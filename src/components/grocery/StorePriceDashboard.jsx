import ThrftListIcon from '@/components/icons/ThrftListIcon';
import React, { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ALL_STORES, COLOR_MAP } from '@/lib/storeConfig';

function getInstoreTotal(storeData) {
  if (!storeData) return null;
  if (Array.isArray(storeData)) return storeData.reduce((s, i) => s + (i.price || 0), 0);
  return storeData.instore_total ?? storeData.items?.reduce((s, i) => s + (i.price || 0), 0) ?? null;
}

export default function StorePriceDashboard({ lists }) {
  const storeTotals = useMemo(() => {
    const totals = {};
    lists.forEach(list => {
      if (!list.price_data) return;
      Object.entries(list.price_data).forEach(([key, data]) => {
        const t = getInstoreTotal(data);
        if (t == null) return;
        totals[key] = (totals[key] || 0) + t;
      });
    });
    return totals;
  }, [lists]);

  const entries = Object.entries(storeTotals).sort((a, b) => a[1] - b[1]);

  if (entries.length === 0) return null;

  const cheapestKey = entries[0][0];
  const maxTotal = entries[entries.length - 1][1];

  return (
    <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center gap-2">
        <ThrftListIcon className="w-4 h-4" style={{ color: '#4181ed' }} />
        <h2 className="font-bold text-slate-800 text-sm">Store Price Comparison</h2>
        <span className="ml-auto text-xs text-slate-400">across all lists with price data</span>
      </div>

      <div className="p-5 space-y-3">
        {entries.map(([key, total], i) => {
          const store = ALL_STORES.find(s => s.key === key);
          const colors = COLOR_MAP[store?.color || 'blue'];
          const isCheapest = key === cheapestKey;
          const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl p-3 border transition-all ${
                isCheapest ? `${colors.border} ${colors.light}` : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{store?.name || key}</span>
                  {isCheapest && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      <TrendingDown className="w-3 h-3" />
                      Cheapest
                    </span>
                  )}
                </div>
                <span className={`text-base font-bold ${isCheapest ? colors.badge.split(' ')[1] : 'text-slate-700'}`}>
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar}`}
                />
              </div>
            </motion.div>
          );
        })}

        {entries.length > 1 && (
          <p className="text-xs text-slate-400 pt-1 text-center">
            💰 Shopping at <strong className="text-slate-600">{ALL_STORES.find(s => s.key === cheapestKey)?.name || cheapestKey}</strong> saves you{' '}
            <strong className="text-emerald-600">${(entries[entries.length - 1][1] - entries[0][1]).toFixed(2)}</strong> vs. the most expensive option
          </p>
        )}
      </div>
    </div>
  );
}