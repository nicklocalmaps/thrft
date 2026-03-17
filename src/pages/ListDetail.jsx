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

export default function ListDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [comparing, setComparing] = useState(false);
  const [localItems, setLocalItems] = useState(null);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);

  // Load user's favorite stores as default on mount
  React.useEffect(() => {
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
    select: (data) => {
      const l = data[0];
      if (l?.selected_stores?.length && selectedStores === DEFAULT_STORES) {
        setSelectedStores(l.selected_stores);
      }
      return l;
    },
    enabled: !!listId,
  });

  const items = localItems || list?.items || [];

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

  const comparePrices = async () => {
    if (items.length === 0 || selectedStores.length === 0) return;
    setComparing(true);

    const itemsList = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const storeNames = selectedStores.map(k => ALL_STORES.find(s => s.key === k)?.name || k);

    // Build the response schema dynamically for selected stores
    const storeProperties = {};
    selectedStores.forEach(key => {
      storeProperties[key] = {
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
      };
    });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a grocery price comparison assistant. For the following grocery list items, provide realistic current estimated prices from these stores: ${storeNames.join(', ')}.

Items: ${itemsList}

For each store, provide the best matching product with a realistic price. Use your knowledge of typical US grocery prices and each store's pricing patterns. If an item is uncommon for a store, mark it as not in stock.

Store pricing tendencies:
- Aldi & Walmart: typically lowest prices, store brands
- Kroger, Safeway, Albertsons: mid-range, frequent sales
- Whole Foods, Bristol Farms, Gelson's, The Fresh Market: premium pricing
- Trader Joe's: unique private-label, competitive pricing
- H-E-B, Publix: strong regional value
- Amazon Fresh: convenient, slightly premium
- Regional chains: match their typical local market pricing`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: storeProperties,
      },
    });

    await base44.entities.GroceryList.update(listId, {
      price_data: result,
      selected_stores: selectedStores,
      last_compared: new Date().toISOString(),
    });

    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
    setComparing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">List not found.</p>
        <Link to="/Home" className="text-emerald-600 hover:underline mt-2 inline-block">Go back</Link>
      </div>
    );
  }

  const priceData = list.price_data;
  const comparedStoreKeys = priceData ? Object.keys(priceData) : [];
  const storeTotals = priceData
    ? Object.fromEntries(comparedStoreKeys.map(k => [k, priceData[k]?.reduce((s, i) => s + (i.price || 0), 0) || 0]))
    : null;
  const cheapestStore = storeTotals
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
          <p className="text-sm text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
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
              <Store className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Stores to Compare</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {selectedStores.length} selected
              </span>
            </div>
            {showStorePicker ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showStorePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
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
          className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base font-semibold shadow-lg shadow-emerald-200 gap-2 transition-all mb-8"
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-emerald-500 animate-pulse" />
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
                  items={priceData[storeKey]}
                  isCheapest={cheapestStore === storeKey}
                  index={i}
                />
              );
            })}
          </div>

          {storeTotals && cheapestStore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-100"
            >
              <p className="text-sm text-emerald-700 font-medium">
                💡 <strong>{ALL_STORES.find(s => s.key === cheapestStore)?.name || cheapestStore}</strong> has the best estimated total at{' '}
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