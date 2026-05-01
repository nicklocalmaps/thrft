import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, ChevronUp, Loader2, Plus, Check } from 'lucide-react';
import ThrftListIcon from '@/components/icons/ThrftListIcon';
import { useCart } from '@/lib/cartContext';

const THRFT_BLUE = '#4181ed';

// ─── Brand popularity order per aisle ────────────────────────────────────────

const BRAND_PRIORITY = {
  beverages: [
    'Coca-Cola', 'Coke', 'Pepsi', 'Sprite', 'Dr Pepper', 'Mountain Dew',
    'Gatorade', 'Powerade', 'Lipton', 'Snapple', 'Arizona', 'Tropicana',
    'Minute Maid', 'Simply', 'Ocean Spray', 'Red Bull', 'Monster',
    'Celsius', 'Kool-Aid', 'Capri Sun', 'Welchs',
  ],
  snacks: [
    "Lay's", 'Lays', 'Doritos', 'Cheetos', 'Pringles', 'Ruffles',
    'Fritos', 'Tostitos', 'SunChips', 'Wheat Thins', 'Ritz',
    'Oreo', 'Chips Ahoy', 'Goldfish', 'SkinnyPop', 'Popchips',
    'Kind', 'Clif', 'Nature Valley',
  ],
  breakfast: [
    "Kellogg's", 'Kellog', 'General Mills', 'Quaker', 'Post', 'Eggo',
    'Jimmy Dean', 'Bob Evans', 'Pillsbury', 'Betty Crocker',
    'Nature Valley', 'Clif', 'Kind', 'Aunt Jemima',
  ],
  cereal: [
    "Kellogg's", 'General Mills', 'Post', 'Quaker', 'Cheerios',
    'Frosted Flakes', 'Lucky Charms', 'Honey Bunches', 'Raisin Bran',
  ],
  frozen: [
    'DiGiorno', 'Hot Pockets', "Stouffer's", 'Lean Cuisine',
    "Marie Callender's", "Amy's", 'Birds Eye', 'Green Giant',
    'Ore-Ida', "Ben & Jerry's", "Häagen-Dazs", 'Breyers',
  ],
  meat: [
    'Tyson', 'Perdue', 'Oscar Mayer', 'Hillshire Farm', 'Ball Park',
    'Hebrew National', 'Applegate', 'Johnsonville', 'Bob Evans',
  ],
  eggs_dairy: [
    'Kroger', 'Horizon', 'Organic Valley', "Land O'Lakes", 'Kerrygold',
    'Tillamook', 'Darigold', 'Fairlife', 'Silk', 'Oatly',
  ],
  cheese: [
    'Kraft', 'Sargento', 'Tillamook', 'Cabot', "Boar's Head",
    'Cracker Barrel', 'Philadelphia', 'Laughing Cow',
  ],
  bread: [
    'Wonder', "Nature's Own", "Dave's Killer Bread", 'Sara Lee',
    'Pepperidge Farm', 'Arnold', "Thomas's", 'Oroweat', 'Mission',
  ],
  cookies: [
    'Oreo', 'Chips Ahoy', 'Pepperidge Farm', 'Keebler', 'Nabisco',
    'Newman-O', 'Nutter Butter', 'Lorna Doone',
  ],
  candy: [
    "Reese's", 'Snickers', 'M&Ms', 'Kit Kat', 'Twix', 'Hershey',
    'Skittles', 'Starburst', 'Sour Patch', 'Jolly Rancher',
  ],
};

function getBrandPriority(categoryKey, brandName) {
  const list = BRAND_PRIORITY[categoryKey] || [];
  const idx  = list.findIndex(b =>
    brandName.toLowerCase().includes(b.toLowerCase()) ||
    b.toLowerCase().includes(brandName.toLowerCase().split(' ')[0])
  );
  return idx === -1 ? 999 : idx;
}

// ─── Product image ────────────────────────────────────────────────────────────

function ProductImg({ imageUrl, emoji, size = 48 }) {
  const [err, setErr] = useState(false);
  if (imageUrl && !err) {
    return (
      <img src={imageUrl} alt="" style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setErr(true)} />
    );
  }
  return <span style={{ fontSize: size * 0.55 }}>{emoji || '🛒'}</span>;
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ product, emoji, onTap, onAdd, inCart, isLast }) {
  const hasVariants = product.variants && product.variants.length > 1;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <button
        onClick={() => onTap(product)}
        className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 hover:border-blue-200 transition-colors"
      >
        <ProductImg imageUrl={product.imageUrl} emoji={emoji} size={52} />
      </button>

      <button onClick={() => onTap(product)} className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {product.price !== null && (
            <p className="text-sm font-bold text-slate-700">${product.price.toFixed(2)}</p>
          )}
          {hasVariants && (
            <span className="text-xs text-blue-500 font-medium">
              {product.variants.length} size{product.variants.length !== 1 ? 's' : ''} →
            </span>
          )}
        </div>
      </button>

      <button
        onClick={() => onAdd(product.variants?.[0] || product)}
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: inCart ? '#16a34a' : THRFT_BLUE }}
      >
        {inCart
          ? <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          : <Plus className="w-4 h-4 text-white" />
        }
      </button>
    </div>
  );
}

// ─── Brand section ────────────────────────────────────────────────────────────

function BrandSection({ brandData, categoryKey, emoji, onAdd, onTapProduct, cartNames, defaultOpen }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [showAll, setShowAll]   = useState(false);

  const MAX_VISIBLE = 2;
  const products    = brandData.products || [];
  const visible     = showAll ? products : products.slice(0, MAX_VISIBLE);
  const hasMore     = products.length > MAX_VISIBLE;

  return (
    <div className="mb-3 rounded-2xl overflow-hidden border border-slate-100">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-left hover:bg-slate-100 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
          <ProductImg imageUrl={brandData.imageUrl} emoji={emoji} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">{brandData.brand}</p>
          <p className="text-xs text-slate-500">
            {brandData.productCount} product{brandData.productCount !== 1 ? 's' : ''}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="bg-white">
          {visible.map((product, i) => {
            const inCart = cartNames.has(product.name) ||
              (product.variants || []).some(v => cartNames.has(v.name));
            return (
              <ProductRow
                key={i}
                product={product}
                emoji={emoji}
                onTap={onTapProduct}
                onAdd={onAdd}
                inCart={inCart}
                isLast={i === visible.length - 1 && !hasMore}
              />
            );
          })}

          {hasMore && (
            <button
              onClick={() => setShowAll(s => !s)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-slate-50 text-sm font-semibold transition-colors hover:bg-blue-50"
              style={{ color: THRFT_BLUE }}
            >
              {showAll
                ? 'Show less'
                : `See all ${products.length} ${brandData.brand} products`
              }
              {showAll
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Aisle page ──────────────────────────────────────────────────────────

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
      const raw = res.data?.brands || [];

      const sorted = [...raw].sort((a, b) => {
        const pa = getBrandPriority(key, a.brand);
        const pb = getBrandPriority(key, b.brand);
        if (pa !== pb) return pa - pb;
        return b.productCount - a.productCount;
      });

      setBrands(sorted);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [key, userZip]);

  const cartNames = new Set(cartItems.map(i => i.name));

  const handleAdd = item => {
    addToCart({
      name:     item.name,
      brand:    item.brand || '',
      size:     item.size  || '',
      imageUrl: item.imageUrl,
      price:    item.price,
      quantity: 1,
    });
  };

  const handleTapProduct = product => {
    sessionStorage.setItem('thrft_selected_product', JSON.stringify({
      ...product,
      displayName: product.name,
      emoji,
      category: label,
    }));
    navigate('/Product');
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

  const totalProducts = brands.reduce((s, b) => s + b.productCount, 0);

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', paddingBottom: 100 }}>

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
              {loading
                ? 'Loading from Kroger…'
                : `${brands.length} brand${brands.length !== 1 ? 's' : ''} · ${totalProducts} products`
              }
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
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder={`Search ${label}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-3 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading {label} from Kroger…</p>
            <p className="text-xs text-slate-400 mt-1">Organizing by brand…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">No products found</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-blue-500 text-sm mt-2 underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          filtered.map((brandData, i) => (
            <BrandSection
              key={brandData.brand}
              brandData={brandData}
              categoryKey={key}
              emoji={emoji}
              onAdd={handleAdd}
              onTapProduct={handleTapProduct}
              cartNames={cartNames}
              defaultOpen={i === 0}
            />
          ))
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2">
          <button
            onClick={() => navigate('/Cart')}
            className="w-full max-w-2xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-xl"
            style={{ backgroundColor: THRFT_BLUE }}
          >
            <div className="flex items-center gap-2.5">
              <ThrftListIcon className="w-5 h-5 text-white" />
              <span className="text-sm font-bold">
                {cartCount} item{cartCount !== 1 ? 's' : ''} on list
              </span>
            </div>
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-xl">
              View list →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}