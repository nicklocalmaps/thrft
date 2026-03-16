import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroceryItemRow({ item, index, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm font-semibold text-emerald-700">
          {item.quantity}
        </div>
        <span className="text-slate-800 font-medium">{item.name}</span>
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