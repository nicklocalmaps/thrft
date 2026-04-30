import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, Minus, Check, Loader2, ChevronDown } from 'lucide-react';
import ThrftListIcon from '@/components/icons/ThrftListIcon';
import { useCart } from '@/lib/cartContext.jsx';

const THRFT_BLUE = '#4181ed';

function SimilarCard({ p, onClick }) {
  const [err, setErr] = useState(false);
  return (
    <button onClick={() => onClick(p)}
      className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-3 text-left hover:bg-blue-50 transition-colors border border-slate-100">
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
        {p.imageUrl && !err ? (
          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain p-1" onError={() => setErr(true)} />
        ) : (
          <span style={{ fontSize: 20 }}>🛒</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">{p.name}</p>
        {p.price && <p className="text-xs font-bold text-slate-700 mt-0.5">${p.price.toFixed(2)}</p>}
      </div>
    </button>
  );
}

export default function Product() {
  const navigate = useNavigate();
  const { cartCount, addToCart, cartItems } = useCart();

  const [product, setProduct]           = useState(null);
  const [similar, setSimilar]           = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [qty, setQty]                   = useState(1);
  const [variant, setVariant]           = useState('');
  const [variants, setVariants]         = useState([]);
  const [imgError, setImgError]         = useState(false);
  const [added, setAdded]               = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('thrft_selected_product');
    if (!stored) { navigate('/NewList'); return; }
    const p = JSON.parse(stored);
    setProduct(p);

    if (p.allVariants && p.allVariants.length > 0) {
      setVariants(p.allVariants);
      setVariant(p.allVariants[0]);
    } else if (p.size) {
      setVariants([p.size]);
      setVariant(p.size);
    }

    if (p.brand) {
      setLoadingSimilar(true);
      base44.auth.me().then(user => {
        const zip = user?.delivery_address?.zip || user?.zip_code || '10001';
        return base44.functions.invoke('krogerProducts', {
          mode: 'search', term: p.brand, zip_code: zip, limit: 20,
        });
      }).then(res => {
        const results = res.data?.products || [];
        const currentName = JSON.parse(sessionStorage.getItem('thrft_selected_product') || '{}').name;
        const sim = results.filter(r => r.imageUrl && r.name !== currentName).slice(0, 4);
        setSimilar(sim);
        setLoadingSimilar(false);
      }).catch(() => setLoadingSimilar(false));
    }
  }, []);

  const inCart = cartItems.some(i => i.name === product?.name);

  const handleAddToCart = () => {
    if (!product) return;
    const isObj  = typeof variant === 'object' && variant !== null;
    const vName  = isObj ? variant.name  : null;
    const vSize  = isObj ? variant.size  : (variant || product.size);
    const vPrice = isObj ? variant.price : product.price;
    const vImage = isObj ? variant.imageUrl : product.imageUrl;
    addToCart({
      name:     vName || (vSize ? `${product.displayName || product.name} (${vSize})` : (product.displayName || product.name)),
      brand:    product.brand,
      size:     vSize,
      imageUrl: vImage || product.imageUrl,
      price:    vPrice || product.price,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const goToSimilar = p => {
    sessionStorage.setItem('thrft_selected_product', JSON.stringify(p));
    setProduct(p);
    setImgError(false);
    setAdded(false);
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!product) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: 80 }}>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{product.brand || 'Product'}</p>
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

      <div className="w-full bg-slate-50 flex items-center justify-center border-b border-slate-100" style={{ height: 260 }}>
        {product.imageUrl && !imgError ? (
          <img src={product.imageUrl} alt={product.name} className="object-contain"
            style={{ maxHeight: 240, maxWidth: '85%' }} onError={() => setImgError(true)} />
        ) : (
          <span style={{ fontSize: 80 }}>🛒</span>
        )}
      </div>

      <div className="px-4 py-5">
        {product.brand && <p className="text-sm text-slate-400 mb-1">{product.brand}</p>}
        <h1 className="text-xl font-bold text-slate-900 mb-1">{product.displayName || product.name}</h1>
        {product.size && <p className="text-sm text-slate-400 mb-3">{product.size}</p>}
        {product.price && <p className="text-2xl font-extrabold text-slate-900 mb-1">${product.price.toFixed(2)}</p>}

        <div className="border-t border-slate-100 my-4" />

        {variants.length > 1 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Size / variant</p>
            <div className="relative">
              <select
                value={typeof variant === 'object' ? JSON.stringify(variant) : variant}
                onChange={e => {
                  try { setVariant(JSON.parse(e.target.value)); } catch { setVariant(e.target.value); }
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none"
              >
                {variants.map((v, i) => {
                  const isObj = typeof v === 'object' && v !== null;
                  const label = isObj ? `${v.name}${v.size ? ` — ${v.size}` : ''}${v.price ? ` ($${v.price.toFixed(2)})` : ''}` : v;
                  const val   = isObj ? JSON.stringify(v) : v;
                  return <option key={i} value={val}>{label}</option>;
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-bold text-slate-900 px-3 min-w-[32px] text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)}
              className="w-12 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleAddToCart}
            className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: added ? '#16a34a' : THRFT_BLUE, boxShadow: added ? 'none' : '0 4px 14px rgba(65,129,237,.3)' }}>
            {added ? <><Check className="w-4 h-4" strokeWidth={2.5} /> Added!</> : <><Plus className="w-4 h-4" /> Add to cart</>}
          </button>
        </div>

        {cartCount > 0 && (
          <button onClick={() => navigate('/Cart')}
            className="w-full py-3 rounded-xl border-2 text-sm font-bold mb-6 transition-colors hover:bg-blue-50"
            style={{ borderColor: THRFT_BLUE, color: THRFT_BLUE }}>
            View cart ({cartCount} item{cartCount !== 1 ? 's' : ''}) →
          </button>
        )}

        {(loadingSimilar || similar.length > 0) && (
          <div>
            <div className="border-t border-slate-100 mb-4" />
            <p className="text-base font-bold text-slate-900 mb-3">You might also like</p>
            {loadingSimilar ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading similar products...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {similar.map((p, i) => <SimilarCard key={i} p={p} onClick={goToSimilar} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}