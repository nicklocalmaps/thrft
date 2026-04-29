import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [userZip, setUserZip]     = useState('');

  useEffect(() => {
    base44.auth.me().then(user => {
      const zip = user?.delivery_address?.zip || user?.zip_code || '';
      setUserZip(zip);
    }).catch(() => {});
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const addToCart = item => {
    setCartItems(prev => {
      const exists = prev.findIndex(i => i.name === item.name);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = { ...next[exists], quantity: next[exists].quantity + (item.quantity || 1) };
        return next;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const updateQty = (index, qty) => {
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = index => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, userZip, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}