import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Star, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  'Unlimited price comparisons',
  'Unlimited grocery lists',
  'All 50+ stores',
  'In-store, pickup & delivery',
  'Coupon scanner',
  'Budget tracker',
];

export default function FreeTrialModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleSubscribe = async () => {
    setError(null);
    setLoading(true);
    timerRef.current = setTimeout(() => {
      setLoading(false);
      setError('Checkout timed out. Please try again.');
    }, 15000);

    try {
      const returnUrl = window.location.href;
      const res = await base44.functions.invoke('createCheckoutSession', { return_url: returnUrl });
      clearTimeout(timerRef.current);
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
        setLoading(false);
      } else {
        setError('Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      clearTimeout(timerRef.current);
      setError('Something went wrong. Please try again or contact support@thrft.app');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top gradient bar */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #4181ed, #7c3aed)' }} />

          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-4">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> You just saved money! 🎉
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Unlock Full Access</h2>
              <p className="text-slate-500 text-sm">Start your 30-day free trial to keep comparing prices and saving on every grocery trip.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6">
              <div className="flex items-end gap-1 justify-center mb-4">
                <span className="text-4xl font-extrabold text-slate-900">$1.99</span>
                <span className="text-slate-400 mb-1">/month</span>
              </div>
              <ul className="space-y-2">
                {FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-200 gap-2"
              style={{ backgroundColor: '#4181ed' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening Stripe…</> : 'Start Free Trial →'}
            </Button>
            <p className="text-xs text-slate-400 text-center mt-3">No charge for 30 days. Cancel anytime.</p>

            <button onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors">
              Maybe later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}