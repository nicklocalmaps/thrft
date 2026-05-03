import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import InstructionModal from '@/components/InstructionModal';
import { ALL_STORES, COLOR_MAP } from '@/lib/storeConfig';
import { getStoreLink } from '@/lib/storeLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Smartphone, Check, CreditCard, Edit2, X, MapPin, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import ShoppingMethodPicker from '@/components/grocery/ShoppingMethodPicker';

const STORES_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/4f6af4bc3_Stores1.jpg', nextTop: '5%', dismissTop: '15%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c2c0b6303_Stores2.jpg', nextTop: '76%', dismissTop: '86%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/7df75b810_Stores3.jpg', nextTop: '76%', dismissTop: '86%' },
];

export default function StoreAccounts() {
  const [user, setUser] = useState(null);
  const [loyaltyCards, setLoyaltyCards] = useState({});
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [shoppingMethod, setShoppingMethod] = useState('all');
  const [savingMethod, setSavingMethod] = useState(false);
  const [editingZip, setEditingZip] = useState(false);
  const [zipValue, setZipValue] = useState('');
  const [savingZip, setSavingZip] = useState(false);
  const [refreshingStores, setRefreshingStores] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem('thrft_instructions_dismissed_stores');
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoyaltyCards(u?.loyalty_cards || {});
      if (u?.shopping_method) setShoppingMethod(u.shopping_method);
      if (u?.zip_code) setZipValue(u.zip_code);
    });
  }, []);

  const saveZip = async () => {
    if (zipValue.length < 5) return;
    setSavingZip(true);
    await base44.auth.updateMe({ zip_code: zipValue });
    setUser(prev => ({ ...prev, zip_code: zipValue }));
    setSavingZip(false);
    setEditingZip(false);
  };

  const refreshNearbyStores = async () => {
    const zip = user?.zip_code;
    if (!zip) return;
    setRefreshingStores(true);
    setRefreshMessage('');
    const response = await base44.functions.invoke('findNearbyStores', { zip_code: zip });
    const nearbyKeys = response.data?.store_keys || [];
    if (nearbyKeys.length > 0) {
      await base44.auth.updateMe({ favorite_stores: nearbyKeys });
      setUser(prev => ({ ...prev, favorite_stores: nearbyKeys }));
      setRefreshMessage(`Found ${nearbyKeys.length} stores near ${zip}`);
    } else {
      setRefreshMessage('No stores found — try a different zip code.');
    }
    setRefreshingStores(false);
  };

  const saveShoppingMethod = async (method) => {
    setShoppingMethod(method);
    setSavingMethod(true);
    await base44.auth.updateMe({ shopping_method: method });
    setSavingMethod(false);
  };

  const favoriteStores = user?.favorite_stores || [];
  const displayStores = favoriteStores.length > 0
    ? ALL_STORES.filter(s => favoriteStores.includes(s.key))
    : ALL_STORES.slice(0, 8);

  const startEdit = (key, current) => { setEditing(key); setEditValue(current || ''); };
  const cancelEdit = () => { setEditing(null); setEditValue(''); };

  const saveCard = async (key) => {
    setSaving(true);
    const updated = { ...loyaltyCards, [key]: editValue };
    if (!editValue.trim()) delete updated[key];
    setLoyaltyCards(updated);
    await base44.auth.updateMe({ loyalty_cards: updated });
    setSaving(false);
    setEditing(null);
    setEditValue('');
  };

  return (
    <div>
      {showInstructions && (
        <InstructionModal
          instructionKey="stores"
          slides={STORES_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Store Accounts</h1>
        <p className="text-slate-500 mt-1">Save your loyalty card numbers and manage your shopping preferences.</p>
      </div>

      {/* Zip Code */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <h2 className="font-semibold text-slate-900">Your Zip Code</h2>
              <p className="text-sm text-slate-500">Used to find nearby stores</p>
            </div>
          </div>
          {!editingZip ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-700">{user?.zip_code || 'Not set'}</span>
              <button onClick={() => setEditingZip(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input value={zipValue} onChange={e => setZipValue(e.target.value.replace(/\D/g, '').slice(0, 5))} className="h-8 w-24 rounded-lg text-sm text-center focus-visible:ring-blue-400" autoFocus onKeyDown={e => { if (e.key === 'Enter') saveZip(); if (e.key === 'Escape') setEditingZip(false); }} />
              <Button size="icon" className="h-8 w-8 rounded-lg" style={{ backgroundColor: '#4181ed' }} disabled={savingZip} onClick={saveZip}><Check className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400" onClick={() => setEditingZip(false)}><X className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
        {!editingZip && user?.zip_code && (
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">Stores are cached from your last detection. Refresh to find new ones.</p>
            <Button variant="outline" size="sm" onClick={refreshNearbyStores} disabled={refreshingStores} className="h-8 rounded-lg text-xs gap-1.5 border-slate-200 shrink-0 ml-3">
              <RefreshCw className={`w-3 h-3 ${refreshingStores ? 'animate-spin' : ''}`} />
              {refreshingStores ? 'Detecting...' : 'Refresh Nearby Stores'}
            </Button>
          </div>
        )}
        {refreshMessage && <p className="text-xs text-emerald-600 font-medium mt-2">{refreshMessage}</p>}
      </div>

      {/* Shopping Method */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Default Shopping Method</h2>
            <p className="text-sm text-slate-500 mt-0.5">Applied to all new lists by default</p>
          </div>
          {savingMethod && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
        </div>
        <ShoppingMethodPicker value={shoppingMethod} onChange={saveShoppingMethod} />
      </div>

      <div className="space-y-3">
        {displayStores.map((store, i) => {
          const link = getStoreLink(store.key);
          const colors = COLOR_MAP[store.color] || COLOR_MAP.blue;
          const cardNumber = loyaltyCards[store.key];
          const isEditing = editing === store.key;

          return (
            <motion.div key={store.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${colors.bar}`} />
                    <h3 className="font-semibold text-slate-900">{store.name}</h3>
                    <span className="text-xs text-slate-400">{store.region}</span>
                  </div>
                  {link.loyalty && (
                    <div className="mt-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder={link.loyalty_label || 'Card number'} className="h-9 rounded-lg text-sm flex-1 focus-visible:ring-blue-400" autoFocus onKeyDown={e => { if (e.key === 'Enter') saveCard(store.key); if (e.key === 'Escape') cancelEdit(); }} />
                          <Button size="icon" className="h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: '#4181ed' }} disabled={saving} onClick={() => saveCard(store.key)}><Check className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg shrink-0 text-slate-400" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(store.key, cardNumber)} className="flex items-center gap-2 text-sm group">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {cardNumber ? <span className="text-slate-700 font-mono">{cardNumber}</span> : <span className="text-slate-400 italic">Add {link.loyalty_label || 'loyalty card #'}</span>}
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {link.signup && (
                    <a href={link.signup} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5 border-slate-200"><ExternalLink className="w-3 h-3" />Sign Up</Button>
                    </a>
                  )}
                  {link.website && (
                    <a href={link.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5 border-slate-200"><ExternalLink className="w-3 h-3" />Website</Button>
                    </a>
                  )}
                  {(link.app_ios || link.app_android) && (
                    <a href={/iPhone|iPad|iPod/i.test(navigator.userAgent) ? (link.app_ios || link.app_android) : (link.app_android || link.app_ios)} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="h-8 rounded-lg text-xs gap-1.5" style={{ backgroundColor: '#4181ed' }}><Smartphone className="w-3 h-3" />App</Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {favoriteStores.length === 0 && (
        <p className="text-sm text-slate-400 text-center mt-6">Complete onboarding to see only your nearby stores here.</p>
      )}
    </div>
  );
}