import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, X, ChevronLeft, Plus, Minus,
  ChevronDown, Loader2, TrendingDown, ShoppingBag, Check,
} from 'lucide-react';
import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';
import { filterByPopularity } from '@/lib/productSearch';
import useUserTier, { FREE_TIER_LIST_LIMIT } from '@/hooks/useUserTier';
import FreePlanLimitModal from '@/components/subscription/FreePlanLimitModal';
import PremiumTrialPrompt from '@/components/subscription/PremiumTrialPrompt';
import InstructionModal from '@/components/InstructionModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';
const THRFT_DARK = '#1e3a5f';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

const AISLES = [
  { key: 'produce',        label: 'Produce',       emoji: '🥦' },
  { key: 'meat',           label: 'Meat',          emoji: '🥩' },
  { key: 'seafood',        label: 'Seafood',       emoji: '🦐' },
  { key: 'eggs_dairy',     label: 'Dairy',         emoji: '🥛' },
  { key: 'cheese',         label: 'Cheese',        emoji: '🧀' },
  { key: 'frozen',         label: 'Frozen',        emoji: '🧊' },
  { key: 'bread',          label: 'Bakery',        emoji: '🍞' },
  { key: 'beverages',      label: 'Beverages',     emoji: '🥤' },
  { key: 'snacks',         label: 'Snacks',        emoji: '🍿' },
  { key: 'breakfast',      label: 'Breakfast',     emoji: '🍳' },
  { key: 'cereal',         label: 'Cereal',        emoji: '🥣' },
  { key: 'canned',         label: 'Canned Goods',  emoji: '🥫' },
  { key: 'cookies',        label: 'Cookies',       emoji: '🍪' },
  { key: 'candy',          label: 'Candy',         emoji: '🍬' },
  { key: 'deli',           label: 'Deli',          emoji: '🥪' },
  { key: 'yogurt',         label: 'Yogurt',        emoji: '🍦' },
  { key: 'personal_care',  label: 'Personal Care', emoji: '🧴' },
  { key: 'cleaning',       label: 'Cleaning',      emoji: '🧹' },
  { key: 'health',         label: 'Health',        emoji: '💊' },
  { key: 'baby',           label: 'Baby',          emoji: '👶' },
  { key: 'pet',            label: 'Pet',           emoji: '🐶' },
  { key: 'alcohol',        label: 'Beer & Wine',   emoji: '🍺' },
];

const QUICK_FAVORITES = [
  'Bananas', 'Whole Milk', 'Eggs', 'Chicken Breast', 'Bread',
];

// ─── THRFT Food Library search ────────────────────────────────────────────────

async function searchLibrary(query, pageSize = 24) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=product_name,brands,image_front_small_url,quantity,categories_tags`;
    const res  = await fetch(url);
    const data = await res.json();
    return (data.products || []).filter(p => p.product_name);
  } catch { return []; }
}

async function fetchAisleProducts(categoryKey) {
  try {
    const { CATEGORY_SEARCH_CONFIG } = await import('@/lib/productSearch');
    const config = CATEGORY_SEARCH_CONFIG?.[categoryKey];
    if (config?.offCategory) {
      const url = `https://world.openfoodfacts.org/category/${config.offCategory}.json?page_size=48&fields=product_name,brands,image_front_small_url,quantity`;
      const res  = await fetch(url);
      const data = await res.json();
      return (data.products || []).filter(p => p.product_name);
    }
    const aisle = AISLES.find(a => a.key === categoryKey);
    return searchLibrary(aisle?.label || categoryKey, 30);
  } catch { return []; }
}

function mapProduct(p, fallbackEmoji = '🛒') {
  const brand = p.brands?.split(',')[0]?.trim() || '';
  return {
    name:        brand ? `${p.product_name} (${brand})` : p.product_name,
    displayName: p.product_name,
    search_hint: [p.product_name, p.brands, p.quantity].filter(Boolean).join(' '),
    brand,
    size:        p.quantity || '',
    is_branded:  !!brand,
    quantity:    1,
    unit:        'each',
    image:       p.image_front_small_url || null,
    emoji:       fallbackEmoji,
  };
}

// ─── Local catalog helpers ────────────────────────────────────────────────────

let _catalogIndex = null;
function buildCatalogIndex() {
  if (_catalogIndex) return _catalogIndex;
  const entries = [];
  for (const cat of CATEGORIES) {
    for (const item of cat.items || []) {
      entries.push({
        ...item,
        quantity:    1,
        unit:        'each',
        category:    cat.label,
        categoryKey: cat.key,
        emoji:       cat.emoji,
        _tokens:     `${item.name} ${item.search_hint || ''} ${cat.label}`.toLowerCase(),
      });
    }
  }
  return (_catalogIndex = entries);
}

function searchLocal(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const index = buildCatalogIndex();
  const results = index.filter(e => e._tokens.includes(q));
  results.sort((a, b) => (a.name.toLowerCase().startsWith(q) ? 0 : 1) - (b.name.toLowerCase().startsWith(q) ? 0 : 1));
  return results.slice(0, 6);
}

// ─── Product image component ──────────────────────────────────────────────────

function ProductImage({ image, emoji, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const sizeMap = { sm: 44, md: 80, lg: 140, xl: 180 };
  const px = sizeMap[size] || 80;
  const fontSize = { sm: 20, md: 36, lg: 56, xl: 72 }[size] || 36;

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt=""
        className={className}
        style={{ width: px, height: px, objectFit: 'contain' }}
        onError={() => setImgError(true)}
      />
    );
  }
  return <span style={{ fontSize }}>{emoji || '🛒'}</span>;
}

// ─── Product card (grid) ──────────────────────────────────────────────────────

function ProductCard({ product, onSelect, inCart }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(product)}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-left hover:border-blue-200 hover:shadow-md transition-all relative w-full"
    >
      {inCart && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
      <div className="w-full flex items-center justify-center bg-slate-50 border-b border-slate-50" style={{ height: 100 }}>
        <ProductImage image={product.image} emoji={product.emoji} size="md" />
      </div>
      <div className="p-2.5">
        {product.brand && (
          <p className="text-xs text-slate-400 truncate">{product.brand}</p>
        )}
        <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 mt-0.5">
          {product.displayName || product.name}
        </p>
        {product.size && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{product.size}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">Add</span>
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Product row (search results) ─────────────────────────────────────────────

function ProductRow({ product, onSelect, inCart }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(product)}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-50 hover:bg-blue-50 transition-colors text-left"
    >
      <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
        <ProductImage image={product.image} emoji={product.emoji} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        {product.brand && <p className="text-xs text-slate-400 truncate">{product.brand}</p>}
        <p className="text-sm font-semibold text-slate-900 truncate">{product.displayName || product.name}</p>
        {product.size && <p className="text-xs text-slate-400 truncate">{product.size}</p>}
      </div>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: inCart ? '#16a34a' : THRFT_BLUE }}
      >
        {inCart
          ? <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          : <Plus className="w-4 h-4 text-white" />
        }
      </div>
    </motion.button>
  );
}

// ─── Product detail sheet ─────────────────────────────────────────────────────

function ProductDetailSheet({ product, onAdd, onClose, cartItems }) {
  const [qty, setQty]           = useState(1);
  const [variant, setVariant]   = useState('');
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [similar, setSimilar]   = useState([]);

  const inCart = cartItems.some(i =>
    i.name === product.name || i.search_hint === product.search_hint
  );

  useEffect(() => {
    if (!product.brand && !product.displayName) return;
    setLoadingVariants(true);

    const query = product.brand
      ? `${product.brand} ${product.displayName || product.name}`
      : product.displayName || product.name;

    searchLibrary(query, 30).then(results => {
      const brandResults = results.filter(p =>
        product.brand
          ? (p.brands || '').toLowerCase().includes(product.brand.toLowerCase().split(' ')[0])
          : true
      );

      const variantOptions = [...new Set(
        brandResults.map(p => p.quantity || '').filter(Boolean).slice(0, 8)
      )];
      setVariants(variantOptions);
      if (variantOptions.length > 0) setVariant(variantOptions[0]);

      const others = results
        .filter(p => {
          const b = p.brands?.split(',')[0]?.trim() || '';
          return b.toLowerCase() !== (product.brand || '').toLowerCase() && p.image_front_small_url;
        })
        .slice(0, 6)
        .map(p => mapProduct(p, product.emoji));
      setSimilar(others);
      setLoadingVariants(false);
    });
  }, [product.name]);

  const handleAdd = () => {
    const finalName = variant
      ? `${product.displayName || product.name} (${variant})`
      : product.displayName || product.name;
    onAdd({
      name:        finalName,
      search_hint: product.search_hint || product.name,
      is_branded:  product.is_branded,
      quantity:    qty,
      unit:        'each',
      image:       product.image,
      brand:       product.brand,
      emoji:       product.emoji,
      category:    product.category,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
            {product.category || product.brand || ''}
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full flex items-center justify-center bg-slate-50 border-y border-slate-100" style={{ height: 200 }}>
          <ProductImage image={product.image} emoji={product.emoji} size="xl" />
        </div>

        <div className="px-5 py-4">
          {product.brand && (
            <p className="text-sm text-slate-400 mb-1">{product.brand}</p>
          )}
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {product.displayName || product.name}
          </h2>
          {product.size && (
            <p className="text-sm text-slate-400 mb-4">{product.size}</p>
          )}

          {(loadingVariants || variants.length > 1) && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Size / variant</p>
              {loadingVariants ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading options…
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={variant}
                    onChange={e => setVariant(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none"
                  >
                    {variants.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mb-5">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-bold text-slate-900 px-3 min-w-[32px] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-12 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={inCart}
              className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: inCart ? '#16a34a' : THRFT_BLUE,
                boxShadow: inCart ? 'none' : '0 4px 14px rgba(65,129,237,.35)',
              }}
            >
              {inCart ? (
                <><Check className="w-4 h-4" strokeWidth={2.5} /> In cart</>
              ) : (
                <><Plus className="w-4 h-4" /> Add to cart</>
              )}
            </button>
          </div>

          {similar.length > 0 && (
            <div>
              <p className="text-sm font-bold text-slate-800 mb-3">You might also like</p>
              <div className="grid grid-cols-2 gap-2">
                {similar.slice(0, 4).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => onClose()}
                    className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-2.5 text-left hover:bg-blue-50 transition-colors border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
                      <ProductImage image={p.image} emoji={p.emoji} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate leading-snug">{p.displayName || p.name}</p>
                      {p.brand && <p className="text-xs text-slate-400 truncate">{p.brand}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cart sheet ───────────────────────────────────────────────────────────────

function CartSheet({ items, onUpdateQty, onRemove, onCompare, onClose, isSaving }) {
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            My Cart <span className="text-slate-400 font-normal text-base">({items.length})</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ThrftCartIcon className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Your cart is empty</p>
            <p className="text-xs text-slate-400 mt-1">Browse aisles or search to add items</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50">
              {items.map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                    <ProductImage image={item.image} emoji={item.emoji} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    {item.brand && (
                      <p className="text-xs text-slate-400 truncate">{item.brand}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => item.quantity > 1 ? onUpdateQty(i, item.quantity - 1) : onRemove(i)}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-slate-900 w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(i, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-500">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                <span className="text-sm font-bold text-slate-900">
                  {subtotal > 0 ? `$${subtotal.toFixed(2)}` : '—'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Final price determined after store comparison</p>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${THRFT_DARK}, #2d5491)` }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-lg overflow-hidden shrink-0">
                      <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wide">THRFT</span>
                  </div>
                  <p className="text-base font-bold text-white mb-0.5">Ready to save?</p>
                  <p className="text-xs text-white/65 mb-4 leading-relaxed">
                    Compare your cart across 50+ stores and find the lowest total price before you shop.
                  </p>
                  <button
                    onClick={onCompare}
                    disabled={isSaving}
                    className="w-full bg-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-50 active:scale-[.98]"
                    style={{ color: THRFT_DARK }}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><TrendingDown className="w-4 h-4" /> Compare prices now</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Aisle panel ──────────────────────────────────────────────────────────────

function AislePanel({ aisle, cartItems, onSelect, onBack }) {
  const [localProducts, setLocalProducts] = useState([]);
  const [libraryProducts, setLibraryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const catData = CATEGORIES.find(c => c.key === aisle.key);

  useEffect(() => {
    if (catData?.items) {
      setLocalProducts(catData.items.map(item => ({
        ...item,
        displayName: item.name,
        quantity: 1,
        unit: 'each',
        emoji: aisle.emoji,
        category: aisle.label,
        image: null,
      })));
    }

    setLoading(true);
    fetchAisleProducts(aisle.key).then(raw => {
      const localNames = new Set((catData?.items || []).map(i => i.name.toLowerCase()));
      const fresh = raw
        .filter(p => p.image_front_small_url)
        .map(p => mapProduct(p, aisle.emoji))
        .filter(p => !localNames.has(p.displayName?.toLowerCase()))
        .slice(0, 20);
      setLibraryProducts(fresh);
      setLoading(false);
    });
  }, [aisle.key]);

  const cartKeys = new Set(cartItems.map(i => i.search_hint || i.name));

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-10">
        <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span style={{ fontSize: 22 }}>{aisle.emoji}</span>
        <div>
          <p className="text-sm font-bold text-slate-900">{aisle.label}</p>
          <p className="text-xs text-emerald-600 font-semibold">
            {localProducts.length} items · instant
          </p>
        </div>
      </div>

      <div className="p-3">
        {localProducts.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">All items</p>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {localProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => onSelect(product)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl">
                    {aisle.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cartKeys.has(product.search_hint || product.name) ? '#16a34a' : THRFT_BLUE }}
                  >
                    {cartKeys.has(product.search_hint || product.name)
                      ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      : <Plus className="w-3.5 h-3.5 text-white" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading product photos from THRFT Food Library…
          </div>
        )}
        {!loading && libraryProducts.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              With photos · THRFT Food Library
            </p>
            <div className="grid grid-cols-2 gap-2">
              {libraryProducts.map((product, i) => (
                <ProductCard
                  key={i}
                  product={product}
                  onSelect={onSelect}
                  inCart={cartKeys.has(product.search_hint || product.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Shop component ──────────────────────────────────────────────────────

export default function Shop() {
  const navigate = useNavigate();
  const { isPremium, isFree, listsThisMonth, canCreateList, loading: tierLoading } = useUserTier();

  const [cartItems, setCartItems]             = useState([]);
  const [showCart, setShowCart]               = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeAisle, setActiveAisle]         = useState(null);
  const [query, setQuery]                     = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [listName, setListName]               = useState('My Shopping List');
  const [showLimitModal, setShowLimitModal]   = useState(false);
  const [showTrialPrompt, setShowTrialPrompt] = useState(false);
  const [userZip, setUserZip]                 = useState('');

  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      const zip = user?.delivery_address?.zip || user?.zip_code || '';
      setUserZip(zip);
    }).catch(() => {});
  }, []);

  // ── Search ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSearchResults([]); return; }

    const local = searchLocal(q).map(item => ({ ...item, displayName: item.name, image: null }));
    setSearchResults(local);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      const raw = await searchLibrary(q, 20);
      const localNames = new Set(local.map(r => r.name.toLowerCase()));
      const fresh = raw
        .map(p => mapProduct(p, '🛒'))
        .filter(p => !localNames.has(p.displayName?.toLowerCase() || p.name.toLowerCase()));
      setSearchResults(prev => {
        const combined = [...prev.filter(p => !fresh.some(f => f.name === p.name)), ...fresh];
        return combined.slice(0, 20);
      });
      setSearchLoading(false);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // ── Cart mutations ──────────────────────────────────────────────────────────

  const addToCart = useCallback(item => {
    setCartItems(prev => {
      const exists = prev.findIndex(i => i.name === item.name);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = { ...next[exists], quantity: next[exists].quantity + 1 };
        return next;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const updateQty = useCallback((index, qty) => {
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  }, []);

  const removeFromCart = useCallback(index => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Save & compare ──────────────────────────────────────────────────────────

  const handleCompare = async () => {
    if (cartItems.length === 0) return;
    if (!canCreateList) { setShowLimitModal(true); return; }

    setIsSaving(true);
    try {
      const name = listName.trim() || 'My Shopping List';
      const list = await base44.entities.GroceryList.create({
        name,
        items: cartItems,
        shopping_method: 'instore',
      });
      setShowCart(false);
      if (isFree) {
        sessionStorage.setItem('pendingListId', list.id);
        setShowTrialPrompt(true);
      } else {
        navigate(`/ListDetail?id=${list.id}`);
      }
    } catch (err) {
      console.error('Failed to save list:', err);
    }
    setIsSaving(false);
  };

  const handleTrialPromptClose = () => {
    setShowTrialPrompt(false);
    const id = sessionStorage.getItem('pendingListId');
    sessionStorage.removeItem('pendingListId');
    if (id) navigate(`/ListDetail?id=${id}`);
  };

  const cartCount  = cartItems.reduce((s, i) => s + i.quantity, 0);
  const isSearching = query.trim().length >= 2;

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {showLimitModal  && <FreePlanLimitModal onClose={() => setShowLimitModal(false)} />}
      {showTrialPrompt && <PremiumTrialPrompt onClose={handleTrialPromptClose} />}

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailSheet
            product={selectedProduct}
            cartItems={cartItems}
            onAdd={item => { addToCart(item); setSelectedProduct(null); }}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCart && (
          <CartSheet
            items={cartItems}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onCompare={handleCompare}
            onClose={() => setShowCart(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      {/* ── Blue header ─────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: THRFT_BLUE }} className="sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {activeAisle ? (
            <button
              onClick={() => setActiveAisle(null)}
              className="flex items-center gap-1.5 text-white/80 text-sm shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div className="flex flex-col shrink-0">
              <span className="text-xs text-white/65">Shopping at</span>
              <span className="text-sm font-bold text-white leading-tight">{userZip || 'your area'}</span>
            </div>
          )}

          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2">
            {searchLoading
              ? <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
              : <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            }
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearchResults([]); }} className="text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button onClick={() => setShowCart(true)} className="relative flex items-center justify-center shrink-0">
            <ThrftCartIcon className="w-7 h-7 text-white" />
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="font-bold text-white" style={{ fontSize: 9 }}>{cartCount}</span>
              </div>
            )}
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">

        {isSearching ? (
          <div className="bg-white">
            <p className="text-xs text-slate-400 px-4 py-2 border-b border-slate-50">
              {searchResults.length} results for "{query}"
            </p>
            <AnimatePresence>
              {searchResults.map((product, i) => (
                <ProductRow
                  key={`${product.name}-${i}`}
                  product={product}
                  onSelect={setSelectedProduct}
                  inCart={cartItems.some(c => c.name === product.name)}
                />
              ))}
            </AnimatePresence>
            {searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500">No results for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

        ) : activeAisle ? (
          <AislePanel
            aisle={activeAisle}
            cartItems={cartItems}
            onSelect={setSelectedProduct}
            onBack={() => setActiveAisle(null)}
          />

        ) : (
          <div>
            {/* Aisle scroll */}
            <div className="bg-white border-b border-slate-100">
              <div className="flex gap-4 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
                {AISLES.map(aisle => (
                  <button
                    key={aisle.key}
                    onClick={() => setActiveAisle(aisle)}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all hover:border-blue-400"
                      style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                    >
                      {aisle.emoji}
                    </div>
                    <span className="text-xs font-medium text-slate-600 whitespace-nowrap" style={{ maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {aisle.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* List name input */}
            <div className="px-4 pt-4 pb-2">
              <input
                placeholder="List name (e.g. Weekly shop)"
                value={listName}
                onChange={e => setListName(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Quick favorites */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900">Start your order</h2>
              </div>

              <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
                {['Favorites', 'On Sale', 'Past Lists'].map((tab, i) => (
                  <button
                    key={tab}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: i === 0 ? '#fff' : 'transparent',
                      color:      i === 0 ? '#0f172a' : '#94a3b8',
                      boxShadow:  i === 0 ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {QUICK_FAVORITES.map((name, i) => {
                  const cat  = CATEGORIES.find(c => (c.items || []).some(it => it.name === name));
                  const item = cat?.items?.find(it => it.name === name);
                  const inCart = cartItems.some(c => c.name === name);
                  return (
                    <div
                      key={name}
                      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shrink-0 cursor-pointer hover:border-blue-200 transition-all"
                      style={{ width: 120 }}
                      onClick={() => item && setSelectedProduct({
                        ...item,
                        displayName: item.name,
                        emoji: cat?.emoji || '🛒',
                        category: cat?.label,
                        quantity: 1,
                        unit: 'each',
                        image: null,
                      })}
                    >
                      <div className="w-full h-20 bg-slate-50 flex items-center justify-center text-4xl border-b border-slate-50">
                        {cat?.emoji || '🛒'}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-slate-900 leading-snug">{name}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-slate-400">Add</span>
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: inCart ? '#16a34a' : THRFT_BLUE }}
                          >
                            {inCart
                              ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              : <Plus className="w-3 h-3 text-white" />
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Browse by aisle grid */}
            <div className="px-4 pt-2 pb-24">
              <h2 className="text-base font-bold text-slate-900 mb-3">Browse by aisle</h2>
              <div className="grid grid-cols-2 gap-2">
                {AISLES.slice(0, 12).map(aisle => (
                  <button
                    key={aisle.key}
                    onClick={() => setActiveAisle(aisle)}
                    className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 text-left hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <span style={{ fontSize: 22 }}>{aisle.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{aisle.label}</p>
                      <p className="text-xs text-slate-400">
                        {CATEGORIES.find(c => c.key === aisle.key)?.items?.length || 0} items
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky cart bar ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartCount > 0 && !showCart && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 px-4"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full max-w-2xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-xl"
              style={{ backgroundColor: THRFT_BLUE, display: 'flex' }}
            >
              <div className="flex items-center gap-2.5">
                <ThrftCartIcon className="w-5 h-5 text-white" />
                <span className="text-sm font-bold">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
              </div>
              <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-xl">View cart →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}