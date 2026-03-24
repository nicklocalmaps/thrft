import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LayoutTemplate, Plus, Trash2, X, ChevronRight } from 'lucide-react';

export default function TemplatesDrawer({ currentItems, currentName, shoppingMethod, onLoadTemplate }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['list-templates'],
    queryFn: () => base44.entities.ListTemplate.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ListTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-templates'] }),
  });

  const saveAsTemplate = async () => {
    if (!currentItems?.length) return;
    setSaving(true);
    const templateName = currentName?.trim() || `Template ${templates.length + 1}`;
    await base44.entities.ListTemplate.create({
      name: templateName,
      shopping_method: shoppingMethod || 'all',
      items: currentItems.map(({ name, quantity, unit, search_hint, is_branded }) => ({ name, quantity, unit, search_hint, is_branded })),
    });
    queryClient.invalidateQueries({ queryKey: ['list-templates'] });
    setSaving(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
      >
        <LayoutTemplate className="w-3.5 h-3.5" />
        Templates ({templates.length})
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-sm text-slate-800">List Templates</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      {currentItems?.length > 0 && (
        <button
          onClick={saveAsTemplate}
          disabled={saving}
          className="w-full mb-3 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-xl border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
        >
          {saving ? 'Saving...' : (
            <><Plus className="w-3.5 h-3.5" /> Save current list as template</>
          )}
        </button>
      )}

      {templates.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No templates yet. Save a list as a template to reuse it later.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {templates.map(template => (
            <div key={template.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 group transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{template.name}</p>
                <p className="text-xs text-slate-400">{template.items?.length || 0} items</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => { onLoadTemplate(template); setOpen(false); }}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  <ChevronRight className="w-3 h-3" />
                  Use
                </button>
                <button
                  onClick={() => deleteMutation.mutate(template.id)}
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