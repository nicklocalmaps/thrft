import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import InstructionModal from '@/components/InstructionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Check, ArrowRight, Star, Search } from 'lucide-react';
import { ALL_STORES } from '@/lib/storeConfig';

const ONBOARDING_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c2b98c125_Onboarding1.jpg', nextTop: '5%', dismissTop: '17%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/81ac9ce9a_Onboarding2.jpg', nextTop: '5%', dismissTop: '20%' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('zip');
  const [zipCode, setZipCode] = useState('');
  const [loadingStores, setLoadingStores] = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [saving, setSaving] = useState(false);
  const [storeQuery, setStoreQuery] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [userCount, setUserCount] = useState(217);
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem('thrft_instructions_dismissed_onboarding');
  });

  useEffect(() => {
    base44.functions.invoke('getUserCount', {}).then(res => {
      if (res.data?.count) setUserCount(res.data.count);
    }).catch(() => {});
  }, []);

  const findNearbyStores = async () => {
    if (zipCode.length < 5) return;
    setLoadingStores(true);
    const response = await base44.functions.invoke('findNearbyStores', { zip_code: zipCode });
    const keys = response.data?.store_keys || [];
    const found = keys.map(k => ALL_STORES.find(s => s.key === k)).filter(Boolean);
    setNearbyStores(found);
    setSelectedStores(found.map(s => s.key));
    setLoadingStores(false);
    setStep('stores');
  };

  const toggleStore = (key) => {
    setSelectedStores(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const VALID_PROMO_CODES = ['EBT2026', 'AIRDROP2026'];

  const validatePromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMO_CODES.includes(code)) {
      setPromoApplied(true);
      return;
    }
    setPromoError('Invalid promo code. Please check and try again.');
  };

  const completeOnboarding = async () => {
    setSaving(true);
    const updates = {
      zip_code: zipCode,
      favorite_stores: selectedStores,
      onboarding_complete: true,
    };
    if (promoApplied) {
      updates.has_lifetime_access = true;
      updates.account_type = 'premium';
    }
    await base44.auth.updateMe(updates);
    base44.functions.invoke('incrementUserCount', {}).catch(() => {});
    base44.functions.invoke('sendWelcomeEmail', {}).catch(() => {});
    if (promoApplied) {
      base44.functions.invoke('sendWelcomeToPremium', {}).catch(() => {});
    }
    navigate('/NewList');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50/30 flex items-center justify-center px-4">
      {showInstructions && (
        <InstructionModal
          instructionKey="onboarding"
          slides={ONBOARDING_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}

      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
            <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-4xl font-bold tracking-tight text-slate-900">THRFT</span>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">{userCount.toLocaleString()} users saving money</span>
            <span className="text-base">🎉</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'zip' && (
            <motion.div key="zip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="rounded-2xl w-14 h-14 flex items-center justify-center shrink-0" style={{ backgroundColor: '#4181ed' }}>
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-slate-900 text-xl font-semibold">Find Stores Near You</h1>
              </div>
              <p className="text-slate-900 mb-4">Enter your ZIP code to discover nearby grocery stores and start comparing prices instantly.</p>
              <p className="text-slate-900 mb-8">THRFT shows you the cheapest options for your entire list—so you always shop smarter.</p>
              <label className="text-sm font-medium text-slate-900 mb-2 block">Your Zip Code</label>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g. 78701"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  onKeyDown={e => e.key === 'Enter' && zipCode.length === 5 && findNearbyStores()}
                  className="h-12 rounded-xl border-slate-200 text-base flex-1 focus-visible:ring-blue-400"
                  maxLength={5}
                />
                <Button onClick={findNearbyStores} disabled={zipCode.length < 5 || loadingStores} className="h-12 px-6 rounded-xl shadow-md shadow-blue-200 gap-2" style={{ backgroundColor: '#4181ed' }}>
                  {loadingStores ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Find Stores <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </div>
              {loadingStores && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-900 mt-4 text-center">
                  Searching for stores near {zipCode}...
                </motion.p>
              )}
            </motion.div>
          )}

          {step === 'stores' && (
            <motion.div key="stores" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
                <Star className="w-7 h-7 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Stores Near {zipCode}</h1>
              <p className="text-slate-900 mb-6">
                We found <strong>{nearbyStores.length} stores</strong> within ~25 miles. Check the ones you shop at — they'll be pre-selected on all your lists.
              </p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={storeQuery}
                  onChange={e => setStoreQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-6 pr-1">
                {nearbyStores.filter(s => !storeQuery.trim() || s.name.toLowerCase().includes(storeQuery.toLowerCase())).map((store, i) => {
                  const isSelected = selectedStores.includes(store.key);
                  return (
                    <motion.button
                      key={store.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => toggleStore(store.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${isSelected ? 'bg-blue-50 border-blue-200 text-slate-800' : 'bg-white border-slate-100 text-slate-900 hover:border-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-blue-500' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#4181ed' }}><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>}
                      </div>
                      <span className="font-medium">{store.name}</span>
                      <span className="ml-auto text-xs text-slate-900">{store.region}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-900">
                  <span className="font-semibold" style={{ color: '#4181ed' }}>{selectedStores.length}</span> store{selectedStores.length !== 1 ? 's' : ''} selected
                </p>
                <Button onClick={() => setStep('promo')} disabled={selectedStores.length === 0} className="h-11 px-6 rounded-xl shadow-md shadow-blue-200 gap-2" style={{ backgroundColor: '#4181ed' }}>
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <button onClick={() => setStep('zip')} className="mt-4 text-sm text-slate-900 hover:text-black transition-colors w-full text-center">
                ← Change zip code
              </button>
            </motion.div>
          )}

          {step === 'promo' && (
            <motion.div key="promo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                <span className="text-3xl">🎟️</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Have a Promo Code?</h1>
              <p className="text-slate-500 mb-6 text-sm">If you have an EBT promo code, enter it below for lifetime free access. Otherwise, skip to start your 7-day free trial.</p>

              {promoApplied ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 text-center">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="font-bold text-emerald-800">Lifetime access unlocked!</p>
                  <p className="text-sm text-emerald-600 mt-1">Your promo code has been applied. Enjoy THRFT Premium for free.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Promo Code</label>
                    <Input
                      placeholder="e.g. EBT2026"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                      className="h-11 rounded-xl border-slate-200 text-base focus-visible:ring-blue-400"
                    />
                  </div>
                  {promoError && <p className="text-sm text-red-500">{promoError}</p>}
                  {promoCode.trim() && (
                    <Button onClick={validatePromo} className="w-full h-11 rounded-xl" style={{ backgroundColor: '#4181ed' }}>
                      Apply Code
                    </Button>
                  )}
                </div>
              )}

              <Button onClick={completeOnboarding} disabled={saving} className="w-full h-12 rounded-xl shadow-md shadow-blue-200 gap-2 font-semibold" style={{ backgroundColor: '#4181ed' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{promoApplied ? 'Activate Lifetime Access' : 'Start 7-Day Free Trial'} <ArrowRight className="w-4 h-4" /></>}
              </Button>
              <button onClick={() => setStep('stores')} className="mt-4 text-sm text-slate-500 hover:text-black transition-colors w-full text-center">
                ← Back to stores
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}