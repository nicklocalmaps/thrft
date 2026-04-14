import React from 'react';
import { Check, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THRFT_BLUE = '#4181ed';

const ROWS = [
  { feature: 'Grocery lists', free: '2 per month', premium: 'Unlimited' },
  { feature: 'Stores to compare', free: 'Walmart, Kroger, Amazon Fresh', premium: '50+ stores' },
  { feature: 'In-store price comparison', free: true, premium: true },
  { feature: 'Curbside pickup pricing', free: false, premium: true },
  { feature: 'Delivery pricing (Instacart, Shipt)', free: false, premium: true },
  { feature: 'Budget tracker', free: true, premium: true },
  { feature: 'Coupon scanner', free: false, premium: true },
  { feature: 'Price history tracking', free: false, premium: true },
  { feature: 'Family plan (up to 5 accounts)', free: false, premium: true },
];

function Cell({ value }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={3} />;
  if (value === false) return <Lock className="w-4 h-4 text-slate-300 mx-auto" />;
  return <span className="text-xs font-medium text-slate-600">{value}</span>;
}

export default function FreePremiumComparison({ onCTA }) {
  return (
    <section className="py-20 px-5 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Free vs. Premium</h2>
          <p className="text-slate-500 text-lg">Start free — no card needed. Upgrade anytime for the full experience.</p>
        </div>

        <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-lg">
          {/* Header */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
            <div className="p-5" />
            <div className="p-5 text-center border-l border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Free</p>
              <p className="text-2xl font-extrabold text-slate-900">$0</p>
              <p className="text-xs text-slate-400 mt-0.5">No card needed</p>
            </div>
            <div className="p-5 text-center border-l border-slate-100" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: THRFT_BLUE }}>Premium</p>
              <p className="text-2xl font-extrabold text-slate-900">$3.99<span className="text-base font-semibold text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-0.5">7-day free trial</p>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 border-b border-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <div className="p-4 pl-5 flex items-center">
                <span className="text-sm text-slate-700 font-medium">{row.feature}</span>
              </div>
              <div className="p-4 border-l border-slate-100 flex items-center justify-center">
                <Cell value={row.free} />
              </div>
              <div className="p-4 border-l border-slate-100 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eff6ff30 0%, #f0f9ff30 100%)' }}>
                <Cell value={row.premium} />
              </div>
            </div>
          ))}

          {/* CTA row */}
          <div className="bg-white border-t border-slate-100 p-5 flex flex-col gap-3">
            <Button onClick={onCTA} className="w-full h-12 rounded-xl text-sm font-bold shadow-md shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
              Start Free Trial →
            </Button>
            <Button onClick={onCTA} variant="outline" className="w-full h-12 rounded-xl text-sm font-bold border-slate-200">
              Create Free Account
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Free plan resets every month. Upgrade anytime. No contracts.
        </p>
      </div>
    </section>
  );
}