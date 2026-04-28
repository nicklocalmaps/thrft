import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, Loader2, Store,
  ChevronDown, ChevronUp, CheckSquare,
  TrendingDown, ExternalLink, Check,
  AlertCircle, Zap, BarChart2, ShoppingBag,
} from 'lucide-react';
import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import AddItemForm from '@/components/grocery/AddItemForm';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import StoreCard from '@/components/grocery/StoreCard';
import StorePicker from '@/components/grocery/StorePicker';
import PriceHistoryChart from '@/components/grocery/PriceHistoryChart';
import ListBudget from '@/components/grocery/ListBudget';
import CouponListMatcher from '@/components/coupons/CouponListMatcher';
import FreeTrialModal from '@/components/subscription/FreeTrialModal';
import useUserTier, { FREE_TIER_STORES } from '@/hooks/useUserTier';
import { ALL_STORES } from '@/lib/storeConfig';
import NearbyStoresMap from '@/components/grocery/NearbyStoresMap';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';
const THRFT_DARK = '#1e3a5f';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

const THRFT_MARKUP = 0;

const AFFILIATE_URLS = {
  instacart: (store) => `https://www.instacart.com/store/${store}?utm_source=thrft&utm_medium=affiliate`,
  shipt:     (store) => `https://www.shipt.com/store/${store}?ref=thrft`,
  walmart:   ()      => `https://www.walmart.com/grocery?affiliateId=thrft`,
  kroger:    ()      => `https://www.kroger.com/d/grocery-delivery?utm_source=thrft`,
  amazon:    ()      => `https://www.amazon.com/alm/storefront?utm_source=thrft`,
  default:   (store) => `https://www.instacart.com/store/${store}?utm_source=thrft`,
};

const NATIVE_DELIVERY  = new Set(['walmart', 'kroger', 'fred_meyer', 'harris_teeter', 'amazon', 'whole_foods']);
const SHIPT_STORES_SET = new Set(['target', 'kroger', 'harris_teeter', 'publix', 'meijer', 'heb']);
const KROGER_FAMILY    = ['kroger', 'fred_meyer', 'king_soopers', 'city_market', 'smiths', 'harris_teeter', 'jewel_osco'];

const TTL_LIVE      = 4  * 60 * 60 * 1000;
const TTL_ESTIMATED = 24 * 60 * 60 * 1000;

// ─── Delivery helpers ─────────────────────────────────────────────────────────

function findBestDelivery(priceData, allStores) {
  if (!priceData) return null;
  let best = null;

  for (const [key, data] of Object.entries(priceData)) {
    const storeMeta = allStores.find(s => s.key === key);
    const baseTotal = Array.isArray(data)
      ? data.reduce((s, i) => s + (i.price || 0), 0)
      : (data?.instore_total ?? 0);
    if (!baseTotal) continue;

    const options = [];

    if (NATIVE_DELIVERY.has(key)) {
      const fee = key === 'walmart' ? 0 : key === 'amazon' ? 0 : 6.95;
      options.push({ service: key === 'walmart' ? 'Walmart+ Delivery' : key === 'amazon' ? 'Amazon Fresh' : `${storeMeta?.name} Delivery`, fee, affiliateUrl: (AFFILIATE_URLS[key] || AFFILIATE_URLS.default)(key) });
    }

    if (data?.instacart_available !== false) {
      const fee = data?.instacart_fee ?? 5.99;
      options.push({ service: 'Instacart', fee, affiliateUrl: AFFILIATE_URLS.instacart(key) });
    }

    if (SHIPT_STORES_SET.has(key) || data?.shipt_available) {
      const fee = data?.shipt_fee ?? 7.00;
      options.push({ service: 'Shipt', fee, affiliateUrl: AFFILIATE_URLS.shipt(key) });
    }

    for (const opt of options) {
      const allIn = baseTotal + opt.fee;
      if (!best || allIn < best.allIn) {
        best = {
          storeKey:     key,
          storeName:    storeMeta?.name || key,
          instoreTotal: baseTotal,
          deliveryFee:  opt.fee,
          service:      opt.service,
          affiliateUrl: opt.affiliateUrl,
          allIn,
          thrftPrice:   Math.round(allIn * 100) / 100,
          arrivalLabel: 'Today, 2–4pm',
        };
      }
    }
  }

  return best;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

function itemsFingerprint(items = []) {
  return items.map(i => `${i.name}:${i.quantity}:${i.search_hint || ''}`).sort().join('|');
}

function ageMs(lastCompared) {
  if (!lastCompared) return Infinity;
  return Date.now() - new Date(lastCompared).getTime();
}

function ageLabel(lastCompared) {
  if (!lastCompared) return null;
  const ms = ageMs(lastCompared);
  const h  = Math.floor(ms / 3_600_000);
  const m  = Math.floor(ms / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1)  return `${h}h ago`;
  if (m >= 1)  return `${m}m ago`;
  return 'just now';
}

function storeStatus(storeKey, priceData, lastCompared) {
  if (!priceData?.[storeKey]) return 'missing';
  const ttl = KROGER_FAMILY.includes(storeKey) ? TTL_LIVE : TTL_ESTIMATED;
  return ageMs(lastCompared) < ttl ? 'fresh' : 'stale';
}

function cacheStatus(list, items) {
  if (!list?.price_data || Object.keys(list.price_data).length === 0) return 'empty';
  const savedFp   = list.items_fingerprint;
  const currentFp = itemsFingerprint(items);
  if (savedFp && savedFp !== currentFp) return 'changed';
  const statuses = Object.keys(list.price_data).map(k => storeStatus(k, list.price_data, list.last_compared));
  if (statuses.every(s => s === 'fresh')) return 'fresh';
  return 'stale';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CacheBanner({ status, lastCompared, itemsAdded, onRefresh }) {
  if (status === 'empty') return null;

  if (status === 'fresh') return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4">
      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
      <p className="text-xs text-emerald-700 flex-1">Prices loaded instantly · compared {ageLabel(lastCompared)}</p>
      <span className="text-xs font-semibold text-emerald-600">Fresh</span>
    </motion.div>
  );

  if (status === 'stale') return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4 cursor-pointer"
      onClick={onRefresh}>
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <p className="text-xs text-amber-800 flex-1">Prices from {ageLabel(lastCompared)} · may have changed</p>
      <span className="text-xs font-semibold text-amber-700 underline">Refresh</span>
    </motion.div>
  );

  if (status === 'changed') return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-4">
      <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: THRFT_BLUE }} />
      <p className="text-xs flex-1" style={{ color: '#1d4ed8' }}>
        {itemsAdded > 0 ? `${itemsAdded} item${itemsAdded !== 1 ? 's' : ''} added` : 'List changed'} · compare again for updated prices
      </p>
    </motion.div>
  );

  return null;
}

function StoreBadge({ storeKey, lastCompared }) {
  const status = storeStatus(storeKey, { [storeKey]: true }, lastCompared);
  const isLive = KROGER_FAMILY.includes(storeKey);
  const age    = ageLabel(lastCompared);

  if (status === 'fresh') return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
      {isLive ? `✓ Live · ${age}` : `Est · ${age}`}
    </span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-amber-50 text-amber-700 border-amber-200">{age}</span>
  );
}

function StoreProgressRow({ storeKey, storeName, rowStatus, foundTotal }) {
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 ${
        rowStatus === 'cached' ? 'bg-emerald-50' : rowStatus === 'active' ? 'bg-blue-50' : 'opacity-50'
      }`}>
      {rowStatus === 'cached' && (
        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
        </div>
      )}
      {rowStatus === 'active' && (
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
        </div>
      )}
      {rowStatus === 'waiting' && (
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${
          rowStatus === 'cached' ? 'text-emerald-800' : rowStatus === 'active' ? 'text-blue-800' : 'text-slate-500'
        }`}>{storeName}</p>
        <p className={`text-xs truncate ${
          rowStatus === 'cached' ? 'text-emerald-600' : rowStatus === 'active' ? 'text-blue-500' : 'text-slate-400'
        }`}>
          {rowStatus === 'cached' ? `Cached · $${foundTotal?.toFixed(2) ?? '—'}` :
           rowStatus === 'active' ? 'Refreshing prices…' : 'Queued…'}
        </p>
      </div>
      {rowStatus === 'cached' && <span className="text-xs font-semibold text-emerald-600 shrink-0">Cached</span>}
      {rowStatus === 'active' && <span className="text-xs text-blue-400 shrink-0">~8s</span>}
    </motion.div>
  );
}

function ShimmerCard({ opacity = 1 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4" style={{ opacity }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse mb-3" />
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-2.5 w-3/5 rounded-full bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function WinnerBanner({ storeName, total, savings }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <span className="text-base font-bold text-emerald-900">{storeName} wins</span>
        </div>
        <span className="text-xl font-extrabold text-emerald-700">${total.toFixed(2)}</span>
      </div>
      <p className="text-sm text-emerald-700">
        You save <strong>${savings.toFixed(2)}</strong> vs. most expensive
        {' '}({Math.round((savings / (total + savings)) * 100)}% off)
      </p>
    </motion.div>
  );
}

function StickyCompareButton({ cStatus, comparing, items, selectedStores, storesRefreshing, onCompare }) {
  const disabled = comparing || items.length === 0 || selectedStores.length === 0;

  if (cStatus === 'fresh' && !comparing) {
    return (
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <button onClick={onCompare} disabled={disabled}
            className="w-full bg-white border border-slate-200 text-slate-500 rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh comparison
          </button>
        </div>
      </div>
    );
  }

  const label = comparing
    ? `Refreshing ${storesRefreshing} store${storesRefreshing !== 1 ? 's' : ''}…`
    : cStatus === 'stale'   ? 'Refresh prices now'
    : cStatus === 'changed' ? `Compare prices across ${selectedStores.length} stores`
    : `Compare prices across ${selectedStores.length} stores`;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 70%, rgba(255,255,255,0))', paddingTop: 16 }}>
        <button onClick={onCompare} disabled={disabled}
          className="w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={{ backgroundColor: disabled ? '#94a3b8' : THRFT_BLUE, boxShadow: disabled ? 'none' : '0 6px 24px rgba(65,129,237,.4)' }}>
          {comparing
            ? <><Loader2 className="w-4 h-4 animate-spin" />{label}</>
            : <><TrendingDown className="w-4 h-4" />{label}</>}
        </button>
      </div>
    </div>
  );
}

function MethodTabs({ value, onChange }) {
  const tabs = [
    { key: 'instore',  label: 'In-Store', icon: '🏪' },
    { key: 'pickup',   label: 'Pickup',   icon: '🚗' },
    { key: 'delivery', label: 'Delivery', icon: '🚚' },
    { key: 'all',      label: 'All',      icon: '📦' },
  ];
  return (
    <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-5">
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            background: value === tab.key ? '#ffffff'  : 'transparent',
            color:      value === tab.key ? '#0f172a'  : '#94a3b8',
            boxShadow:  value === tab.key ? '0 1px 4px rgba(0,0,0,.07)' : 'none',
          }}>
          <span style={{ fontSize: 13 }}>{tab.icon}</span>
          <span className="block" style={{ fontSize: 9, marginTop: 1 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function ThrftDeliveryCard({ delivery, nextCheapestAllIn, onOrder }) {
  if (!delivery) return null;
  const savings = nextCheapestAllIn ? Math.max(0, nextCheapestAllIn - delivery.thrftPrice) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="rounded-2xl overflow-hidden mb-4"
      style={{ background: `linear-gradient(135deg, ${THRFT_DARK}, #2d5491)` }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold text-white">THRFT Delivery</span>
              <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">Best deal</span>
            </div>
            <p className="text-3xl font-extrabold text-white">${delivery.thrftPrice.toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-0.5">Incl. delivery · arrives {delivery.arrivalLabel}</p>
          </div>
          {savings > 0.01 && (
            <div className="text-right shrink-0 ml-3">
              <p className="text-xs text-white/50 mb-0.5">vs. next cheapest</p>
              <p className="text-sm font-bold text-emerald-400">Save ${savings.toFixed(2)}</p>
            </div>
          )}
        </div>

        <div className="bg-white/10 rounded-xl px-4 py-3 space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/65">🕐 Estimated arrival</span>
            <span className="text-xs font-semibold text-white">{delivery.arrivalLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/65">📦 Fulfilled by</span>
            <span className="text-xs font-semibold text-white/80">THRFT partner</span>
          </div>
        </div>

        <button onClick={onOrder}
          className="w-full bg-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-50 active:scale-[.98]"
          style={{ color: THRFT_DARK }}>
          <ShoppingBag className="w-4 h-4" />
          Order via THRFT Delivery
        </button>
      </div>
    </motion.div>
  );
}

function HandoffModal({ delivery, nextCheapestAllIn, onConfirm, onClose }) {
  const savings = nextCheapestAllIn ? Math.max(0, nextCheapestAllIn - delivery.thrftPrice) : 0;
  const breakdown = [
    { label: 'Your list total', value: `$${delivery.instoreTotal.toFixed(2)}` },
    { label: 'Delivery fee',    value: delivery.deliveryFee > 0 ? `$${delivery.deliveryFee.toFixed(2)}` : 'Free' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl overflow-hidden">
              <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-slate-900">THRFT Delivery</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-5">
          <p className="text-base font-bold text-slate-900 mb-1">Almost there!</p>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            We found the best delivery price for your list. You'll complete your order with our delivery partner — then come right back to THRFT.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-2">
            {breakdown.map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-semibold text-slate-800">{row.value}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-base font-extrabold" style={{ color: THRFT_BLUE }}>${delivery.thrftPrice.toFixed(2)}</span>
            </div>
          </div>

          {savings > 0.01 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
              <p className="text-xs text-emerald-700">
                You're saving <strong>${savings.toFixed(2)}</strong> vs. the next cheapest delivery option
              </p>
            </div>
          )}

          <button onClick={onConfirm}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 mb-3 transition-all active:scale-[.98]"
            style={{ backgroundColor: THRFT_BLUE, boxShadow: '0 4px 14px rgba(65,129,237,.35)' }}>
            <ExternalLink className="w-4 h-4" />
            Continue to checkout
          </button>
          <p className="text-xs text-slate-400 text-center">You'll be redirected to complete your order · takes ~2 min</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrderConfirmedScreen({ delivery, nextCheapest, lifetimeSavings, ordersThisMonth, onNewList, onClose }) {
  const savings = (nextCheapest && delivery) ? Math.max(0, nextCheapest - delivery.thrftPrice) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Delivery on its way!</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Your groceries are being picked and will arrive {delivery?.arrivalLabel || 'today'}.
          </p>

          <div className="w-full rounded-2xl p-4 mb-4 text-center"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '0.5px solid #86efac' }}>
            <p className="text-xs font-semibold text-emerald-600 mb-1">You saved with THRFT</p>
            <p className="text-3xl font-extrabold text-emerald-700 mb-1">${savings.toFixed(2)}</p>
            <p className="text-xs text-emerald-600">vs. the next cheapest delivery option</p>
          </div>

          <div className="w-full bg-slate-50 rounded-2xl p-4 mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total saved with THRFT</span>
              <span className="text-sm font-bold text-slate-900">${(lifetimeSavings || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Orders this month</span>
              <span className="text-sm font-bold text-slate-900">{ordersThisMonth || 1}</span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <button onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
              View order status →
            </button>
            <button onClick={onNewList}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: THRFT_BLUE }}>
              Start a new list
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ListDetail() {
  const urlParams   = new URLSearchParams(window.location.search);
  const listId      = urlParams.get('id');
  const queryClient = useQueryClient();
  const { isPremium } = useUserTier();
  const resultsRef    = useRef(null);
  const trialTimerRef = useRef(null);

  const [localItems, setLocalItems]           = useState(null);
  const [comparing, setComparing]             = useState(false);
  const [showTrialModal, setShowTrialModal]   = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [selectedStores, setSelectedStores]   = useState([]);
  const [shoppingMode, setShoppingMode]       = useState(false);
  const [checkedItems, setCheckedItems]       = useState(new Set());
  const [showHistory, setShowHistory]         = useState(false);
  const [shoppingMethod, setShoppingMethod]   = useState('instore');
  const [storeProgress, setStoreProgress]     = useState({});
  const [partialResults, setPartialResults]   = useState({});
  const [storesRefreshing, setStoresRefreshing] = useState(0);

  // Delivery state
  const [showHandoff, setShowHandoff]         = useState(false);
  const [showConfirmed, setShowConfirmed]     = useState(false);
  const [deliveryOrdered, setDeliveryOrdered] = useState(null);
  const [lifetimeSavings, setLifetimeSavings] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const addItemParam = urlParams.get('addItem');
    if (addItemParam) {
      try {
        const item = JSON.parse(decodeURIComponent(addItemParam));
        window.history.replaceState({}, '', `/ListDetail?id=${listId}`);
        const doAdd = async () => {
          const lists = await base44.entities.GroceryList.filter({ id: listId });
          const currentItems = lists[0]?.items || [];
          const newItems = [...currentItems, item];
          setLocalItems(newItems);
          await base44.entities.GroceryList.update(listId, { items: newItems });
          queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
        };
        doAdd();
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!isPremium)                         setSelectedStores(FREE_TIER_STORES);
      else if (user?.favorite_stores?.length) setSelectedStores(user.favorite_stores);
      else                                    setSelectedStores(['kroger', 'walmart', 'amazon']);
    }).catch(() => setSelectedStores(['kroger', 'walmart', 'amazon']));
  }, [isPremium]);

  useEffect(() => {
    if (!comparing && resultsRef.current) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [comparing]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: list, isLoading } = useQuery({
    queryKey: ['grocery-list', listId],
    queryFn:  () => base44.entities.GroceryList.filter({ id: listId }),
    select:   data => data[0],
    enabled:  !!listId,
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn:  () => base44.entities.Coupon.filter({ status: 'active' }),
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const items             = localItems || list?.items || [];
  const cStatus           = useMemo(() => cacheStatus(list, items), [list, items]);
  const priceData         = comparing ? partialResults : list?.price_data;
  const comparedStoreKeys = priceData ? Object.keys(priceData) : [];

  const storeTotals = useMemo(() => {
    if (!priceData) return null;
    return Object.fromEntries(
      comparedStoreKeys.map(k => {
        const d = priceData[k];
        const t = Array.isArray(d) ? d.reduce((s, i) => s + (i.price || 0), 0)
                : (d?.instore_total ?? d?.items?.reduce((s, i) => s + (i.price || 0), 0) ?? 0);
        return [k, t];
      })
    );
  }, [priceData]);

  const cheapestStore = useMemo(() => {
    if (!storeTotals || !Object.keys(storeTotals).length) return null;
    return Object.entries(storeTotals).reduce((a, b) => a[1] < b[1] ? a : b)[0];
  }, [storeTotals]);

  const maxTotal        = storeTotals ? Math.max(...Object.values(storeTotals)) : 0;
  const savings         = cheapestStore && storeTotals ? maxTotal - storeTotals[cheapestStore] : 0;
  const SHIPT_STORES    = useMemo(() => new Set(ALL_STORES.filter(s => s.shipt).map(s => s.key)), []);
  const effectiveStores = isPremium ? selectedStores : FREE_TIER_STORES;

  const bestDelivery = useMemo(
    () => (shoppingMethod === 'delivery' || shoppingMethod === 'all') ? findBestDelivery(priceData, ALL_STORES) : null,
    [priceData, shoppingMethod]
  );

  const nextCheapestDelivery = useMemo(() => {
    if (!priceData || !bestDelivery) return null;
    let secondBest = null;
    for (const [key, data] of Object.entries(priceData)) {
      if (key === bestDelivery.storeKey) continue;
      const base = Array.isArray(data) ? data.reduce((s, i) => s + (i.price || 0), 0) : (data?.instore_total ?? 0);
      if (!base) continue;
      const allIn = base + (data?.instacart_fee ?? 5.99);
      if (!secondBest || allIn < secondBest) secondBest = allIn;
    }
    return secondBest;
  }, [priceData, bestDelivery]);

  const itemsAdded = useMemo(() => {
    if (!list?.items_fingerprint) return 0;
    const prev = list.items_fingerprint.split('|').length;
    return Math.max(0, items.length - prev);
  }, [items, list?.items_fingerprint]);

  // ── Item mutations ─────────────────────────────────────────────────────────

  const addItem = async item => {
    const newItems = [...items, item];
    setLocalItems(newItems);
    await base44.entities.GroceryList.update(listId, { items: newItems });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const removeItem = async index => {
    const newItems = items.filter((_, i) => i !== index);
    setLocalItems(newItems);
    await base44.entities.GroceryList.update(listId, { items: newItems });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const updateQuantity = async (index, qty) => {
    const newItems = items.map((item, i) => i === index ? { ...item, quantity: qty } : item);
    setLocalItems(newItems);
    await base44.entities.GroceryList.update(listId, { items: newItems });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const toggleChecked = index => setCheckedItems(prev => {
    const next = new Set(prev);
    next.has(index) ? next.delete(index) : next.add(index);
    return next;
  });

  const saveStores = async stores => {
    setSelectedStores(stores);
    await base44.entities.GroceryList.update(listId, { selected_stores: stores });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  // ── Schema helper ──────────────────────────────────────────────────────────

  const storeSchema = useCallback((withPickup, withDelivery) => ({
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            item_name:    { type: 'string'  },
            product_name: { type: 'string'  },
            price:        { type: 'number'  },
            unit_price:   { type: 'string'  },
            in_stock:     { type: 'boolean' },
          },
        },
      },
      instore_total: { type: 'number' },
      ...(withPickup ? { pickup_total: { type: 'number' }, pickup_available: { type: 'boolean' } } : {}),
      ...(withDelivery ? {
        instacart_fee:       { type: 'number'  },
        instacart_available: { type: 'boolean' },
        shipt_fee:           { type: 'number'  },
        shipt_available:     { type: 'boolean' },
      } : {}),
    },
  }), []);

  // ── Delivery handlers ──────────────────────────────────────────────────────

  const handleOrderDelivery = () => {
    setDeliveryOrdered(bestDelivery);
    setShowHandoff(true);
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryOrdered) return;
    window.open(deliveryOrdered.affiliateUrl, '_blank');
    setShowHandoff(false);

    try {
      const user = await base44.auth.me().catch(() => null);
      const prev   = user?.lifetime_delivery_savings || 0;
      const months = user?.delivery_orders_this_month || 0;
      const saved  = deliveryOrdered.thrftPrice * THRFT_MARKUP / (1 + THRFT_MARKUP);
      setLifetimeSavings(prev + saved);
      setOrdersThisMonth(months + 1);
      await base44.auth.updateMe({
        lifetime_delivery_savings:  prev + saved,
        delivery_orders_this_month: months + 1,
      }).catch(() => {});
    } catch (_) {}

    setTimeout(() => setShowConfirmed(true), 1200);
  };

  // ── Compare with smart caching ─────────────────────────────────────────────

  const comparePrices = async (forceRefresh = false) => {
    if (items.length === 0 || effectiveStores.length === 0) return;

    const includePickup   = isPremium && (shoppingMethod === 'pickup'   || shoppingMethod === 'all');
    const includeDelivery = isPremium && (shoppingMethod === 'delivery' || shoppingMethod === 'all');

    const existingData    = list?.price_data || {};
    const itemsChanged    = cStatus === 'changed' || cStatus === 'empty';

    const storesToRefresh = forceRefresh || itemsChanged
      ? effectiveStores
      : effectiveStores.filter(k => storeStatus(k, existingData, list?.last_compared) === 'stale' || !existingData[k]);

    const storesToCache = effectiveStores.filter(k => !storesToRefresh.includes(k));

    setComparing(true);
    setStoresRefreshing(storesToRefresh.length);
    setPartialResults({ ...existingData });

    const initProgress = {};
    storesToCache.forEach(k => { initProgress[k] = 'cached'; });
    storesToRefresh.forEach((k, i) => { initProgress[k] = i === 0 ? 'active' : 'waiting'; });
    setStoreProgress(initProgress);

    const userZip   = (await base44.auth.me().catch(() => null))?.zip_code || '10001';
    const finalData = { ...existingData };

    const itemsList = items.map(i => {
      const hint = i.search_hint || i.name;
      return i.is_branded
        ? `${i.quantity}x "${hint}" (exact branded product)`
        : `${i.quantity}x "${hint}" (generic — store-brand ok)`;
    }).join('\n');

    const krogerToRefresh = storesToRefresh.filter(k => KROGER_FAMILY.includes(k));
    const aiToRefresh     = storesToRefresh.filter(k => !KROGER_FAMILY.includes(k));

    if (krogerToRefresh.length > 0) {
      krogerToRefresh.forEach(k => setStoreProgress(p => ({ ...p, [k]: 'active' })));
      try {
        const res = await base44.functions.invoke('krogerPrices', {
          items:      items.map(i => ({ ...i, name: i.search_hint || i.name })),
          store_keys: krogerToRefresh,
          zip_code:   userZip,
        });
        const krogerData = res.data?.results || {};
        for (const k of krogerToRefresh) {
          const d = krogerData[k];
          if (d) {
            if (includePickup)   { d.pickup_available = true; d.pickup_total = d.instore_total; }
            if (includeDelivery) {
              d.instacart_available = true;
              d.instacart_fee       = 5.99;
              d.shipt_available     = SHIPT_STORES.has(k);
              d.shipt_fee           = SHIPT_STORES.has(k) ? 7.00 : 0;
            }
            d.source    = 'kroger_api';
            finalData[k] = d;
          } else {
            const storeName = ALL_STORES.find(s => s.key === k)?.name || k;
            const props = {}; props[k] = storeSchema(includePickup, includeDelivery);
            const fallback = await base44.integrations.Core.InvokeLLM({
              prompt: `Provide realistic grocery prices for ${storeName}.\nItems:\n${itemsList}\nALWAYS find a substitute. Never leave an item out.`,
              model: 'gemini_3_flash',
              response_json_schema: { type: 'object', properties: props },
            });
            if (fallback?.[k]) finalData[k] = fallback[k];
          }
          setStoreProgress(p => ({ ...p, [k]: 'done' }));
          setPartialResults(r => ({ ...r, [k]: finalData[k] }));
        }
      } catch {
        krogerToRefresh.forEach(k => setStoreProgress(p => ({ ...p, [k]: 'done' })));
      }
    }

    if (aiToRefresh.length > 0) {
      const BATCH_SIZE = 3;
      for (let i = 0; i < aiToRefresh.length; i += BATCH_SIZE) {
        const batch = aiToRefresh.slice(i, i + BATCH_SIZE);
        batch.forEach(k => setStoreProgress(p => ({ ...p, [k]: 'active' })));

        const batchNames = batch.map(k => ALL_STORES.find(s => s.key === k)?.name || k);
        const batchProps = {};
        batch.forEach(k => { batchProps[k] = storeSchema(includePickup, includeDelivery); });

        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a grocery price comparison assistant. Provide realistic estimated prices from: ${batchNames.join(', ')}.\n\nItems:\n${itemsList}\n\nCRITICAL: ALWAYS find a product for every item. Never mark unavailable unless no comparable product exists. Calculate instore_total as sum of ALL items.`,
            add_context_from_internet: true,
            model: 'gemini_3_flash',
            response_json_schema: { type: 'object', properties: batchProps },
          });
          batch.forEach(k => {
            if (result?.[k]) { finalData[k] = result[k]; setPartialResults(r => ({ ...r, [k]: result[k] })); }
            setStoreProgress(p => ({ ...p, [k]: 'done' }));
          });
        } catch {
          batch.forEach(k => setStoreProgress(p => ({ ...p, [k]: 'done' })));
        }
      }
    }

    const now = new Date().toISOString();
    await base44.entities.GroceryList.update(listId, {
      price_data:        finalData,
      selected_stores:   effectiveStores,
      last_compared:     now,
      items_fingerprint: itemsFingerprint(items),
    });

    const storeTotalsSnap = Object.fromEntries(
      Object.entries(finalData).map(([k, d]) => {
        const t = Array.isArray(d) ? d.reduce((s, i) => s + (i.price || 0), 0) : (d?.instore_total ?? 0);
        return [k, t];
      })
    );
    const cheapestEntry = Object.entries(storeTotalsSnap).reduce((a, b) => a[1] < b[1] ? a : b, ['', Infinity]);
    try {
      await base44.entities.PriceHistory.create({
        list_id:        listId,
        list_name:      list.name,
        snapshot_date:  now,
        store_totals:   storeTotalsSnap,
        cheapest_store: cheapestEntry[0],
        cheapest_total: cheapestEntry[1],
        item_count:     items.length,
      });
    } catch (_) {}

    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
    queryClient.invalidateQueries({ queryKey: ['price-history', listId] });
    setComparing(false);
    setStoreProgress({});
    setStoresRefreshing(0);

    const user = await base44.auth.me().catch(() => null);
    if (!['trialing', 'active'].includes(user?.subscription_status)) {
      clearTimeout(trialTimerRef.current);
      trialTimerRef.current = setTimeout(() => setShowTrialModal(true), 30_000);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  if (!list) return (
    <div className="text-center py-20">
      <p className="text-slate-600 mb-2">List not found.</p>
      <Link to="/Home" className="text-sm font-medium hover:underline" style={{ color: THRFT_BLUE }}>Go back home</Link>
    </div>
  );

  return (
    <div className="pb-32">
      {showTrialModal && (
        <FreeTrialModal onClose={() => { setShowTrialModal(false); clearTimeout(trialTimerRef.current); }} />
      )}

      <AnimatePresence>
        {showHandoff && deliveryOrdered && (
          <HandoffModal
            delivery={deliveryOrdered}
            nextCheapestAllIn={nextCheapestDelivery}
            onConfirm={handleConfirmDelivery}
            onClose={() => setShowHandoff(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showConfirmed && deliveryOrdered && (
          <OrderConfirmedScreen
            delivery={deliveryOrdered}
            nextCheapest={nextCheapestDelivery}
            lifetimeSavings={lifetimeSavings}
            ordersThisMonth={ordersThisMonth}
            onNewList={() => { setShowConfirmed(false); window.location.href = '/NewList'; }}
            onClose={() => setShowConfirmed(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to="/Home">
          <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">{list.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''}
            {list.last_compared && <> · Last compared {ageLabel(list.last_compared)}</>}
          </p>
        </div>
        <button
          onClick={() => { setShoppingMode(!shoppingMode); setCheckedItems(new Set()); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            shoppingMode ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          style={shoppingMode ? { backgroundColor: THRFT_BLUE } : {}}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          {shoppingMode ? 'Done' : 'Shop mode'}
        </button>
      </div>

      {/* Coupons */}
      <CouponListMatcher
        coupons={coupons}
        list={{ ...list, items }}
        onItemAdded={() => queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] })}
      />

      {/* Cache banner */}
      {cStatus !== 'empty' && (
        <CacheBanner
          status={cStatus}
          lastCompared={list.last_compared}
          itemsAdded={itemsAdded}
          onRefresh={() => comparePrices(true)}
        />
      )}

      {/* Add item */}
      <div className="mb-4">
        <AddItemForm onAdd={addItem} listId={listId} />
      </div>

      {/* Item list */}
      <div className="space-y-2 mb-5">
        {shoppingMode ? (
          <>
            <p className="text-xs text-slate-400 mb-2">Tap to check off as you shop</p>
            {items.map((item, i) => {
              const checked = checkedItems.has(i);
              return (
                <button key={`${item.name}-${i}`} onClick={() => toggleChecked(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'
                  }`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}>
                    {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">{item.quantity}</span>
                    <span className={`text-sm font-medium ${checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.name}</span>
                  </div>
                </button>
              );
            })}
            {checkedItems.size > 0 && (
              <p className="text-xs text-slate-400 text-center pt-1">{checkedItems.size} of {items.length} checked off</p>
            )}
          </>
        ) : (
          <AnimatePresence>
            {items.map((item, i) => (
              <GroceryItemRow
                key={`${item.name}-${i}`}
                item={item}
                index={i}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Store picker */}
      {items.length > 0 && (
        <div className="mb-5 rounded-2xl border border-slate-100 bg-white overflow-hidden">
          {!isPremium ? (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Stores</span>
                <Link to="/Subscribe" className="text-xs font-semibold underline" style={{ color: THRFT_BLUE }}>
                  Upgrade for 50+ stores →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Walmart', 'Kroger', 'Amazon Fresh'].map(name => (
                  <span key={name} className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 border border-blue-200 text-blue-700">{name}</span>
                ))}
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setShowStorePicker(!showStorePicker)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" style={{ color: THRFT_BLUE }} />
                  <span className="text-sm font-semibold text-slate-800">Stores</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {selectedStores.length} selected
                  </span>
                </div>
                {showStorePicker ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {showStorePicker && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden px-4 pb-4 border-t border-slate-100">
                    <div className="pt-4">
                      <StorePicker selected={selectedStores} onChange={saveStores} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}

      {/* Budget */}
      {items.length > 0 && (
        <div className="mb-5">
          <ListBudget list={list} priceData={list?.price_data}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] })} />
        </div>
      )}

      {/* Loading progress */}
      <AnimatePresence>
        {comparing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
            <div className="flex flex-col items-center py-6 mb-4">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ThrftCartIcon className="w-7 h-7" style={{ color: THRFT_BLUE }} />
                </div>
              </div>
              <p className="text-base font-bold text-slate-900">
                {storesRefreshing < effectiveStores.length
                  ? `Refreshing ${storesRefreshing} of ${effectiveStores.length} stores…`
                  : 'Finding best prices…'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {effectiveStores.length - storesRefreshing} store{effectiveStores.length - storesRefreshing !== 1 ? 's' : ''} loaded from cache
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-3 mb-4">
              {effectiveStores.map(k => {
                const meta    = ALL_STORES.find(s => s.key === k);
                const pStatus = storeProgress[k] || 'waiting';
                const total   = partialResults[k]
                  ? (partialResults[k]?.instore_total ?? partialResults[k]?.items?.reduce((s, i) => s + (i.price || 0), 0) ?? 0)
                  : null;
                return <StoreProgressRow key={k} storeKey={k} storeName={meta?.name || k} rowStatus={pStatus} foundTotal={total} />;
              })}
            </div>

            <p className="text-xs text-slate-400 font-medium mb-2">Results loading…</p>
            <ShimmerCard />
            <ShimmerCard opacity={0.6} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {priceData && !comparing && comparedStoreKeys.length > 0 && (
        <motion.div ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          <MethodTabs value={shoppingMethod} onChange={setShoppingMethod} />

          <AnimatePresence>
            {(shoppingMethod === 'delivery' || shoppingMethod === 'all') && bestDelivery && (
              <ThrftDeliveryCard
                delivery={bestDelivery}
                nextCheapestAllIn={nextCheapestDelivery}
                onOrder={handleOrderDelivery}
              />
            )}
          </AnimatePresence>

          {(shoppingMethod === 'delivery' || shoppingMethod === 'all') && bestDelivery && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">Other delivery options</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Price comparison</h2>
            <button onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <BarChart2 className="w-3.5 h-3.5" />
              {showHistory ? 'Hide' : 'View'} history
            </button>
          </div>

          <PriceHistoryChart listId={listId} open={showHistory} onClose={() => setShowHistory(false)} />

          {cheapestStore && savings > 0.01 && (
            <WinnerBanner
              storeKey={cheapestStore}
              storeName={ALL_STORES.find(s => s.key === cheapestStore)?.name || cheapestStore}
              total={storeTotals[cheapestStore]}
              savings={savings}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {comparedStoreKeys
              .slice()
              .sort((a, b) => (storeTotals?.[a] || 0) - (storeTotals?.[b] || 0))
              .map((storeKey, i) => {
                const storeMeta = ALL_STORES.find(s => s.key === storeKey);
                return (
                  <div key={storeKey} className="relative">
                    <StoreCard
                      storeKey={storeKey}
                      storeName={storeMeta?.name || storeKey}
                      storeColor={storeMeta?.color || 'blue'}
                      storeData={priceData[storeKey]}
                      isCheapest={cheapestStore === storeKey}
                      index={i}
                      shoppingMethod={shoppingMethod}
                      isPremium={isPremium}
                    />
                    <div className="absolute top-3 right-3">
                      <StoreBadge storeKey={storeKey} lastCompared={list.last_compared} />
                    </div>
                  </div>
                );
              })}
          </div>

          <p className="text-xs text-center text-slate-400 mb-6">
            Compared {ageLabel(list.last_compared)} · <button onClick={() => comparePrices(true)} className="underline hover:text-slate-600">force refresh</button>
          </p>

          <div className="mb-4">
            <NearbyStoresMap priceData={list?.price_data} listName={list?.name} />
          </div>
        </motion.div>
      )}

      {items.length > 0 && (
        <StickyCompareButton
          cStatus={cStatus}
          comparing={comparing}
          items={items}
          selectedStores={effectiveStores}
          storesRefreshing={storesRefreshing}
          onCompare={() => comparePrices(false)}
        />
      )}
    </div>
  );
}