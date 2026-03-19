import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ALL_STORES, COLOR_MAP } from '@/lib/storeConfig';
import { getStoreLink } from '@/lib/storeLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Smartphone, Check, CreditCard, Edit2, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreAccounts() {
  const [user, setUser] = useState(null);
  const [loyaltyCards, setLoyaltyCards] = useState({});
  const [editing, setEditing] = useState(null); // store key being edited
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoyaltyCards(u?.loyalty_cards || {});
    });
  }, []);

  const favoriteStores = user?.favorite_stores || [];
  const displayStores = favoriteStores.length > 0
    ? ALL_STORES.filter(s => favoriteStores.includes(s.key))
    : ALL_STORES.slice(0, 8);

  const startEdit = (key, current) => {
    setEditing(key);
    setEditValue(current || '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue('');
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Store Accounts</h1>
        <p className="text-slate-500 mt-1">Save your loyalty card numbers and quickly access your favorite store apps.</p>
      </div>

      <div className="space-y-3">
        {displayStores.map((store, i) => {
          const link = getStoreLink(store.key);
          const colors = COLOR_MAP[store.color] || COLOR_MAP.blue;
          const cardNumber = loyaltyCards[store.key];
          const isEditing = editing === store.key;

          return (
            <motion.div
              key={store.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Store name + loyalty */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${colors.bar}`} />
                    <h3 className="font-semibold text-slate-900">{store.name}</h3>
                    <span className="text-xs text-slate-400">{store.region}</span>
                  </div>

                  {/* Loyalty Card */}
                  {link.loyalty && (
                    <div className="mt-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            placeholder={link.loyalty_label || 'Card number'}
                            className="h-9 rounded-lg text-sm flex-1 focus-visible:ring-blue-400"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveCard(store.key);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <Button
                            size="icon"
                            className="h-9 w-9 rounded-lg shrink-0"
                            style={{ backgroundColor: '#4181ed' }}
                            disabled={saving}
                            onClick={() => saveCard(store.key)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg shrink-0 text-slate-400"
                            onClick={cancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(store.key, cardNumber)}
                          className="flex items-center gap-2 text-sm group"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {cardNumber ? (
                            <span className="text-slate-700 font-mono">{cardNumber}</span>
                          ) : (
                            <span className="text-slate-400 italic">Add {link.loyalty_label || 'loyalty card #'}</span>
                          )}
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {link.signup && (
                    <a href={link.signup} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5 border-slate-200">
                        <ExternalLink className="w-3 h-3" />
                        Sign Up
                      </Button>
                    </a>
                  )}
                  {link.website && (
                    <a href={link.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5 border-slate-200">
                        <ExternalLink className="w-3 h-3" />
                        Website
                      </Button>
                    </a>
                  )}
                  {(link.app_ios || link.app_android) && (
                    <a
                      href={/iPhone|iPad|iPod/i.test(navigator.userAgent) ? (link.app_ios || link.app_android) : (link.app_android || link.app_ios)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="h-8 rounded-lg text-xs gap-1.5" style={{ backgroundColor: '#4181ed' }}>
                        <Smartphone className="w-3 h-3" />
                        App
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {favoriteStores.length === 0 && (
        <p className="text-sm text-slate-400 text-center mt-6">
          Complete onboarding to see only your nearby stores here.
        </p>
      )}
    </div>
  );
}