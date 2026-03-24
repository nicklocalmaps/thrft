import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { ALL_STORES } from '@/lib/storeConfig';

export default function PriceHistoryChart({ listId, open, onClose }) {
  const { data: history = [] } = useQuery({
    queryKey: ['price-history', listId],
    queryFn: () => base44.entities.PriceHistory.filter({ list_id: listId }, 'snapshot_date', 20),
    enabled: open && !!listId,
  });

  if (!open) return null;

  if (history.length < 2) {
    return (
      <div className="mt-4 p-5 rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-sm text-slate-800">Price History</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-slate-400 text-center py-6">
          Price history will appear here after comparing prices at least twice.
        </p>
      </div>
    );
  }

  // Build chart data — one entry per snapshot
  const allStoreKeys = Array.from(new Set(history.flatMap(h => Object.keys(h.store_totals || {}))));
  const chartData = history.map(h => ({
    date: format(new Date(h.snapshot_date), 'MMM d'),
    ...Object.fromEntries(allStoreKeys.map(k => [k, h.store_totals?.[k] ?? null])),
  }));

  const COLORS = ['#4181ed', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

  return (
    <div className="mt-4 p-5 rounded-2xl border border-slate-100 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-sm text-slate-800">Price History</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={(v) => v ? `$${v.toFixed(2)}` : 'N/A'} />
          <Legend formatter={(key) => ALL_STORES.find(s => s.key === key)?.name || key} wrapperStyle={{ fontSize: 11 }} />
          {allStoreKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}