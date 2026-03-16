import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AddItemForm from '@/components/grocery/AddItemForm';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import EmptyState from '@/components/grocery/EmptyState';

export default function NewList() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const addItem = (item) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim() || items.length === 0) return;
    setSaving(true);
    const list = await base44.entities.GroceryList.create({
      name: name.trim(),
      items,
    });
    navigate(`/ListDetail?id=${list.id}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">New Grocery List</h1>
      <p className="text-slate-500 mb-8">Add your items, then compare prices across stores.</p>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">List Name</label>
          <Input
            placeholder="e.g. Weekly Groceries, Party Supplies..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-white text-base placeholder:text-slate-400 focus-visible:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Add Items</label>
          <AddItemForm onAdd={addItem} />
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item, i) => (
                <GroceryItemRow key={`${item.name}-${i}`} item={item} index={i} onRemove={removeItem} />
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
            className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base font-semibold shadow-lg shadow-emerald-200 gap-2 transition-all"
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