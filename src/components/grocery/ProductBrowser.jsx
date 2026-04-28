import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, Plus, Search, Loader2, Check } from 'lucide-react';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';
import {
  fetchCategoryProducts,
  searchProducts,
  aiFillProducts,
  filterByPopularity,
} from '@/lib/productSearch';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupBrandsAlpha(brands) {
  const map = {};
  for (const b of brands) {
    const letter = b.label[0].toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(b);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

function mapLibraryProduct(product, fallbackEmoji = '🛒') {
  const brand = product.brands?.split(',')[0]?.trim() || '';
  const name  = brand
    ? `${product.product_name} (${brand})`
    : product.product_name;
  return {
    name,
    search_hint: [product.product_name, product.brands, product.quantity].filter(Boolean).join(' '),
    is_branded:  true,
    quantity:    1,
    unit:        'each',
    image:       product.image_front_small_url,
    brand,
  };
}

async function searchTHRFTFoodLibrary(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=30&fields=product_name,brands,image_front_small_url,quantity`;
    const res = await fetch(url);
    const data = await res.json();
    const products = (data.products || []).filter(p => p.product_name);
    return filterByPopularity(products, query);
  } catch {
    return [];
  }
}

async function fetchCategoryFromLibrary(categoryKey) {
  try {
    const { CATEGORY_SEARCH_CONFIG } = await import('@/lib/productSearch');
    const config = CATEGORY_SEARCH_CONFIG[categoryKey];
    if (!config) return [];
    const url = `https://world.openfoodfacts.org/category/${config.offCategory}.json?page_size=48&fields=product_name,brands,image_front_small_url,quantity`;
    const res  = await fetch(url);
    const data = await res.json();
    const products = (data.products || []).filter(p => p.product_name && p.brands);
    return filterByPopularity(products);
  } catch {
    return [];
  }
}

// ─── Shared ProductRow ────────────────────────────────────────────────────────

function ProductRow({ item, onAdd, added, fallbackEmoji }) {
  const key     = item.search_hint || item.name;
  const isAdded = added.has(key);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
        ) : (
          <span style={{ fontSize: 18 }}>{item.emoji || fallbackEmoji || '🛒'}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate leading-snug">{item.name}</p>
        {(item.brand || item.category) && (
          <p className="text-xs text-slate-400 truncate">{item.brand || item.category}</p>
        )}
      </div>
      <button
        onClick={() => !isAdded && onAdd(item)}
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
        style={{ background: isAdded ? '#16a34a' : THRFT_BLUE }}
        aria-label={isAdded ? 'Added' : 'Add'}
      >
        {isAdded
          ? <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          : <Plus className="w-4 h-4 text-white" />
        }
      </button>
    </div>
  );
}

// ─── Loading row ──────────────────────────────────────────────────────────────

function LibraryLoadingRow() {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 opacity-55">
      <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
      <span className="text-xs text-slate-400">Loading more from THRFT Food Library…</span>
    </div>
  );
}

// ─── Search panel ─────────────────────────────────────────────────────────────

function SearchPanel({ query, onAdd, added }) {
  const [localResults, setLocalResults]     = useState([]);
  const [libraryResults, setLibraryResults] = useState([]);
  const [loading, setLoading]               = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) { setLocalResults([]); setLibraryResults([]); return; }

    const q = query.toLowerCase();
    const local = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items || []) {
        const tokens = `${item.name} ${item.search_hint || ''} ${cat.label}`.toLowerCase();
        if (tokens.includes(q)) {
          local.push({ ...item, quantity: 1, unit: 'each', category: cat.label, emoji: cat.emoji });
        }
      }
    }
    setLocalResults(local.slice(0, 10));

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const raw = await searchTHRFTFoodLibrary(query);
      const localNames = new Set(local.map(r => r.name.toLowerCase()));
      const fresh = raw
        .map(p => mapLibraryProduct(p))
        .filter(r => !localNames.has(r.name.toLowerCase()))
        .slice(0, 6);
      setLibraryResults(fresh);
      setLoading(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (query.length < 2) return (
    <p className="text-center text-sm text-slate-400 py-10">Type 2+ characters to search…</p>
  );

  return (
    <div>
      {localResults.length > 0 && (
        <>
          <div className="px-3 pt-3 pb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600">● THRFT Food Library</span>
            <span className="text-xs text-slate-400">· instant</span>
          </div>
          {localResults.map((item, i) => (
            <ProductRow key={`s-local-${i}`} item={item} onAdd={onAdd} added={added} fallbackEmoji={item.emoji} />
          ))}
        </>
      )}
      {loading && <LibraryLoadingRow />}
      {libraryResults.length > 0 && (
        <>
          <div className="px-3 pt-3 pb-1.5 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">More from THRFT Food Library</span>
          </div>
          {libraryResults.map((item, i) => (
            <ProductRow key={`s-lib-${i}`} item={item} onAdd={onAdd} added={added} />
          ))}
        </>
      )}
      {!loading && localResults.length === 0 && libraryResults.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">No results for "{query}"</p>
      )}
    </div>
  );
}

// ─── Categories panel ─────────────────────────────────────────────────────────

function CategoriesPanel({ onSelectCategory, searchQuery }) {
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
              <p className="text-xs font-semibold text-slate-900 leading-snug">{cat.label}</p>
              <p className="text-xs text-slate-400">{cat.items?.length || 0} items</p>
            </div>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">No categories match "{searchQuery}"</p>
      )}
    </div>
  );
}

// ─── Category items panel ─────────────────────────────────────────────────────

function CategoryItemsPanel({ category, onAdd, added }) {
  const [libraryItems, setLibraryItems]     = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [filterQ, setFilterQ]               = useState('');

  const localItems = useMemo(() => {
    const items = (category.items || []).map(item => ({
      ...item,
      quantity: 1,
      unit: 'each',
      emoji: category.emoji,
      category: category.label,
    }));
    if (!filterQ) return items;
    const q = filterQ.toLowerCase();
    return items.filter(i => i.name.toLowerCase().includes(q) || (i.search_hint || '').toLowerCase().includes(q));
  }, [category, filterQ]);

  useEffect(() => {
    setLibraryLoading(true);
    fetchCategoryFromLibrary(category.key).then(raw => {
      const localNames = new Set((category.items || []).map(i => i.name.toLowerCase()));
      const fresh = raw
        .map(p => mapLibraryProduct(p, category.emoji))
        .filter(r => !localNames.has(r.name.toLowerCase()))
        .slice(0, 12);
      setLibraryItems(fresh);
      setLibraryLoading(false);
    });
  }, [category.key]);

  const filteredLibrary = useMemo(() => {
    if (!filterQ) return libraryItems;
    const q = filterQ.toLowerCase();
    return libraryItems.filter(i => i.name.toLowerCase().includes(q));
  }, [libraryItems, filterQ]);

  return (
    <div>
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={`Filter ${category.label.toLowerCase()}…`}
            value={filterQ}
            onChange={e => setFilterQ(e.target.value)}
            className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {localItems.length > 0 && (
        <>
          <div className="px-3 pb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600">● THRFT Food Library</span>
            <span className="text-xs text-slate-400">· {localItems.length} items · instant</span>
          </div>
          {localItems.map((item, i) => (
            <ProductRow key={`cat-local-${i}`} item={item} onAdd={onAdd} added={added} fallbackEmoji={category.emoji} />
          ))}
        </>
      )}

      {libraryLoading && <LibraryLoadingRow />}
      {!libraryLoading && filteredLibrary.length > 0 && (
        <>
          <div className="px-3 pt-3 pb-1.5 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">More from THRFT Food Library</span>
          </div>
          {filteredLibrary.map((item, i) => (
            <ProductRow key={`cat-lib-${i}`} item={item} onAdd={onAdd} added={added} fallbackEmoji={category.emoji} />
          ))}
        </>
      )}

      {localItems.length === 0 && !libraryLoading && filteredLibrary.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">No results for "{filterQ}"</p>
      )}
    </div>
  );
}

// ─── Brands panel ─────────────────────────────────────────────────────────────

function BrandsPanel({ onSelectBrand, searchQuery }) {
  const filtered = useMemo(() => {
    if (!searchQuery) return BRANDS;
    const q = searchQuery.toLowerCase();
    return BRANDS.filter(b =>
      b.label.toLowerCase().includes(q) ||
      (b.search || '').toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const grouped = useMemo(() => groupBrandsAlpha(filtered), [filtered]);

  const brandPreviews = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) {
      for (const item of cat.items || []) {
        if (!item.is_branded) continue;
        for (const brand of BRANDS) {
          if (
            (item.search_hint || item.name).toLowerCase().includes(brand.label.toLowerCase().split(' ')[0])
          ) {
            if (!map[brand.key]) map[brand.key] = new Set();
            const short = item.name.replace(/\s*\(.*?\)\s*/g, '').trim().split(' ').slice(0, 2).join(' ');
            map[brand.key].add(short);
          }
        }
      }
    }
    return map;
  }, []);

  return (
    <div className="p-3">
      {grouped.map(([letter, brands]) => (
        <div key={letter} className="mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-1.5 px-1 tracking-wide">{letter}</p>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            {brands.map((brand, i) => {
              const preview = brandPreviews[brand.key]
                ? Array.from(brandPreviews[brand.key]).slice(0, 4).join(', ')
                : brand.search;
              return (
                <button
                  key={brand.key}
                  onClick={() => onSelectBrand(brand)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors ${i < brands.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <span style={{ fontSize: 20 }}>{brand.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{brand.label}</p>
                    {preview && <p className="text-xs text-slate-400 truncate">{preview}…</p>}
                  </div>
                  <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {grouped.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">No brands match "{searchQuery}"</p>
      )}
    </div>
  );
}

// ─── Brand items panel ────────────────────────────────────────────────────────

function BrandItemsPanel({ brand, onAdd, added }) {
  const [libraryItems, setLibraryItems]     = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [filterQ, setFilterQ]               = useState('');

  const localItems = useMemo(() => {
    const results = [];
    for (const cat of CATEGORIES) {
      for (const item of cat.items || []) {
        if (!item.is_branded) continue;
        const tokens = `${item.name} ${item.search_hint || ''}`.toLowerCase();
        if (tokens.includes(brand.label.toLowerCase().split(' ')[0].toLowerCase())) {
          results.push({ ...item, quantity: 1, unit: 'each', emoji: cat.emoji, category: cat.label });
        }
      }
    }
    if (!filterQ) return results;
    const q = filterQ.toLowerCase();
    return results.filter(i => i.name.toLowerCase().includes(q));
  }, [brand, filterQ]);

  useEffect(() => {
    setLibraryLoading(true);
    searchTHRFTFoodLibrary(brand.search || brand.label).then(raw => {
      const localNames = new Set(localItems.map(i => i.name.toLowerCase()));
      const fresh = raw
        .map(p => mapLibraryProduct(p, brand.emoji))
        .filter(r => !localNames.has(r.name.toLowerCase()))
        .slice(0, 10);
      setLibraryItems(fresh);
      setLibraryLoading(false);
    });
  }, [brand.key]);

  const filteredLibrary = useMemo(() => {
    if (!filterQ) return libraryItems;
    const q = filterQ.toLowerCase();
    return libraryItems.filter(i => i.name.toLowerCase().includes(q));
  }, [libraryItems, filterQ]);

  return (
    <div>
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={`Filter ${brand.label}…`}
            value={filterQ}
            onChange={e => setFilterQ(e.target.value)}
            className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {localItems.length > 0 && (
        <>
          <div className="px-3 pb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600">● THRFT Food Library</span>
            <span className="text-xs text-slate-400">· {localItems.length} items · instant</span>
          </div>
          {localItems.map((item, i) => (
            <ProductRow key={`br-local-${i}`} item={item} onAdd={onAdd} added={added} fallbackEmoji={brand.emoji} />
          ))}
        </>
      )}

      {libraryLoading && <LibraryLoadingRow />}
      {!libraryLoading && filteredLibrary.length > 0 && (
        <>
          <div className="px-3 pt-3 pb-1.5 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400">More from THRFT Food Library</span>
          </div>
          {filteredLibrary.map((item, i) => (
            <ProductRow key={`br-lib-${i}`} item={item} onAdd={onAdd} added={added} fallbackEmoji={brand.emoji} />
          ))}
        </>
      )}

      {localItems.length === 0 && !libraryLoading && filteredLibrary.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">No products found for {brand.label}</p>
      )}
    </div>
  );
}

// ─── Main ProductBrowser ──────────────────────────────────────────────────────

export default function ProductBrowser({
  onAdd,
  onClose,
  initialTab = 'categories',
  initialState = null,
  inline = false,
}) {
  const [nav, setNav] = useState(() => {
    if (initialState?.level) return [{ level: 'home', tab: initialTab }, initialState];
    return [{ level: 'home', tab: initialTab }];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [added, setAdded]             = useState(new Set());

  const current     = nav[nav.length - 1];
  const isSearching = searchQuery.trim().length >= 2;
  const canGoBack   = nav.length > 1;

  const pushNav = entry => { setSearchQuery(''); setNav(prev => [...prev, entry]); };
  const popNav  = ()    => { setSearchQuery(''); setNav(prev => prev.slice(0, -1)); };

  const handleAdd = item => {
    const { _tokens, _isBrand, ...clean } = item;
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

  const subtitleColor = current.level === 'category' ? '#16a34a' : '#94a3b8';

  return (
    <div className={inline ? '' : 'fixed inset-0 z-50 flex flex-col bg-slate-50'}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
            {subtitle && (
              <p className="text-xs font-semibold truncate" style={{ color: subtitleColor }}>{subtitle}</p>
            )}
          </div>

          {added.size > 0 && (
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full shrink-0">
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
                current.level === 'home'
                  ? current.tab === 'brands' ? 'Search brands…' : 'Filter categories…'
                  : current.level === 'category' ? `Filter ${current.category?.label?.toLowerCase()}…`
                  : `Filter ${current.brand?.label}…`
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

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className={inline ? '' : 'flex-1 overflow-y-auto'}>
        <AnimatePresence mode="wait">

          {isSearching && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SearchPanel query={searchQuery.trim()} onAdd={handleAdd} added={added} />
            </motion.div>
          )}

          {!isSearching && current.level === 'home' && current.tab !== 'brands' && (
            <motion.div key="cats" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <CategoriesPanel
                onSelectCategory={cat => pushNav({ level: 'category', category: cat })}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {!isSearching && current.level === 'home' && current.tab === 'brands' && (
            <motion.div key="brands" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrandsPanel
                onSelectBrand={brand => pushNav({ level: 'brand', brand })}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {!isSearching && current.level === 'category' && (
            <motion.div key={`cat-${current.category.key}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <CategoryItemsPanel
                category={current.category}
                onAdd={handleAdd}
                added={added}
              />
            </motion.div>
          )}

          {!isSearching && current.level === 'brand' && (
            <motion.div key={`brand-${current.brand.key}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrandItemsPanel
                brand={current.brand}
                onAdd={handleAdd}
                added={added}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}