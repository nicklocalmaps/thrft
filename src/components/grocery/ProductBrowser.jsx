import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, Plus, Search, Loader2, Check, ChevronRight } from 'lucide-react';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';
import { filterByPopularity } from '@/lib/productSearch';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE   = '#4181ed';
const MAX_BRANDS   = 4;
const MAX_PRODUCTS = 4;

// ─── THRFT Food Library helpers ───────────────────────────────────────────────

async function fetchFromLibrary(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=30&fields=product_name,brands,image_front_small_url,quantity`;
    const res  = await fetch(url);
    const data = await res.json();
    const prods = (data.products || []).filter(p => p.product_name);
    return filterByPopularity(prods, query);
  } catch { return []; }
}

async function fetchCategoryFromLibrary(categoryKey) {
  try {
    const { CATEGORY_SEARCH_CONFIG } = await import('@/lib/productSearch');
    const config = CATEGORY_SEARCH_CONFIG[categoryKey];
    if (!config) return [];
    const url = `https://world.openfoodfacts.org/category/${config.offCategory}.json?page_size=48&fields=product_name,brands,image_front_small_url,quantity`;
    const res  = await fetch(url);
    const data = await res.json();
    const prods = (data.products || []).filter(p => p.product_name && p.brands);
    return filterByPopularity(prods);
  } catch { return []; }
}

function mapLibraryProduct(p, fallbackEmoji = '🛒') {
  const brand = p.brands?.split(',')[0]?.trim() || '';
  return {
    name:        brand ? `${p.product_name} (${brand})` : p.product_name,
    search_hint: [p.product_name, p.brands, p.quantity].filter(Boolean).join(' '),
    is_branded:  true,
    quantity:    1,
    unit:        'each',
    image:       p.image_front_small_url,
    brand,
    size:        p.quantity,
    emoji:       fallbackEmoji,
  };
}

// ─── Product detail overlay ───────────────────────────────────────────────────

function ProductDetail({ item, onAdd, onClose, added }) {
  const [qty, setQty]         = useState(1);
  const [selSize, setSelSize] = useState(item.size || null);
  const sizes   = item.sizes || (item.size ? [item.size] : []);
  const key     = item.search_hint || item.name;
  const isAdded = added.has(key);

  const doAdd = () => {
    onAdd({
      name:        selSize ? `${item.name} (${selSize})` : item.name,
      search_hint: item.search_hint || item.name,
      is_branded:  item.is_branded ?? true,
      quantity:    qty,
      unit:        'each',
      image:       item.image,
      brand:       item.brand,
      category:    item.category,
      emoji:       item.emoji,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)' }}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-base font-bold text-slate-900 truncate flex-1 mr-2">{item.name}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Image */}
          <div className="w-full rounded-2xl flex items-center justify-center mb-4 border border-slate-100 overflow-hidden" style={{ height: 160, background: '#f8fafc' }}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
            ) : (
              <span style={{ fontSize: 72 }}>{item.emoji || '🛒'}</span>
            )}
          </div>

          {[item.brand, item.category].filter(Boolean).length > 0 && (
            <p className="text-sm text-slate-400 mb-4">{[item.brand, item.category].filter(Boolean).join(' · ')}</p>
          )}

          {/* Sizes */}
          {sizes.length > 1 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Pick a size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelSize(size)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                    style={{
                      background:  selSize === size ? THRFT_BLUE : '#f8fafc',
                      color:       selSize === size ? '#fff'      : '#64748b',
                      borderColor: selSize === size ? THRFT_BLUE  : '#e2e8f0',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add */}
          <div className="flex gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-slate-500 text-lg hover:text-slate-800">−</button>
              <span className="text-sm font-bold text-slate-900 px-2 min-w-[24px] text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-10 h-11 flex items-center justify-center text-slate-500 text-lg hover:text-slate-800">+</button>
            </div>
            <button
              onClick={doAdd}
              disabled={isAdded}
              className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: isAdded ? '#16a34a' : THRFT_BLUE, boxShadow: '0 4px 14px rgba(65,129,237,.3)' }}
            >
              {isAdded ? <><Check className="w-4 h-4" /> Added</> : <><Plus className="w-4 h-4" /> Add to list</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Product image card (2-col grid) ─────────────────────────────────────────

function ProductImageCard({ item, onSelect, added }) {
  const key     = item.search_hint || item.name;
  const isAdded = added.has(key);

  return (
    <button
      onClick={() => onSelect(item)}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-left hover:border-blue-200 hover:shadow-md transition-all relative"
    >
      {isAdded && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
      <div className="w-full aspect-square flex items-center justify-center border-b border-slate-50 overflow-hidden" style={{ background: '#f8fafc' }}>
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <span style={{ fontSize: 36 }}>{item.emoji || '🛒'}</span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">{item.name}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{item.brand || item.category || ''}</p>
      </div>
    </button>
  );
}

// ─── Brand card ───────────────────────────────────────────────────────────────

function BrandCard({ brand, preview, onSelect }) {
  return (
    <button
      onClick={() => onSelect(brand)}
      className="w-full flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 text-left hover:border-blue-200 hover:shadow-sm transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl">
        {brand.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{brand.label}</p>
        {preview && <p className="text-xs text-slate-400 truncate mt-0.5">{preview}…</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
    </button>
  );
}

// ─── More button ──────────────────────────────────────────────────────────────

function MoreButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors hover:bg-blue-50"
      style={{ borderColor: '#bfdbfe', color: THRFT_BLUE }}
    >
      {label}
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function CategoriesHome({ onSelectCategory, searchQuery }) {
  const filtered = useMemo(() => {
    if (!searchQuery) return CATEGORIES;
    const q = searchQuery.toLowerCase();
    return CATEGORIES.filter(c => c.label.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(cat => (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat)}
            className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
          >
            <span style={{ fontSize: 22 }}>{cat.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-snug">{cat.label}</p>
              <p className="text-xs text-slate-400">{cat.items?.length || 0} items</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BrandsHome({ onSelectBrand, searchQuery }) {
  const filtered = useMemo(() => {
    if (!searchQuery) return BRANDS;
    const q = searchQuery.toLowerCase();
    return BRANDS.filter(b => b.label.toLowerCase().includes(q) || (b.search || '').toLowerCase().includes(q));
  }, [searchQuery]);

  const previews = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) {
      for (const item of cat.items || []) {
        if (!item.is_branded) continue;
        for (const brand of BRANDS) {
          const tok = `${item.name} ${item.search_hint || ''}`.toLowerCase();
          if (tok.includes(brand.label.toLowerCase().split(' ')[0].toLowerCase())) {
            if (!map[brand.key]) map[brand.key] = [];
            const short = item.name.split(' ').slice(0, 3).join(' ');
            if (!map[brand.key].includes(short)) map[brand.key].push(short);
          }
        }
      }
    }
    return map;
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    for (const b of filtered) {
      const l = b.label[0].toUpperCase();
      if (!map[l]) map[l] = [];
      map[l].push(b);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="p-3">
      {grouped.map(([letter, brands]) => (
        <div key={letter} className="mb-4">
          <p className="text-xs font-bold text-slate-400 mb-1.5 px-1 tracking-wide">{letter}</p>
          <div className="space-y-2">
            {brands.map(brand => (
              <BrandCard
                key={brand.key}
                brand={brand}
                preview={previews[brand.key]?.slice(0, 3).join(', ')}
                onSelect={onSelectBrand}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBrandsPanel({ category, onSelectBrand, searchQuery, onAdd, added }) {
  const [libraryItems, setLibraryItems]       = useState([]);
  const [libraryLoading, setLibraryLoading]   = useState(true);
  const [showAllBrands, setShowAllBrands]     = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const localItems = useMemo(() => {
    return (category.items || []).map(item => ({
      ...item, quantity: 1, unit: 'each', emoji: category.emoji, category: category.label,
    }));
  }, [category]);

  const localBrands = useMemo(() => {
    const brandKeys = new Set();
    for (const item of localItems) {
      if (!item.is_branded) continue;
      for (const brand of BRANDS) {
        const tok = `${item.name} ${item.search_hint || ''}`.toLowerCase();
        if (tok.includes(brand.label.toLowerCase().split(' ')[0].toLowerCase())) {
          brandKeys.add(brand.key);
        }
      }
    }
    return BRANDS.filter(b => brandKeys.has(b.key));
  }, [localItems]);

  const q = searchQuery.trim().toLowerCase();
  const filteredBrands   = q ? localBrands.filter(b => b.label.toLowerCase().includes(q))   : localBrands;
  const filteredProducts = q ? localItems.filter(i => `${i.name} ${i.search_hint || ''}`.toLowerCase().includes(q)) : localItems;

  const visibleBrands   = showAllBrands   ? filteredBrands   : filteredBrands.slice(0, MAX_BRANDS);
  const visibleProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, MAX_PRODUCTS);

  useEffect(() => {
    setLibraryLoading(true);
    fetchCategoryFromLibrary(category.key).then(raw => {
      const localNames = new Set(localItems.map(i => i.name.toLowerCase()));
      const fresh = raw.map(p => mapLibraryProduct(p, category.emoji)).filter(r => !localNames.has(r.name.toLowerCase())).slice(0, 12);
      setLibraryItems(fresh);
      setLibraryLoading(false);
    });
  }, [category.key]);

  return (
    <div className="p-3">
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail item={selectedProduct} onAdd={onAdd} onClose={() => setSelectedProduct(null)} added={added} />
        )}
      </AnimatePresence>

      {/* Brands section */}
      {filteredBrands.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Brands &amp; options</p>
            {filteredBrands.length > MAX_BRANDS && !showAllBrands && (
              <button onClick={() => setShowAllBrands(true)} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: THRFT_BLUE }}>
                More <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {visibleBrands.map(brand => (
              <BrandCard key={brand.key} brand={brand} preview={brand.search} onSelect={onSelectBrand} />
            ))}
          </div>
          {filteredBrands.length > MAX_BRANDS && !showAllBrands && (
            <div className="mt-2">
              <MoreButton label={`Show more brands in ${category.label}`} onClick={() => setShowAllBrands(true)} />
            </div>
          )}
        </div>
      )}

      {/* Products section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Products
            <span className="ml-1 text-emerald-600 font-semibold normal-case tracking-normal">· instant</span>
          </p>
          {filteredProducts.length > MAX_PRODUCTS && !showAllProducts && (
            <button onClick={() => setShowAllProducts(true)} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: THRFT_BLUE }}>
              More <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {visibleProducts.map((item, i) => (
            <ProductImageCard key={`local-${i}`} item={item} onSelect={setSelectedProduct} added={added} />
          ))}
        </div>
        {filteredProducts.length > MAX_PRODUCTS && !showAllProducts && (
          <MoreButton label={`Show more in ${category.label}`} onClick={() => setShowAllProducts(true)} />
        )}

        {libraryLoading && (
          <div className="flex items-center gap-2 py-2 opacity-55 mt-2">
            <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading more from THRFT Food Library…</span>
          </div>
        )}
        {!libraryLoading && libraryItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 mb-2">More from THRFT Food Library</p>
            <div className="grid grid-cols-2 gap-2">
              {libraryItems.slice(0, showAllProducts ? libraryItems.length : MAX_PRODUCTS).map((item, i) => (
                <ProductImageCard key={`lib-${i}`} item={item} onSelect={setSelectedProduct} added={added} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandProductsPanel({ brand, onAdd, added, searchQuery }) {
  const [libraryItems, setLibraryItems]       = useState([]);
  const [libraryLoading, setLibraryLoading]   = useState(true);
  const [showAll, setShowAll]                 = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const localItems = useMemo(() => {
    const results = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items || []) {
        if (!item.is_branded) continue;
        const tok = `${item.name} ${item.search_hint || ''}`.toLowerCase();
        if (tok.includes(brand.label.toLowerCase().split(' ')[0].toLowerCase())) {
          results.push({ ...item, quantity: 1, unit: 'each', emoji: cat.emoji, category: cat.label });
        }
      }
    }
    return results;
  }, [brand.key]);

  const q        = searchQuery.trim().toLowerCase();
  const filtered = q ? localItems.filter(i => `${i.name} ${i.search_hint || ''}`.toLowerCase().includes(q)) : localItems;
  const visible  = showAll ? filtered : filtered.slice(0, MAX_PRODUCTS);

  useEffect(() => {
    setLibraryLoading(true);
    fetchFromLibrary(brand.search || brand.label).then(raw => {
      const localNames = new Set(localItems.map(i => i.name.toLowerCase()));
      const fresh = raw.map(p => mapLibraryProduct(p, brand.emoji)).filter(r => !localNames.has(r.name.toLowerCase())).slice(0, 10);
      setLibraryItems(fresh);
      setLibraryLoading(false);
    });
  }, [brand.key]);

  return (
    <div className="p-3">
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail item={selectedProduct} onAdd={onAdd} onClose={() => setSelectedProduct(null)} added={added} />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          Products
          <span className="ml-1 text-emerald-600 font-semibold normal-case tracking-normal">· instant</span>
        </p>
        {filtered.length > MAX_PRODUCTS && !showAll && (
          <button onClick={() => setShowAll(true)} className="text-xs font-semibold flex items-center gap-0.5" style={{ color: THRFT_BLUE }}>
            More <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {visible.map((item, i) => (
          <ProductImageCard key={`local-${i}`} item={item} onSelect={setSelectedProduct} added={added} />
        ))}
      </div>

      {filtered.length > MAX_PRODUCTS && !showAll && (
        <div className="mb-3">
          <MoreButton label={`Show more ${brand.label} products`} onClick={() => setShowAll(true)} />
        </div>
      )}

      {libraryLoading && (
        <div className="flex items-center gap-2 py-2 opacity-55">
          <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          <span className="text-xs text-slate-400">Loading more from THRFT Food Library…</span>
        </div>
      )}

      {!libraryLoading && libraryItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 mb-2">More from THRFT Food Library</p>
          <div className="grid grid-cols-2 gap-2">
            {libraryItems.slice(0, showAll ? libraryItems.length : MAX_PRODUCTS).map((item, i) => (
              <ProductImageCard key={`lib-${i}`} item={item} onSelect={setSelectedProduct} added={added} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ProductBrowser ──────────────────────────────────────────────────────

export default function ProductBrowser({
  onAdd,
  onClose,
  initialTab = 'categories',
  initialCategory = null,
  inline = false,
}) {
  const [nav, setNav] = useState(() => {
    if (initialCategory) return [{ level: 'home', tab: initialTab }, { level: 'category', category: initialCategory }];
    return [{ level: 'home', tab: initialTab }];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [added, setAdded]             = useState(new Set());

  const current   = nav[nav.length - 1];
  const canGoBack = nav.length > 1;

  const pushNav = entry => { setSearchQuery(''); setNav(prev => [...prev, entry]); };
  const popNav  = ()    => { setSearchQuery(''); setNav(prev => prev.slice(0, -1)); };

  const handleAdd = item => {
    const { _tokens, categoryKey, ...clean } = item;
    onAdd({ ...clean, quantity: clean.quantity || 1, unit: clean.unit || 'each' });
    setAdded(prev => new Set([...prev, clean.search_hint || clean.name]));
  };

  const title = useMemo(() => {
    if (current.level === 'home')     return current.tab === 'brands' ? 'Brands' : 'Categories';
    if (current.level === 'category') return `${current.category.emoji} ${current.category.label}`;
    if (current.level === 'brand')    return `${current.brand.emoji} ${current.brand.label}`;
    return 'Browse';
  }, [current]);

  const subtitle = useMemo(() => {
    if (current.level === 'category') return `${current.category.items?.length || 0} items · instant`;
    if (current.level === 'brand')    return 'From THRFT Food Library';
    return null;
  }, [current]);

  return (
    <div className={inline ? '' : 'fixed inset-0 z-50 flex flex-col bg-slate-50'}>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-3">
          {canGoBack ? (
            <button onClick={popNav} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : !inline ? (
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all shrink-0">
              <X className="w-5 h-5" />
            </button>
          ) : null}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
            {subtitle && <p className="text-xs font-semibold truncate text-emerald-600">{subtitle}</p>}
          </div>

          {/* Home: tab switcher */}
          {current.level === 'home' && !inline && (
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
              {['categories', 'brands'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setNav([{ level: 'home', tab }])}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize"
                  style={{
                    background: current.tab === tab ? '#fff'      : 'transparent',
                    color:      current.tab === tab ? '#0f172a'   : '#94a3b8',
                    boxShadow:  current.tab === tab ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {added.size > 0 && (
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full shrink-0">
              {added.size} added ✓
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={
                current.level === 'home'     ? (current.tab === 'brands' ? 'Search brands…' : 'Filter categories…') :
                current.level === 'category' ? `Filter ${current.category?.label?.toLowerCase()}…` :
                `Filter ${current.brand?.label}…`
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={inline ? '' : 'flex-1 overflow-y-auto'}>
        <AnimatePresence mode="wait">

          {current.level === 'home' && current.tab !== 'brands' && (
            <motion.div key="cats" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <CategoriesHome
                onSelectCategory={cat => pushNav({ level: 'category', category: cat })}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {current.level === 'home' && current.tab === 'brands' && (
            <motion.div key="brands" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrandsHome
                onSelectBrand={brand => pushNav({ level: 'brand', brand })}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {current.level === 'category' && (
            <motion.div key={`cat-${current.category.key}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <CategoryBrandsPanel
                category={current.category}
                onSelectBrand={brand => pushNav({ level: 'brand', brand })}
                searchQuery={searchQuery}
                onAdd={handleAdd}
                added={added}
              />
            </motion.div>
          )}

          {current.level === 'brand' && (
            <motion.div key={`brand-${current.brand.key}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrandProductsPanel
                brand={current.brand}
                onAdd={handleAdd}
                added={added}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}