import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Search } from 'lucide-react';

async function searchOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=6&fields=product_name,brands,image_front_small_url,quantity`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.products || []).filter(p => p.product_name);
}

export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (name.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchOpenFoodFacts(name);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setLoading(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [name]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    // Manually typed = generic item, no brand hint
    onAdd({ name: name.trim(), quantity: Number(quantity) || 1, unit: 'each', search_hint: name.trim(), is_branded: false });
    setName('');
    setQuantity(1);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const selectSuggestion = (product) => {
    const productName = product.brands
      ? `${product.product_name} (${product.brands})`
      : product.product_name;
    // search_hint carries the full branded name for accurate price lookups
    const searchHint = [product.product_name, product.brands, product.quantity]
      .filter(Boolean).join(' ');
    onAdd({
      name: productName,
      quantity: Number(quantity) || 1,
      unit: 'each',
      search_hint: searchHint,
      is_branded: true,
    });
    setName('');
    setQuantity(1);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Add an item... (e.g. organic milk, bananas)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="w-full h-12 rounded-xl border-slate-200 bg-white text-base placeholder:text-slate-600 focus-visible:ring-blue-400 pr-10"
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {loading
              ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              : <Search className="w-4 h-4 text-slate-300" />
            }
          </div>
        </div>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 h-12 rounded-xl border-slate-200 bg-white text-center text-base focus-visible:ring-blue-400"
        />
        <Button
          type="submit"
          className="h-12 px-5 rounded-xl shadow-md shadow-blue-200 transition-all"
          style={{ backgroundColor: '#4181ed' }}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((product, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => selectSuggestion(product)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {product.image_front_small_url ? (
                  <img
                    src={product.image_front_small_url}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-xl">🛒</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{product.product_name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {[product.brands, product.quantity].filter(Boolean).join(' · ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}