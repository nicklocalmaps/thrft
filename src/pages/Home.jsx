import ThrftListIcon from '@/components/icons/ThrftListIcon';
import InstructionModal from '@/components/InstructionModal';
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Trash2, ChevronRight } from 'lucide-react';
import { format, isThisMonth } from 'date-fns';
import { getStoreByKey, ALL_STORES } from '@/lib/storeConfig';
import useUserTier from '@/hooks/useUserTier';

const THRFT_BLUE = '#4181ed';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

const HOME_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/e304df701_Budget1.jpg', nextTop: '5%', dismissTop: '17%' },
];

function getInstoreTotal(storeData) {
  if (!storeData) return null;
  if (Array.isArray(storeData)) return storeData.reduce((s, i) => s + (i.price || 0), 0);
  return storeData.instore_total ?? storeData.items?.reduce((s, i) => s + (i.price || 0), 0) ?? null;
}

function getCheapestStore(priceData) {
  if (!priceData) return null;
  let min = Infinity, winner = null;
  for (const [key, data] of Object.entries(priceData)) {
    const t = getInstoreTotal(data);
    if (t != null && t < min) { min = t; winner = key; }
  }
  return winner ? { key: winner, total: min } : null;
}

function getMaxTotal(priceData) {
  if (!priceData) return 0;
  return Math.max(...Object.values(priceData).map(d => getInstoreTotal(d) ?? 0));
}

function SavingsStrip({ lists }) {
  const stats = useMemo(() => {
    let totalSaved = 0;
    let listsCompared = 0;
    const storeWins = {};
    for (const list of lists) {
      if (!list.price_data || Object.keys(list.price_data).length === 0) continue;
      listsCompared++;
      const cheapest = getCheapestStore(list.price_data);
      const max = getMaxTotal(list.price_data);
      if (cheapest) {
        totalSaved += max - cheapest.total;
        storeWins[cheapest.key] = (storeWins[cheapest.key] || 0) + 1;
      }
    }
    const bestStoreKey = Object.entries(storeWins).sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestStore = bestStoreKey ? (getStoreByKey(bestStoreKey)?.name || bestStoreKey) : null;
    return { totalSaved, listsCompared, bestStore };
  }, [lists]);

  if (stats.listsCompared === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { value: `$${Math.round(stats.totalSaved)}`, label: 'saved this month' },
        { value: stats.listsCompared, label: `list${stats.listsCompared !== 1 ? 's' : ''} compared` },
        { value: stats.bestStore || '—', label: 'best store' },
      ].map(stat => (
        <div key={stat.label} className="text-center rounded-xl py-3 px-2 bg-slate-50">
          <p className="font-bold leading-tight mb-0.5 truncate text-slate-900" style={{ fontSize: stat.value?.length > 5 ? 13 : 18 }}>
            {stat.value}
          </p>
          <p className="text-xs text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function ListCard({ list, index, onDelete }) {
  const itemCount = list.items?.length || 0;
  const priceData = list.price_data;
  const hasCompared = priceData && Object.keys(priceData).length > 0;
  const cheapest = hasCompared ? getCheapestStore(priceData) : null;
  const cheapestMeta = cheapest ? getStoreByKey(cheapest.key) : null;

  const storeResults = hasCompared
    ? Object.entries(priceData)
        .map(([key, data]) => ({ key, total: getInstoreTotal(data) ?? 0 }))
        .filter(s => s.total > 0)
        .sort((a, b) => a.total - b.total)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/ListDetail?id=${list.id}`} className="block group">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                {list.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <ThrftListIcon className="w-3 h-3" />
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
                {list.last_compared && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {format(new Date(list.last_compared), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {cheapest ? (
                <div className="text-right">
                  <p className="text-base font-bold text-emerald-600">${cheapest.total.toFixed(2)}</p>
                  <p className="text-xs text-emerald-500 truncate max-w-[80px]">{cheapestMeta?.name || cheapest.key}</p>
                </div>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                  Compare →
                </span>
              )}
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(list.id); }}
                aria-label="Delete list"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
          {storeResults.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {storeResults.slice(0, 4).map((s, i) => {
                const meta = getStoreByKey(s.key);
                return (
                  <span key={s.key} className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: i === 0 ? '#eff6ff' : '#f8fafc', color: i === 0 ? '#1d4ed8' : '#94a3b8' }}>
                    {meta?.name || s.key}: ${s.total.toFixed(2)}
                  </span>
                );
              })}
              {storeResults.length > 4 && (
                <span className="text-xs text-slate-400 px-2 py-0.5">+{storeResults.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div>
      <div className="rounded-2xl p-5 mb-5" style={{ background: `linear-gradient(135deg, ${THRFT_BLUE}, #3672d4)` }}>
        <p className="text-base font-bold text-white mb-1">Welcome to THRFT 👋</p>
        <p className="text-xs text-white/70 leading-relaxed mb-4">Create your first list and start saving money on groceries today.</p>
        <Link to="/NewList">
          <button className="bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            Create my first list →
          </button>
        </Link>
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">How it works</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ emoji: '📝', label: 'Add items' }, { emoji: '🔍', label: 'Compare stores' }, { emoji: '💰', label: 'Save money' }].map(step => (
          <div key={step.label} className="bg-white rounded-xl border border-slate-100 py-4 text-center">
            <p className="text-2xl mb-2">{step.emoji}</p>
            <p className="text-xs font-semibold text-slate-700">{step.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">My lists</p>
      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <ThrftListIcon className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">No lists yet</p>
        <p className="text-xs text-slate-400">Tap + to create your first list</p>
      </div>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isPremium, isFree } = useUserTier();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['grocery-lists'],
    queryFn: () => base44.entities.GroceryList.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: id => base44.entities.GroceryList.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grocery-lists'] }),
  });

  const thisMonthLists = useMemo(
    () => lists.filter(l => l.last_compared && isThisMonth(new Date(l.last_compared))),
    [lists]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <InstructionModal instructionKey="home" slides={HOME_SLIDES} onClose={() => {}} />

      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
          <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex-1">
          {lists.length === 0 ? 'THRFT' : 'My lists'}
        </h1>
        {isFree && lists.length > 0 && (
          <Link to="/Subscribe" className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={{ color: THRFT_BLUE, borderColor: '#bfdbfe', background: '#eff6ff' }}>
            Upgrade
          </Link>
        )}
        <Link to="/Profile">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </Link>
      </div>

      {lists.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <SavingsStrip lists={thisMonthLists} />
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent lists</p>
            <p className="text-xs text-slate-400">{lists.length} list{lists.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {lists.map((list, i) => (
                <ListCard key={list.id} list={list} index={i} onDelete={id => deleteMutation.mutate(id)} />
              ))}
            </AnimatePresence>
          </div>
          {isPremium && (
            <Link to="/Rewards">
              <div className="mt-5 flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-2xl hover:shadow-sm transition-all">
                <span className="text-xl">🎁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-900">Earn free THRFT</p>
                  <p className="text-xs text-purple-600">Refer a friend, get rewards</p>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
              </div>
            </Link>
          )}
        </>
      )}

      <Link to="/NewList">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: THRFT_BLUE, boxShadow: '0 4px 20px rgba(65,129,237,.45)' }}
          aria-label="New list"
        >
          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
        </motion.div>
      </Link>
    </div>
  );
}