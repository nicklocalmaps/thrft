import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Star, AlertCircle, Users } from 'lucide-react';
import PriceOptimizationDemo from '@/components/grocery/PriceOptimizationDemo';

const FEATURES = [
  'Unlimited Grocery Lists',
  'AI Pricing Optimization Engine — Compare 50+ Stores Instantly',
  'In-Store, Curbside Pickup & Delivery Pricing',
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
          <PriceOptimizationDemo />
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

            {/* Family plan CTA */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <Link to="/FamilyInvite">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Family Plan — $6.99/mo</p>
                    <p className="text-xs text-slate-500">5 accounts · All premium features · 7-day trial</p>
                  </div>
                  <span className="text-xs font-semibold text-purple-600">View →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}