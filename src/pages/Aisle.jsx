import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, ChevronUp, Loader2, Plus, Check } from 'lucide-react';
import ThrftListIcon from '@/components/icons/ThrftListIcon';
import { useCart } from '@/lib/cartContext.jsx';

const THRFT_BLUE = '#4181ed';

function ProductImg({ imageUrl, emoji, size = 48, className = '' }) {
  const [err, setErr] = useState(false);
  if (imageUrl && !err) {
    return (
      <img src={imageUrl} alt="" className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setErr(true)} />
    );
  }
  return <span style={{ fontSize: size * 0.6 }}>{emoji || '🛒'}</span>;
}

function VariantRow({ variant, onAdd, inCart }) {
  const [err, setErr] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
        {variant.imageUrl && !err ? (
          <img src={variant.imageUrl} alt="" className="w-full h-full object-contain p-0.5" onError={() => setErr(true)} />
        ) : (
          <span style={{ fontSize: 18 }}>🛒</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{variant.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {variant.size && <p className="text-xs text-slate-400">{variant.size}</p>}
          {variant.price && <p className="text-xs font-bold text-slate-700">${variant.price.toFixed(2)}</p>}
        </div>
      </div>
      <button
        onClick={() => onAdd(variant)}
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: inCart ? '#16a34a' : THRFT_BLUE }}
      >
        {inCart ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} /> : <Plus className="w-3.5 h-3.5 text-white" />}
      </button>
    </div>
  );
}

function ProductFamily({ family, emoji, onAdd, cartNames }) {
  const [expanded, setExpanded] = useState(false);
  const hasVariants = family.variants.length > 1;
  const firstVariant = family.variants[0];
  const inCart = cartNames.has(family.name) || family.variants.some(v => cartNames.has(v.name));

  return (
    <div className="border-b border-slate-50 last:border-0">
      <button
        onClick={() => hasVariants ? setExpanded(e => !e) : onAdd(firstVariant)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
          <ProductImg imageUrl={family.imageUrl} emoji={emoji} size={52} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{family.name}</p>
          {family.price !== null && (
            <p className="text-xs text-slate-500 mt-0.5">
              From ${family.price.toFixed(2)}{hasVariants && ` · ${family.variants.length} options`}
            </p>
          )}
        </div>
        {hasVariants ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {inCart && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onAdd(firstVariant); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
            style={{ backgroundColor: inCart ? '#16a34a' : THRFT_BLUE }}
          >
            {inCart ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} /> : <Plus className="w-3.5 h-3.5 text-white" />}
          </button>
        )}
      </button>
      {expanded && hasVariants && (
        <div className="bg-slate-50 border-t border-slate-100">
          {family.variants.map((variant, i) => (
            <VariantRow key={i} variant={variant} onAdd={onAdd} inCart={cartNames.has(variant.name)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandSection({ brandData, emoji, onAdd, cartNames }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 text-left hover:bg-slate-200 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
          <ProductImg imageUrl={brandData.imageUrl} emoji={emoji} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">{brandData.brand}</p>
          <p className="text-xs text-slate-500">{brandData.productCount} product{brandData.productCount !== 1 ? 's' : ''}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>
      {expanded && (
        <div className="bg-white border border-slate-100 border-t-0 rounded-b-2xl overflow-hidden">
          {brandData.products.map((family, i) => (
            <ProductFamily key={i} family={family} emoji={emoji} onAdd={onAdd} cartNames={cartNames} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Aisle() {
  const navigate = useNavigate();
  const { cartCount, addToCart, cartItems, userZip } = useCart();

  const params = new URLSearchParams(window.location.search);
  const key    = params.get('key')   || 'beverages';
  const label  = decodeURIComponent(params.get('label') || 'Aisle');
  const emoji  = params.get('emoji') || '🛒';

  const [brands, setBrands]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const zip = userZip || '10001';
    setLoading(true);
    base44.functions.invoke('krogerProducts', {
      mode: 'browse', category: key, zip_code: zip, limit: 50,
    }).then(res => {
      setBrands(res.data?.brands || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [key, userZip]);

  const cartNames = new Set(cartItems.map(i => i.name));

  const handleAdd = item => {
    addToCart({ name: item.name, brand: item.brand || '', size: item.size || '', imageUrl: item.imageUrl, price: item.price, quantity: 1 });
  };

  const filtered = search.trim()
    ? brands.map(b => ({
        ...b,
        products: b.products.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          b.brand.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(b => b.products.length > 0)
    : brands;

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', paddingBottom: 80 }}>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/NewList')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span style={{ fontSize: 22 }}>{emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900">{label}</p>
            <p className="text-xs font-semibold text-emerald-600">
              {loading ? 'Loading from Kroger…' : `${brands.length} brand${brands.length !== 1 ? 's' : ''} · ${brands.reduce((s, b) => s + b.productCount, 0)} products`}
            </p>
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

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder={`Search ${label}…`} value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none" />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading {label} from Kroger…</p>
            <p className="text-xs text-slate-400 mt-1">Organizing by brand…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">No products found</p>
            {search && <button onClick={() => setSearch('')} className="text-blue-500 text-sm mt-2 underline">Clear search</button>}
          </div>
        ) : (
          filtered.map(brandData => (
            <BrandSection key={brandData.brand} brandData={brandData} emoji={emoji} onAdd={handleAdd} cartNames={cartNames} />
          ))
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4">
          <button onClick={() => navigate('/Cart')}
            className="w-full flex items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-xl"
            style={{ backgroundColor: THRFT_BLUE }}>
            <div className="flex items-center gap-2.5">
              <ThrftListIcon className="w-5 h-5 text-white" />
              <span className="text-sm font-bold">{cartCount} item{cartCount !== 1 ? 's' : ''} on list</span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-xl">View list →</span>
          </button>
        </div>
      )}
    </div>
  );
}