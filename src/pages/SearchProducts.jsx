import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructionModal from '@/components/InstructionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2, Plus, ShoppingCart, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductBrowser from '@/components/grocery/ProductBrowser';

const SEARCH_SLIDES = [
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c661c9ba7_SearchProducts1.jpg', nextTop: '76%', dismissTop: '86%' },
  { imageUrl: 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/e6195a5bd_SearchProducts2.jpg', nextTop: '4%', dismissTop: '16%' },
];

async function searchTHRFTFoodLibrary(query) {
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
  const initialTab = urlParams.get('tab') === 'browse' ? 'browse' : 'search';

  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(() => {
    return !localStorage.getItem('thrft_instructions_dismissed_searchproducts');
  });

  useEffect(() => {
    if (initialQuery.length >= 3) runSearch(initialQuery);
  }, []);

  const runSearch = async (q) => {
    if (q.length < 3) return;
    setLoading(true);
    const data = await searchTHRFTFoodLibrary(q);
    setResults(data);
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); runSearch(query); };

  const handleAddItem = (product) => {
    const productName = product.brands ? `${product.product_name} (${product.brands})` : product.product_name;
    const searchHint = [product.product_name, product.brands, product.quantity].filter(Boolean).join(' ');
    const item = { name: productName, quantity: 1, unit: 'each', search_hint: searchHint, is_branded: true };
    const encoded = encodeURIComponent(JSON.stringify(item));
    if (listId) navigate(`/ListDetail?id=${listId}&addItem=${encoded}`);
    else navigate(`/NewList?addItem=${encoded}`);
  };

  const handleBrowseAdd = (item) => {
    const encoded = encodeURIComponent(JSON.stringify({ ...item, quantity: 1, unit: 'each' }));
    if (listId) navigate(`/ListDetail?id=${listId}&addItem=${encoded}`);
    else navigate(`/NewList?addItem=${encoded}`);
  };

  const backUrl = listId ? `/ListDetail?id=${listId}` : '/NewList';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {showInstructions && (
        <InstructionModal
          instructionKey="searchproducts"
          slides={SEARCH_SLIDES}
          onClose={() => setShowInstructions(false)}
        />
      )}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(backUrl)} className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1 flex-1">
            <button onClick={() => setTab('search')} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'search' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button onClick={() => setTab('browse')} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${tab === 'browse' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Browse
            </button>
          </div>
        </div>
        {tab === 'search' && (
          <div className="max-w-2xl mx-auto mt-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Input autoFocus placeholder="Search products by name or brand..." value={query} onChange={e => setQuery(e.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-4 pr-4 text-sm focus-visible:ring-blue-400" />
              </div>
              <Button type="submit" disabled={query.length < 3 || loading} className="h-10 px-4 rounded-xl gap-1.5 text-sm shrink-0" style={{ backgroundColor: '#4181ed' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </form>
          </div>
        )}
      </div>

      {tab === 'browse' ? (
        <div className="flex-1">
          <ProductBrowser onAdd={handleBrowseAdd} onClose={() => navigate(backUrl)} />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full px-4 py-6">
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-slate-500 text-sm mb-4">
                {query.length < 3 ? 'Type at least 3 characters to search, or use Browse to explore by category.' : 'No products found. Try a different search term.'}
              </p>
              <button onClick={() => setTab('browse')} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
                <LayoutGrid className="w-4 h-4" /> Browse by category or brand →
              </button>
            </div>
          )}
          {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>}
          {!loading && results.length > 0 && (
            <>
              <p className="text-xs text-slate-400 mb-4">{results.length} products found for "{query}"</p>
              <AnimatePresence>
                <div className="space-y-2">
                  {results.map((product, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {product.image_front_small_url ? (
                          <img src={product.image_front_small_url} alt={product.product_name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span className="text-2xl">🛒</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{product.product_name}</p>
                        {product.brands && <p className="text-xs text-slate-500 truncate">{product.brands}</p>}
                        {product.quantity && <p className="text-xs text-slate-400 mt-0.5">{product.quantity}</p>}
                      </div>
                      <Button size="sm" onClick={() => handleAddItem(product)} className="h-9 px-3 rounded-xl gap-1.5 text-xs shrink-0" style={{ backgroundColor: '#4181ed' }}>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  );
}