import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Settings2 } from 'lucide-react';
import AddItemForm from '@/components/grocery/AddItemForm';
import GroceryItemRow from '@/components/grocery/GroceryItemRow';
import ShoppingMethodPicker from '@/components/grocery/ShoppingMethodPicker';
import SavedItemsDrawer from '@/components/grocery/SavedItemsDrawer';
import TemplatesDrawer from '@/components/grocery/TemplatesDrawer';
import PastListsDrawer from '@/components/grocery/PastListsDrawer';
import InlineBrowseProducts from '@/components/grocery/InlineBrowseProducts';
import useUserTier, { FREE_TIER_LIST_LIMIT } from '@/hooks/useUserTier';
import InstructionModal from '@/components/InstructionModal';

const NEWLIST_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/3f9b2db30_NewList1.jpg', nextTop: '5%', dismissTop: '20%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/a2a628e97_NewList2.jpg', nextTop: '5%', dismissTop: '20%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/ee504c4f0_NewList3.jpg', nextTop: '5%', dismissTop: '20%' },
];
import FreePlanLimitModal from '@/components/subscription/FreePlanLimitModal';
import PremiumTrialPrompt from '@/components/subscription/PremiumTrialPrompt';

export default function NewList() {
  const navigate = useNavigate();
  const { isPremium, isFree, listsThisMonth, canCreateList, loading: tierLoading } = useUserTier();

  const [name, setName] = useState('');
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [shoppingMethod, setShoppingMethod] = useState('all');
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.shopping_method) setShoppingMethod(user.shopping_method);
    }).catch(() => {});

    const urlParams = new URLSearchParams(window.location.search);
    const addItemParam = urlParams.get('addItem');
    if (addItemParam) {
      const item = JSON.parse(decodeURIComponent(addItemParam));
      setItems(prev => [...prev, item]);
      window.history.replaceState({}, '', '/NewList');
    }
  }, []);

  const addItem = (item) => setItems(prev => [...prev, item]);
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateQuantity = (index, qty) => setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));

  const handleCreate = async () => {
    if (!name.trim()) { setNameError(true); return; }
    if (items.length === 0) return;

    // Check free tier monthly limit
    if (!canCreateList) {
      setShowLimitModal(true);
      return;
    }

    setSaving(true);
    const list = await base44.entities.GroceryList.create({
      name: name.trim(),
      items,
      shopping_method: shoppingMethod,
    });
    setSaving(false);

    // Show premium trial prompt to free users after list creation
    if (isFree) {
      setShowTrialPrompt(true);
      // Store list id so we navigate after prompt is dismissed
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

  const METHOD_LABELS = {
    instore: '🏪 In-Store',
    pickup: '🚗 Curbside Pickup',
    delivery: '🚚 Delivery',
    all: '📦 Compare All',
  };

  return (
    <div>
      {showLimitModal && <FreePlanLimitModal onClose={() => setShowLimitModal(false)} />}
      {showTrialPrompt && <PremiumTrialPrompt onClose={handleTrialPromptClose} />}
      {showInstructions && (
        <InstructionModal
          instructionKey="newlist"
          slides={NEWLIST_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}


      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">New Grocery List</h1>
      <p className="text-slate-900 mb-2">Add your items, then compare prices across stores.</p>

      {/* Free tier usage indicator */}
      {isFree && !tierLoading && (
        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-sm">
          <span className="text-amber-800 font-medium">
            Free plan: <strong>{listsThisMonth}/{FREE_TIER_LIST_LIMIT}</strong> lists used this month
          </span>
          <button
            onClick={() => setShowLimitModal(true)}
            className="text-xs font-semibold underline text-amber-700 hover:text-amber-900"
          >
            Upgrade →
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* List Name */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">List Name</label>
          <Input
            placeholder="e.g. Weekly Groceries, Party Supplies..."
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(false); }}
            className={`h-12 rounded-xl bg-white text-base placeholder:text-slate-400 focus-visible:ring-blue-400 ${nameError ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200'}`}
          />
          {nameError && <p className="text-xs text-red-500 mt-1">Please enter a list name to continue.</p>}
        </div>

        {/* Shopping Method */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-900">Shopping Method</label>
            <button
              type="button"
              onClick={() => setShowMethodPicker(!showMethodPicker)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showMethodPicker ? 'Hide options' : 'Change preference'}
            </button>
          </div>

          {!showMethodPicker ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">
              {METHOD_LABELS[shoppingMethod]}
              <span className="ml-auto text-xs text-slate-400">(from your preferences)</span>
            </div>
          ) : (
            <ShoppingMethodPicker value={shoppingMethod} onChange={setShoppingMethod} />
          )}
        </div>

        {/* Saved Items, Templates & Past Lists */}
        <div className="flex flex-col gap-3">
          <SavedItemsDrawer onAddItem={addItem} />
          <TemplatesDrawer
            currentItems={items}
            currentName={name}
            shoppingMethod={shoppingMethod}
            onLoadTemplate={(template) => {
              setItems(template.items || []);
              if (!name.trim()) setName(template.name);
              if (template.shopping_method) setShoppingMethod(template.shopping_method);
            }}
          />
          <PastListsDrawer
            onAddItems={(newItems) => setItems(prev => [...prev, ...newItems])}
          />
        </div>

        {/* Add Items */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-1 block">Add Items</label>
          <p className="text-xs text-slate-400 mb-2 leading-snug max-w-sm">Be as specific as possible — e.g. "Mint Oreos", "Store Brand 2% Milk" or "Breyer's Ice Cream"</p>
          <AddItemForm onAdd={addItem} />
        </div>

        {/* Browse Products */}
        <InlineBrowseProducts onAddItem={addItem} />

        {items.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item, i) => (
                <GroceryItemRow key={`${item.name}-${i}`} item={item} index={i} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {items.length > 0 && (
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-blue-200 gap-2 transition-all"
            style={{ backgroundColor: '#4181ed' }}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Save & Compare Prices
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}