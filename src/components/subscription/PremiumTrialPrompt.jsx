import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Star, Zap, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const THRFT_BLUE = '#4181ed';

export default function PremiumTrialPrompt({ onClose }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const returnUrl = window.location.origin + '/Home';
    const res = await base44.functions.invoke('createCheckoutSession', { return_url: returnUrl });
    if (res.data?.url) window.open(res.data.url, '_blank');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500">
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Star className="w-7 h-7 text-blue-500" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 text-center mb-2">Unlock Premium — Free for 7 Days</h2>
        <p className="text-sm text-slate-500 text-center mb-5">
          You're comparing prices — nice! Premium unlocks even more savings.
        </p>

        <div className="bg-blue-50 rounded-2xl p-4 mb-5 space-y-2">
          {[
            'Unlimited grocery lists',
            '50+ stores to compare',
            'Curbside & delivery pricing',
            'Coupon scanner',
            'Full budget tools + price history',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
              <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 rounded-xl font-bold text-base gap-2 shadow-lg shadow-blue-200"
          style={{ backgroundColor: THRFT_BLUE }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Free Trial →'}
        </Button>
        <p className="text-xs text-slate-400 text-center mt-2">No charge for 7 days. $3.99/mo after. Cancel anytime.</p>

        <button onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600 mt-3 underline">
          No thanks, stay on free plan
        </button>
      </div>
    </div>
  );
}