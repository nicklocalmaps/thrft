import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Check, ShoppingCart, ArrowRight, Star } from 'lucide-react';
import { ALL_STORES } from '@/lib/storeConfig';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('zip'); // 'zip' | 'stores' | 'saving'
  const [zipCode, setZipCode] = useState('');
  const [loadingStores, setLoadingStores] = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [saving, setSaving] = useState(false);

  const findNearbyStores = async () => {
    if (zipCode.length < 5) return;
    setLoadingStores(true);

    const response = await base44.functions.invoke('findNearbyStores', { zip_code: zipCode });
    const keys = response.data?.store_keys || [];
    const found = keys.
    map((k) => ALL_STORES.find((s) => s.key === k)).
    filter(Boolean);

    setNearbyStores(found);
    setSelectedStores(found.map((s) => s.key));
    setLoadingStores(false);
    setStep('stores');
  };

  const toggleStore = (key) => {
    setSelectedStores((prev) =>
    prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const completeOnboarding = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      zip_code: zipCode,
      favorite_stores: selectedStores,
      onboarding_complete: true
    });
    navigate('/Subscribe');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
            <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-4xl font-bold tracking-tight text-slate-900">
            THRFT
          </span>
        </div>

        {/* User count badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">11,483 users saving money</span>
            <span className="text-base">🎉</span>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: Zip Code */}
          {step === 'zip' &&
          <motion.div
            key="zip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
            
              <div className="flex items-center gap-3 mb-5">
                <div className="rounded-2xl w-14 h-14 flex items-center justify-center shrink-0" style={{ backgroundColor: '#4181ed' }}>
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-slate-900 text-xl font-semibold normal-case">Welcome to THRFT!</h1>
              </div>
              <p className="text-slate-900 mb-8 text-center">Your intelligent grocery shopping assistant that helps you find the best prices at stores near you.

Let's find your favorite grocery stores so we can compare prices for your shopping lists.</p>

              <label className="text-sm font-medium text-slate-900 mb-2 block">Your Zip Code</label>
              <div className="flex gap-3">
                <Input
                placeholder="e.g. 78701"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onKeyDown={(e) => e.key === 'Enter' && zipCode.length === 5 && findNearbyStores()}
                className="h-12 rounded-xl border-slate-200 text-base flex-1 focus-visible:ring-blue-400"
                maxLength={5} />
              
                <Button
                onClick={findNearbyStores}
                disabled={zipCode.length < 5 || loadingStores}
                className="h-12 px-6 rounded-xl shadow-md shadow-blue-200 gap-2" style={{ backgroundColor: '#4181ed' }}>
                
                  {loadingStores ?
                <Loader2 className="w-5 h-5 animate-spin" /> :

                <>
                      Find Stores
                      <ArrowRight className="w-4 h-4" />
                    </>
                }
                </Button>
              </div>

              {loadingStores &&
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-slate-900 mt-4 text-center">
              
                  Searching for stores near {zipCode}...
                </motion.p>
            }
            </motion.div>
          }

          {/* Step 2: Store Selection */}
          {step === 'stores' &&
          <motion.div
            key="stores"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
            
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
                <Star className="w-7 h-7 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Stores Near {zipCode}</h1>
              <p className="text-slate-900 mb-6">
                We found <strong>{nearbyStores.length} stores</strong> within ~25 miles. Check the ones you shop at — they'll be pre-selected on all your lists.
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto mb-6 pr-1">
                {nearbyStores.map((store, i) => {
                const isSelected = selectedStores.includes(store.key);
                return (
                  <motion.button
                    key={store.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleStore(store.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    isSelected ?
                    'bg-blue-50 border-blue-200 text-slate-800' :
                    'bg-white border-slate-100 text-slate-900 hover:border-slate-200'}`
                    }>
                    
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'border-blue-500' : 'border-slate-300'}`
                    }>
                        {isSelected && <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#4181ed' }}><Check className="w-3 h-3 text-white" strokeWidth={3} /></div>}
                      </div>
                      <span className="font-medium">{store.name}</span>
                      <span className="ml-auto text-xs text-slate-900">{store.region}</span>
                    </motion.button>);

              })}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-900">
                  <span className="font-semibold" style={{ color: '#4181ed' }}>{selectedStores.length}</span> store{selectedStores.length !== 1 ? 's' : ''} selected
                </p>
                <Button
                onClick={completeOnboarding}
                disabled={selectedStores.length === 0 || saving}
                className="h-11 px-6 rounded-xl shadow-md shadow-blue-200 gap-2" style={{ backgroundColor: '#4181ed' }}>
                
                  {saving ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <>
                      Start Shopping
                      <ArrowRight className="w-4 h-4" />
                    </>
                }
                </Button>
              </div>

              <button
              onClick={() => setStep('zip')}
              className="mt-4 text-sm text-slate-900 hover:text-black transition-colors w-full text-center">
              
                ← Change zip code
              </button>
            </motion.div>
          }

        </AnimatePresence>
      </div>
    </div>);

}