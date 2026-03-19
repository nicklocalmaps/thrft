import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Loader2, ShoppingCart, Store, ChevronDown, ChevronUp } from 'lucide-react';
import AddItemForm from '@/components/grocery/AddItemForm';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import StoreCard from '@/components/grocery/StoreCard';
import StorePicker from '@/components/grocery/StorePicker';
import { ALL_STORES } from '@/lib/storeConfig';

const METHOD_LABELS = {
  instore: '🏪 In-Store',
  pickup: '🚗 Curbside Pickup',
  delivery: '🚚 Delivery',
  all: '📦 All Methods',
};

export default function ListDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [comparing, setComparing] = useState(false);
  const [localItems, setLocalItems] = useState(null);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.favorite_stores?.length) {
        setSelectedStores(user.favorite_stores);
      } else {
        setSelectedStores(['kroger', 'walmart', 'amazon']);
      }
    }).catch(() => setSelectedStores(['kroger', 'walmart', 'amazon']));
  }, []);

  const { data: list, isLoading } = useQuery({
    queryKey: ['grocery-list', listId],
    queryFn: () => base44.entities.GroceryList.filter({ id: listId }),
    select: (data) => data[0],
    enabled: !!listId,
  });

  const items = localItems || list?.items || [];
  const shoppingMethod = list?.shopping_method || 'all';

  const addItem = async (item) => {
    const newItems = [...items, item];
    setLocalItems(newItems);
    await base44.entities.GroceryList.update(listId, { items: newItems });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const removeItem = async (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setLocalItems(newItems);
    await base44.entities.GroceryList.update(listId, { items: newItems });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const saveStores = async (stores) => {
    setSelectedStores(stores);
    await base44.entities.GroceryList.update(listId, { selected_stores: stores });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const KROGER_FAMILY = ['kroger', 'fred_meyer', 'king_soopers', 'city_market', 'smiths', 'harris_teeter', 'jewel_osco'];

  const comparePrices = async () => {
    if (items.length === 0 || selectedStores.length === 0) return;
    setComparing(true);

    const includePickup = shoppingMethod === 'pickup' || shoppingMethod === 'all';
    const includeDelivery = shoppingMethod === 'delivery' || shoppingMethod === 'all';

    const krogerStores = selectedStores.filter(k => KROGER_FAMILY.includes(k));
    const aiStores = selectedStores.filter(k => !KROGER_FAMILY.includes(k));

    const storeSchema = (includePickup, includeDelivery) => ({
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              item_name: { type: 'string' },
              product_name: { type: 'string' },
              price: { type: 'number' },
              unit_price: { type: 'string' },
              in_stock: { type: 'boolean' },
            },
          },
        },
        instore_total: { type: 'number' },
        ...(includePickup ? { pickup_total: { type: 'number' }, pickup_available: { type: 'boolean' } } : {}),
        ...(includeDelivery ? {
          instacart_fee: { type: 'number' },
          instacart_available: { type: 'boolean' },
          shipt_fee: { type: 'number' },
          shipt_available: { type: 'boolean' },
        } : {}),
      },
    });

    // Fetch Kroger real prices + AI estimates in parallel
    const userZip = (await base44.auth.me())?.zip_code || '10001';

    const [krogerResponse, aiResult] = await Promise.all([
      krogerStores.length > 0
        ? base44.functions.invoke('krogerPrices', { items, store_keys: krogerStores, zip_code: userZip })
        : Promise.resolve({ data: { results: {} } }),
      aiStores.length > 0
        ? (() => {
            const aiStoreNames = aiStores.map(k => ALL_STORES.find(s => s.key === k)?.name || k);
            const storeProperties = {};
            aiStores.forEach(key => { storeProperties[key] = storeSchema(includePickup, includeDelivery); });
            const itemsList = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
            const deliveryNote = includeDelivery
              ? `\n- Estimate if Instacart and Shipt delivery is available and provide a realistic fee ($3-$10 for Instacart, $5-$10 for Shipt, or 0 if not available).`
              : '';
            const pickupNote = includePickup
              ? `\n- Indicate if curbside pickup is available and the pickup total.`
              : '';
            return base44.integrations.Core.InvokeLLM({
              prompt: `You are a grocery price comparison assistant. Provide realistic estimated prices from these stores: ${aiStoreNames.join(', ')}.

Items: ${itemsList}

For each store:
- Provide the best matching product with a realistic in-store price
- Calculate the instore_total as the sum of all item prices
- Mark unavailable items as not in stock${pickupNote}${deliveryNote}

Store pricing tendencies:
- Aldi & Walmart: lowest prices, store brands
- Safeway, Albertsons: mid-range, frequent sales
- Whole Foods, Bristol Farms, Gelson's, The Fresh Market: premium
- Trader Joe's: private-label, competitive
- H-E-B, Publix: strong regional value
- Amazon Fresh: slightly premium`,
              add_context_from_internet: true,
              model: 'gemini_3_flash',
              response_json_schema: { type: 'object', properties: storeProperties },
            });
          })()
        : Promise.resolve({}),
    ]);

    // Merge Kroger real data with AI data
    // For Kroger stores, add delivery/pickup estimates via AI if needed
    const krogerRealData = krogerResponse.data?.results || {};
    let finalData = { ...(aiStores.length > 0 ? aiResult : {}) };

    for (const storeKey of krogerStores) {
      const realData = krogerRealData[storeKey];
      if (realData) {
        // Add pickup/delivery estimates to real Kroger data if needed
        if (includePickup) {
          realData.pickup_available = true;
          realData.pickup_total = realData.instore_total;
        }
        if (includeDelivery) {
          realData.instacart_available = true;
          realData.instacart_fee = 5.99;
          realData.shipt_available = true;
          realData.shipt_fee = 7.00;
        }
        realData.source = 'kroger_api';
        finalData[storeKey] = realData;
      } else {
        // Store not found in area — fall back to AI for this store
        const storeName = ALL_STORES.find(s => s.key === storeKey)?.name || storeKey;
        const itemsList = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const props = {};
        props[storeKey] = storeSchema(includePickup, includeDelivery);
        const fallback = await base44.integrations.Core.InvokeLLM({
          prompt: `Provide realistic estimated grocery prices for ${storeName}. Items: ${itemsList}. Return instore_total and item prices.`,
          model: 'gemini_3_flash',
          response_json_schema: { type: 'object', properties: props },
        });
        if (fallback?.[storeKey]) finalData[storeKey] = fallback[storeKey];
      }
    }

    await base44.entities.GroceryList.update(listId, {
      price_data: finalData,
      selected_stores: selectedStores,
      last_compared: new Date().toISOString(),
    });

    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
    setComparing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">List not found.</p>
        <Link to="/Home" className="hover:underline mt-2 inline-block" style={{ color: '#4181ed' }}>Go back</Link>
      </div>
    );
  }

  const priceData = list.price_data;
  const comparedStoreKeys = priceData ? Object.keys(priceData) : [];

  // For "cheapest" badge, compare instore totals
  const storeTotals = priceData
    ? Object.fromEntries(comparedStoreKeys.map(k => {
        const d = priceData[k];
        const total = Array.isArray(d)
          ? d.reduce((s, i) => s + (i.price || 0), 0)
          : (d?.instore_total ?? d?.items?.reduce((s, i) => s + (i.price || 0), 0) ?? 0);
        return [k, total];
      }))
    : null;

  const cheapestStore = storeTotals && Object.keys(storeTotals).length > 0
    ? Object.entries(storeTotals).reduce((a, b) => (a[1] < b[1] ? a : b))[0]
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/Home">
          <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{list.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
            {list.shopping_method && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {METHOD_LABELS[list.shopping_method]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add Item */}
      <div className="mb-4">
        <AddItemForm onAdd={addItem} />
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-6">
        <AnimatePresence>
          {items.map((item, i) => (
            <GroceryItemRow key={`${item.name}-${i}`} item={item} index={i} onRemove={removeItem} />
          ))}
        </AnimatePresence>
      </div>

      {/* Store Selector */}
      {items.length > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-100 bg-white overflow-hidden">
          <button
            onClick={() => setShowStorePicker(!showStorePicker)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4" style={{ color: '#4181ed' }} />
              <span className="font-semibold text-slate-800">Stores to Compare</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {selectedStores.length} selected
              </span>
            </div>
            {showStorePicker ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showStorePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-5 pb-5 border-t border-slate-100"
            >
              <div className="pt-4">
                <StorePicker selected={selectedStores} onChange={saveStores} />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Compare Button */}
      {items.length > 0 && (
        <Button
          onClick={comparePrices}
          disabled={comparing || selectedStores.length === 0}
          className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-blue-200 gap-2 transition-all mb-8"
          style={{ backgroundColor: '#4181ed' }}
        >
          {comparing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Comparing prices across {selectedStores.length} stores...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {priceData ? 'Refresh Price Comparison' : `Compare Prices Across ${selectedStores.length} Stores`}
            </>
          )}
        </Button>
      )}

      {/* Loading state */}
      {comparing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 animate-pulse" style={{ color: '#4181ed' }} />
          </div>
          <p className="text-slate-600 font-medium">Searching {selectedStores.length} stores...</p>
          <p className="text-sm text-slate-400 mt-1">This may take a moment</p>
        </motion.div>
      )}

      {/* Results */}
      {priceData && !comparing && comparedStoreKeys.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold text-slate-900 mb-5">Price Comparison</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparedStoreKeys.map((storeKey, i) => {
              const storeMeta = ALL_STORES.find(s => s.key === storeKey);
              return (
                <StoreCard
                  key={storeKey}
                  storeKey={storeKey}
                  storeName={storeMeta?.name || storeKey}
                  storeColor={storeMeta?.color || 'blue'}
                  storeData={priceData[storeKey]}
                  isCheapest={cheapestStore === storeKey}
                  index={i}
                  shoppingMethod={shoppingMethod}
                />
              );
            })}
          </div>

          {storeTotals && cheapestStore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-5 rounded-2xl bg-blue-50 border border-blue-100"
            >
              <p className="text-sm font-medium" style={{ color: '#4181ed' }}>
                💡 <strong>{ALL_STORES.find(s => s.key === cheapestStore)?.name || cheapestStore}</strong> has the best estimated in-store total at{' '}
                <strong>${storeTotals[cheapestStore]?.toFixed(2)}</strong>
                {' '}— saving you up to{' '}
                <strong>${(Math.max(...Object.values(storeTotals)) - storeTotals[cheapestStore]).toFixed(2)}</strong> vs the most expensive option.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}