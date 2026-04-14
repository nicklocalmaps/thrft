import React, { useState } from 'react';
import { CATEGORIES, BRANDS } from '@/lib/productCatalog';
import ProductBrowser from '@/components/grocery/ProductBrowser';

export default function InlineBrowseProducts({ onAddItem }) {
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserState, setBrowserState] = useState(null);

  const handleSelectCategory = (category) => {
    setBrowserState({ level: 'category', category });
    setShowBrowser(true);
  };

  const handleSelectBrand = (brand) => {
    setBrowserState({ level: 'brand', brand });
    setShowBrowser(true);
  };

  const handleAdd = (item) => {
    onAddItem(item);
    setShowBrowser(false);
  };

  if (showBrowser) {
    return (
      <ProductBrowser 
        onAdd={handleAdd} 
        onClose={() => setShowBrowser(false)}
        initialState={browserState}
      />
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Browse Popular Items</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Product <br /> Categories</h4>
          <div className="grid grid-cols-1 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleSelectCategory(cat)}
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

        {/* Brands */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Popular <br /> Brands</h4>
          <div className="grid grid-cols-1 gap-3">
            {BRANDS.map(brand => (
              <button
                key={brand.key}
                onClick={() => handleSelectBrand(brand)}
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