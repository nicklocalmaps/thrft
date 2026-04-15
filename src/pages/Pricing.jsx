import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, X, Star } from 'lucide-react';

const THRFT_BLUE = '#4181ed';

const TIERS = [
  {
    name: 'Free Account',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'Forever free',
    features: [
      { name: 'Up to 2 grocery lists per month', included: true },
      { name: 'Basic store price comparison', included: true },
      { name: 'Budget tracker', included: true },
      { name: 'Unlimited grocery lists', included: false },
      { name: 'Coupon scanner', included: false },
      { name: 'Curbside & delivery pricing', included: false },
      { name: 'Price history tracking', included: false },
      { name: 'Family plan (up to 5 accounts)', included: false },
      { name: 'AI smart suggestions', included: false },
    ],
    cta: 'Get Started Free',
    ctaHref: '/',
    badge: null,
  },
  {
    name: 'Premium Individual',
    description: 'For individuals and couples',
    price: '$3.99',
    period: '/month',
    features: [
      { name: 'Up to 2 grocery lists per month', included: true },
      { name: 'Basic store price comparison', included: true },
      { name: 'Budget tracker', included: true },
      { name: 'Unlimited grocery lists', included: true },
      { name: 'Coupon scanner', included: true },
      { name: 'Curbside & delivery pricing', included: true },
      { name: 'Price history tracking', included: true },
      { name: 'Family plan (up to 5 accounts)', included: false },
      { name: 'AI smart suggestions', included: true },
    ],
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/Subscribe',
    badge: 'MOST POPULAR',
    badgeBg: 'bg-blue-100',
    badgeColor: 'text-blue-700',
  },
  {
    name: 'Premium Family',
    description: 'For households of 2-5 people',
    price: '$6.99',
    period: '/month',
    features: [
      { name: 'Up to 2 grocery lists per month', included: true },
      { name: 'Basic store price comparison', included: true },
      { name: 'Budget tracker', included: true },
      { name: 'Unlimited grocery lists', included: true },
      { name: 'Coupon scanner', included: true },
      { name: 'Curbside & delivery pricing', included: true },
      { name: 'Price history tracking', included: true },
      { name: 'Family plan (up to 5 accounts)', included: true },
      { name: 'AI smart suggestions', included: true },
    ],
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/FamilyInvite',
    badge: 'BEST VALUE',
    badgeBg: 'bg-emerald-100',
    badgeColor: 'text-emerald-700',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-slate-900">THRFT</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-sm">Back</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-5 bg-gradient-to-br from-blue-50 via-white to-slate-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-500 mb-2">
            Choose the plan that fits your family's needs.
          </p>
          <p className="text-sm text-slate-400">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl border transition-all ${
                  tier.badge
                    ? 'border-blue-200 bg-blue-50/30 shadow-xl shadow-blue-100/50 relative'
                    : 'border-slate-100 bg-white shadow-lg'
                }`}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${tier.badgeBg} ${tier.badgeColor}`}>
                    {tier.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">{tier.description}</p>

                  {/* Pricing */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                      <span className="text-slate-500">{tier.period}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link to={tier.ctaHref} className="w-full block mb-8">
                    <Button
                      className="w-full h-12 rounded-xl text-base font-bold"
                      style={tier.badge ? { backgroundColor: THRFT_BLUE } : undefined}
                      variant={tier.badge ? 'default' : 'outline'}
                    >
                      {tier.cta}
                    </Button>
                  </Link>

                  {/* Features */}
                  <div className="space-y-3 border-t border-slate-200 pt-8">
                    {tier.features.map((feature) => (
                      <div key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={3} />
                        ) : (
                          <X className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={3} />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-5 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-slate-500 mb-12">Have questions? We've got answers.</p>

          <div className="space-y-6 text-left">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-600 text-sm">Yes, absolutely. Cancel your subscription anytime from your profile—no questions asked.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">What's included in the 7-day free trial?</h3>
              <p className="text-slate-600 text-sm">Full access to all Premium features. After 7 days, your card will be charged unless you cancel.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Can I switch plans anytime?</h3>
              <p className="text-slate-600 text-sm">Yes! Upgrade or downgrade between Individual and Family plans anytime. Changes take effect immediately.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Is my payment information secure?</h3>
              <p className="text-slate-600 text-sm">We use industry-standard encryption and never store your card details. All payments are processed securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Ready to save on groceries?</h2>
          <p className="text-blue-200 text-lg mb-8">Join thousands of families already shopping smarter with THRFT.</p>
          <Link to="/Subscribe">
            <Button className="h-13 px-10 text-base font-bold rounded-2xl bg-white text-blue-600 hover:bg-blue-50">
              Start Your Free Trial →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-5">
        <div className="max-w-5xl mx-auto text-center text-sm">
          <p>© {new Date().getFullYear()} THRFT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}