import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { History, ChevronDown, ChevronUp, ChevronRight, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

function PastListItems({ list, onAddItems }) {
  const [selected, setSelected] = useState(new Set(list.items?.map((_, i) => i) || []));

  const toggle = (i) => setSelected(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

  const handleAdd = () => {
    const itemsToAdd = (list.items || []).filter((_, i) => selected.has(i));
    onAddItems(itemsToAdd);
  };

  return (
    <div className="px-5 pb-4">
      <p className="text-xs text-slate-400 mb-3">Select items to add to your new list:</p>
      <div className="space-y-1.5 max-h-56 overflow-y-auto mb-3">
        {(list.items || []).map((item, i) => {
          const isSelected = selected.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all ${
                isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs font-medium text-slate-700 flex-1">{item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}</span>
            </button>
          );
        })}
      </div>
      <Button
        onClick={handleAdd}
        disabled={selected.size === 0}
        size="sm"
        className="w-full rounded-xl gap-1.5 text-xs"
        style={{ backgroundColor: '#4181ed' }}
      >
        <Plus className="w-3.5 h-3.5" />
        Add {selected.size} item{selected.size !== 1 ? 's' : ''} to list
      </Button>
    </div>
  );
}

export default function PastListsDrawer({ onAddItems }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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
          <span className="font-semibold text-slate-800">Add from Past List</span>
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
              <div className="divide-y divide-slate-50">
                {lists.map(list => (
                  <div key={list.id}>
                    <button
                      onClick={() => setExpandedId(expandedId === list.id ? null : list.id)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <ThrftCartIcon className="w-4 h-4 text-slate-300 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{list.name}</p>
                        <p className="text-xs text-slate-400">
                          {list.items?.length || 0} items
                          {list.created_date && <span> · {format(new Date(list.created_date), 'MMM d, yyyy')}</span>}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${expandedId === list.id ? 'rotate-90' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {expandedId === list.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50/50"
                        >
                          <PastListItems
                            list={list}
                            onAddItems={(items) => { onAddItems(items); setExpandedId(null); }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}