import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';
import {
  fetchCategoryProducts,
  searchProducts,
  fetchProductVariants,
  groupByBrand,
  aiFillProducts,
} from '@/lib/productSearch';

const THRFT_BLUE = '#4181ed';

// ── Level 1: Categories & Brands Grid ────────────────────────────────────
function BrowseHome({ onSelectCategory, onSelectBrand, searchQuery }) {
  const filteredCategories = searchQuery
    ? CATEGORIES.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : CATEGORIES;

  const filteredBrands = searchQuery
    ? BRANDS.filter(b => b.label.toLowerCase().includes(searchQuery.toLowerCase()) || b.search.toLowerCase().includes(searchQuery.toLowerCase()))
    : BRANDS;

  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Search Input */}
      {searchQuery === '' && (
        <div className="flex items-center justify-center py-4">
          <p className="text-xs text-slate-400 text-center">Type to search categories or brands, or browse below →</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Categories Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 px-2">Product Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-lg shrink-0">
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-xs leading-snug">{cat.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 px-2">Popular Brands</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredBrands.map(brand => (
              <button
                key={brand.key}
                onClick={() => onSelectBrand(brand)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-lg shrink-0">
                  {brand.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-xs leading-snug truncate">{brand.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Level 2: Brand Grid inside a Category ─────────────────────────────────
function BrandGrid({ category, onSelectBrand, searchQuery }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [aiUsed, setAiUsed] = useState(false);

  const loadBrands = async (p = 1, existing = []) => {
    setLoading(true);
    let products = await fetchCategoryProducts(category.key, p);

    // AI fill-in if OFF returns too few
    if (products.length < 10 && !aiUsed) {
      const aiProducts = await aiFillProducts(category.label, null);
      products = [...products, ...aiProducts];
      setAiUsed(true);
      setHasMore(false);
    } else if (products.length < 10) {
      setHasMore(false);
    }

    const grouped = groupByBrand([...existing.flatMap(b => b.products || [{ brands: b.brand }]), ...products]);
    setBrands(grouped);
    setLoading(false);
  };

  useEffect(() => { loadBrands(1, []); }, [category.key]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadBrands(next, brands);
  };

  const filtered = searchQuery
    ? brands.filter(b => b.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands;

  if (loading && brands.length === 0) return <LoadingSpinner />;

  return (
    <div className="px-4 pb-6">
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(brand => (
          <button
            key={brand.brand}
            onClick={() => onSelectBrand(brand)}
            className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
              {brand.image ? (
                <img src={brand.image} alt={brand.brand} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <span className="text-xl">{category.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{brand.brand}</p>
              <p className="text-xs text-slate-400">{brand.products?.length || 1} products</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && !loading && (
          <p className="col-span-2 text-center text-sm text-slate-400 py-12">No brands found.</p>
        )}
      </div>
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="w-full mt-4 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Load more brands
        </button>
      )}
      {loading && brands.length > 0 && <div className="flex justify-center mt-4"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>}
    </div>
  );
}

// ── Level 2b: Brand Products ──────────────────────────────────────────────
function BrandVariants({ brand, onAdd, added, searchQuery }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Search for products from this brand
      const results = await searchProducts(brand.label);
      setProducts(results);
      setLoading(false);
    };
    load();
  }, [brand.label]);

  const filtered = searchQuery
    ? products.filter(p => p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-4 pb-6 space-y-2">
      {filtered.map((product, i) => {
        const searchHint = [product.product_name, product.brands, product.quantity].filter(Boolean).join(' ');
        const isAdded = added.has(searchHint);
        return (
          <div
            key={i}
            className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-blue-200 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
              {product.image_front_small_url ? (
                <img
                  src={product.image_front_small_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="text-xl">{brand.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm leading-snug">{product.product_name}</p>
              <p className="text-xs text-slate-400 truncate">
                {[product.brands, product.quantity].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onAdd({
                name: product.product_name,
                search_hint: searchHint,
                is_branded: true,
                quantity: 1,
                unit: 'each',
              })}
              className={`h-8 w-8 p-0 rounded-xl shrink-0 transition-all ${isAdded ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}
              style={!isAdded ? { backgroundColor: THRFT_BLUE } : {}}
            >
              {isAdded ? '✓' : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-12">No products found for this brand.</p>
      )}
    </div>
  );
}

// ── Level 3: Product Variants ─────────────────────────────────────────────
function VariantList({ category, brand, onAdd, added, searchQuery }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // Try OFF first
      let results = brand.products?.filter(p => p.product_name && p.quantity) || [];

      if (results.length < 5) {
        // Fetch more variants for this brand
        const fetched = await fetchProductVariants(brand.brand, category.label);
        results = [...results, ...fetched];
      }

      // AI fill-in if still not enough
      if (results.length < 5) {
        const ai = await aiFillProducts(category.label, brand.brand);
        results = [...results, ...ai];
      }

      // Deduplicate by product_name
      const seen = new Set();
      results = results.filter(p => {
        if (!p.product_name) return false;
        const key = p.product_name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setProducts(results);
      setLoading(false);
    };
    load();
  }, [brand.brand, category.key]);

  const filtered = searchQuery
    ? products.filter(p => p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-4 pb-6 space-y-2">
      {filtered.map((product, i) => {
        const searchHint = [product.product_name, product.brands, product.quantity].filter(Boolean).join(' ');
        const isAdded = added.has(searchHint);
        return (
          <div
            key={i}
            className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-blue-200 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
              {product.image_front_small_url ? (
                <img
                  src={product.image_front_small_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="text-xl">{category.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm leading-snug">{product.product_name}</p>
              <p className="text-xs text-slate-400 truncate">
                {[product.brands, product.quantity].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onAdd({
                name: product.product_name,
                search_hint: searchHint,
                is_branded: true,
                quantity: 1,
                unit: 'each',
              })}
              className={`h-8 w-8 p-0 rounded-xl shrink-0 transition-all ${isAdded ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}
              style={!isAdded ? { backgroundColor: THRFT_BLUE } : {}}
            >
              {isAdded ? '✓' : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-12">No products found.</p>
      )}
    </div>
  );
}

// ── Search Results ────────────────────────────────────────────────────────
function SearchResults({ query, onAdd, added }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.length < 3) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchProducts(query);
      setResults(data);
      setLoading(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (query.length < 3) return (
    <p className="text-center text-sm text-slate-400 py-12 px-4">Type at least 3 characters to search across all products…</p>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-4 pb-6 space-y-2">
      <p className="text-xs text-slate-400 mb-3">{results.length} results for "{query}"</p>
      {results.map((product, i) => {
        const searchHint = [product.product_name, product.brands, product.quantity].filter(Boolean).join(' ');
        const isAdded = added.has(searchHint);
        return (
          <div key={i} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
              {product.image_front_small_url ? (
                <img src={product.image_front_small_url} alt={product.product_name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
              ) : <span className="text-xl">🛒</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{product.product_name}</p>
              <p className="text-xs text-slate-400 truncate">{[product.brands, product.quantity].filter(Boolean).join(' · ')}</p>
            </div>
            <Button
              size="sm"
              onClick={() => onAdd({ name: product.product_name, search_hint: searchHint, is_branded: true, quantity: 1, unit: 'each' })}
              className={`h-8 w-8 p-0 rounded-xl shrink-0 ${isAdded ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}
              style={!isAdded ? { backgroundColor: THRFT_BLUE } : {}}
            >
              {isAdded ? '✓' : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        );
      })}
      {results.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No products found.</p>}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
      <p className="text-sm text-slate-400">Loading products…</p>
    </div>
  );
}

// ── Main ProductBrowser ───────────────────────────────────────────────────
export default function ProductBrowser({ onAdd, onClose, isFullPage = false }) {
  // Navigation stack: each entry is { level: 'browse'|'category'|'brand'|'variants', category?, brand? }
  const [nav, setNav] = useState([{ level: 'browse' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [added, setAdded] = useState(new Set());

  const current = nav[nav.length - 1];
  const isSearching = searchQuery.length > 0;

  const handleAdd = (item) => {
    onAdd(item);
    setAdded(prev => new Set([...prev, item.search_hint]));
  };

  const pushNav = (entry) => {
    setSearchQuery('');
    setNav(prev => [...prev, entry]);
  };

  const popNav = () => {
    setSearchQuery('');
    setNav(prev => prev.slice(0, -1));
  };

  // Header breadcrumb label
  const getTitle = () => {
    if (current.level === 'browse') return 'Browse Products';
    if (current.level === 'category') return current.category.label;
    if (current.level === 'brand') return current.brand.label;
    if (current.level === 'variants') return current.brand.brand || current.brand.label;
    return 'Browse Products';
  };

  const getSubtitle = () => {
    if (current.level === 'category') return 'Select a brand';
    if (current.level === 'brand') return `${current.brand.label} · Browse products`;
    if (current.level === 'variants') return `${current.category?.label || ''} · Pick a size or flavor`;
    return null;
  };

  return (
    <div className={`${isFullPage ? 'flex flex-col flex-1' : 'fixed inset-0 z-50 flex flex-col'} bg-slate-50`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          {nav.length > 1 ? (
            <button onClick={popNav} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-base leading-tight truncate">{getTitle()}</p>
            {getSubtitle() && <p className="text-xs text-slate-400 leading-tight">{getSubtitle()}</p>}
          </div>
          {nav.length > 1 && (
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 shrink-0">Done</button>
          )}
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder={
                current.level === 'categories' ? 'Search all products…' :
                current.level === 'brands' ? `Search brands in ${current.category?.label}…` :
                `Search ${current.brand?.brand} products…`
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Added count badge */}
        {added.size > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-xs font-semibold text-emerald-700">{added.size} item{added.size !== 1 ? 's' : ''} added to your list ✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-3">
        <AnimatePresence mode="wait">
          {/* Global search across all products */}
          {isSearching && current.level !== 'variants' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SearchResults query={searchQuery} onAdd={handleAdd} added={added} />
            </motion.div>
          )}

          {/* Level 1: Browse Home (Categories + Brands) */}
          {!isSearching && current.level === 'browse' && (
            <motion.div key="browse" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrowseHome
                onSelectCategory={cat => pushNav({ level: 'category', category: cat })}
                onSelectBrand={brand => pushNav({ level: 'brand', brand })}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {/* Level 2: Category - Brand picker */}
          {!isSearching && current.level === 'category' && (
            <motion.div key={`category-${current.category.key}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrandGrid
                category={current.category}
                onSelectBrand={brand => pushNav({ level: 'variants', category: current.category, brand })}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {/* Level 2b: Brand - Product variants */}
          {!isSearching && current.level === 'brand' && (
            <motion.div key={`brand-${current.brand.key}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BrandVariants
                brand={current.brand}
                onAdd={handleAdd}
                added={added}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}

          {/* Level 3: Variant list */}
          {current.level === 'variants' && (
            <motion.div key={`variants-${current.brand.key}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <VariantList
                category={current.category}
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