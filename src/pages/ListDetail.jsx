import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Loader2, ShoppingCart } from 'lucide-react';
import AddItemForm from '@/components/grocery/AddItemForm';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import StoreCard from '@/components/grocery/StoreCard';

export default function ListDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [comparing, setComparing] = useState(false);
  const [localItems, setLocalItems] = useState(null);

  const { data: list, isLoading } = useQuery({
    queryKey: ['grocery-list', listId],
    queryFn: () => base44.entities.GroceryList.filter({ id: listId }),
    select: (data) => data[0],
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

  const comparePrices = async () => {
    if (items.length === 0) return;
    setComparing(true);

    const itemsList = items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a grocery price comparison assistant. For the following grocery list items, provide realistic current estimated prices from Kroger, Walmart, and Amazon Fresh online grocery stores.

Items: ${itemsList}

For each store, provide the best matching product with a realistic price. Use your knowledge of typical US grocery prices. If an item is uncommon for a store, mark it as not in stock.

Important: Return realistic, current US grocery prices. Consider store-specific pricing patterns (Walmart tends to be lower on basics, Kroger has good sales, Amazon Fresh can be higher but convenient).`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          kroger: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item_name: { type: 'string', description: 'Original item from the list' },
                product_name: { type: 'string', description: 'Specific product name found at the store' },
                price: { type: 'number', description: 'Price in USD' },
                unit_price: { type: 'string', description: 'Price per unit e.g. $0.50/oz' },
                in_stock: { type: 'boolean', description: 'Whether the item is available' },
              },
            },
          },
          walmart: {
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
          amazon: {
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
        },
      },
    });

    await base44.entities.GroceryList.update(listId, {
      price_data: result,
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
  const storeTotals = priceData
    ? {
        kroger: priceData.kroger?.reduce((s, i) => s + (i.price || 0), 0) || 0,
        walmart: priceData.walmart?.reduce((s, i) => s + (i.price || 0), 0) || 0,
        amazon: priceData.amazon?.reduce((s, i) => s + (i.price || 0), 0) || 0,
      }
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
      <div className="mb-6">
        <AddItemForm onAdd={addItem} />
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-8">
        <AnimatePresence>
          {items.map((item, i) => (
            <GroceryItemRow key={`${item.name}-${i}`} item={item} index={i} onRemove={removeItem} />
          ))}
        </AnimatePresence>
      </div>

      {/* Compare Button */}
      {items.length > 0 && (
        <Button
          onClick={comparePrices}
          disabled={comparing}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base font-semibold shadow-lg shadow-emerald-200 gap-2 transition-all mb-8"
        >
          {comparing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Comparing prices across stores...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {priceData ? 'Refresh Price Comparison' : 'Compare Prices'}
            </>
          )}
        </Button>
      )}

      {/* Comparison Results */}
      {comparing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Searching store websites...</p>
          <p className="text-sm text-slate-400 mt-1">Checking Kroger, Walmart & Amazon Fresh</p>
        </motion.div>
      )}

      {priceData && !comparing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-5">Price Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['kroger', 'walmart', 'amazon'].map((store, i) => (
              <StoreCard
                key={store}
                storeKey={store}
                items={priceData[store]}
                isCheapest={cheapestStore === store}
                index={i}
              />
            ))}
          </div>

          {storeTotals && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-100"
            >
              <p className="text-sm text-emerald-700 font-medium">
                💡 <strong>{cheapestStore?.charAt(0).toUpperCase() + cheapestStore?.slice(1)}</strong> has the best estimated total at <strong>${storeTotals[cheapestStore]?.toFixed(2)}</strong>
                {' '}— saving you up to <strong>${(Math.max(...Object.values(storeTotals)) - storeTotals[cheapestStore]).toFixed(2)}</strong> compared to the most expensive option.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}