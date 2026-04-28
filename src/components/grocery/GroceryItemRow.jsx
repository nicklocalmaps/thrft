import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Minus, Plus, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroceryItemRow({ item, index, onRemove, onUpdateQuantity }) {
  const [saved, setSaved] = useState(false);

  const bookmarkItem = async e => {
    e.stopPropagation();
    await base44.entities.SavedItem.create({
      name:             item.name,
      search_hint:      item.search_hint || item.name,
      is_branded:       item.is_branded || false,
      unit:             item.unit || 'each',
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
      className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      {/* Product image or emoji */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100"
        style={{ background: '#f8fafc' }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: item.emoji ? 22 : 18 }}>
            {item.emoji || '🛒'}
          </span>
        )}
      </div>

      {/* Name + brand */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate leading-snug">{item.name}</p>
        {(item.brand || item.category) && (
          <p className="text-xs text-slate-400 truncate">
            {[item.brand, item.category].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 shrink-0">
        {onUpdateQuantity && (
          <button
            onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Minus className="w-3 h-3" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700">
          {item.quantity}
        </div>
        {onUpdateQuantity && (
          <button
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Bookmark + Remove */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={bookmarkItem}
          disabled={saved}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
          title="Save item"
        >
          {saved
            ? <BookmarkCheck className="w-3.5 h-3.5 text-blue-500" />
            : <Bookmark className="w-3.5 h-3.5" />
          }
        </button>
        <button
          onClick={() => onRemove(index)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}