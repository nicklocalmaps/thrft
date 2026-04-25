import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { TrendingDown, DollarSign, Percent, Store } from 'lucide-react';
import { format } from 'date-fns';

const THRFT_BLUE = '#4181ed';

const STORE_COLORS = [
  '#4181ed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
];

function StatCard({ icon: Icon, label, value, sub, color = THRFT_BLUE }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function SavingsDashboard() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['price-history-all'],
    queryFn: () => base44.entities.PriceHistory.list('-snapshot_date', 100),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-7 h-7 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <TrendingDown className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="font-semibold text-slate-700">No savings data yet</p>
        <p className="text-sm text-slate-400 mt-1">Compare prices on a grocery list to start tracking your savings.</p>
      </div>
    );
  }

  // Build cumulative savings chart data (sorted oldest → newest)
  const sorted = [...history].sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));

  let cumulative = 0;
  const chartData = sorted.map(h => {
    const totals = Object.values(h.store_totals || {}).filter(v => typeof v === 'number' && v > 0);
    const maxTotal = totals.length ? Math.max(...totals) : 0;
    const minTotal = h.cheapest_total || (totals.length ? Math.min(...totals) : 0);
    const saved = maxTotal - minTotal;
    cumulative += saved;
    return {
      date: format(new Date(h.snapshot_date), 'MMM d'),
      saved: parseFloat(saved.toFixed(2)),
      cumulative: parseFloat(cumulative.toFixed(2)),
      listName: h.list_name,
    };
  });

  // Total stats
  const totalSaved = cumulative;
  const avgSaved = totalSaved / history.length;

  // Avg savings % across all snapshots
  const avgPct = history.reduce((sum, h) => {
    const totals = Object.values(h.store_totals || {}).filter(v => typeof v === 'number' && v > 0);
    if (!totals.length) return sum;
    const max = Math.max(...totals);
    const min = h.cheapest_total || Math.min(...totals);
    return sum + (max > 0 ? ((max - min) / max) * 100 : 0);
  }, 0) / history.length;

  // Savings by store
  const storeSavings = {};
  history.forEach(h => {
    const totals = h.store_totals || {};
    const cheapest = h.cheapest_store;
    if (!cheapest || !totals[cheapest]) return;
    Object.entries(totals).forEach(([store, total]) => {
      if (store === cheapest) return;
      const diff = total - totals[cheapest];
      if (diff > 0) {
        storeSavings[cheapest] = (storeSavings[cheapest] || 0) + diff;
      }
    });
  });

  const storeData = Object.entries(storeSavings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([store, saved]) => ({ store: store.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), saved: parseFloat(saved.toFixed(2)) }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Savings Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">Your grocery savings over time</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Total Saved" value={`$${totalSaved.toFixed(2)}`} sub={`across ${history.length} comparisons`} color="#10b981" />
        <StatCard icon={Percent} label="Avg Savings %" value={`${avgPct.toFixed(1)}%`} sub="per comparison" color={THRFT_BLUE} />
        <StatCard icon={TrendingDown} label="Avg Per Trip" value={`$${avgSaved.toFixed(2)}`} sub="saved vs. most expensive store" color="#f59e0b" />
      </div>

      {/* Cumulative savings line chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Cumulative Savings Over Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={THRFT_BLUE} stopOpacity={0.18} />
                <stop offset="95%" stopColor={THRFT_BLUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={48} />
            <Tooltip formatter={(v) => [`$${v}`, 'Cumulative Saved']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Area type="monotone" dataKey="cumulative" stroke={THRFT_BLUE} strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-trip savings bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Savings Per Comparison</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={48} />
            <Tooltip formatter={(v) => [`$${v}`, 'Saved']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="saved" radius={[6, 6, 0, 0]} fill={THRFT_BLUE} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings by store */}
      {storeData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Savings by Best Store</p>
          <div className="space-y-3">
            {storeData.map((s, i) => {
              const pct = (s.saved / storeData[0].saved) * 100;
              return (
                <div key={s.store}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{s.store}</span>
                    <span className="font-bold" style={{ color: STORE_COLORS[i % STORE_COLORS.length] }}>${s.saved.toFixed(2)} saved</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: STORE_COLORS[i % STORE_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}