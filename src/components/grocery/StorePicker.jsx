import { ALL_STORES, COLOR_MAP } from '@/lib/storeConfig';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorePicker({ selected, onChange }) {
  const toggle = (key) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  // Group by region
  const regions = {};
  ALL_STORES.forEach(s => {
    if (!regions[s.region]) regions[s.region] = [];
    regions[s.region].push(s);
  });

  return (
    <div className="space-y-4">
      {Object.entries(regions).map(([region, stores]) => (
        <div key={region}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{region}</p>
          <div className="flex flex-wrap gap-2">
            {stores.map((store, i) => {
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
            })}
          </div>
        </div>
      ))}
    </div>
  );
}