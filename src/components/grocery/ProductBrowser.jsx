import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Plus, Search, Tag, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';

/**
 * ProductBrowser — full-screen modal for browsing by category or brand.
 * onAdd(item) — called when user taps "Add" on an item.
 * onClose()   — called to dismiss the modal.
 */
export default function ProductBrowser({ onAdd, onClose }) {
  const [tab, setTab] = useState('categories'); // 'categories' | 'brands'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [added, setAdded] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (item) => {
    onAdd({ ...item, quantity: 1, unit: 'each' });
    setAdded(prev => new Set([...prev, item.search_hint]));
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery('');
  };

  // Items to show when a category is selected
  const categoryItems = selectedCategory
    ? selectedCategory.items.filter(i =>
        !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Filtered categories / brands for the grid
  const filteredCategories = searchQuery
    ? CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : CATEGORIES;

  const filteredBrands = searchQuery
    ? BRANDS.filter(b => b.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : BRANDS;

  const isItemView = selectedCategory || selectedBrand;
  const viewLabel = selectedCategory?.label || selectedBrand?.label;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        {isItemView ? (
          <button
            onClick={clearSelection}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1">
          {isItemView ? (
            <div>
              <p className="text-xs text-slate-400">Browse Products</p>
              <p className="font-bold text-slate-900 leading-tight">{viewLabel}</p>
            </div>
          ) : (
            <p className="font-bold text-slate-900">Browse Products</p>
          )}
        </div>

        {!isItemView && (
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Done</button>
        )}
      </div>

      {/* Tabs (only on root view) */}
      {!isItemView && (
        <div className="flex gap-1 px-4 pt-3 pb-2">
          <button
            onClick={() => { setTab('categories'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === 'categories' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" /> Categories
          </button>
          <button
            onClick={() => { setTab('brands'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === 'brands' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Brands
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="px-4 pb-3 pt-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={isItemView ? `Search in ${viewLabel}...` : `Search ${tab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <AnimatePresence mode="wait">

          {/* Category item list */}
          {selectedCategory && (
            <motion.div key="cat-items" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-2">
                {categoryItems.map((item) => {
                  const isAdded = added.has(item.search_hint);
                  return (
                    <div
                      key={item.search_hint}
                      className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">
                          {selectedCategory.emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                          {item.is_branded && (
                            <p className="text-xs text-blue-500 font-medium">Branded</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(item)}
                        disabled={isAdded}
                        className={`h-8 px-3 rounded-xl text-xs shrink-0 gap-1 ${isAdded ? 'bg-emerald-500' : ''}`}
                        style={!isAdded ? { backgroundColor: '#4181ed' } : {}}
                      >
                        {isAdded ? '✓ Added' : <><Plus className="w-3 h-3" /> Add</>}
                      </Button>
                    </div>
                  );
                })}
                {categoryItems.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-12">No items found.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Brand item list — search OpenFoodFacts */}
          {selectedBrand && (
            <BrandItemList brand={selectedBrand} onAdd={handleAdd} added={added} searchQuery={searchQuery} />
          )}

          {/* Categories grid */}
          {!isItemView && tab === 'categories' && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-3">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shrink-0">
                      {cat.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-snug">{cat.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.items.length} items</p>
                    </div>
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="col-span-2 text-center text-sm text-slate-400 py-12">No categories found.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Brands grid */}
          {!isItemView && tab === 'brands' && (
            <motion.div key="brands" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-3 gap-3">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.key}
                    onClick={() => { setSelectedBrand(brand); setSearchQuery(''); }}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">
                      {brand.emoji}
                    </div>
                    <p className="font-semibold text-slate-900 text-xs text-center leading-tight">{brand.label}</p>
                  </button>
                ))}
                {filteredBrands.length === 0 && (
                  <p className="col-span-3 text-center text-sm text-slate-400 py-12">No brands found.</p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-component: fetches OpenFoodFacts for a brand and shows results
function BrandItemList({ brand, onAdd, added, searchQuery }) {
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const query = encodeURIComponent(brand.search);
    fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,image_front_small_url,quantity`)
      .then(r => r.json())
      .then(data => {
        setResults((data.products || []).filter(p => p.product_name));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brand.key]);

  const filtered = searchQuery
    ? results.filter(p => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : results;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
      <div className="space-y-2">
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
                  <img src={product.image_front_small_url} alt={product.product_name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="text-xl">{brand.emoji}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{product.product_name}</p>
                {product.brands && <p className="text-xs text-slate-400 truncate">{product.brands}</p>}
                {product.quantity && <p className="text-xs text-slate-300">{product.quantity}</p>}
              </div>
              <Button
                size="sm"
                onClick={() => onAdd({ name: product.product_name, search_hint: searchHint, is_branded: true })}
                disabled={isAdded}
                className={`h-8 px-3 rounded-xl text-xs shrink-0 gap-1 ${isAdded ? 'bg-emerald-500' : ''}`}
                style={!isAdded ? { backgroundColor: '#4181ed' } : {}}
              >
                {isAdded ? '✓' : <><Plus className="w-3 h-3" /> Add</>}
              </Button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-12">No products found for "{brand.label}".</p>
        )}
      </div>
    </motion.div>
  );
}