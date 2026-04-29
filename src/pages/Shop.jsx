import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, X } from 'lucide-react';
import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import { useCart } from '@/lib/cartContext.jsx';

const THRFT_BLUE = '#4181ed';

const AISLES = [
  { key: 'produce',       label: 'Produce',      emoji: '🥦' },
  { key: 'meat',          label: 'Meat',         emoji: '🥩' },
  { key: 'seafood',       label: 'Seafood',      emoji: '🦐' },
  { key: 'eggs_dairy',    label: 'Dairy',        emoji: '🥛' },
  { key: 'cheese',        label: 'Cheese',       emoji: '🧀' },
  { key: 'frozen',        label: 'Frozen',       emoji: '🧊' },
  { key: 'bread',         label: 'Bakery',       emoji: '🍞' },
  { key: 'beverages',     label: 'Beverages',    emoji: '🥤' },
  { key: 'snacks',        label: 'Snacks',       emoji: '🍿' },
  { key: 'breakfast',     label: 'Breakfast',    emoji: '🍳' },
  { key: 'cereal',        label: 'Cereal',       emoji: '🥣' },
  { key: 'canned',        label: 'Canned Goods', emoji: '🥫' },
  { key: 'cookies',       label: 'Cookies',      emoji: '🍪' },
  { key: 'candy',         label: 'Candy',        emoji: '🍬' },
  { key: 'deli',          label: 'Deli',         emoji: '🥪' },
  { key: 'yogurt',        label: 'Yogurt',       emoji: '🍦' },
  { key: 'personal_care', label: 'Personal Care',emoji: '🧴' },
  { key: 'cleaning',      label: 'Cleaning',     emoji: '🧹' },
  { key: 'health',        label: 'Health',       emoji: '💊' },
  { key: 'baby',          label: 'Baby',         emoji: '👶' },
  { key: 'pet',           label: 'Pet',          emoji: '🐶' },
  { key: 'alcohol',       label: 'Beer & Wine',  emoji: '🍺' },
];

function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={() => onClick(product)}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-left hover:border-blue-200 hover:shadow-md transition-all w-full"
    >
      <div className="w-full bg-slate-50 flex items-center justify-center" style={{ height: 110 }}>
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain"
            style={{ maxHeight: 100, maxWidth: '90%' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: 40 }}>{product.emoji || '🛒'}</span>
        )}
      </div>
      <div className="p-2.5">
        {product.brand && <p className="text-xs text-slate-400 truncate">{product.brand}</p>}
        <p className="text-xs font-semibold text-slate-900 leading-snug" style={{ minHeight: 32, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </p>
        {product.size && <p className="text-xs text-slate-400 mt-0.5 truncate">{product.size}</p>}
        {product.price && (
          <p className="text-sm font-bold text-slate-900 mt-1">${product.price.toFixed(2)}</p>
        )}
      </div>
    </button>
  );
}

function SearchRow({ product, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={() => onClick(product)}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-blue-50 transition-colors text-left"
    >
      <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
        {product.imageUrl && !imgError ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)} />
        ) : (
          <span style={{ fontSize: 26 }}>🛒</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {product.brand && <p className="text-xs text-slate-400 truncate">{product.brand}</p>}
        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
        {product.size && <p className="text-xs text-slate-400 truncate">{product.size}</p>}
        {product.price && <p className="text-sm font-bold text-slate-900 mt-0.5">${product.price.toFixed(2)}</p>}
      </div>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: THRFT_BLUE }}>
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </button>
  );
}

export default function Shop() {
  const navigate  = useNavigate();
  const { cartCount, userZip } = useCart();

  const [query, setQuery]               = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured]   = useState(true);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    if (!userZip) return;
    base44.functions.invoke('krogerProducts', {
      mode: 'browse', category: 'beverages', zip_code: userZip, limit: 8,
    }).then(res => {
      setFeaturedProducts(res.data?.products || []);
      setLoadingFeatured(false);
    }).catch(() => setLoadingFeatured(false));
  }, [userZip]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSearchResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await base44.functions.invoke('krogerProducts', {
          mode: 'search', term: q, zip_code: userZip || '10001', limit: 20,
        });
        setSearchResults(res.data?.products || []);
      } catch { setSearchResults([]); }
      setSearching(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, userZip]);

  const goToProduct = product => {
    sessionStorage.setItem('thrft_selected_product', JSON.stringify(product));
    navigate('/Product');
  };

  const isSearching = query.trim().length >= 2;

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', paddingBottom: 80 }}>

      {/* Blue header */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: THRFT_BLUE }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col shrink-0">
            <span className="text-xs text-white/65">Shopping at</span>
            <span className="text-sm font-bold text-white leading-tight">{userZip || 'your area'}</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2">
            {searching
              ? <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
              : <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            }
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearchResults([]); }}>
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
          <button onClick={() => navigate('/Cart')} className="relative shrink-0">
            <ThrftCartIcon className="w-7 h-7 text-white" />
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontSize: 9 }}>{cartCount}</span>
              </div>
            )}
          </button>
        </div>
      </header>

      {isSearching ? (
        <div className="bg-white">
          <p className="text-xs text-slate-400 px-4 py-2.5 border-b border-slate-100">
            {searching ? 'Searching Kroger...' : `${searchResults.length} results for "${query}"`}
          </p>
          {searchResults.map((product, i) => (
            <SearchRow key={i} product={product} onClick={goToProduct} />
          ))}
          {!searching && searchResults.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm">No results for "{query}"</p>
              <p className="text-slate-400 text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

      ) : (
        <div>
          {/* Aisle scroll */}
          <div className="bg-white border-b border-slate-100">
            <div className="flex gap-4 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
              {AISLES.map(aisle => (
                <button
                  key={aisle.key}
                  onClick={() => navigate(`/Aisle?key=${aisle.key}&label=${encodeURIComponent(aisle.label)}&emoji=${aisle.emoji}`)}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 border-slate-200 bg-slate-50 hover:border-blue-400 transition-colors">
                    {aisle.emoji}
                  </div>
                  <span className="text-xs font-medium text-slate-600" style={{ maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {aisle.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured products */}
          <div className="px-4 pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Start your order</h2>
            </div>

            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
              {['Favorites', 'On Sale', 'Past Lists'].map((tab, i) => (
                <button key={tab} className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: i === 0 ? '#fff' : 'transparent', color: i === 0 ? '#0f172a' : '#94a3b8', boxShadow: i === 0 ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>
                  {tab}
                </button>
              ))}
            </div>

            {loadingFeatured ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {featuredProducts.map((product, i) => (
                  <ProductCard key={i} product={product} onClick={goToProduct} />
                ))}
              </div>
            )}
          </div>

          {/* Browse by aisle grid */}
          <div className="px-4 pb-6">
            <h2 className="text-base font-bold text-slate-900 mb-3">Browse by aisle</h2>
            <div className="grid grid-cols-2 gap-2">
              {AISLES.map(aisle => (
                <button
                  key={aisle.key}
                  onClick={() => navigate(`/Aisle?key=${aisle.key}&label=${encodeURIComponent(aisle.label)}&emoji=${aisle.emoji}`)}
                  className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 text-left hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <span style={{ fontSize: 22 }}>{aisle.emoji}</span>
                  <p className="text-sm font-semibold text-slate-900 truncate">{aisle.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}