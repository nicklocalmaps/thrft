import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Star } from 'lucide-react';

const FEATURES = [
  'Unlimited grocery lists',
  'Real-time price comparison across 50+ stores',
  'Kroger live prices',
  'Delivery & pickup cost comparison',
  'Price history tracking',
  'Shopping mode & item checking',
];

export default function Subscribe() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    // Block if running inside iframe (preview mode)
    if (window.self !== window.top) {
      alert('Checkout only works from the published app. Open the app in a new tab to subscribe.');
      return;
    }

    setLoading(true);
    const returnUrl = window.location.origin + '/Home';
    const res = await base44.functions.invoke('createCheckoutSession', { return_url: returnUrl });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert('Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
            <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-slate-900">THRFT</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 p-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            30-Day Free Trial
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Start saving money today</h1>
          <p className="text-slate-500 text-sm mb-6">
            Try free for 30 days, then just <strong className="text-slate-800">$1.99/month</strong>. Cancel anytime.
          </p>

          {/* Features */}
          <ul className="space-y-3 text-left mb-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full h-13 rounded-xl text-base font-semibold shadow-lg shadow-blue-200 gap-2"
            style={{ backgroundColor: '#4181ed' }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-5 h-5 rounded-md object-cover" />
                Start Free Trial
              </>
            )}
          </Button>

          <p className="text-xs text-slate-400 mt-4">
            No charge for 30 days. Card required to activate trial.
          </p>
        </div>
      </div>
    </div>
  );
}