import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import useUserTier from '@/hooks/useUserTier';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import WillieOwl from '@/components/WillieOwl';
import { Input } from '@/components/ui/input';
import { Loader2, DollarSign, Target, Users, TrendingDown, Lightbulb, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const THRFT_BLUE = '#4181ed';

const AVG_SPEND_PER_PERSON = 300; // avg monthly grocery spend per person (USD)

export default function Budget() {
  const { isPremium, loading: tierLoading } = useUserTier();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiTips, setAiTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [showChart, setShowChart] = useState(true);

  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [perTripBudget, setPerTripBudget] = useState('');
  const [householdSize, setHouseholdSize] = useState('2');

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.PriceHistory.list('-snapshot_date', 60),
    ]).then(([u, h]) => {
      setUser(u);
      setHistory(h);
      setMonthlyBudget(u?.monthly_budget?.toString() || '');
      setPerTripBudget(u?.per_trip_budget?.toString() || '');
      setHouseholdSize(u?.household_size?.toString() || '2');
      setLoading(false);
    });
  }, []);

  const saveBudget = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      monthly_budget: parseFloat(monthlyBudget) || null,
      per_trip_budget: parseFloat(perTripBudget) || null,
      household_size: parseInt(householdSize) || 2,
    });
    setUser(prev => ({
      ...prev,
      monthly_budget: parseFloat(monthlyBudget) || null,
      per_trip_budget: parseFloat(perTripBudget) || null,
      household_size: parseInt(householdSize) || 2,
    }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const getAiTips = async () => {
    setLoadingTips(true);
    const tripCount = history.length;
    const avgSpend = history.length
      ? history.reduce((s, h) => s + (h.cheapest_total || 0), 0) / history.length
      : 0;
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a grocery savings coach. The user has the following profile:
- Household size: ${householdSize} people
- Monthly grocery budget: $${monthlyBudget || 'not set'}
- Per-trip budget: $${perTripBudget || 'not set'}
- Number of grocery trips recorded: ${tripCount}
- Average spend per trip (at cheapest store): $${avgSpend.toFixed(2)}
- This month's estimated spend: $${thisMonthSpend.toFixed(2)}

Give 3 short, specific, actionable tips to help them save money and stay within their budget. Each tip should be 1-2 sentences max. Be encouraging and practical. Return as a JSON array of strings.`,
      response_json_schema: {
        type: 'object',
        properties: {
          tips: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    setAiTips(res?.tips || []);
    setLoadingTips(false);
  };

  if (loading || tierLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  // Budget is available to all users including free trial

  // --- Data calculations ---
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthTrips = history.filter(h => {
    try { return isWithinInterval(parseISO(h.snapshot_date), { start: monthStart, end: monthEnd }); }
    catch { return false; }
  });

  const thisMonthSpend = thisMonthTrips.reduce((s, h) => s + (h.cheapest_total || 0), 0);
  const mBudget = parseFloat(user?.monthly_budget) || 0;
  const tripBudget = parseFloat(user?.per_trip_budget) || 0;
  const budgetPct = mBudget > 0 ? Math.min((thisMonthSpend / mBudget) * 100, 100) : 0;
  const isNearLimit = mBudget > 0 && budgetPct >= 80;
  const isOverBudget = mBudget > 0 && thisMonthSpend > mBudget;
  const recommended = parseInt(householdSize) * AVG_SPEND_PER_PERSON;

  // Savings vs most expensive store
  const totalSavings = history.reduce((s, h) => {
    if (!h.store_totals) return s;
    const vals = Object.values(h.store_totals).filter(v => v > 0);
    if (vals.length < 2) return s;
    const max = Math.max(...vals);
    return s + (max - (h.cheapest_total || 0));
  }, 0);

  // Chart data — last 8 trips
  const chartData = [...history].slice(0, 8).reverse().map(h => ({
    date: (() => { try { return format(parseISO(h.snapshot_date), 'MMM d'); } catch { return ''; } })(),
    spent: parseFloat((h.cheapest_total || 0).toFixed(2)),
    budget: tripBudget || null,
  }));

  // Monthly trend — last 4 months
  const monthlyTrend = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = startOfMonth(d);
    const mEnd = endOfMonth(d);
    const trips = history.filter(h => {
      try { return isWithinInterval(parseISO(h.snapshot_date), { start: mStart, end: mEnd }); }
      catch { return false; }
    });
    const total = trips.reduce((s, h) => s + (h.cheapest_total || 0), 0);
    monthlyTrend.push({ month: format(d, 'MMM'), spent: parseFloat(total.toFixed(2)), budget: mBudget || null });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <WillieOwl pageKey="budget" hint="Set a monthly budget and THRFT will alert you when you're getting close. Compare prices first to keep each trip on track!" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <DollarSign className="w-7 h-7" style={{ color: THRFT_BLUE }} />
          Budget Planner
        </h1>
        <p className="text-slate-500 mt-1">Set your grocery budget and track your spending across trips.</p>
      </div>

      {/* 1. Budget Setup */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" /> Budget Setup
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Monthly Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <Input
                type="number"
                placeholder="400"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                className="h-10 pl-7 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Per-Trip Target</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <Input
                type="number"
                placeholder="80"
                value={perTripBudget}
                onChange={e => setPerTripBudget(e.target.value)}
                className="h-10 pl-7 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
              <Users className="w-3 h-3" /> Household Size
            </label>
            <Input
              type="number"
              placeholder="2"
              min="1"
              value={householdSize}
              onChange={e => setHouseholdSize(e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-400"
            />
          </div>
        </div>
        {parseInt(householdSize) > 0 && (
          <p className="text-xs text-slate-400 mb-3">
            💡 National average for {householdSize}-person household: <strong className="text-slate-600">${recommended}/mo</strong>
          </p>
        )}
        <Button
          onClick={saveBudget}
          disabled={saving}
          className="h-9 px-5 rounded-xl text-sm font-semibold gap-2"
          style={{ backgroundColor: THRFT_BLUE }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✅ Saved!' : 'Save Budget'}
        </Button>
      </div>

      {/* 2. Spending Tracker */}
      {mBudget > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> This Month's Spending
          </h2>

          {/* Alert */}
          {isOverBudget && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">You're <strong>${(thisMonthSpend - mBudget).toFixed(2)}</strong> over your monthly budget!</p>
            </div>
          )}
          {!isOverBudget && isNearLimit && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">Heads up — you're at {Math.round(budgetPct)}% of your budget with {format(monthEnd, 'MMM d')} to go.</p>
            </div>
          )}
          {!isOverBudget && !isNearLimit && thisMonthTrips.length > 0 && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 font-medium">On track! ${(mBudget - thisMonthSpend).toFixed(2)} remaining this month.</p>
            </div>
          )}

          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-slate-900">${thisMonthSpend.toFixed(2)}</span>
            <span className="text-sm text-slate-400">of ${mBudget.toFixed(2)}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: isOverBudget ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981' }}
            />
          </div>
          <p className="text-xs text-slate-400">{thisMonthTrips.length} trip{thisMonthTrips.length !== 1 ? 's' : ''} this month · {format(now, 'MMMM yyyy')}</p>
        </div>
      )}

      {/* 3. Savings Insights */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-purple-500" /> Savings Insights
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">${totalSavings.toFixed(2)}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Total saved vs. priciest store</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{history.length}</p>
              <p className="text-xs text-blue-600 mt-0.5">Trips compared</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <p className="text-xl font-bold text-purple-700">
                ${history.length ? (totalSavings / history.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-purple-600 mt-0.5">Avg saved per trip</p>
            </div>
          </div>

          {/* Chart */}
          <button
            onClick={() => setShowChart(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-3"
          >
            {showChart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showChart ? 'Hide' : 'Show'} spending chart
          </button>

          <AnimatePresence>
            {showChart && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <p className="text-xs text-slate-400 mb-2">Monthly spend trend</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${v}`, '']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="spent" stroke={THRFT_BLUE} strokeWidth={2} dot={{ r: 4 }} name="Spent" />
                    {mBudget > 0 && <Line type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Budget" />}
                  </LineChart>
                </ResponsiveContainer>

                {chartData.length > 1 && (
                  <>
                    <p className="text-xs text-slate-400 mt-4 mb-2">Per-trip spend (last {chartData.length} trips)</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
                        <Tooltip formatter={(v) => [`$${v}`, '']} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Trip Cost" />
                        {tripBudget > 0 && <Line type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Trip Budget" />}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 4. Budget Alerts Summary */}
      {mBudget > 0 && thisMonthTrips.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Month Summary
          </h2>
          <div className="space-y-2">
            {thisMonthTrips.slice(0, 5).map((trip, i) => {
              const overTrip = tripBudget > 0 && trip.cheapest_total > tripBudget;
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{trip.list_name || 'Grocery Trip'}</p>
                    <p className="text-xs text-slate-400">
                      {(() => { try { return format(parseISO(trip.snapshot_date), 'MMM d'); } catch { return ''; } })()}
                      {trip.cheapest_store ? ` · Best: ${trip.cheapest_store}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${overTrip ? 'text-red-600' : 'text-emerald-600'}`}>
                      ${(trip.cheapest_total || 0).toFixed(2)}
                    </p>
                    {overTrip && <p className="text-xs text-red-400">+${(trip.cheapest_total - tripBudget).toFixed(2)} over</p>}
                  </div>
                </div>
              );
            })}
          </div>
          {!isOverBudget && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <p className="text-sm font-bold text-emerald-700">🎉 You stayed ${(mBudget - thisMonthSpend).toFixed(2)} under budget this month!</p>
            </div>
          )}
        </div>
      )}

      {/* 5. AI Smart Suggestions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" /> AI Smart Suggestions
        </h2>
        <p className="text-xs text-slate-500 mb-4">Personalized tips based on your shopping patterns.</p>

        {aiTips === null && (
          <Button
            onClick={getAiTips}
            disabled={loadingTips}
            className="h-9 px-5 rounded-xl text-sm font-semibold gap-2"
            style={{ backgroundColor: THRFT_BLUE }}
          >
            {loadingTips ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : '✨ Get My Tips'}
          </Button>
        )}

        {aiTips && (
          <div className="space-y-2">
            {aiTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white rounded-xl border border-blue-100 p-3">
                <span className="text-base shrink-0">💡</span>
                <p className="text-sm text-slate-700">{tip}</p>
              </div>
            ))}
            <button onClick={() => setAiTips(null)} className="text-xs text-blue-500 hover:text-blue-700 underline mt-1">Refresh tips</button>
          </div>
        )}
      </div>
    </div>
  );
}