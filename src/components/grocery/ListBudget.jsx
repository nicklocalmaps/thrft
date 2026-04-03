import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_STORES } from '@/lib/storeConfig';

const THRFT_BLUE = '#4181ed';

/**
 * Props:
 *  list        — GroceryList entity
 *  priceData   — the current price_data object (may be null)
 *  onUpdate    — callback after saving budget or removing items
 */
export default function ListBudget({ list, priceData, onUpdate }) {
  const [budget, setBudget] = useState(list?.budget?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveBudget = async () => {
    setSaving(true);
    await base44.entities.GroceryList.update(list.id, { budget: parseFloat(budget) || null });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate?.();
  };

  const removeItem = async (itemName) => {
    const newItems = (list.items || []).filter(i => i.name !== itemName);
    await base44.entities.GroceryList.update(list.id, { items: newItems });
    onUpdate?.();
  };

  const budgetVal = parseFloat(budget) || parseFloat(list?.budget) || 0;

  // Find cheapest store total from priceData
  let cheapestTotal = null;
  let cheapestStore = null;
  let itemPrices = []; // [{name, price}]

  if (priceData && Object.keys(priceData).length > 0) {
    const entries = Object.entries(priceData).map(([k, d]) => {
      const total = Array.isArray(d)
        ? d.reduce((s, i) => s + (i.price || 0), 0)
        : (d?.instore_total ?? 0);
      return { key: k, total, data: d };
    }).filter(e => e.total > 0);

    if (entries.length > 0) {
      const best = entries.reduce((a, b) => a.total < b.total ? a : b);
      cheapestTotal = best.total;
      cheapestStore = ALL_STORES.find(s => s.key === best.key)?.name || best.key;

      // Build per-item price list from cheapest store
      const storeData = best.data;
      const itemsArr = Array.isArray(storeData) ? storeData : (storeData?.items || []);
      itemPrices = itemsArr.map(i => ({
        name: i.item_name || i.product_name || '',
        price: i.price || 0,
        in_stock: i.in_stock !== false,
      })).filter(i => i.name);
    }
  }

  const isOverBudget = budgetVal > 0 && cheapestTotal !== null && cheapestTotal > budgetVal;
  const overBy = isOverBudget ? cheapestTotal - budgetVal : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-blue-500" /> List Budget
      </h3>

      {/* Budget input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
          <Input
            type="number"
            placeholder="Target budget (e.g. 80)"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="h-10 pl-7 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-400"
          />
        </div>
        <Button
          onClick={saveBudget}
          disabled={saving || !budget}
          className="h-10 px-4 rounded-xl text-sm font-semibold shrink-0"
          style={{ backgroundColor: THRFT_BLUE }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✅' : 'Set'}
        </Button>
      </div>

      {/* Status — only show if we have price data */}
      {cheapestTotal !== null && budgetVal > 0 && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {isOverBudget ? (
              <>
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Over budget by ${overBy.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Best price at {cheapestStore}: ${cheapestTotal.toFixed(2)} · Your budget: ${budgetVal.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-500 mt-1">Remove items below to get within budget.</p>
                  </div>
                </div>

                {/* Items to remove */}
                {itemPrices.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Items at {cheapestStore}</p>
                    {[...itemPrices].sort((a, b) => b.price - a.price).map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl border border-slate-100 bg-slate-50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 truncate">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-sm font-semibold text-slate-700">${item.price.toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(item.name)}
                            className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
                            title="Remove item"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-emerald-700">
                  Within budget! ${(budgetVal - cheapestTotal).toFixed(2)} to spare at {cheapestStore}.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {cheapestTotal === null && budgetVal > 0 && (
        <p className="text-xs text-slate-400 italic">Compare prices to see how this list measures up against your budget.</p>
      )}
    </div>
  );
}