import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';
import { filterByPopularity } from '@/lib/productSearch';

// ─── Local catalog search index (built once, cached in module scope) ──────────

let _catalogIndex = null;

function buildCatalogIndex() {
  if (_catalogIndex) return _catalogIndex;

  const entries = [];

  for (const cat of CATEGORIES) {
    for (const item of cat.items || []) {
      entries.push({
        name:        item.name,
        search_hint: item.search_hint || item.name,
        is_branded:  item.is_branded || false,
        unit:        'each',
        quantity:    1,
        category:    cat.label,
        emoji:       cat.emoji,
        _tokens: `${item.name} ${item.search_hint || ''} ${cat.label}`.toLowerCase(),
      });
    }
  }

  for (const brand of BRANDS) {
    entries.push({
      name:        brand.label,
      search_hint: brand.search || brand.label,
      is_branded:  true,
      unit:        'each',
      quantity:    1,
      category:    'Brand',
      emoji:       brand.emoji,
      _isBrand:    true,
      _tokens:     `${brand.label} ${brand.search || ''}`.toLowerCase(),
    });
  }

  _catalogIndex = entries;
  return entries;
}

function searchLocalCatalog(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const index = buildCatalogIndex();
  const results = index.filter(e => e._tokens.includes(q));
  results.sort((a, b) => {
    const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aStart - bStart;
  });
  return results.slice(0, 8);
}

// ─── THRFT Food Library (OpenFoodFacts) search ────────────────────────────────

async function searchTHRFTFoodLibrary(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24&fields=product_name,brands,image_front_small_url,quantity`;
    const res = await fetch(url);
    const data = await res.json();
    const products = (data.products || []).filter(p => p.product_name);
    return filterByPopularity(products, query).slice(0, 6);
  } catch {
    return [];
  }
}

function mapLibraryProduct(product) {
  const productName = product.brands
    ? `${product.product_name} (${product.brands.split(',')[0].trim()})`
    : product.product_name;
  const searchHint = [product.product_name, product.brands, product.quantity]
    .filter(Boolean).join(' ');
  return {
    name:        productName,
    search_hint: searchHint,
    is_branded:  true,
    quantity:    1,
    unit:        'each',
    image:       product.image_front_small_url,
    brand:       product.brands?.split(',')[0].trim(),
  };
}

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({ item, onSelect, isLibrary }) {
  return (
    <button
      type="button"
      onMouseDown={() => onSelect(item)}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
    >
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: 18 }}>{item.emoji || '🛒'}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
        <p className="text-xs text-slate-400 truncate">
          {item.category || item.brand || ''}
          {isLibrary && (
            <span className="ml-1 text-emerald-600 font-medium">· THRFT Food Library</span>
          )}
        </p>
      </div>

      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4181ed" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AddItemForm({ onAdd }) {
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState([]);
  const [libraryResults, setLibraryResults] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setLocalResults([]);
      setLibraryResults([]);
      setShowDropdown(false);
      setLibraryLoading(false);
      clearTimeout(debounceRef.current);
      return;
    }

    const local = searchLocalCatalog(q);
    setLocalResults(local);
    setShowDropdown(true);

    clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current = false;

    debounceRef.current = setTimeout(async () => {
      setLibraryLoading(true);
      const mine = {};
      abortRef.current = mine;
      const results = await searchTHRFTFoodLibrary(q);
      if (abortRef.current !== mine) return;
      const localNames = new Set(local.map(r => r.name.toLowerCase()));
      const fresh = results
        .map(mapLibraryProduct)
        .filter(r => !localNames.has(r.name.toLowerCase()))
        .slice(0, 4);
      setLibraryResults(fresh);
      setLibraryLoading(false);
    }, 400);

    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current = false;
    };
  }, [query]);

  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback(item => {
    const { _tokens, _isBrand, emoji, category, image, brand, ...clean } = item;
    onAdd({ ...clean, quantity: 1, unit: 'each' });
    setQuery('');
    setLocalResults([]);
    setLibraryResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  }, [onAdd]);

  const handleSubmit = e => {
    if (e && e.preventDefault) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    onAdd({ name: q, search_hint: q, is_branded: false, quantity: 1, unit: 'each' });
    setQuery('');
    setLocalResults([]);
    setLibraryResults([]);
    setShowDropdown(false);
  };

  const allResults = [...localResults, ...libraryResults];
  const hasResults = allResults.length > 0 || libraryLoading;

  return (
    <div ref={containerRef} className="relative mb-1">
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-2 px-3 rounded-xl border transition-all"
          style={{
            background:  'white',
            borderColor: showDropdown && query ? '#4181ed' : '#e2e8f0',
            height:      44,
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
            onFocus={() => allResults.length > 0 && setShowDropdown(true)}
            className="flex-1 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(''); setShowDropdown(false); setLocalResults([]); setLibraryResults([]); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </form>

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDropdown && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
            style={{ maxHeight: 340, overflowY: 'auto' }}
          >
            {localResults.length > 0 && (
              <>
                <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-600">● THRFT Food Library</span>
                  <span className="text-xs text-slate-400">· instant</span>
                </div>
                {localResults.map((item, i) => (
                  <ResultRow key={`local-${i}`} item={item} onSelect={handleSelect} isLibrary={false} />
                ))}
              </>
            )}

            {libraryResults.length > 0 && (
              <>
                <div className="px-3 pt-2.5 pb-1 border-t border-slate-50 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">More from THRFT Food Library</span>
                </div>
                {libraryResults.map((item, i) => (
                  <ResultRow key={`lib-${i}`} item={item} onSelect={handleSelect} isLibrary />
                ))}
              </>
            )}

            {libraryLoading && libraryResults.length === 0 && localResults.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-50 opacity-60">
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                <span className="text-xs text-slate-400">Loading more from THRFT Food Library…</span>
              </div>
            )}

            {query.trim().length >= 2 && (
              <button
                type="button"
                onMouseDown={handleSubmit}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
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