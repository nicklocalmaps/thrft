import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  ShoppingCart,
  Store,
  CheckSquare,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  ExternalLink,
  BarChart2,
  Tag,
} from 'lucide-react';
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

const KROGER_FAMILY = [
  'kroger', 'fred_meyer', 'king_soopers', 'city_market',
  'smiths', 'harris_teeter', 'jewel_osco',
];

const SHIPT_STORES = new Set(ALL_STORES.filter(s => s.shipt).map(s => s.key));

const METHOD_LABELS = {
  instore:  { label: 'In-store',  icon: '🏪' },
  pickup:   { label: 'Pickup',    icon: '🚗' },
  delivery: { label: 'Delivery',  icon: '🚚' },
  all:      { label: 'All',       icon: '📦' },
};

const STORE_COLORS = {
  walmart:      '#0071CE',
  kroger:       '#CC0000',
  amazon:       '#FF9900',
  whole_foods:  '#00704A',
  target:       '#CC0000',
  publix:       '#1a9c3e',
  aldi:         '#006ab3',
  trader_joes:  '#CC0000',
  costco:       '#005DAA',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoreColor(storeKey) {
  return STORE_COLORS[storeKey] || '#4181ed';
}

function instoreTotal(storeData) {
  if (!storeData) return 0;
  if (Array.isArray(storeData)) return storeData.reduce((s, i) => s + (i.price || 0), 0);
  return storeData.instore_total ?? (storeData.items || []).reduce((s, i) => s + (i.price || 0), 0);
}

function isLivePrice(storeData) {
  return storeData?.source === 'kroger_api';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Shopping method tab strip
function MethodTabs({ value, onChange }) {
  const methods = ['instore', 'pickup', 'delivery'];
  return (
    <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-4">
      {methods.map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            value === m
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span style={{ fontSize: 13 }}>{METHOD_LABELS[m]?.icon}</span>
          {METHOD_LABELS[m]?.label}
        </button>
      ))}
    </div>
  );
}

// Compact store pills row (above items)
function StoresPillRow({ selectedStores, isPremium, onEditClick }) {
  const visible = selectedStores.slice(0, 4);
  const overflow = selectedStores.length - 4;
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-4">
      <span className="text-xs text-slate-400 shrink-0">Comparing:</span>
      {visible.map(key => {
        const meta = ALL_STORES.find(s => s.key === key);
        return (
          <span
            key={key}
            className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full"
          >
            {meta?.name || key}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="text-xs text-slate-400">+{overflow} more</span>
      )}
      <button
        onClick={onEditClick}
        className="text-xs font-medium ml-1 px-2 py-1 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
      >
        {isPremium ? 'Edit' : 'Upgrade →'}
      </button>
    </div>
  );
}

// Per-store loading row (State 2)
function StoreLoadingRow({ storeName, storeKey, status, foundTotal }) {
  const color = getStoreColor(storeKey);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 transition-all ${
        status === 'done'    ? 'bg-emerald-50' :
        status === 'active'  ? 'bg-blue-50'    :
        'opacity-50'
      }`}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: status === 'done'   ? '#dcfce7' :
                      status === 'active' ? '#dbeafe' : '#f1f5f9',
        }}
      >
        {status === 'done' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          >
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
          </motion.div>
        )}
        {status === 'active' && (
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        )}
        {status === 'waiting' && (
          <Clock className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${
          status === 'done'   ? 'text-emerald-800' :
          status === 'active' ? 'text-blue-800'    :
          'text-slate-500'
        }`}>
          {storeName}
        </p>
        <p className={`text-xs truncate ${
          status === 'done'   ? 'text-emerald-600' :
          status === 'active' ? 'text-blue-500'    :
          'text-slate-400'
        }`}>
          {status === 'done'   ? `Found · $${foundTotal?.toFixed(2) ?? '—'}` :
           status === 'active' ? 'Checking prices…' :
           'Queued…'}
        </p>
      </div>

      {/* Right badge */}
      {status === 'done' && (
        <span className="text-xs font-semibold text-emerald-600 shrink-0">Done</span>
      )}
      {status === 'active' && (
        <span className="text-xs text-blue-400 shrink-0">~10s</span>
      )}
    </motion.div>
  );
}

// Shimmer skeleton card
function ShimmerCard({ opacity = 1 }) {
  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-4"
      style={{ opacity }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="h-4 w-16 rounded-full bg-slate-200 animate-pulse mb-3" />
      <div className="space-y-2">
        <div className="h-2.5 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100 animate-pulse" />
        <div className="h-2.5 w-3/5 rounded-full bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

// Winner banner (State 3 — top of results)
function WinnerBanner({ storeName, storeKey, total, savings, onShop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getStoreColor(storeKey) }}
          />
          <span className="text-base font-bold text-emerald-900">
            {storeName} wins
          </span>
          <TrendingDown className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="text-xl font-extrabold text-emerald-700">
          ${total.toFixed(2)}
        </span>
      </div>
      <p className="text-sm text-emerald-700 mb-3">
        You save <strong>${savings.toFixed(2)}</strong> vs. most expensive
        {' '}({Math.round((savings / (total + savings)) * 100)}% off)
      </p>
      <button
        onClick={onShop}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        Shop at {storeName}
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// Collapsed store result row
function StoreResultCard({ storeKey, storeMeta, storeData, isCheapest, cheapestTotal, index, shoppingMethod, isPremium, onExpand, expanded }) {
  const total = instoreTotal(storeData);
  const items = Array.isArray(storeData) ? storeData : (storeData?.items || []);
  const diff = total - cheapestTotal;
  const live = isLivePrice(storeData);
  const color = getStoreColor(storeKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-white rounded-2xl border overflow-hidden mb-3 ${
        isCheapest ? 'border-emerald-300 shadow-md shadow-emerald-50' : 'border-slate-100'
      }`}
    >
      {/* Color bar */}
      <div className="h-1" style={{ backgroundColor: color }} />

      {/* Header row — always visible */}
      <button
        onClick={onExpand}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{storeMeta?.name || storeKey}</span>
            {isCheapest && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Best price
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              live
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {live ? '✓ Live' : 'Estimated'}
            </span>
          </div>
          {!isCheapest && diff > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              ${diff.toFixed(2)} more than {ALL_STORES.find(s => instoreTotal(storeData) === cheapestTotal)?.name || 'cheapest'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-base font-bold ${isCheapest ? 'text-emerald-700' : 'text-slate-800'}`}>
            ${total.toFixed(2)}
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />
          }
        </div>
      </button>

      {/* Expanded item breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-1.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs ${
                    item.in_stock !== false ? 'bg-slate-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className={`font-medium truncate ${item.in_stock !== false ? 'text-slate-700' : 'text-red-500'}`}>
                      {item.item_name || item.name}
                    </p>
                    {item.product_name && item.product_name !== item.item_name && (
                      <p className="text-slate-400 truncate">{item.product_name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {item.in_stock !== false
                      ? <span className="font-semibold text-slate-800">${item.price?.toFixed(2)}</span>
                      : <span className="text-red-400">N/A</span>
                    }
                    {item.unit_price && (
                      <p className="text-slate-400 text-xs">{item.unit_price}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Delivery/pickup rows for premium */}
              {isPremium && storeData?.pickup_available && (
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-blue-50 mt-2 text-xs">
                  <span className="text-blue-700 font-medium">🚗 Curbside pickup</span>
                  <span className="font-semibold text-blue-700">${(storeData.pickup_total ?? total).toFixed(2)}</span>
                </div>
              )}
              {isPremium && storeData?.instacart_available && (
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-purple-50 text-xs">
                  <span className="text-purple-700 font-medium">🛒 Instacart (+${storeData.instacart_fee?.toFixed(2)} fee)</span>
                  <span className="font-semibold text-purple-700">${(total + (storeData.instacart_fee || 0)).toFixed(2)}</span>
                </div>
              )}
              {isPremium && storeData?.shipt_available && (
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-red-50 text-xs">
                  <span className="text-red-700 font-medium">🚗 Shipt (+${storeData.shipt_fee?.toFixed(2)} fee)</span>
                  <span className="font-semibold text-red-700">${(total + (storeData.shipt_fee || 0)).toFixed(2)}</span>
                </div>
              )}

              {/* Shop button */}
              <a
                href={`https://www.${storeKey.replace('_', '')}.com/search?q=${encodeURIComponent(items[0]?.item_name || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Shop at {storeMeta?.name || storeKey}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Sticky bottom CTA — swaps between "compare" and "refresh"
function StickyCompareButton({ hasResults, comparing, selectedStores, items, onCompare }) {
  const disabled = comparing || items.length === 0 || selectedStores.length === 0;

  if (hasResults && !comparing) {
    return (
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <button
            onClick={onCompare}
            disabled={disabled}
            className="w-full bg-white border border-slate-200 text-slate-600 rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh comparison
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
      <div
        className="max-w-xl mx-auto pointer-events-auto"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))',
          paddingTop: 16,
        }}
      >
        <button
          onClick={onCompare}
          disabled={disabled}
          className="w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xl"
          style={{
            backgroundColor: disabled ? '#94a3b8' : THRFT_BLUE,
            boxShadow: disabled ? 'none' : '0 6px 24px rgba(65,129,237,.4)',
          }}
        >
          {comparing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Comparing {selectedStores.length} stores…
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" />
              Compare prices across {selectedStores.length} store{selectedStores.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ListDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('id');
  const queryClient = useQueryClient();
  const { isPremium } = useUserTier();
  const resultsRef = useRef(null);
  const trialTimerRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [comparing, setComparing] = useState(false);
  const [localItems, setLocalItems] = useState(null);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [selectedStores, setSelectedStores] = useState([]);
  const [shoppingMode, setShoppingMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [expandedStore, setExpandedStore] = useState(null);
  const [shoppingMethod, setShoppingMethod] = useState('instore');

  // Per-store loading progress: { [storeKey]: 'waiting' | 'active' | 'done' }
  const [storeProgress, setStoreProgress] = useState({});
  const [partialResults, setPartialResults] = useState({});

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: list, isLoading } = useQuery({
    queryKey: ['grocery-list', listId],
    queryFn: () => base44.entities.GroceryList.filter({ id: listId }),
    select: data => data[0],
    enabled: !!listId,
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.filter({ status: 'active' }),
  });

  // ── Effects ────────────────────────────────────────────────────────────────

  // Handle item passed back from SearchProducts page
  useEffect(() => {
    const addItemParam = urlParams.get('addItem');
    if (addItemParam) {
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
    }
  }, []);

  // Set initial selected stores and shopping method from list
  useEffect(() => {
    if (!isPremium) {
      setSelectedStores(FREE_TIER_STORES);
      return;
    }
    base44.auth.me().then(user => {
      if (user?.favorite_stores?.length) {
        setSelectedStores(user.favorite_stores);
      } else {
        setSelectedStores(['kroger', 'walmart', 'amazon']);
      }
    }).catch(() => setSelectedStores(['kroger', 'walmart', 'amazon']));
  }, [isPremium]);

  useEffect(() => {
    if (list?.shopping_method) setShoppingMethod(list.shopping_method);
  }, [list?.shopping_method]);

  // Auto-scroll to results after comparison
  useEffect(() => {
    if (!comparing && list?.price_data && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [comparing]);

  // ── Item mutations ─────────────────────────────────────────────────────────

  const items = localItems || list?.items || [];

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

  const toggleChecked = index => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const saveStores = async stores => {
    setSelectedStores(stores);
    await base44.entities.GroceryList.update(listId, { selected_stores: stores });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  const saveShoppingMethod = async method => {
    setShoppingMethod(method);
    await base44.entities.GroceryList.update(listId, { shopping_method: method });
    queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] });
  };

  // ── Price comparison ───────────────────────────────────────────────────────

  const storeSchema = useCallback((withPickup, withDelivery) => ({
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            item_name:    { type: 'string' },
            product_name: { type: 'string' },
            price:        { type: 'number' },
            unit_price:   { type: 'string' },
            in_stock:     { type: 'boolean' },
          },
        },
      },
      instore_total: { type: 'number' },
      ...(withPickup   ? { pickup_total: { type: 'number' }, pickup_available: { type: 'boolean' } } : {}),
      ...(withDelivery ? {
        instacart_fee: { type: 'number' }, instacart_available: { type: 'boolean' },
        shipt_fee:     { type: 'number' }, shipt_available:     { type: 'boolean' },
      } : {}),
    },
  }), []);

  const comparePrices = async () => {
    if (items.length === 0 || selectedStores.length === 0) return;
    setComparing(true);
    setPartialResults({});
    setExpandedStore(null);

    const effectiveStores = isPremium ? selectedStores : FREE_TIER_STORES;
    const includePickup   = isPremium && (shoppingMethod === 'pickup'   || shoppingMethod === 'all');
    const includeDelivery = isPremium && (shoppingMethod === 'delivery' || shoppingMethod === 'all');

    const krogerStores = effectiveStores.filter(k => KROGER_FAMILY.includes(k));
    const aiStores     = effectiveStores.filter(k => !KROGER_FAMILY.includes(k));

    // Initialise all stores as 'waiting', then activate Kroger first
    const initProgress = {};
    effectiveStores.forEach(k => { initProgress[k] = 'waiting'; });
    krogerStores.forEach(k => { initProgress[k] = 'active'; });
    if (krogerStores.length === 0 && aiStores.length > 0) initProgress[aiStores[0]] = 'active';
    setStoreProgress({ ...initProgress });

    const userZip = (await base44.auth.me().catch(() => null))?.zip_code || '10001';

    const itemsList = items.map(i => {
      const hint = i.search_hint || i.name;
      return i.is_branded
        ? `${i.quantity}x "${hint}" (exact branded product)`
        : `${i.quantity}x "${hint}" (generic — store-brand ok)`;
    }).join('\n');

    const pickupNote   = includePickup   ? '\n- Indicate if curbside pickup is available and the pickup total.' : '';
    const deliveryNote = includeDelivery
      ? '\n- For Instacart: estimate fee ($3-$10) if available, else 0.\n- For Shipt: only mark shipt_available=true for official Shipt partners. Fee $5-$10.'
      : '';

    let finalData = {};

    // ── Kroger (real API) ────────────────────────────────────────────────────
    if (krogerStores.length > 0) {
      try {
        const krogerResponse = await base44.functions.invoke('krogerPrices', {
          items:      items.map(i => ({ ...i, name: i.search_hint || i.name })),
          store_keys: krogerStores,
          zip_code:   userZip,
        });
        const krogerRealData = krogerResponse.data?.results || {};

        for (const storeKey of krogerStores) {
          const realData = krogerRealData[storeKey];
          if (realData) {
            if (includePickup)   { realData.pickup_available = true; realData.pickup_total = realData.instore_total; }
            if (includeDelivery) {
              realData.instacart_available = true;
              realData.instacart_fee = 5.99;
              realData.shipt_available = SHIPT_STORES.has(storeKey);
              realData.shipt_fee = SHIPT_STORES.has(storeKey) ? 7.00 : 0;
            }
            realData.source = 'kroger_api';
            finalData[storeKey] = realData;
          } else {
            // Fallback to AI for this Kroger store
            const storeName = ALL_STORES.find(s => s.key === storeKey)?.name || storeKey;
            const props = {};
            props[storeKey] = storeSchema(includePickup, includeDelivery);
            const fallback = await base44.integrations.Core.InvokeLLM({
              prompt: `Provide realistic grocery prices for ${storeName}. Items:\n${itemsList}\nALWAYS find a substitute. Never leave an item out.${pickupNote}${deliveryNote}`,
              model: 'gemini_3_flash',
              response_json_schema: { type: 'object', properties: props },
            });
            if (fallback?.[storeKey]) finalData[storeKey] = fallback[storeKey];
          }
          setStoreProgress(p => ({ ...p, [storeKey]: 'done' }));
          setPartialResults(r => ({ ...r, [storeKey]: finalData[storeKey] }));
        }
      } catch (e) {
        console.error('Kroger fetch error', e);
        krogerStores.forEach(k => {
          setStoreProgress(p => ({ ...p, [k]: 'done' }));
        });
      }
    }

    // ── AI stores (batched, sequential for progress UX) ──────────────────────
    if (aiStores.length > 0) {
      const BATCH_SIZE = 3;
      for (let i = 0; i < aiStores.length; i += BATCH_SIZE) {
        const batch = aiStores.slice(i, i + BATCH_SIZE);
        // Mark this batch as active
        setStoreProgress(p => {
          const next = { ...p };
          batch.forEach(k => { next[k] = 'active'; });
          return next;
        });

        const batchStoreNames  = batch.map(k => ALL_STORES.find(s => s.key === k)?.name || k);
        const batchProperties  = {};
        batch.forEach(key => { batchProperties[key] = storeSchema(includePickup, includeDelivery); });

        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a grocery price comparison assistant. Provide realistic estimated prices from: ${batchStoreNames.join(', ')}.

Items:
${itemsList}

CRITICAL RULES:
- ALWAYS find a product for every item — never mark unavailable unless store has zero comparable products.
- Substitute closest store-brand/generic if exact product not carried. Set in_stock=true for substitutes.
- Calculate instore_total as sum of ALL items.
- Only set in_stock=false if store has absolutely no comparable product.${pickupNote}${deliveryNote}

Store pricing tendencies:
- Aldi & Walmart: lowest prices
- Safeway, Albertsons: mid-range
- Whole Foods, The Fresh Market: premium
- Trader Joe's, H-E-B, Publix: competitive`,
            add_context_from_internet: true,
            model: 'gemini_3_flash',
            response_json_schema: { type: 'object', properties: batchProperties },
          });

          batch.forEach(key => {
            if (result?.[key]) {
              finalData[key] = result[key];
              setPartialResults(r => ({ ...r, [key]: result[key] }));
            }
            setStoreProgress(p => ({ ...p, [key]: 'done' }));
          });
        } catch (e) {
          console.error('AI batch error', e);
          batch.forEach(k => setStoreProgress(p => ({ ...p, [k]: 'done' })));
        }
      }
    }

    // ── Persist ──────────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    await base44.entities.GroceryList.update(listId, {
      price_data:      finalData,
      selected_stores: effectiveStores,
      last_compared:   now,
    });

    // Save price history snapshot
    const storeTotalsSnap = Object.fromEntries(
      Object.entries(finalData).map(([k, d]) => [k, instoreTotal(d)])
    );
    const cheapestEntry = Object.entries(storeTotalsSnap).reduce(
      (a, b) => a[1] < b[1] ? a : b, ['', Infinity]
    );
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

    // Show free trial modal 30s after first comparison for non-subscribers
    const user = await base44.auth.me().catch(() => null);
    if (!['trialing', 'active'].includes(user?.subscription_status)) {
      clearTimeout(trialTimerRef.current);
      trialTimerRef.current = setTimeout(() => setShowTrialModal(true), 30000);
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const priceData         = comparing ? partialResults : list?.price_data;
  const comparedStoreKeys = priceData ? Object.keys(priceData) : [];
  const effectiveStores   = isPremium ? selectedStores : FREE_TIER_STORES;

  const storeTotals = priceData
    ? Object.fromEntries(comparedStoreKeys.map(k => [k, instoreTotal(priceData[k])]))
    : null;

  const cheapestStore = storeTotals && Object.keys(storeTotals).length > 0
    ? Object.entries(storeTotals).reduce((a, b) => a[1] < b[1] ? a : b)[0]
    : null;

  const maxTotal = storeTotals ? Math.max(...Object.values(storeTotals)) : 0;
  const savings  = cheapestStore && storeTotals
    ? maxTotal - storeTotals[cheapestStore]
    : 0;

  const hasResults = !!(list?.price_data && Object.keys(list.price_data).length > 0);

  // Stores currently in loading progress list
  const progressStores = effectiveStores;

  // ── Loading / not found ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 mb-2">List not found.</p>
        <Link to="/Home" className="text-sm font-medium hover:underline" style={{ color: THRFT_BLUE }}>
          Go back home
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pb-32">
      {showTrialModal && (
        <FreeTrialModal
          onClose={() => { setShowTrialModal(false); clearTimeout(trialTimerRef.current); }}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
            {list.last_compared && (
              <> · Last compared {new Date(list.last_compared).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <button
          onClick={() => { setShoppingMode(!shoppingMode); setCheckedItems(new Set()); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            shoppingMode
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          {shoppingMode ? 'Done' : 'Shop mode'}
        </button>
      </div>

      {/* ── Coupon suggestions ──────────────────────────────────────────────── */}
      <CouponListMatcher
        coupons={coupons}
        list={{ ...list, items }}
        onItemAdded={() => queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] })}
      />

      {/* ── Shopping method tabs ────────────────────────────────────────────── */}
      {items.length > 0 && (
        <MethodTabs value={shoppingMethod} onChange={saveShoppingMethod} />
      )}

      {/* ── Store pills + picker ────────────────────────────────────────────── */}
      {items.length > 0 && (
        <>
          <StoresPillRow
            selectedStores={effectiveStores}
            isPremium={isPremium}
            onEditClick={() => setShowStorePicker(v => !v)}
          />
          <AnimatePresence>
            {showStorePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                {isPremium ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <StorePicker selected={selectedStores} onChange={saveStores} />
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-center">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Upgrade to compare 50+ stores
                    </p>
                    <p className="text-xs text-blue-600 mb-3">
                      Free plan: Walmart, Kroger & Amazon Fresh only
                    </p>
                    <Link
                      to="/Subscribe"
                      className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white"
                      style={{ backgroundColor: THRFT_BLUE }}
                    >
                      Upgrade for $3.99/mo →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Add item form ───────────────────────────────────────────────────── */}
      <div className="mb-4">
        <AddItemForm onAdd={addItem} listId={listId} />
      </div>

      {/* ── Item list ───────────────────────────────────────────────────────── */}
      <div className="space-y-2 mb-5">
        {shoppingMode ? (
          <>
            <p className="text-xs text-slate-400 mb-2">Tap to check off as you shop</p>
            {items.map((item, i) => {
              const checked = checkedItems.has(i);
              return (
                <button
                  key={`${item.name}-${i}`}
                  onClick={() => toggleChecked(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                  }`}>
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                      {item.quantity}
                    </span>
                    <span className={`text-sm font-medium ${checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                  </div>
                </button>
              );
            })}
            {checkedItems.size > 0 && (
              <p className="text-xs text-slate-400 text-center pt-1">
                {checkedItems.size} of {items.length} checked off
              </p>
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

      {/* ── Budget ──────────────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="mb-5">
          <ListBudget
            list={list}
            priceData={list?.price_data}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['grocery-list', listId] })}
          />
        </div>
      )}

      {/* ── STATE 2: Animated loading ────────────────────────────────────────── */}
      <AnimatePresence>
        {comparing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            {/* Big spinner header */}
            <div className="flex flex-col items-center py-6 mb-4">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-base font-bold text-slate-900">Finding best prices…</p>
              <p className="text-xs text-slate-400 mt-1">
                Checking {items.length} item{items.length !== 1 ? 's' : ''} across {progressStores.length} stores
              </p>
            </div>

            {/* Per-store progress */}
            <div className="bg-white rounded-2xl border border-slate-100 p-3 mb-4">
              {progressStores.map(key => {
                const meta   = ALL_STORES.find(s => s.key === key);
                const status = storeProgress[key] || 'waiting';
                const found  = partialResults[key] ? instoreTotal(partialResults[key]) : null;
                return (
                  <StoreLoadingRow
                    key={key}
                    storeKey={key}
                    storeName={meta?.name || key}
                    status={status}
                    foundTotal={found}
                  />
                );
              })}
            </div>

            {/* Shimmer preview cards */}
            <p className="text-xs text-slate-400 font-medium mb-2">Results loading…</p>
            <ShimmerCard />
            <ShimmerCard opacity={0.6} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STATE 3: Results ─────────────────────────────────────────────────── */}
      {priceData && !comparing && comparedStoreKeys.length > 0 && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* History toggle */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Price comparison</h2>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {showHistory ? 'Hide' : 'View'} history
            </button>
          </div>

          <PriceHistoryChart
            listId={listId}
            open={showHistory}
            onClose={() => setShowHistory(false)}
          />

          {/* Winner banner */}
          {cheapestStore && storeTotals && savings > 0.01 && (
            <WinnerBanner
              storeKey={cheapestStore}
              storeName={ALL_STORES.find(s => s.key === cheapestStore)?.name || cheapestStore}
              total={storeTotals[cheapestStore]}
              savings={savings}
              onShop={() => {
                const url = `https://www.${cheapestStore.replace('_', '')}.com`;
                window.open(url, '_blank', 'noopener');
              }}
            />
          )}

          {/* Store result cards (sorted: cheapest first) */}
          {comparedStoreKeys
            .slice()
            .sort((a, b) => (storeTotals?.[a] || 0) - (storeTotals?.[b] || 0))
            .map((storeKey, i) => {
              const storeMeta = ALL_STORES.find(s => s.key === storeKey);
              return (
                <StoreResultCard
                  key={storeKey}
                  storeKey={storeKey}
                  storeMeta={storeMeta}
                  storeData={priceData[storeKey]}
                  isCheapest={cheapestStore === storeKey}
                  cheapestTotal={storeTotals?.[cheapestStore] || 0}
                  index={i}
                  shoppingMethod={shoppingMethod}
                  isPremium={isPremium}
                  expanded={expandedStore === storeKey}
                  onExpand={() => setExpandedStore(expandedStore === storeKey ? null : storeKey)}
                />
              );
            })}

          {/* Timestamp + map (lazy — only after results) */}
          <p className="text-xs text-center text-slate-400 mb-6">
            Compared {list.last_compared ? new Date(list.last_compared).toLocaleString() : 'just now'}
          </p>

          <div className="mb-4">
            <NearbyStoresMap priceData={list?.price_data} listName={list?.name} />
          </div>
        </motion.div>
      )}

      {/* ── Sticky compare / refresh button ─────────────────────────────────── */}
      {items.length > 0 && (
        <StickyCompareButton
          hasResults={hasResults}
          comparing={comparing}
          selectedStores={effectiveStores}
          items={items}
          onCompare={comparePrices}
        />
      )}
    </div>
  );
}