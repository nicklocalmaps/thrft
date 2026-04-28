import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ALL_STORES } from '@/lib/storeConfig';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';
const VALID_PROMO_CODES = ['EBT2026', 'AIRDROP2026'];

const STEPS = ['welcome', 'stores', 'ready'];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current }) {
  return (
    <div className="flex justify-center gap-1.5 mt-5">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width:      STEPS[i] === current ? 20 : 6,
            background: STEPS[i] === current ? THRFT_BLUE : '#e2e8f0',
          }}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Welcome / value prop ────────────────────────────────────────────

function WelcomeStep({ userCount, onNext, onLogin }) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Blue hero */}
      <div
        className="rounded-3xl overflow-hidden mb-5"
        style={{ background: `linear-gradient(135deg, ${THRFT_BLUE}, #3672d4)` }}
      >
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-5 border-2 border-white/20 shadow-lg">
            <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">
            Stop overpaying<br />for groceries
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            THRFT compares 50+ stores so you always know the cheapest price before you shop.
          </p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-px bg-white/10 border-t border-white/10">
          {[
            { value: '50+', label: 'stores' },
            { value: '$14', label: 'avg savings/trip' },
            { value: 'Free', label: 'to start' },
          ].map(stat => (
            <div key={stat.label} className="py-4 text-center bg-white/5">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="flex justify-center mb-5">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
          <div className="flex -space-x-1.5">
            {['#60a5fa', '#34d399', '#fbbf24'].map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {userCount.toLocaleString()} families saving money
          </span>
        </div>
      </div>

      {/* CTAs */}
      <button
        onClick={onNext}
        className="w-full rounded-2xl py-4 text-sm font-bold text-white mb-3 transition-all"
        style={{ backgroundColor: THRFT_BLUE, boxShadow: '0 6px 20px rgba(65,129,237,.35)' }}
      >
        Get started free →
      </button>
      <button
        onClick={onLogin}
        className="w-full rounded-2xl py-3 text-sm font-medium border text-slate-500 hover:text-slate-700 transition-colors"
        style={{ borderColor: '#e2e8f0' }}
      >
        I already have an account
      </button>

      <StepDots current="welcome" />
    </motion.div>
  );
}

// ─── Step 2: Zip + stores (combined) ─────────────────────────────────────────

function StoresStep({ onNext, onBack }) {
  const [zipCode, setZipCode]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [selected, setSelected]         = useState([]);
  const [storeQuery, setStoreQuery]     = useState('');
  const [zipError, setZipError]         = useState('');

  const findStores = async () => {
    if (zipCode.length < 5) { setZipError('Please enter a 5-digit zip code.'); return; }
    setZipError('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('findNearbyStores', { zip_code: zipCode });
      const keys   = response.data?.store_keys || [];
      const found  = keys.map(k => ALL_STORES.find(s => s.key === k)).filter(Boolean);
      setNearbyStores(found);
      setSelected(found.map(s => s.key));
    } catch {
      setZipError('Could not find stores. Please check your zip code.');
    }
    setLoading(false);
  };

  const toggleStore = key =>
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const filtered = nearbyStores.filter(s =>
    !storeQuery.trim() || s.name.toLowerCase().includes(storeQuery.toLowerCase())
  );

  return (
    <motion.div
      key="stores"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="text-xl font-bold text-slate-900 mb-1">Find stores near you</h2>
      <p className="text-sm text-slate-500 mb-5">
        Enter your zip code — we'll find nearby stores in seconds.
      </p>

      {/* Zip input */}
      <div className="flex gap-2 mb-4">
        <div
          className="flex-1 flex items-center gap-2 px-3 rounded-xl border h-11 bg-white transition-colors"
          style={{ borderColor: zipError ? '#f87171' : nearbyStores.length ? '#86efac' : '#e2e8f0' }}
        >
          <MapPin className="w-4 h-4 shrink-0" style={{ color: THRFT_BLUE }} />
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 78701"
            value={zipCode}
            maxLength={5}
            onChange={e => { setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5)); setZipError(''); }}
            onKeyDown={e => e.key === 'Enter' && zipCode.length === 5 && findStores()}
            className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {nearbyStores.length > 0 && (
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
        </div>
        <button
          onClick={findStores}
          disabled={zipCode.length < 5 || loading}
          className="px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: THRFT_BLUE }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find stores'}
        </button>
      </div>

      {zipError && <p className="text-xs text-red-500 mb-3">{zipError}</p>}

      {/* Store list */}
      <AnimatePresence>
        {nearbyStores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-emerald-600">
                ● {nearbyStores.length} stores found near {zipCode}
              </p>
              <p className="text-xs text-slate-400">{selected.length} selected</p>
            </div>

            {nearbyStores.length > 6 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Filter stores…"
                  value={storeQuery}
                  onChange={e => setStoreQuery(e.target.value)}
                  className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden max-h-56 overflow-y-auto">
              {filtered.map((store, i) => {
                const isSel = selected.includes(store.key);
                return (
                  <motion.button
                    key={store.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => toggleStore(store.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-50 last:border-0 transition-colors ${isSel ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <div
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: isSel ? THRFT_BLUE : '#cbd5e1', background: isSel ? THRFT_BLUE : 'transparent' }}
                    >
                      {isSel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-800">{store.name}</span>
                    <span className="text-xs text-slate-400">{store.region}</span>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              You can always change these later in settings
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav buttons */}
      <button
        onClick={() => onNext(zipCode, selected)}
        disabled={nearbyStores.length === 0 || selected.length === 0}
        className="w-full rounded-2xl py-4 text-sm font-bold text-white mb-3 transition-all disabled:opacity-40"
        style={{ backgroundColor: THRFT_BLUE, boxShadow: nearbyStores.length ? '0 6px 20px rgba(65,129,237,.3)' : 'none' }}
      >
        Continue →
      </button>
      <button onClick={onBack} className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
        ← Back
      </button>

      <StepDots current="stores" />
    </motion.div>
  );
}

// ─── Step 3: Ready + optional promo ──────────────────────────────────────────

function ReadyStep({ selectedStoreCount, onComplete, saving }) {
  const [showPromo, setShowPromo]       = useState(false);
  const [promoCode, setPromoCode]       = useState('');
  const [promoError, setPromoError]     = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const validatePromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (VALID_PROMO_CODES.includes(code)) {
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Please check and try again.');
    }
  };

  const NEXT_STEPS = [
    { emoji: '📝', title: 'Create your grocery list',    sub: 'Type items or browse 800+ products' },
    { emoji: '🔍', title: 'Compare prices instantly',    sub: 'We check every store at once'       },
    { emoji: '💰', title: 'Save on every trip',          sub: 'Average family saves $14/shop'      },
  ];

  return (
    <motion.div
      key="ready"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Success icon */}
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
          <Check className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">You're all set!</h2>
        <p className="text-sm text-slate-500">
          {selectedStoreCount} store{selectedStoreCount !== 1 ? 's' : ''} selected · 7-day free trial
        </p>
      </div>

      {/* What happens next */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
        {NEXT_STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-lg">
              {step.emoji}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="text-xs text-slate-400">{step.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo code — optional, collapsed by default */}
      <div className="mb-5">
        {!showPromo && !promoApplied ? (
          <button
            onClick={() => setShowPromo(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
            style={{ borderColor: '#e2e8f0' }}
          >
            Have a promo or EBT code?
            <span className="font-semibold" style={{ color: THRFT_BLUE }}>Enter it here</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        ) : promoApplied ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-bold text-emerald-800">Lifetime access unlocked!</p>
            <p className="text-xs text-emerald-600 mt-1">Your promo code has been applied. Enjoy THRFT Premium for free.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-2xl border border-slate-100 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-800">Promo / EBT code</p>
              <button onClick={() => setShowPromo(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. EBT2026"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase"
              />
              <button
                onClick={validatePromo}
                disabled={!promoCode.trim()}
                className="px-4 h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ backgroundColor: THRFT_BLUE }}
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => onComplete(promoApplied)}
        disabled={saving}
        className="w-full rounded-2xl py-4 text-sm font-bold text-white mb-2 flex items-center justify-center gap-2 transition-all"
        style={{ backgroundColor: THRFT_BLUE, boxShadow: '0 6px 20px rgba(65,129,237,.35)' }}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>{promoApplied ? 'Activate lifetime access' : 'Start my free trial'} <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
      <p className="text-xs text-slate-400 text-center">No credit card · Cancel anytime</p>

      <StepDots current="ready" />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();

  const [step, setStep]           = useState('welcome');
  const [userCount, setUserCount] = useState(217);
  const [saving, setSaving]       = useState(false);

  const [zipCode, setZipCode]               = useState('');
  const [selectedStores, setSelectedStores] = useState([]);

  useEffect(() => {
    base44.functions.invoke('getUserCount', {}).then(res => {
      if (res.data?.count) setUserCount(res.data.count);
    }).catch(() => {});
  }, []);

  const handleStoresNext = (zip, stores) => {
    setZipCode(zip);
    setSelectedStores(stores);
    setStep('ready');
  };

  const handleComplete = async promoApplied => {
    setSaving(true);
    const updates = {
      zip_code:            zipCode,
      favorite_stores:     selectedStores,
      onboarding_complete: true,
    };
    if (promoApplied) {
      updates.has_lifetime_access = true;
      updates.account_type        = 'premium';
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
    <div
      className="min-h-screen flex items-start justify-center px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #eff6ff 0%, white 60%)' }}
    >
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <WelcomeStep
              key="welcome"
              userCount={userCount}
              onNext={() => setStep('stores')}
              onLogin={() => navigate('/Login')}
            />
          )}
          {step === 'stores' && (
            <StoresStep
              key="stores"
              onNext={handleStoresNext}
              onBack={() => setStep('welcome')}
            />
          )}
          {step === 'ready' && (
            <ReadyStep
              key="ready"
              selectedStoreCount={selectedStores.length}
              onComplete={handleComplete}
              saving={saving}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}