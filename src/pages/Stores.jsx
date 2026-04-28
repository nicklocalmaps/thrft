import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Loader2, MapPin, Check, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import NearbyStoresMap from '@/components/grocery/NearbyStoresMap';
import { ALL_STORES } from '@/lib/storeConfig';

const THRFT_BLUE = '#4181ed';

function StoreToggleRow({ store, isFavorite, distMiles, onToggle, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onToggle(store.key)}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 text-left hover:bg-blue-50 transition-colors"
    >
      <div
        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all"
        style={{
          borderColor: isFavorite ? THRFT_BLUE : '#cbd5e1',
          background:  isFavorite ? THRFT_BLUE : 'transparent',
        }}
      >
        {isFavorite && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{store.name}</p>
        <p className="text-xs text-slate-400 truncate">
          {store.region}
          {distMiles != null && ` · ${distMiles.toFixed(1)} mi away`}
        </p>
      </div>
      {distMiles != null && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
          Nearby
        </span>
      )}
    </motion.button>
  );
}

export default function Stores() {
  const [user, setUser]                     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [nearbyKeys, setNearbyKeys]         = useState(new Set());
  const [saving, setSaving]                 = useState(false);
  const [saveSuccess, setSaveSuccess]       = useState(false);
  const [activeTab, setActiveTab]           = useState('nearby');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFavoriteStores(u?.favorite_stores || []);
      setLoading(false);
    });
  }, []);

  const savedAddress = user?.delivery_address;
  const initialZip   = savedAddress?.zip || user?.zip_code;

  const handleToggleFavorite = key => {
    setFavoriteStores(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSaveFavorites = async () => {
    setSaving(true);
    await base44.auth.updateMe({ favorite_stores: favoriteStores });
    setUser(prev => ({ ...prev, favorite_stores: favoriteStores }));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleNearbyResults = results => {
    setNearbyKeys(new Set(results.map(r => r.key)));
  };

  const nearbyStores  = ALL_STORES.filter(s => nearbyKeys.has(s.key));
  const displayStores = activeTab === 'nearby' && nearbyStores.length > 0 ? nearbyStores : ALL_STORES;
  const hasChanges    = JSON.stringify([...favoriteStores].sort()) !==
                        JSON.stringify([...(user?.favorite_stores || [])].sort());

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="pb-24">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">My Stores</h1>
        <p className="text-sm text-slate-500">
          {favoriteStores.length} store{favoriteStores.length !== 1 ? 's' : ''} selected for price comparisons
        </p>
      </div>

      {/* Delivery address pill */}
      {savedAddress?.street ? (
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-5">
          <MapPin className="w-4 h-4 shrink-0" style={{ color: THRFT_BLUE }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-800 mb-0.5">Delivery address</p>
            <p className="text-sm text-blue-700 truncate">
              {savedAddress.street}{savedAddress.apt ? `, ${savedAddress.apt}` : ''}, {savedAddress.city}, {savedAddress.state} {savedAddress.zip}
            </p>
          </div>
          <Link to="/Profile" className="text-xs font-bold shrink-0 hover:underline" style={{ color: THRFT_BLUE }}>
            Edit →
          </Link>
        </div>
      ) : (
        <Link to="/Profile">
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-5 hover:bg-amber-100 transition-colors">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 flex-1">Add a delivery address for automatic store lookup</p>
            <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Map */}
      <div className="mb-6">
        <NearbyStoresMap
          initialZip={initialZip}
          savedAddress={savedAddress}
          favoriteStores={favoriteStores}
          showFavorites
          onNearbyResults={handleNearbyResults}
        />
      </div>

      {/* Favorite stores selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Compare these stores</h2>
          <span className="text-xs text-slate-400">{favoriteStores.length} selected</span>
        </div>

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
          {[
            { key: 'nearby', label: `Nearby${nearbyStores.length ? ` (${nearbyStores.length})` : ''}` },
            { key: 'all',    label: `All stores (${ALL_STORES.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeTab === tab.key ? '#fff'    : 'transparent',
                color:      activeTab === tab.key ? '#0f172a' : '#94a3b8',
                boxShadow:  activeTab === tab.key ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'nearby' && nearbyStores.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-400">
            Enter your zip code on the map above to see nearby stores
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {displayStores.map((store, i) => (
            <StoreToggleRow
              key={store.key}
              store={store}
              isFavorite={favoriteStores.includes(store.key)}
              distMiles={null}
              onToggle={handleToggleFavorite}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Quick select */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFavoriteStores(ALL_STORES.filter(s => nearbyKeys.has(s.key)).map(s => s.key))}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700"
        >
          Select all nearby
        </button>
        <button
          onClick={() => setFavoriteStores(ALL_STORES.slice(0, 6).map(s => s.key))}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600"
        >
          Top 6 national
        </button>
        <button
          onClick={() => setFavoriteStores([])}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-400"
        >
          Clear all
        </button>
      </div>

      {/* Sticky save */}
      <AnimatePresence>
        {(hasChanges || saveSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 px-4"
          >
            <div className="max-w-xl mx-auto">
              <button
                onClick={handleSaveFavorites}
                disabled={saving || saveSuccess}
                className="w-full rounded-2xl py-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xl"
                style={{
                  backgroundColor: saveSuccess ? '#16a34a' : THRFT_BLUE,
                  boxShadow: saveSuccess ? '0 6px 20px rgba(22,163,74,.4)' : '0 6px 20px rgba(65,129,237,.4)',
                }}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : saveSuccess ? (
                  <><Check className="w-4 h-4" strokeWidth={3} /> Stores saved!</>
                ) : (
                  <>Save {favoriteStores.length} store{favoriteStores.length !== 1 ? 's' : ''} →</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}