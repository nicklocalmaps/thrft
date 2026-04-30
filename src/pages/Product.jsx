import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, Minus, Check, Loader2, ChevronRight } from 'lucide-react';
import ThrftListIcon from '@/components/icons/ThrftListIcon';
import { useCart } from '@/lib/cartContext.jsx';

const THRFT_BLUE = '#4181ed';

const AISLES = [
  { key: 'produce',       label: 'Produce',      emoji: '🥦' },
  { key: 'meat',          label: 'Meat',         emoji: '🥩' },
  { key: 'eggs_dairy',    label: 'Dairy',        emoji: '🥛' },
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
  { key: 'cheese',        label: 'Cheese',       emoji: '🧀' },
  { key: 'seafood',       label: 'Seafood',      emoji: '🦐' },
  { key: 'personal_care', label: 'Personal Care',emoji: '🧴' },
  { key: 'cleaning',      label: 'Cleaning',     emoji: '🧹' },
  { key: 'health',        label: 'Health',       emoji: '💊' },
  { key: 'baby',          label: 'Baby',         emoji: '👶' },
  { key: 'pet',           label: 'Pet',          emoji: '🐶' },
  { key: 'alcohol',       label: 'Beer & Wine',  emoji: '🍺' },
];

const RELATED_AISLES = {
  snacks:       ['beverages', 'cookies', 'candy'],
  cookies:      ['snacks', 'candy', 'breakfast'],
  candy:        ['snacks', 'cookies', 'beverages'],
  beverages:    ['snacks', 'breakfast', 'alcohol'],
  breakfast:    ['cereal', 'bread', 'eggs_dairy'],
  cereal:       ['breakfast', 'eggs_dairy', 'bread'],
  meat:         ['produce', 'bread', 'condiments'],
  produce:      ['meat', 'deli', 'canned'],
  frozen:       ['meat', 'snacks', 'beverages'],
  bread:        ['deli', 'breakfast', 'condiments'],
  deli:         ['bread', 'meat', 'cheese'],
  cheese:       ['deli', 'eggs_dairy', 'bread'],
  yogurt:       ['eggs_dairy', 'breakfast', 'produce'],
  eggs_dairy:   ['breakfast', 'bread', 'cheese'],
  canned:       ['produce', 'condiments', 'packaged_meals'],
  personal_care:['health', 'cleaning', 'baby'],
  cleaning:     ['personal_care', 'health', 'baby'],
  health:       ['personal_care', 'baby', 'beverages'],
};

function ProductImg({ imageUrl, size = 100, fallback = '🛒' }) {
  const [err, setErr] = useState(false);
  if (imageUrl && !err) {
    return (
      <img src={imageUrl} alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setErr(true)} />
    );
  }
  return <span style={{ fontSize: size * 0.6 }}>{fallback}</span>;
}

function SuggestionProductCard({ product, onClick }) {
  const [err, setErr] = useState(false);
  return (
    <button onClick={() => onClick(product)}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-left hover:border-blue-200 hover:shadow-sm transition-all shrink-0"
      style={{ width: 120 }}>
      <div className="w-full bg-slate-50 flex items-center justify-center" style={{ height: 80 }}>
        {product.imageUrl && !err ? (
          <img src={product.imageUrl} alt={product.name} className="object-contain p-1"
            style={{ maxHeight: 72, maxWidth: '90%' }} onError={() => setErr(true)} />
        ) : <span style={{ fontSize: 32 }}>🛒</span>}
      </div>
      <div className="p-2">
        {product.brand && <p className="text-xs text-slate-400 truncate">{product.brand}</p>}
        <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">{product.displayName || product.name}</p>
        {product.price && <p className="text-xs font-bold text-slate-700 mt-1">${product.price.toFixed(2)}</p>}
      </div>
    </button>
  );
}

function SectionHeader({ title, count, onSeeMore, showMore }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {count > 3 && (
        <button onClick={onSeeMore} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: THRFT_BLUE }}>
          {showMore ? 'Show less' : `See all ${count}`}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function Product() {
  const navigate = useNavigate();
  const { cartCount, addToCart, cartItems } = useCart();

  const [product, setProduct]               = useState(null);
  const [selectedVariant, setVariant]       = useState(null);
  const [qty, setQty]                       = useState(1);
  const [added, setAdded]                   = useState(false);
  const [brandProducts, setBrandProducts]   = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showMoreBrand, setShowMoreBrand]   = useState(false);
  const [showMoreSimilar, setShowMoreSimilar] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('thrft_selected_product');
    if (!stored) { navigate('/NewList'); return; }
    const p = JSON.parse(stored);
    setProduct(p);
    setVariant(p.allVariants?.length > 0 ? p.allVariants[0] : p);

    if (!p.brand && !p.displayName) return;
    setLoadingSuggestions(true);

    base44.auth.me().then(user => {
      const zip = user?.delivery_address?.zip || user?.zip_code || '10001';
      const searchTerm  = p.brand || p.displayName || p.name;
      const simTerm     = (p.displayName || p.name).split(' ').slice(0, 2).join(' ');
      return Promise.all([
        base44.functions.invoke('krogerProducts', { mode: 'search', term: searchTerm, zip_code: zip, limit: 20 }).catch(() => ({ data: { products: [] } })),
        base44.functions.invoke('krogerProducts', { mode: 'search', term: simTerm, zip_code: zip, limit: 20 }).catch(() => ({ data: { products: [] } })),
      ]);
    }).then(results => {
      if (!results) return;
      const [brandRes, similarRes] = results;
      const current = JSON.parse(sessionStorage.getItem('thrft_selected_product') || '{}');
      setBrandProducts((brandRes?.data?.products || []).filter(r => r.imageUrl && r.name !== current.name).map(r => ({ ...r, displayName: r.name })).slice(0, 9));
      setSimilarProducts((similarRes?.data?.products || []).filter(r => r.imageUrl && r.brand !== current.brand && r.name !== current.name).map(r => ({ ...r, displayName: r.name })).slice(0, 9));
      setLoadingSuggestions(false);
    }).catch(() => setLoadingSuggestions(false));
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    const v = selectedVariant || product;
    addToCart({
      name:     v.name || product.displayName || product.name,
      brand:    product.brand,
      size:     v.size || product.size,
      imageUrl: v.imageUrl || product.imageUrl,
      price:    v.price || product.price,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const goToProduct = p => {
    const productData = { ...p, displayName: p.name, allVariants: [], imageUrl: p.imageUrl };
    sessionStorage.setItem('thrft_selected_product', JSON.stringify(productData));
    navigate('/Product', { replace: true });
  };

  const goToAisle = aisle => navigate(`/Aisle?key=${aisle.key}&label=${encodeURIComponent(aisle.label)}&emoji=${aisle.emoji}`);

  if (!product) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  const allVariants     = product.allVariants?.length > 0 ? product.allVariants : [product];
  const relatedAisleKeys = RELATED_AISLES[product.categoryKey || ''] || [];
  const relatedAisles   = relatedAisleKeys.map(k => AISLES.find(a => a.key === k)).filter(Boolean);
  const visibleBrand    = showMoreBrand   ? brandProducts   : brandProducts.slice(0, 3);
  const visibleSimilar  = showMoreSimilar ? similarProducts : similarProducts.slice(0, 3);

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: 80 }}>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{product.displayName || product.name}</p>
            {product.brand && <p className="text-xs text-slate-400">{product.brand}</p>}
          </div>
          <button onClick={() => navigate('/Cart')} className="relative shrink-0">
            <ThrftListIcon className="w-6 h-6 text-slate-600" />
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontSize: 9 }}>{cartCount}</span>
              </div>
            )}
          </button>
        </div>
      </header>

      <div className="w-full bg-slate-50 flex items-center justify-center border-b border-slate-100" style={{ height: 240 }}>
        <ProductImg imageUrl={selectedVariant?.imageUrl || product.imageUrl} size={200} />
      </div>

      <div className="px-4 py-5">
        {product.brand && <p className="text-sm text-slate-400 mb-1">{product.brand}</p>}
        <h1 className="text-xl font-bold text-slate-900 mb-1">{product.displayName || product.name}</h1>
        {(selectedVariant?.price || product.price) && (
          <p className="text-2xl font-extrabold text-slate-900 mb-1">${(selectedVariant?.price || product.price).toFixed(2)}</p>
        )}
        {(selectedVariant?.size || product.size) && (
          <p className="text-sm text-slate-400 mb-4">{selectedVariant?.size || product.size}</p>
        )}

        <div className="border-t border-slate-100 my-4" />

        {/* Variant cards */}
        {allVariants.length > 1 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{allVariants.length} sizes available</p>
            <div className="space-y-2">
              {allVariants.map((v, i) => {
                const isSelected = selectedVariant?.id === v.id || selectedVariant?.name === v.name;
                return (
                  <VariantCard key={i} v={v} product={product} isSelected={isSelected} onSelect={() => setVariant(v)} />
                );
              })}
            </div>
          </div>
        )}

        {/* Qty + Add */}
        <div className="flex gap-3 mb-4">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"><Minus className="w-4 h-4" /></button>
            <span className="text-base font-bold text-slate-900 px-3 min-w-[32px] text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          <button onClick={handleAddToCart}
            className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[.98]"
            style={{ backgroundColor: added ? '#16a34a' : THRFT_BLUE, boxShadow: added ? 'none' : '0 4px 14px rgba(65,129,237,.3)' }}>
            {added ? <><Check className="w-4 h-4" strokeWidth={2.5} /> Added!</> : <><Plus className="w-4 h-4" /> Add to list</>}
          </button>
        </div>

        {cartCount > 0 && (
          <button onClick={() => navigate('/Cart')}
            className="w-full py-3 rounded-xl border-2 text-sm font-bold mb-6 transition-colors hover:bg-blue-50"
            style={{ borderColor: THRFT_BLUE, color: THRFT_BLUE }}>
            View list ({cartCount} item{cartCount !== 1 ? 's' : ''}) →
          </button>
        )}

        {loadingSuggestions && (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading suggestions…
          </div>
        )}

        {!loadingSuggestions && brandProducts.length > 0 && (
          <div className="mb-6">
            <div className="border-t border-slate-100 mb-4" />
            <SectionHeader title={`More from ${product.brand || 'this brand'}`} count={brandProducts.length} onSeeMore={() => setShowMoreBrand(v => !v)} showMore={showMoreBrand} />
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {visibleBrand.map((p, i) => <SuggestionProductCard key={i} product={p} onClick={goToProduct} />)}
            </div>
          </div>
        )}

        {relatedAisles.length > 0 && (
          <div className="mb-6">
            <div className="border-t border-slate-100 mb-4" />
            <h3 className="text-base font-bold text-slate-900 mb-3">Browse related aisles</h3>
            <div className="flex gap-2 flex-wrap">
              {relatedAisles.map(aisle => (
                <button key={aisle.key} onClick={() => goToAisle(aisle)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <span style={{ fontSize: 18 }}>{aisle.emoji}</span>
                  <span className="text-sm font-semibold text-slate-800">{aisle.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!loadingSuggestions && similarProducts.length > 0 && (
          <div className="mb-6">
            <div className="border-t border-slate-100 mb-4" />
            <SectionHeader title="You might also like" count={similarProducts.length} onSeeMore={() => setShowMoreSimilar(v => !v)} showMore={showMoreSimilar} />
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {visibleSimilar.map((p, i) => <SuggestionProductCard key={i} product={p} onClick={goToProduct} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VariantCard({ v, product, isSelected, onSelect }) {
  const [err, setErr] = useState(false);
  return (
    <button onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left"
      style={{ borderColor: isSelected ? THRFT_BLUE : '#e2e8f0', background: isSelected ? '#eff6ff' : '#fff' }}>
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
        {(v.imageUrl || product.imageUrl) && !err ? (
          <img src={v.imageUrl || product.imageUrl} alt={v.name} className="w-full h-full object-contain p-1" onError={() => setErr(true)} />
        ) : <span style={{ fontSize: 20 }}>🛒</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{v.name}</p>
        {v.size && <p className="text-xs text-slate-400 mt-0.5">{v.size}</p>}
        {v.price && <p className="text-sm font-bold mt-0.5" style={{ color: THRFT_BLUE }}>${v.price.toFixed(2)}</p>}
      </div>
      {isSelected && <Check className="w-5 h-5 shrink-0" style={{ color: THRFT_BLUE }} strokeWidth={2.5} />}
    </button>
  );
}