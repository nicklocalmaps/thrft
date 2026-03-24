import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bookmark, Plus, Trash2, X } from 'lucide-react';

export default function SavedItemsDrawer({ onAddItem }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedItems = [] } = useQuery({
    queryKey: ['saved-items'],
    queryFn: () => base44.entities.SavedItem.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-items'] }),
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Bookmark className="w-3.5 h-3.5" />
        Saved Items ({savedItems.length})
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm text-slate-800">Saved Items</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {savedItems.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No saved items yet. Items you bookmark will appear here.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {savedItems.map(item => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 group transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">qty: {item.default_quantity}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => {
                    onAddItem({ name: item.name, quantity: item.default_quantity || 1, unit: item.unit || 'each', search_hint: item.search_hint || item.name, is_branded: item.is_branded || false });
                    setOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#4181ed' }}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}