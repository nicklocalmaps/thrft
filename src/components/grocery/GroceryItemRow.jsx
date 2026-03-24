import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroceryItemRow({ item, index, onRemove, onUpdateQuantity }) {
  const [hovering, setHovering] = useState(false);
  const [saved, setSaved] = useState(false);

  const bookmarkItem = async (e) => {
    e.stopPropagation();
    await base44.entities.SavedItem.create({
      name: item.name,
      search_hint: item.search_hint || item.name,
      is_branded: item.is_branded || false,
      unit: item.unit || 'each',
      default_quantity: item.quantity || 1,
    });
    setSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex items-center gap-3">
        {/* Quantity control */}
        <div className="flex items-center gap-1">
          {onUpdateQuantity && (
            <button
              onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <Minus className="w-3 h-3" />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm font-semibold text-emerald-700">
            {item.quantity}
          </div>
          {onUpdateQuantity && (
            <button
              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
              className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        <span className="text-slate-900 font-medium">{item.name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50"
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}