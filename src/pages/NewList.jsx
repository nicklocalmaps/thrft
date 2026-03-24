import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Settings2 } from 'lucide-react';
import AddItemForm from '@/components/grocery/AddItemForm';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import EmptyState from '@/components/grocery/EmptyState';
import ShoppingMethodPicker from '@/components/grocery/ShoppingMethodPicker';
import SavedItemsDrawer from '@/components/grocery/SavedItemsDrawer';
import TemplatesDrawer from '@/components/grocery/TemplatesDrawer';

export default function NewList() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [shoppingMethod, setShoppingMethod] = useState('all');
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  // Load user's saved preference
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.shopping_method) setShoppingMethod(user.shopping_method);
    }).catch(() => {});
  }, []);

  const addItem = (item) => setItems(prev => [...prev, item]);
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateQuantity = (index, qty) => setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));

  const handleCreate = async () => {
    if (!name.trim() || items.length === 0) return;
    setSaving(true);
    const list = await base44.entities.GroceryList.create({
      name: name.trim(),
      items,
      shopping_method: shoppingMethod,
    });
    navigate(`/ListDetail?id=${list.id}`);
  };

  const METHOD_LABELS = {
    instore: '🏪 In-Store',
    pickup: '🚗 Curbside Pickup',
    delivery: '🚚 Delivery',
    all: '📦 Compare All',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">New Grocery List</h1>
      <p className="text-slate-900 mb-8">Add your items, then compare prices across stores.</p>

      <div className="space-y-6">
        {/* List Name */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">List Name</label>
          <Input
            placeholder="e.g. Weekly Groceries, Party Supplies..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-white text-base placeholder:text-slate-400 focus-visible:ring-blue-400"
          />
        </div>

        {/* Shopping Method */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-900">Shopping Method</label>
            <button
              type="button"
              onClick={() => setShowMethodPicker(!showMethodPicker)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showMethodPicker ? 'Hide options' : 'Change preference'}
            </button>
          </div>

          {!showMethodPicker ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">
              {METHOD_LABELS[shoppingMethod]}
              <span className="ml-auto text-xs text-slate-400">(from your preferences)</span>
            </div>
          ) : (
            <ShoppingMethodPicker value={shoppingMethod} onChange={setShoppingMethod} />
          )}
        </div>

        {/* Add Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium text-slate-900">Add Items</label>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug max-w-sm">Be as specific as possible — e.g. "Mint Oreos", "Store Brand 2% Milk" or "Breyer's Ice Cream"</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <SavedItemsDrawer onAddItem={addItem} />
              <TemplatesDrawer
                currentItems={items}
                currentName={name}
                shoppingMethod={shoppingMethod}
                onLoadTemplate={(template) => {
                  setItems(template.items || []);
                  if (!name.trim()) setName(template.name);
                  if (template.shopping_method) setShoppingMethod(template.shopping_method);
                }}
              />
            </div>
          </div>
          <AddItemForm onAdd={addItem} />
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item, i) => (
                <GroceryItemRow key={`${item.name}-${i}`} item={item} index={i} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}

        {items.length > 0 && (
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-blue-200 gap-2 transition-all"
            style={{ backgroundColor: '#4181ed' }}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Save & Compare Prices
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}