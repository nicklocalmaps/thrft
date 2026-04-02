import { useState } from 'react';
import { ALL_STORES, COLOR_MAP } from '@/lib/storeConfig';
import { Check, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorePicker({ selected, onChange }) {
  const [query, setQuery] = useState('');

  const toggle = (key) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const filtered = query.trim()
    ? ALL_STORES.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : null;

  // Group by region (only when not searching)
  const regions = {};
  ALL_STORES.forEach(s => {
    if (!regions[s.region]) regions[s.region] = [];
    regions[s.region].push(s);
  });

  const renderStoreButton = (store) => {
    const isSelected = selected.includes(store.key);
    const colors = COLOR_MAP[store.color] || COLOR_MAP.blue;
    return (
      <motion.button
        key={store.key}
        onClick={() => toggle(store.key)}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
          isSelected
            ? `${colors.badge} ${colors.border}`
            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
        }`}
      >
        {isSelected && <Check className="w-3 h-3" />}
        {store.name}
      </motion.button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search stores..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
      </div>

      {/* Results */}
      {filtered ? (
        filtered.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filtered.map(renderStoreButton)}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-3">No stores found for "{query}"</p>
        )
      ) : (
        Object.entries(regions).map(([region, stores]) => (
          <div key={region}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{region}</p>
            <div className="flex flex-wrap gap-2">
              {stores.map(renderStoreButton)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}