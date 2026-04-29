import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, X } from 'lucide-react';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import ProductBrowser from '@/components/grocery/ProductBrowser';
import SavedItemsDrawer from '@/components/grocery/SavedItemsDrawer';
import TemplatesDrawer from '@/components/grocery/TemplatesDrawer';
import PastListsDrawer from '@/components/grocery/PastListsDrawer';
import FreePlanLimitModal from '@/components/subscription/FreePlanLimitModal';
import PremiumTrialPrompt from '@/components/subscription/PremiumTrialPrompt';
import useUserTier, { FREE_TIER_LIST_LIMIT } from '@/hooks/useUserTier';
import AddItemForm from '@/components/grocery/AddItemForm';
import InstructionModal from '@/components/InstructionModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';

const NEWLIST_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/3f9b2db30_NewList1.jpg', nextTop: '5%',  dismissTop: '20%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/a2a628e97_NewList2.jpg', nextTop: '76%', dismissTop: '85%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/ee504c4f0_NewList3.jpg', nextTop: '76%', dismissTop: '85%' },
];

const METHODS = [
  { key: 'instore',  label: 'In-store',  icon: '🏪' },
  { key: 'pickup',   label: 'Pickup',    icon: '🚗' },
  { key: 'delivery', label: 'Delivery',  icon: '🚚' },
  { key: 'all',      label: 'All',       icon: '📦' },
];

const QUICK_ADD = [
  { name: 'Bread',      emoji: '🍞', search_hint: 'whole wheat bread loaf',     is_branded: false },
  { name: 'Milk',       emoji: '🥛', search_hint: '2% milk gallon',             is_branded: false },
  { name: 'Eggs',       emoji: '🥚', search_hint: 'large eggs dozen',           is_branded: false },
  { name: 'Chicken',    emoji: '🍗', search_hint: 'boneless chicken breast',    is_branded: false },
  { name: 'Cheese',     emoji: '🧀', search_hint: 'shredded cheddar cheese',    is_branded: false },
  { name: 'Bananas',    emoji: '🍌', search_hint: 'bananas bunch',              is_branded: false },
  { name: 'Butter',     emoji: '🧈', search_hint: 'salted butter 4 sticks',     is_branded: false },
  { name: 'Rice',       emoji: '🍚', search_hint: 'long grain white rice 5 lb', is_branded: false },
];

const BROWSE_TABS = ['Categories', 'Brands', 'Saved items', 'Past lists'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MethodTabs({ value, onChange }) {
  return (
    <div className="flex gap-1.5 mb-2">
      {METHODS.map(m => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-center text-xs font-medium transition-all"
          style={{
            background:  value === m.key ? '#eff6ff' : 'white',
            borderColor: value === m.key ? '#bfdbfe' : '#e2e8f0',
            color:       value === m.key ? '#1d4ed8' : '#94a3b8',
          }}
        >
          <span style={{ fontSize: 14 }}>{m.icon}</span>
          <span style={{ fontSize: 9 }}>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

function QuickAddStrip({ onAdd, added }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: 'none' }}>
      <span className="text-xs text-slate-400 shrink-0">Quick add:</span>
      {QUICK_ADD.map(item => {
        const isAdded = added.has(item.name);
        return (
          <button
            key={item.name}
            onClick={() => !isAdded && onAdd({ ...item, quantity: 1, unit: 'each' })}
            className="flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all"
            style={{
              background:  isAdded ? '#f0fdf4' : 'white',
              borderColor: isAdded ? '#86efac' : '#e2e8f0',
              color:       isAdded ? '#16a34a' : '#64748b',
            }}
          >
            <span style={{ fontSize: 13 }}>{item.emoji}</span>
            {item.name}
            {isAdded && <span style={{ fontSize: 10 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewList() {
  const navigate = useNavigate();
  const { isPremium, isFree, listsThisMonth, canCreateList, loading: tierLoading } = useUserTier();

  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [shoppingMethod, setShoppingMethod] = useState('instore');
  const [nameError, setNameError] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);

  const [browseTab, setBrowseTab] = useState(null);
  const [browserInitial, setBrowserInitial] = useState(null);

  const addedNames = new Set(items.map(i => i.name));

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.shopping_method) setShoppingMethod(user.shopping_method);
    }).catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const addItemParam = params.get('addItem');
    if (addItemParam) {
      try {
        const item = JSON.parse(decodeURIComponent(addItemParam));
        setItems(prev => [...prev, item]);
        window.history.replaceState({}, '', '/NewList');
      } catch (_) {}
    }
  }, []);

  // ── Item mutations ─────────────────────────────────────────────────────────

  const addItem = useCallback(item => {
    setItems(prev => {
      if (prev.some(i => i.name === item.name && i.search_hint === item.search_hint)) return prev;
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback(index => setItems(prev => prev.filter((_, i) => i !== index)), []);

  const updateQuantity = useCallback((index, qty) =>
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item)), []);

  // ── Browse panel ──────────────────────────────────────────────────────────

  const openBrowse = (tab, initial = null) => {
    setBrowseTab(tab);
    setBrowserInitial(initial);
  };

  const closeBrowse = () => {
    setBrowseTab(null);
    setBrowserInitial(null);
  };

  const handleBrowseAdd = item => {
    addItem(item);
  };

  // ── Save & compare ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!name.trim()) { setNameError(true); return; }
    if (items.length === 0) return;
    if (!canCreateList) { setShowLimitModal(true); return; }

    setSaving(true);
    const list = await base44.entities.GroceryList.create({
      name: name.trim(),
      items,
      shopping_method: shoppingMethod,
    });
    setSaving(false);

    if (isFree) {
      setShowTrialPrompt(true);
      sessionStorage.setItem('pendingListId', list.id);
    } else {
      navigate(`/ListDetail?id=${list.id}`);
    }
  };

  const handleTrialPromptClose = () => {
    setShowTrialPrompt(false);
    const listId = sessionStorage.getItem('pendingListId');
    sessionStorage.removeItem('pendingListId');
    if (listId) navigate(`/ListDetail?id=${listId}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pb-36">
      <InstructionModal
        instructionKey="newlist"
        slides={NEWLIST_SLIDES}
        onClose={() => {}}
      />
      {showLimitModal && <FreePlanLimitModal onClose={() => setShowLimitModal(false)} />}
      {showTrialPrompt && <PremiumTrialPrompt onClose={handleTrialPromptClose} />}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">New grocery list</h1>
        {isFree && !tierLoading && (
          <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs mb-3">
            <span className="text-amber-800 font-medium">
              Free plan: <strong>{listsThisMonth}/{FREE_TIER_LIST_LIMIT}</strong> lists used this month
            </span>
            <button onClick={() => setShowLimitModal(true)} className="text-amber-700 font-semibold underline">
              Upgrade →
            </button>
          </div>
        )}

        <input
          placeholder="List name (e.g. Weekly shop, Party supplies…)"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(false); }}
          className="w-full h-11 rounded-xl border px-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
          style={{ borderColor: nameError ? '#f87171' : '#e2e8f0' }}
        />
        {nameError && <p className="text-xs text-red-500 mt-1">Please enter a list name to continue.</p>}
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <AddItemForm onAdd={addItem} />

      {/* ── Browse tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-3 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {BROWSE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => browseTab === tab ? closeBrowse() : openBrowse(tab)}
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{
              background:  browseTab === tab ? '#eff6ff' : 'white',
              borderColor: browseTab === tab ? '#bfdbfe' : '#e2e8f0',
              color:       browseTab === tab ? '#1d4ed8' : '#64748b',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Browse panel (inline expandable) ───────────────────────────────── */}
      <AnimatePresence>
        {browseTab !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{browseTab}</p>
                <button onClick={closeBrowse} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(browseTab === 'Categories' || browseTab === 'Brands') && (
                <ProductBrowser
                  onAdd={handleBrowseAdd}
                  onClose={closeBrowse}
                  initialTab={browseTab === 'Brands' ? 'brands' : 'categories'}
                  initialState={browserInitial}
                  inline
                />
              )}

              {browseTab === 'Saved items' && (
                <div className="p-4">
                  <SavedItemsDrawer onAddItem={item => { addItem(item); }} inline />
                </div>
              )}

              {browseTab === 'Past lists' && (
                <div className="p-4">
                  <PastListsDrawer onAddItems={newItems => { newItems.forEach(addItem); closeBrowse(); }} inline />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick-add strip ─────────────────────────────────────────────────── */}
      <QuickAddStrip onAdd={addItem} added={addedNames} />

      {/* ── Templates ──────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <TemplatesDrawer
          currentItems={items}
          currentName={name}
          shoppingMethod={shoppingMethod}
          onLoadTemplate={template => {
            setItems(template.items || []);
            if (!name.trim()) setName(template.name);
            if (template.shopping_method) setShoppingMethod(template.shopping_method);
          }}
        />
      </div>

      {/* ── Item list ───────────────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">Your list is empty</p>
          <p className="text-xs text-slate-400 mt-1">Search above or browse categories to add items</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setItems([])}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
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
        </div>
      )}

      {/* ── Sticky footer ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
        <div
          className="max-w-xl mx-auto pointer-events-auto"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 70%, rgba(255,255,255,0))', paddingTop: 16 }}
        >
          <MethodTabs value={shoppingMethod} onChange={setShoppingMethod} />
          <button
            onClick={handleCreate}
            disabled={saving || items.length === 0 || tierLoading}
            className="w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: (saving || items.length === 0) ? '#94a3b8' : THRFT_BLUE,
              boxShadow: (saving || items.length === 0) ? 'none' : '0 6px 24px rgba(65,129,237,.35)',
            }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : items.length === 0 ? (
              'Add items to compare'
            ) : (
              <>
                Save &amp; compare prices
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}