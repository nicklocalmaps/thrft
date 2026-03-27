import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { History, ChevronDown, ChevronUp, ShoppingCart, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function PastListsDrawer({ onLoadList }) {
  const [open, setOpen] = useState(false);

  const { data: lists = [] } = useQuery({
    queryKey: ['grocery-lists-history'],
    queryFn: () => base44.entities.GroceryList.list('-created_date'),
    enabled: open,
  });

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800">Load from Past List</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100"
          >
            {lists.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No past lists yet.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => { onLoadList(list); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{list.name}</p>
                      <p className="text-xs text-slate-400">
                        {list.items?.length || 0} items
                        {list.created_date && (
                          <span> · {format(new Date(list.created_date), 'MMM d, yyyy')}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-blue-500 shrink-0">Load items</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}