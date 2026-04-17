import React, { useState, useEffect } from 'react';

const MOCK_ITEMS = [
  {
    name: 'Whole Wheat Bread',
    sub: '1 loaf',
    emoji: '🍞',
    stores: [
      { name: 'Walmart', price: 3.48, icon: '✦', color: '#0071CE', best: true },
      { name: 'Kroger', price: 3.99, icon: '●', color: '#CC0000' },
      { name: 'Safeway', price: 4.49, icon: '◆', color: '#E31837' },
    ],
  },
  {
    name: 'Organic Milk',
    sub: '1 gallon',
    emoji: '🥛',
    stores: [
      { name: 'Walmart', price: 5.98, icon: '✦', color: '#0071CE' },
      { name: 'Kroger', price: 5.49, icon: '●', color: '#CC0000', best: true },
      { name: 'Safeway', price: 6.79, icon: '◆', color: '#E31837' },
    ],
  },
  {
    name: 'Gala Apples',
    sub: '3 lbs',
    emoji: '🍎',
    stores: [
      { name: 'Walmart', price: 4.97, icon: '✦', color: '#0071CE' },
      { name: 'Kroger', price: 4.49, icon: '●', color: '#CC0000', best: true },
      { name: 'Safeway', price: 5.99, icon: '◆', color: '#E31837' },
    ],
  },
];

export default function PriceOptimizationDemo() {
  const [progress, setProgress] = useState(0);
  const [optimizing, setOptimizing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setOptimizing(false); return 0; }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!optimizing) {
      const t = setTimeout(() => { setOptimizing(true); setProgress(0); }, 2000);
      return () => clearTimeout(t);
    }
  }, [optimizing]);

  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 w-full">
      <div className="space-y-4 mb-4">
        {MOCK_ITEMS.map((item) => (
          <div key={item.name} className="flex gap-3">
            <div className="flex items-center gap-2.5 w-36 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                {item.emoji}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{item.name}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            </div>
            <div className="flex-1 space-y-0.5">
              {item.stores.map((store) => (
                <div
                  key={store.name}
                  className={`flex items-center justify-between px-2 py-0.5 rounded-md ${store.best ? 'bg-emerald-50' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: store.color }}>{store.icon}</span>
                    <span className={`text-xs ${store.best ? 'font-semibold text-emerald-700' : 'text-slate-600'}`}>{store.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${store.best ? 'text-emerald-600' : 'text-slate-700'}`}>
                    ${store.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-3">
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Total Savings</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Safeway (highest):</span>
              <span className="font-semibold text-slate-700">$17.27</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>THRFT Optimized:</span>
              <span className="font-bold text-slate-900">$13.46</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 mt-1">
              <span>You Save:</span>
              <span className="font-bold text-emerald-600">$3.81 (22%)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-24 shrink-0">
          <svg width="80" height="80" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <p className="text-xs font-bold text-slate-600 text-center -mt-1 leading-tight">
            {optimizing ? 'OPTIMIZING\n50+ STORES...' : 'DONE!'}
          </p>
        </div>
      </div>
    </div>
  );
}