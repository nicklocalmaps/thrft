import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import { useCart } from '@/lib/cartContext.jsx';

const THRFT_BLUE = '#4181ed';

function ProductCard({ product, onClick, inCart }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={() => onClick(product)}
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden text-left hover:border-blue-200 hover:shadow-md transition-all w-full relative"
    >
      {inCart && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center z-10">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
      <div className="w-full bg-slate-50 flex items-center justify-center" style={{ height: 110 }}>
        {product.imageUrl && !imgError ? (
          <img src={product.imageUrl} alt={product.name}
            className="object-contain" style={{ maxHeight: 100, maxWidth: '90%' }}
            onError={() => setImgError(true)} />
        ) : (
          <span style={{ fontSize: 40 }}>{product.emoji || '🛒'}</span>
        )}
      </div>
      <div className="p-2.5">
        {product.brand && <p className="text-xs text-slate-400 truncate">{product.brand}</p>}
        <p className="text-xs font-semibold text-slate-900 leading-snug"
          style={{ minHeight: 32, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </p>
        {product.size && <p className="text-xs text-slate-400 mt-0.5 truncate">{product.size}</p>}
        {product.price && <p className="text-sm font-bold text-slate-900 mt-1">${product.price.toFixed(2)}</p>}
      </div>
    </button>
  );
}

export default function Aisle() {
  const navigate = useNavigate();
  const { cartCount, cartItems } = useCart();

  const params   = new URLSearchParams(window.location.search);
  const key      = params.get('key') || 'beverages';
  const label    = params.get('label') || 'Aisle';
  const emoji    = params.get('emoji') || '🛒';

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    base44.auth.me().then(user => {
      const zip = user?.delivery_address?.zip || user?.zip_code || '10001';
      return base44.functions.invoke('krogerProducts', {
        mode: 'browse', category: key, zip_code: zip, limit: 30,
      });
    }).then(res => {
      setProducts(res.data?.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [key]);

  const goToProduct = product => {
    sessionStorage.setItem('thrft_selected_product', JSON.stringify(product));
    navigate('/Product');
  };

  const cartKeys = new Set(cartItems.map(i => i.name));

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', paddingBottom: 80 }}>

      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/NewList')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span style={{ fontSize: 24 }}>{emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900">{label}</p>
            <p className="text-xs font-semibold text-emerald-600">
              {loading ? 'Loading...' : `${products.length} products · Kroger`}
            </p>
          </div>
          <button onClick={() => navigate('/Cart')} className="relative shrink-0">
            <ThrftCartIcon className="w-6 h-6 text-slate-600" />
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontSize: 9 }}>{cartCount}</span>
              </div>
            )}
          </button>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading {label} from Kroger...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No products found in {label}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, i) => (
              <ProductCard
                key={i}
                product={product}
                onClick={goToProduct}
                inCart={cartKeys.has(product.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}