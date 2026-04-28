import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Plus, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductBrowser from '@/components/grocery/ProductBrowser';

async function searchTHRFTFoodLibrary(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,image_front_small_url,quantity`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.products || []).filter(p => p.product_name);
}

export default function ProductSearchBrowser({ onAddItem }) {
  const [tab, setTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);

  const runSearch = async (q) => {
    if (q.length < 3) return;
    setLoading(true);
    const data = await searchTHRFTFoodLibrary(q);
    setResults(data);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleAddItem = (product) => {
    const productName = product.brands
      ? `${product.product_name} (${product.brands})`
      : product.product_name;
    const searchHint = [product.product_name, product.brands, product.quantity]
      .filter(Boolean).join(' ');

    onAddItem({
      name: productName,
      quantity: 1,
      unit: 'each',
      search_hint: searchHint,
      is_branded: true,
    });

    setQuery('');
    setResults([]);
  };

  const handleBrowseAdd = (item) => {
    onAddItem(item);
    setShowBrowser(false);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-slate-100">
        <button
          onClick={() => { setTab('search'); setShowBrowser(false); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === 'search' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> Search
        </button>
        <button
          onClick={() => { setTab('browse'); setShowBrowser(true); }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === 'browse' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Browse
        </button>
      </div>

      {/* Content */}
      {showBrowser ? (
        <ProductBrowser onAdd={handleBrowseAdd} onClose={() => { setShowBrowser(false); setTab('search'); }} />
      ) : (
        <div className="p-4">
          {tab === 'search' && (
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search products by name or brand..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-400"
                />
              </div>
              <Button
                type="submit"
                disabled={query.length < 3 || loading}
                size="sm"
                className="rounded-xl gap-1.5 text-sm shrink-0"
                style={{ backgroundColor: '#4181ed' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </form>
          )}

          {tab === 'search' && (
            <>
              {!loading && results.length === 0 && query.length < 3 && (
                <div className="flex flex-col items-center py-6 text-center">
                  <ThrftCartIcon className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">
                    Type at least 3 characters to search, or use Browse to explore by category.
                  </p>
                </div>
              )}

              {!loading && results.length === 0 && query.length >= 3 && (
                <p className="text-sm text-slate-500 text-center py-6">No products found. Try a different search term.</p>
              )}

              {loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-xs text-slate-400 mb-3">{results.length} products found</p>
                  <AnimatePresence>
                    {results.map((product, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-center gap-3 hover:border-blue-200 hover:shadow-sm transition-all"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center">
                          {product.image_front_small_url ? (
                            <img
                              src={product.image_front_small_url}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <ThrftCartIcon className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-xs truncate">{product.product_name}</p>
                          {product.brands && (
                            <p className="text-xs text-slate-500 truncate">{product.brands}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(product)}
                          className="h-8 w-8 p-0 rounded-lg shrink-0"
                          style={{ backgroundColor: '#4181ed' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}