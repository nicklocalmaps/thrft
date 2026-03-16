import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity: Number(quantity) || 1, unit: 'each' });
    setName('');
    setQuantity(1);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Add an item... (e.g. organic milk, bananas)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 h-12 rounded-xl border-slate-200 bg-white text-base placeholder:text-slate-400 focus-visible:ring-emerald-500"
      />
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-20 h-12 rounded-xl border-slate-200 bg-white text-center text-base focus-visible:ring-emerald-500"
      />
      <Button
        type="submit"
        className="h-12 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </form>
  );
}