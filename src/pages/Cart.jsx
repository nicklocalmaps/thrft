import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Minus, Plus, X, TrendingDown, Loader2 } from 'lucide-react';
import ThrftCartIcon from '@/components/icons/ThrftCartIcon';
import { useCart } from '@/lib/cartContext.jsx';

const THRFT_BLUE = '#4181ed';
const THRFT_DARK = '#1e3a5f';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

function CartItem({ item, onUpdateQty, onRemove, isLast }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
        {item.imageUrl && !imgError ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1"
            onError={() => setImgError(true)} />
        ) : (
          <span style={{ fontSize: 24 }}>🛒</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
        {item.brand && <p className="text-xs text-slate-400 truncate">{item.brand}</p>}
        {item.price && (
          <p className="text-sm font-bold text-slate-900 mt-0.5">${(item.price * item.quantity).toFixed(2)}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => item.quantity > 1 ? onUpdateQty(item.quantity - 1) : onRemove()}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
        >
          {item.quantity === 1 ? <X className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        </button>
        <span className="text-sm font-bold text-slate-900 w-7 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
  const [isSaving, setIsSaving] = useState(false);
  const [listName, setListName] = useState('My Shopping List');

  const handleCompare = async () => {
    if (cartItems.length === 0) return;
    setIsSaving(true);
    try {
      const items = cartItems.map(item => ({
        name:        item.name,
        search_hint: item.name,
        is_branded:  !!item.brand,
        quantity:    item.quantity,
        unit:        'each',
        image:       item.imageUrl,
        brand:       item.brand,
      }));

      const list = await base44.entities.GroceryList.create({
        name:  listName.trim() || 'My Shopping List',
        items,
        shopping_method: 'instore',
      });

      clearCart();
      navigate(`/ListDetail?id=${list.id}`);
    } catch (err) {
      console.error('Failed to save list:', err);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: 80 }}>

      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-slate-900 flex-1">
            My Cart
            <span className="text-slate-400 font-normal text-sm ml-1.5">
              ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
            </span>
          </h1>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
              Clear all
            </button>
          )}
        </div>
      </header>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <ThrftCartIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-2">Your cart is empty</p>
          <p className="text-sm text-slate-400 mb-6">Browse aisles or search to add items</p>
          <button onClick={() => navigate('/NewList')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: THRFT_BLUE }}>
            Start shopping →
          </button>
        </div>

      ) : (
        <div className="px-4 py-4">
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">List name</label>
            <input
              value={listName}
              onChange={e => setListName(e.target.value)}
              placeholder="My Shopping List"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden mb-5">
            {cartItems.map((item, i) => (
              <CartItem
                key={`${item.name}-${i}`}
                item={item}
                onUpdateQty={qty => updateQty(i, qty)}
                onRemove={() => removeFromCart(i)}
                isLast={i === cartItems.length - 1}
              />
            ))}
          </div>

          <button onClick={() => navigate('/NewList')}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors mb-6 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add more items
          </button>

          <div className="bg-slate-50 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">
                Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
              <span className="text-sm font-bold text-slate-900">
                {cartItems.some(i => i.price)
                  ? `$${cartItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0).toFixed(2)}`
                  : '—'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Final price determined after store comparison</p>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${THRFT_DARK}, #2d5491)` }}>
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                  <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">THRFT</span>
              </div>
              <p className="text-lg font-bold text-white mb-1">Ready to save?</p>
              <p className="text-sm text-white/65 mb-5 leading-relaxed">
                Compare your cart across 50+ stores and find the lowest total price before you shop.
              </p>
              <button
                onClick={handleCompare}
                disabled={isSaving || cartItems.length === 0}
                className="w-full bg-white rounded-xl py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-50 active:scale-[.98] disabled:opacity-50"
                style={{ color: THRFT_DARK }}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving your list...</>
                ) : (
                  <><TrendingDown className="w-4 h-4" /> Compare prices now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}