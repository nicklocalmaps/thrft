import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Star, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  'Unlimited Grocery Lists',
  'AI Pricing Optimization Engine — Compare 50+ Stores Instantly',
  'In-Store | Curbside Pickup | Delivery Pricing',
  'Coupon Scanner — Photograph Coupons & Leave The Paper At Home',
  'Grocery Budget Tool — Set Limits & Stay On Track',
  'Price History Tracking',
  'Shopping Mode & Item Check-Off',
];

const MOCK_ITEMS = [
  {
    name: 'Whole Wheat Bread',
    sub: '1 loaf',
    emoji: '🍞',
    stores: [
      { name: 'Walmart', price: 45.20, icon: '✦', color: '#0071CE' },
      { name: 'Kroger', price: 28.99, icon: '●', color: '#CC0000' },
      { name: 'Safeway', price: 17.99, icon: '◆', color: '#E31837', best: true },
    ],
  },
  {
    name: 'Organic Milk',
    sub: '1 gallon',
    emoji: '🥛',
    stores: [
      { name: 'Walmart', price: 35.90, icon: '✦', color: '#0071CE' },
      { name: 'Kroger', price: 26.00, icon: '●', color: '#CC0000' },
      { name: 'Safeway', price: 17.00, icon: '◆', color: '#E31837' },
    ],
  },
  {
    name: 'Gala Apples',
    sub: '3 lbs',
    emoji: '🍎',
    stores: [
      { name: 'Walmart', price: 38.99, icon: '✦', color: '#0071CE', best: true },
      { name: 'Kroger', price: 24.00, icon: '●', color: '#CC0000' },
      { name: 'Safeway', price: 18.00, icon: '◆', color: '#E31837' },
    ],
  },
];

const TIMEOUT_SECONDS = 15;

function PriceDemo() {
  const [optimizing, setOptimizing] = useState(true);
  const [progress, setProgress] = useState(0);

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
      {/* Items */}
      <div className="space-y-4 mb-4">
        {MOCK_ITEMS.map((item) => (
          <div key={item.name} className="flex gap-3">
            {/* Item info */}
            <div className="flex items-center gap-2.5 w-36 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                {item.emoji}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{item.name}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            </div>
            {/* Stores */}
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
            {/* Best price badge */}
            <div className="flex items-start pt-0.5 shrink-0">
              {item.stores.some(s => s.best) && (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full whitespace-nowrap">Best Price ✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: savings + spinner */}
      <div className="flex gap-3 mt-3">
        {/* Savings card */}
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Total Savings</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Current List Cost:</span>
              <span className="font-semibold text-slate-700">$45.20</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>THRFT Optimized Cost:</span>
              <span className="font-bold text-slate-900">$38.99</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 mt-1">
              <span>Instant Savings:</span>
              <span className="font-bold text-emerald-600">$6.21 (15%)</span>
            </div>
          </div>
        </div>

        {/* Optimizing spinner */}
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

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    base44.functions.invoke('createCheckoutSession', { warm: true }).catch(() => {});
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(TIMEOUT_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
    setCountdown(null);
  };

  const handleSubscribe = async () => {
    setError(null);
    setTimedOut(false);
    setLoading(true);
    startCountdown();

    timerRef.current = setTimeout(() => {
      stopCountdown();
      setLoading(false);
      setTimedOut(true);
    }, TIMEOUT_SECONDS * 1000);

    try {
      const returnUrl = window.location.origin + '/Home';
      const res = await base44.functions.invoke('createCheckoutSession', { return_url: returnUrl });
      clearTimeout(timerRef.current);
      stopCountdown();
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
        setLoading(false);
      } else {
        setError('Could not start checkout. Please try again or contact us.');
        setLoading(false);
      }
    } catch (err) {
      clearTimeout(timerRef.current);
      stopCountdown();
      setError('Something went wrong connecting to our payment processor. Please try again or contact us.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl overflow-hidden shadow">
          <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
        </div>
        <span className="text-lg font-bold text-slate-900">THRFT</span>
      </header>

      {/* Main split layout */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* LEFT: Demo */}
        <div>
          <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">Live Price Optimization</p>
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-6">
            See exactly how much<br />you'll save on every trip
          </h2>
          <PriceDemo />
          <p className="text-xs text-slate-400 mt-4 text-center">Live demo — prices updated in real time across 50+ stores</p>
        </div>

        {/* RIGHT: Subscription card */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-8">
            {/* Trial badge */}
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                7-Day Free Trial
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Start saving money today</h1>
            <p className="text-slate-500 text-sm text-center mb-7">
              Try free for 7 days, then just <strong className="text-slate-800">$3.99/month</strong>. Cancel anytime.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-blue-200 gap-2"
              style={{ backgroundColor: '#4181ed' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Opening Stripe… {countdown > 0 ? `(${countdown}s)` : ''}
                </>
              ) : 'Start 7-Day Free Trial →'}
            </Button>

            {/* Error / timeout */}
            {(timedOut || error) && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-left">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      {timedOut ? 'Checkout timed out' : 'Something went wrong'}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {timedOut ? "We couldn't connect to our payment processor in time." : error}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Please try again, or{' '}
                      <Link to="/ContactUs" className="underline font-semibold text-blue-600">contact us</Link>{' '}
                      if the problem persists.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center mt-4">
              No charge for 7 days. Card required to activate trial.
            </p>
            <p className="text-xs text-slate-400 text-center mt-1">
              Having trouble?{' '}
              <Link to="/ContactUs" className="underline text-blue-500 hover:text-blue-700">Contact us</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}