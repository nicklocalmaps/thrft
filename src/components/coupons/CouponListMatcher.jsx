import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Shows active coupons alongside a selected list, allowing users to
 * add coupon items to the list with one click.
 */
export default function CouponListMatcher({ coupons, list, onItemAdded }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(null);
  const [added, setAdded] = useState(new Set());

  const activeCoupons = coupons.filter(c => c.status === 'active');
  if (activeCoupons.length === 0) return null;

  const listItemNames = (list?.items || []).map(i => i.name.toLowerCase());

  // Fuzzy match — coupon product_name words vs list item names
  const matches = activeCoupons.map(c => {
    const words = c.product_name.toLowerCase().split(/\s+/);
    const alreadyInList = listItemNames.some(name =>
      words.some(w => w.length > 3 && name.includes(w))
    );
    return { coupon: c, alreadyInList };
  });

  const notInList = matches.filter(m => !m.alreadyInList);
  if (notInList.length === 0) return null;

  const handleAdd = async (coupon) => {
    setAdding(coupon.id);
    const newItem = {
      name: coupon.product_name,
      quantity: 1,
      unit: 'each',
      is_branded: !!coupon.brand,
      search_hint: coupon.brand ? `${coupon.brand} ${coupon.product_name}` : coupon.product_name,
    };
    const currentItems = list?.items || [];
    await base44.entities.GroceryList.update(list.id, {
      items: [...currentItems, newItem],
    });
    await base44.entities.Coupon.update(coupon.id, { added_to_list_id: list.id });
    setAdded(prev => new Set([...prev, coupon.id]));
    setAdding(null);
    if (onItemAdded) onItemAdded(newItem);
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden mb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-800">
            {notInList.length} coupon item{notInList.length !== 1 ? 's' : ''} not in this list
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-amber-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-amber-200 pt-3">
              {notInList.map(({ coupon }) => {
                const isAdded = added.has(coupon.id);
                return (
                  <div key={coupon.id} className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2.5 border border-amber-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{coupon.product_name}</p>
                      <p className="text-xs text-amber-600">{coupon.discount_description || 'Coupon available'}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={adding === coupon.id || isAdded}
                      onClick={() => !isAdded && handleAdd(coupon)}
                      className={`shrink-0 rounded-xl text-xs h-8 gap-1 ${isAdded ? 'bg-emerald-500' : ''}`}
                      style={!isAdded ? { backgroundColor: '#4181ed' } : {}}
                    >
                      {isAdded ? (
                        <><Check className="w-3 h-3" /> Added</>
                      ) : adding === coupon.id ? (
                        <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin inline-block" />
                      ) : (
                        <><Plus className="w-3 h-3" /> Add</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}