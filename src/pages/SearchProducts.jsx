import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2, Plus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

async function searchOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,image_front_small_url,quantity,categories_tags`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.products || []).filter(p => p.product_name);
}

export default function SearchProducts() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('listId');
  const initialQuery = urlParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    if (initialQuery.length >= 3) {
      runSearch(initialQuery);
    }
  }, []);

  const runSearch = async (q) => {
    if (q.length < 3) return;
    setLoading(true);
    const data = await searchOpenFoodFacts(q);
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

    const item = {
      name: productName,
      quantity: 1,
      unit: 'each',
      search_hint: searchHint,
      is_branded: true,
    };

    // Pass item back via URL state or navigate back with item encoded
    const encoded = encodeURIComponent(JSON.stringify(item));
    if (listId) {
      navigate(`/ListDetail?id=${listId}&addItem=${encoded}`);
    } else {
      navigate(`/NewList?addItem=${encoded}`);
    }
  };

  const backUrl = listId ? `/ListDetail?id=${listId}` : '/NewList';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(backUrl)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Input
                autoFocus
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-4 pr-4 text-sm focus-visible:ring-blue-400"
              />
            </div>
            <Button
              type="submit"
              disabled={query.length < 3 || loading}
              className="h-10 px-4 rounded-xl gap-1.5 text-sm"
              style={{ backgroundColor: '#4181ed' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Empty / initial state */}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-slate-500 text-sm">
              {query.length < 3
                ? 'Type at least 3 characters to search'
                : 'No products found. Try a different search term.'}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <p className="text-xs text-slate-400 mb-4">{results.length} products found for "{query}"</p>
            <AnimatePresence>
              <div className="space-y-2">
                {results.map((product, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.image_front_small_url ? (
                        <img
                          src={product.image_front_small_url}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-2xl">🛒</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{product.product_name}</p>
                      {product.brands && (
                        <p className="text-xs text-slate-500 truncate">{product.brands}</p>
                      )}
                      {product.quantity && (
                        <p className="text-xs text-slate-400 mt-0.5">{product.quantity}</p>
                      )}
                    </div>

                    {/* Add button */}
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(product)}
                      className="h-9 px-3 rounded-xl gap-1.5 text-xs shrink-0"
                      style={{ backgroundColor: '#4181ed' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}