import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Star, AlertCircle } from 'lucide-react';

const FEATURES = [
  'Unlimited Grocery Lists',
  'AI Pricing Optimization Engine — Compare 50+ Stores Instantly',
  'In-Store | Curbside Pickup | Delivery Pricing',
  'Coupon Scanner — Photograph Coupons & Leave The Paper At Home',
  'Grocery Budget Tool — Set Limits & Stay On Track',
  'Price History Tracking',
  'Shopping Mode & Item Check-Off',
];

const TIMEOUT_SECONDS = 15;

export default function Subscribe() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Pre-warm the backend function on page load to avoid cold start delay
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
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
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

    // Set a hard timeout
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
        // Open in new tab to avoid iframe/redirect blocking issues
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

          {/* CTA Button */}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full h-13 rounded-xl text-base font-semibold shadow-lg shadow-blue-200 gap-2"
            style={{ backgroundColor: '#4181ed' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening Stripe… {countdown > 0 ? `(${countdown}s)` : ''}
              </>
            ) : 'Start Free Trial →'}
          </Button>

          {/* Timeout / Error state */}
          {(timedOut || error) && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {timedOut ? 'Checkout timed out' : 'Something went wrong'}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {timedOut
                      ? 'We couldn\'t connect to our payment processor in time.'
                      : error}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Please try again, or{' '}
                    <Link to="/ContactUs" className="underline font-semibold text-blue-600">
                      contact us
                    </Link>{' '}
                    if the problem persists.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">
            No charge for 30 days. Card required to activate trial.
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Having trouble?{' '}
            <Link to="/ContactUs" className="underline text-blue-500 hover:text-blue-700">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}