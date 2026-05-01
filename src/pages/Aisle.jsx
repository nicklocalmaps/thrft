import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, ChevronUp, Loader2, Plus, Check, X } from 'lucide-react';
import ThrftListIcon from '@/components/icons/ThrftListIcon';
import { useCart } from '@/lib/cartContext';

const THRFT_BLUE = '#4181ed';

// ─── Subcategory definitions per aisle ───────────────────────────────────────

const SUBCATEGORIES = {
  beverages: [
    { key: 'colas',     label: 'Colas & Soda',       emoji: '🥤', keywords: ['coca', 'coke', 'pepsi', 'sprite', 'dr pepper', 'mountain dew', '7up', 'fanta', 'ginger ale', 'root beer', 'mello yello', 'barqs', 'squirt', 'big red', 'cheerwine', 'rc cola', 'starry', 'diet coke', 'caffeine free'] },
    { key: 'water',     label: 'Water',               emoji: '💧', keywords: ['dasani', 'aquafina', 'smartwater', 'poland spring', 'evian', 'fiji', 'deer park', 'ozarka', 'ice mountain', 'volvic', 'crystal geyser', 'pure life'] },
    { key: 'sparkling', label: 'Sparkling Water',     emoji: '🫧', keywords: ['lacroix', 'bubly', 'perrier', 'san pellegrino', 'topo chico', 'waterloo', 'polar', 'sparkling', 'seltzer', 'sparkling ice'] },
    { key: 'juice',     label: 'Juice',               emoji: '🍊', keywords: ['tropicana', 'simply', 'minute maid', 'ocean spray', 'welch', 'mott', 'v8', 'naked', 'bolthouse', 'hi-c', 'kool-aid', 'hawaiian punch', 'capri sun', 'juicy juice', 'florida natural', 'odwalla', 'juice', 'lemonade'] },
    { key: 'sports',    label: 'Sports & Energy',     emoji: '⚡', keywords: ['gatorade', 'powerade', 'red bull', 'monster', 'celsius', 'bang', 'prime', 'body armor', '5 hour', 'reign', 'rockstar', 'nos', 'full throttle', 'energy', 'liquid iv'] },
    { key: 'coffee',    label: 'Coffee & Tea',        emoji: '☕', keywords: ['starbucks', 'dunkin', 'lipton', 'snapple', 'arizona', 'pure leaf', 'gold peak', 'honest tea', 'brisk', 'chameleon', 'cold brew', 'tea', 'coffee', 'frappuccino', 'fuze'] },
    { key: 'milk_alt',  label: 'Milk Alternatives',  emoji: '🌱', keywords: ['silk', 'oatly', 'califia', 'planet oat', 'ripple', 'almond breeze', 'so delicious', 'almond milk', 'oat milk', 'soy milk', 'coconut milk'] },
  ],
  meat: [
    { key: 'chicken',   label: 'Chicken',             emoji: '🍗', keywords: ['tyson', 'perdue', 'bell evans', 'foster farms', 'sanderson', 'chicken'] },
    { key: 'beef',      label: 'Beef & Steak',        emoji: '🥩', keywords: ['beef', 'steak', 'ribeye', 'sirloin', 'ground beef', 'chuck', 'brisket', 'angus'] },
    { key: 'hotdogs',   label: 'Hot Dogs & Sausage',  emoji: '🌭', keywords: ['oscar mayer', 'ball park', 'nathans', 'hebrew national', 'johnsonville', 'hot dog', 'frank', 'sausage', 'brat', 'kielbasa', 'chorizo'] },
    { key: 'bacon',     label: 'Bacon',               emoji: '🥓', keywords: ['bacon', 'hormel', 'wright', 'applegate', 'smithfield'] },
    { key: 'lunch',     label: 'Lunch Meat',          emoji: '🥪', keywords: ['hillshire', "boar's head", 'land o frost', 'sara lee', 'turkey breast', 'deli', 'lunch meat', 'ham', 'salami', 'pepperoni', 'bologna', 'pastrami', 'prosciutto'] },
    { key: 'plant',     label: 'Plant-Based',         emoji: '🌱', keywords: ['beyond', 'impossible', 'morningstar', 'gardein', 'praeger', 'veggie burger', 'plant based'] },
  ],
  snacks: [
    { key: 'chips',     label: 'Potato Chips',        emoji: '🥔', keywords: ["lay's", 'lays', 'ruffles', 'pringles', 'kettle', 'cape cod', 'utz', 'potato chip', 'wavy'] },
    { key: 'tortilla',  label: 'Tortilla & Nacho',    emoji: '🌽', keywords: ['doritos', 'tostitos', 'santitas', 'on the border', 'tortilla chip', 'nacho'] },
    { key: 'crackers',  label: 'Crackers',            emoji: '🫙', keywords: ['ritz', 'wheat thins', 'triscuit', 'goldfish', 'cheez-it', 'club', 'saltine', 'graham', 'nabisco', 'keebler'] },
    { key: 'popcorn',   label: 'Popcorn',             emoji: '🍿', keywords: ['orville', 'act ii', 'skinnypop', 'smartfood', 'boom chicka', 'popcorn'] },
    { key: 'pretzels',  label: 'Pretzels & Nuts',     emoji: '🥨', keywords: ["snyder's", 'rold gold', 'pretzel', 'planters', 'blue diamond', 'emerald', 'wonderful', 'nut', 'almond', 'cashew', 'peanut', 'pistachio', 'trail mix'] },
    { key: 'bars',      label: 'Granola & Bars',      emoji: '🍫', keywords: ['nature valley', 'kind', 'clif', 'rxbar', 'larabar', 'nutri grain', 'fiber one', 'quaker chewy', 'granola bar', 'protein bar'] },
  ],
  frozen: [
    { key: 'pizza',     label: 'Frozen Pizza',        emoji: '🍕', keywords: ['digiorno', 'red baron', 'tombstone', "totino's", "amy's", 'california pizza', 'pizza'] },
    { key: 'meals',     label: 'Meals & Entrees',     emoji: '🍱', keywords: ["stouffer's", 'marie callender', 'healthy choice', 'lean cuisine', 'banquet', 'swanson', 'birds eye voila', 'frozen meal', 'lasagna', 'pot pie'] },
    { key: 'breakfast', label: 'Frozen Breakfast',    emoji: '🍳', keywords: ['jimmy dean', 'eggo', 'pillsbury', 'bob evans', 'waffle', 'breakfast sandwich', 'french toast'] },
    { key: 'veggies',   label: 'Frozen Vegetables',   emoji: '🥦', keywords: ["bird's eye", 'green giant', 'cascadian', 'frozen vegetable', 'edamame', 'riced cauliflower'] },
    { key: 'fries',     label: 'Fries & Potatoes',    emoji: '🍟', keywords: ['ore-ida', 'alexia', 'mccain', 'fries', 'tater tot', 'hash brown'] },
    { key: 'ice_cream', label: 'Ice Cream',           emoji: '🍦', keywords: ["ben & jerry's", 'haagen-dazs', 'breyers', "dreyer's", 'blue bunny', 'klondike', 'drumstick', 'popsicle', 'ice cream', 'novelty'] },
  ],
  breakfast: [
    { key: 'cereal',    label: 'Cereal',              emoji: '🥣', keywords: ['cheerios', 'frosted flakes', 'corn flakes', 'raisin bran', 'lucky charms', 'cocoa puffs', 'froot loops', 'cap n crunch', 'special k', 'life cereal', 'grape nuts', 'honey bunches', 'cereal'] },
    { key: 'oatmeal',   label: 'Oatmeal',             emoji: '🫙', keywords: ['quaker', "bob's red mill", 'oat', 'oatmeal', 'grits', 'cream of wheat'] },
    { key: 'pancakes',  label: 'Pancakes & Syrup',    emoji: '🧇', keywords: ['bisquick', 'aunt jemima', 'hungry jack', 'krusteaz', 'log cabin', 'mrs butterworth', 'maple syrup', 'pancake', 'waffle mix'] },
    { key: 'pastries',  label: 'Toaster Pastries',    emoji: '🍞', keywords: ['pop tart', 'nutri grain', 'toaster strudel', 'toaster pastry'] },
  ],
  alcohol: [
    { key: 'light',     label: 'Light Beer',          emoji: '🍺', keywords: ['bud light', 'coors light', 'miller lite', 'michelob ultra', 'natural light', 'busch light', 'keystone'] },
    { key: 'regular',   label: 'Regular Beer',        emoji: '🍺', keywords: ['budweiser', 'coors banquet', 'miller high life', 'pabst', 'hamms', 'rolling rock'] },
    { key: 'import',    label: 'Import Beer',         emoji: '🍺', keywords: ['corona', 'heineken', 'modelo', 'dos equis', 'stella', 'guinness', 'peroni', 'newcastle'] },
    { key: 'craft',     label: 'Craft & IPA',         emoji: '🍺', keywords: ['samuel adams', 'blue moon', 'sierra nevada', 'lagunitas', 'goose island', 'dogfish', 'new belgium', 'fat tire', "bell's", 'founders', 'craft', 'ipa', 'ale', 'lager stout'] },
    { key: 'seltzer',   label: 'Hard Seltzer',        emoji: '🫧', keywords: ['white claw', 'truly', 'vizzy', 'high noon', 'seltzer'] },
    { key: 'wine',      label: 'Wine',                emoji: '🍷', keywords: ['barefoot', 'sutter home', 'josh cellars', 'woodbridge', 'apothic', 'kim crawford', 'la marca', 'meiomi', 'wine', 'cabernet', 'merlot', 'pinot', 'chardonnay', 'prosecco'] },
  ],
};

// ─── Image component ──────────────────────────────────────────────────────────

function ProductImg({ imageUrl, emoji = '🛒', size = 48 }) {
  const [err, setErr] = useState(false);
  if (imageUrl && !err) {
    return (
      <img src={imageUrl} alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => setErr(true)} />
    );
  }
  return <span style={{ fontSize: size * 0.55 }}>{emoji}</span>;
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ product, onAdd, onView, inCart }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer"
      onClick={() => onView?.(product)}
    >
      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
        {product.imageUrl && !err ? (
          <img src={product.imageUrl} alt="" className="w-full h-full object-contain p-1" onError={() => setErr(true)} />
        ) : <span style={{ fontSize: 20 }}>🛒</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {product.size && <p className="text-xs text-slate-400">{product.size}</p>}
          {product.price && <p className="text-xs font-bold text-slate-700">${product.price.toFixed(2)}</p>}
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onAdd(product); }}
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: inCart ? '#16a34a' : THRFT_BLUE }}
      >
        {inCart
          ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          : <Plus className="w-3.5 h-3.5 text-white" />
        }
      </button>
    </div>
  );
}

// ─── Brand card ───────────────────────────────────────────────────────────────

const DEFAULT_SHOWN = 2;

function BrandCard({ brandData, emoji, onAdd, cartNames, onViewProduct }) {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll]   = useState(false);

  const allProducts = useMemo(() => {
    const flat = [];
    for (const family of (brandData.products || [])) {
      if (family.variants && family.variants.length > 0) {
        flat.push(...family.variants.map(v => ({ ...v, familyName: family.name, familyImage: family.imageUrl })));
      } else {
        flat.push({ ...family, familyName: family.name });
      }
    }
    return flat;
  }, [brandData]);

  const visible = showAll ? allProducts : allProducts.slice(0, DEFAULT_SHOWN);
  const hidden  = allProducts.length - DEFAULT_SHOWN;
  const inCart  = allProducts.some(p => cartNames.has(p.name));

  return (
    <div className="mb-2 bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
          <ProductImg imageUrl={brandData.imageUrl} emoji={emoji} size={36} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">{brandData.brand}</p>
          <p className="text-xs text-slate-500">{brandData.productCount} product{brandData.productCount !== 1 ? 's' : ''}</p>
        </div>
        {inCart && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>

      {expanded && (
        <>
          {visible.map((product, i) => (
            <ProductRow
              key={i}
              product={product}
              onAdd={onAdd}
              onView={() => onViewProduct(product, { name: product.familyName, imageUrl: product.familyImage || product.imageUrl, variants: allProducts.filter(p => p.familyName === product.familyName) })}
              inCart={cartNames.has(product.name)}
            />
          ))}
          {!showAll && hidden > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-t border-slate-100 hover:bg-blue-50 transition-colors"
              style={{ color: THRFT_BLUE }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              See all {brandData.productCount} {brandData.brand} products
            </button>
          )}
        </>
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

  const [brands, setBrands]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubcat, setActiveSubcat] = useState('all');

  const subcats = SUBCATEGORIES[key] || [];

  useEffect(() => {
    const zip = userZip || '10001';
    setLoading(true);
    setBrands([]);
    setSearchQuery('');
    setActiveSubcat(subcats.length > 0 ? subcats[0].key : 'all');

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
    base44.functions.invoke('populateProductLibrary', {
      mode: 'save_product',
      product: { name: item.name, brand: item.brand || '', aisle_key: key, size: item.size || '', image_url: item.imageUrl || '', price: item.price || null },
    }).catch(() => {});
  };

  const handleViewProduct = (variant, family) => {
    const allVariants = family?.variants || [variant];
    sessionStorage.setItem('thrft_selected_product', JSON.stringify({
      ...variant,
      displayName: family?.name || variant.name,
      allVariants,
      imageUrl: family?.imageUrl || variant.imageUrl,
      categoryKey: key,
      category: label,
    }));
    navigate('/Product');
  };

  const filteredBrands = useMemo(() => {
    let result = brands;

    if (activeSubcat !== 'all' && subcats.length > 0) {
      const sub = subcats.find(s => s.key === activeSubcat);
      if (sub) {
        result = brands.filter(b => {
          const brandText   = b.brand.toLowerCase();
          const productText = (b.products || []).map(p => p.name).join(' ').toLowerCase();
          return sub.keywords.some(k => brandText.includes(k) || productText.includes(k));
        });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.map(b => ({
        ...b,
        products: (b.products || []).filter(p =>
          p.name.toLowerCase().includes(q) || b.brand.toLowerCase().includes(q)
        ),
        productCount: (b.products || []).filter(p =>
          p.name.toLowerCase().includes(q) || b.brand.toLowerCase().includes(q)
        ).length,
      })).filter(b => b.productCount > 0 || b.brand.toLowerCase().includes(q));
    }

    return result;
  }, [brands, activeSubcat, searchQuery, subcats]);

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
              {loading ? 'Loading from Kroger…' : `${brands.length} brands · ${totalProducts} products`}
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

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder={`Search in ${label}…`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-slate-400" /></button>
            )}
          </div>
        </div>

        {/* Subcategory tabs */}
        {subcats.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
            {subcats.map(sub => (
              <button
                key={sub.key}
                onClick={() => { setActiveSubcat(sub.key); setSearchQuery(''); }}
                className="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all border"
                style={{
                  background:  activeSubcat === sub.key ? THRFT_BLUE : '#fff',
                  color:       activeSubcat === sub.key ? '#fff'      : '#475569',
                  borderColor: activeSubcat === sub.key ? THRFT_BLUE  : '#e2e8f0',
                }}
              >
                <span>{sub.emoji}</span>
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading {label}…</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">No products found</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-blue-500 text-sm mt-2 underline">Clear search</button>
            )}
          </div>
        ) : (
          filteredBrands.map(brandData => (
            <BrandCard
              key={brandData.brand}
              brandData={brandData}
              emoji={emoji}
              onAdd={handleAdd}
              cartNames={cartNames}
              onViewProduct={handleViewProduct}
            />
          ))
        )}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4">
          <button
            onClick={() => navigate('/Cart')}
            className="w-full flex items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-xl"
            style={{ backgroundColor: THRFT_BLUE }}
          >
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