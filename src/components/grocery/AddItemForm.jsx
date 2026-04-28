import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Plus, Loader2, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/productCatalog';
import { filterByPopularity } from '@/lib/productSearch';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE   = '#4181ed';
const MAX_CATS     = 2;
const MAX_PRODUCTS = 4;

// ─── Local catalog search index ───────────────────────────────────────────────

let _index = null;

function buildIndex() {
  if (_index) return _index;
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
  _index = entries;
  return entries;
}

function searchLocal(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return { cats: [], products: [] };

  const cats = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(q) ||
    (c.items || []).some(i => i.name.toLowerCase().includes(q))
  );

  const index    = buildIndex();
  const products = index.filter(e => e._tokens.includes(q));
  products.sort((a, b) => {
    const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aStart - bStart;
  });

  return { cats, products };
}

// ─── THRFT Food Library ───────────────────────────────────────────────────────

async function searchTHRFTFoodLibrary(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=30&fields=product_name,brands,image_front_small_url,quantity`;
    const res  = await fetch(url);
    const data = await res.json();
    const prods = (data.products || []).filter(p => p.product_name);
    return filterByPopularity(prods, query);
  } catch { return []; }
}

function mapLibraryItem(p) {
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
  };
}

// ─── Product detail with size picker ─────────────────────────────────────────

function ProductDetail({ item, onAdd, onClose }) {
  const [qty, setQty]         = useState(1);
  const [selSize, setSelSize] = useState(item.size || item.quantity || null);
  const sizes = item.sizes || (item.size ? [item.size] : []);

  const doAdd = () => {
    onAdd({
      name:        selSize ? `${item.name} (${selSize})` : item.name,
      search_hint: item.search_hint || item.name,
      is_branded:  item.is_branded ?? true,
      quantity:    qty,
      unit:        'each',
      image:       item.image || item.image_front_small_url,
      brand:       item.brand || item.brands,
      category:    item.category,
      emoji:       item.emoji,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22 }}
      className="bg-white rounded-2xl border border-blue-200 overflow-hidden mb-3 shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-bold text-slate-900 truncate flex-1 mr-2">{item.name}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Product image */}
        <div
          className="w-full rounded-xl flex items-center justify-center mb-4 border border-slate-100 overflow-hidden"
          style={{ height: 130, background: '#f8fafc' }}
        >
          {item.image || item.image_front_small_url ? (
            <img
              src={item.image || item.image_front_small_url}
              alt={item.name}
              className="h-full object-contain"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span style={{ fontSize: 56 }}>{item.emoji || '🛒'}</span>
          )}
        </div>

        {[item.brand || item.brands, item.category].filter(Boolean).length > 0 && (
          <p className="text-xs text-slate-400 mb-3">
            {[item.brand || item.brands, item.category].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Size picker */}
        {sizes.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pick a size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelSize(size)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
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
        <div className="flex gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-10 flex items-center justify-center text-slate-500 text-lg hover:text-slate-800">−</button>
            <span className="text-sm font-semibold text-slate-900 px-2 min-w-[20px] text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-9 h-10 flex items-center justify-center text-slate-500 text-lg hover:text-slate-800">+</button>
          </div>
          <button
            onClick={doAdd}
            className="flex-1 h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: THRFT_BLUE, boxShadow: '0 3px 10px rgba(65,129,237,.3)' }}
          >
            <Plus className="w-4 h-4" />
            Add to list
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category chip ────────────────────────────────────────────────────────────

function CategoryChip({ cat, onClick }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(cat); }}
      className="flex items-center gap-2 flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50 transition-all"
    >
      <span style={{ fontSize: 18 }}>{cat.emoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate leading-snug">{cat.label}</p>
        <p className="text-xs text-slate-400">{cat.items?.length || 0} items</p>
      </div>
    </button>
  );
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({ item, onSelect }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onSelect(item); }}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 bg-slate-50">
        {item.image || item.image_front_small_url ? (
          <img
            src={item.image || item.image_front_small_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: 22 }}>{item.emoji || '🛒'}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {(item.brand || item.brands) && (
            <p className="text-xs text-slate-400 truncate">{item.brand || item.brands?.split(',')[0]}</p>
          )}
          {item.category && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full shrink-0">{item.category}</span>
          )}
        </div>
      </div>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#eff6ff' }}>
        <Plus className="w-3.5 h-3.5" style={{ color: THRFT_BLUE }} />
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AddItemForm({ onAdd, onBrowseCategory }) {
  const [query, setQuery]                     = useState('');
  const [localCats, setLocalCats]             = useState([]);
  const [localProducts, setLocalProducts]     = useState([]);
  const [libraryProducts, setLibraryProducts] = useState([]);
  const [libraryLoading, setLibraryLoading]   = useState(false);
  const [showDropdown, setShowDropdown]       = useState(false);
  const [selectedItem, setSelectedItem]       = useState(null);
  const [showAllCats, setShowAllCats]         = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const debounceRef  = useRef(null);
  const abortRef     = useRef(null);

  // ── Search ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setLocalCats([]); setLocalProducts([]); setLibraryProducts([]);
      setShowDropdown(false); setLibraryLoading(false);
      setShowAllCats(false); setShowAllProducts(false);
      return;
    }

    const { cats, products } = searchLocal(q);
    setLocalCats(cats);
    setLocalProducts(products);
    setShowDropdown(true);
    setShowAllCats(false);
    setShowAllProducts(false);

    clearTimeout(debounceRef.current);
    const mine = {};
    abortRef.current = mine;

    debounceRef.current = setTimeout(async () => {
      setLibraryLoading(true);
      const raw = await searchTHRFTFoodLibrary(q);
      if (abortRef.current !== mine) return;
      const localNames = new Set(products.map(p => p.name.toLowerCase()));
      const fresh = raw.map(mapLibraryItem).filter(p => !localNames.has(p.name.toLowerCase())).slice(0, 8);
      setLibraryProducts(fresh);
      setLibraryLoading(false);
    }, 400);

    return () => { clearTimeout(debounceRef.current); abortRef.current = null; };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSelectedItem(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelect = useCallback(item => {
    setSelectedItem(item);
    setShowDropdown(false);
  }, []);

  const handleAdd = useCallback(item => {
    const { _tokens, emoji: _e, categoryKey: _ck, ...clean } = item;
    onAdd({ ...clean, quantity: clean.quantity || 1, unit: clean.unit || 'each' });
    setQuery(''); setLocalCats([]); setLocalProducts([]); setLibraryProducts([]);
    setShowDropdown(false); setSelectedItem(null);
    inputRef.current?.focus();
  }, [onAdd]);

  const handleManualAdd = e => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    onAdd({ name: q, search_hint: q, is_branded: false, quantity: 1, unit: 'each' });
    setQuery(''); setShowDropdown(false); setSelectedItem(null);
  };

  const handleCategoryClick = cat => {
    setShowDropdown(false); setQuery('');
    onBrowseCategory?.(cat);
  };

  // Slices
  const allProducts     = [...localProducts, ...libraryProducts];
  const visibleCats     = showAllCats     ? localCats   : localCats.slice(0, MAX_CATS);
  const visibleProducts = showAllProducts ? allProducts : allProducts.slice(0, MAX_PRODUCTS);
  const hasMoreCats     = localCats.length > MAX_CATS;
  const hasMoreProducts = allProducts.length > MAX_PRODUCTS || libraryLoading;

  return (
    <div ref={containerRef} className="relative">

      {/* Product detail */}
      <AnimatePresence>
        {selectedItem && (
          <ProductDetail item={selectedItem} onAdd={handleAdd} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>

      {/* Search bar */}
      <form onSubmit={handleManualAdd}>
        <div
          className="flex items-center gap-2 px-3 rounded-xl border transition-all"
          style={{
            height:      44,
            background:  'white',
            borderColor: showDropdown && query ? THRFT_BLUE : '#e2e8f0',
            borderWidth: showDropdown && query ? '1.5px' : '1px',
          }}
        >
          {libraryLoading
            ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
            : <Search className="w-4 h-4 text-slate-400 shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products… (e.g. Doritos, Coke, chicken)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => allProducts.length > 0 && setShowDropdown(true)}
            className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setShowDropdown(false); setSelectedItem(null); setLocalCats([]); setLocalProducts([]); setLibraryProducts([]); }}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && !selectedItem && (localCats.length > 0 || allProducts.length > 0 || libraryLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
            style={{ maxHeight: 440, overflowY: 'auto' }}
          >

            {/* Categories */}
            {localCats.length > 0 && (
              <div className="px-3 pt-3 pb-2.5 border-b border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Categories</span>
                  {hasMoreCats && !showAllCats && (
                    <button
                      onMouseDown={e => { e.preventDefault(); setShowAllCats(true); }}
                      className="text-xs font-semibold flex items-center gap-0.5"
                      style={{ color: THRFT_BLUE }}
                    >
                      More <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {visibleCats.map(cat => (
                    <CategoryChip key={cat.key} cat={cat} onClick={handleCategoryClick} />
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {(allProducts.length > 0 || libraryLoading) && (
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Products
                    {libraryLoading && localProducts.length > 0 && (
                      <span className="ml-1 text-emerald-600 font-medium normal-case tracking-normal">· loading more</span>
                    )}
                  </span>
                  {hasMoreProducts && !showAllProducts && allProducts.length >= MAX_PRODUCTS && (
                    <button
                      onMouseDown={e => { e.preventDefault(); setShowAllProducts(true); }}
                      className="text-xs font-semibold flex items-center gap-0.5"
                      style={{ color: THRFT_BLUE }}
                    >
                      More <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {visibleProducts.map((item, i) => (
                  <ProductRow key={`prod-${i}`} item={item} onSelect={handleSelect} />
                ))}

                {libraryLoading && localProducts.length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-3 opacity-55">
                    <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    <span className="text-xs text-slate-400">Searching THRFT Food Library…</span>
                  </div>
                )}
              </div>
            )}

            {/* Custom add */}
            {query.trim().length >= 3 && (
              <button
                onMouseDown={handleManualAdd}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Add "{query.trim()}"</p>
                  <p className="text-xs text-slate-400">Add as custom item</p>
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}