import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, ShoppingCart, MapPin, List, Zap, Truck, Star, Gift, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PriceOptimizationDemo from '@/components/grocery/PriceOptimizationDemo';
import FreePremiumComparison from '@/components/landing/FreePremiumComparison';

const THRFT_BLUE = '#4181ed';

const STORE_LOGOS = [
  { name: 'Walmart', color: '#0071CE' },
  { name: 'Kroger', color: '#CC0000' },
  { name: 'Whole Foods', color: '#00704A' },
  { name: 'Amazon Fresh', color: '#FF9900' },
  { name: "Trader Joe's", color: '#CC0000' },
  { name: 'Shipt', color: '#E31837' },
];

const PAIN_POINTS = [
  { icon: '📱', text: "You're checking multiple apps" },
  { icon: '📈', text: "Prices change constantly" },
  { icon: '🚚', text: "Delivery fees are hidden" },
  { icon: '❓', text: "You don't know which store is actually cheapest" },
];

const STEPS = [
  { num: '1', title: 'Add Your Grocery List', desc: 'Quickly enter items or reuse saved lists', icon: List },
  { num: '2', title: 'We Compare Every Store', desc: 'In-store, pickup, and delivery prices', icon: Zap },
  { num: '3', title: 'You Get the Best Total Price', desc: 'Shop smarter, save instantly', icon: Check },
];

const FEATURES = [
  { icon: Zap, title: 'Price Comparison Engine', desc: 'Compare multiple stores in seconds' },
  { icon: Truck, title: 'Multi-Fulfillment Pricing', desc: 'In-store • Pickup • Delivery' },
  { icon: MapPin, title: 'Location-Based Results', desc: 'Only stores within your selected radius' },
  { icon: List, title: 'Smart Grocery Lists', desc: 'Save and reuse weekly lists' },
];

const MOCK_STORES = [
  { name: 'Whole Foods', total: 63.40, badge: null },
  { name: 'Kroger', total: 51.20, badge: null },
  { name: 'Walmart', total: 48.90, badge: 'Best Price' },
  { name: 'Amazon Fresh', total: 54.10, badge: null },
  { name: "Trader Joe's", total: 52.75, badge: null },
  { name: 'Shipt', total: 56.30, badge: null },
];

function handleCTA() {
  base44.auth.redirectToLogin(window.location.origin + '/app');
}

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
  const [userCount, setUserCount] = React.useState(11483);

  React.useEffect(() => {
    base44.functions.invoke('getUserCount', {}).then(res => {
      if (res.data?.count) setUserCount(res.data.count);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-slate-900">THRFT</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Pricing</a>
            <Button onClick={handleCTA} className="h-9 rounded-xl px-5 text-sm font-semibold" style={{ backgroundColor: THRFT_BLUE }}>
              Log In
            </Button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-10 pb-16 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fade} initial="hidden" animate="show">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white" />
                  <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">{userCount.toLocaleString()} users saving money</span>
                <span className="text-base">🎉</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 mb-6">
              <p className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <Star className="w-4 h-4 fill-blue-500 shrink-0" />
                Compare prices across all grocery stores
              </p>
              <p className="text-blue-600 font-semibold text-sm">In-Store | Curbside Pickup | Delivery</p>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
              Stop Overpaying<br className="hidden sm:block" /> for Groceries
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto mb-10">
              One list. Every store. Instantly find the lowest price across nearby grocery stores.
            </p>

            {/* Explainer Video */}
            <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-blue-100 border border-slate-100 mb-2 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://drive.google.com/file/d/1SWScR4QiONWOYQsZjxpz54GbG6jL1tLY/preview"
                title="How THRFT Works"
                frameBorder="0"
                allow="autoplay"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-slate-400 mb-6">See how THRFT works in 60 seconds</p>

            {/* CTA below video */}
            <div className="text-center mb-2">
              <Button onClick={handleCTA} className="h-13 px-10 text-base font-bold rounded-2xl shadow-lg shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
                Create Your Free Account →
              </Button>
              <p className="text-xs text-slate-400 mt-3">Free to join. 7-day free trial included.</p>
            </div>
          </motion.div>

          {/* Mock UI Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 p-6">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-4">Price Comparison</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MOCK_STORES.map((store) => (
                  <div key={store.name} className={`relative rounded-2xl border p-4 text-center ${store.badge ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-100' : 'border-slate-100 bg-slate-50'}`}>
                    {store.badge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: THRFT_BLUE, color: 'white' }}>
                        Best Price
                      </span>
                    )}
                    <p className="text-xs text-slate-500 font-medium mb-1">{store.name}</p>
                    <p className={`text-xl font-extrabold ${store.badge ? 'text-blue-600' : 'text-slate-700'}`}>${store.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trust logos */}
          <div className="flex flex-col items-center mt-10 gap-2">
            <div className="flex items-center justify-center gap-5 flex-wrap">
              {STORE_LOGOS.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                  <span className="w-3 h-3 rounded-full shrink-0 inline-block" style={{ backgroundColor: s.color }} />
                  {s.name}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">In-Store | Curbside Pickup | Delivery</p>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM */}
      <section className="py-20 px-5 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Grocery Shopping Is Broken</h2>
          <p className="text-slate-400 mb-12 text-lg">You're overpaying—every single trip.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {PAIN_POINTS.map((p) => (
              <div key={p.text} className="flex items-start gap-4 bg-slate-800 rounded-2xl px-5 py-4">
                <span className="text-2xl">{p.icon}</span>
                <p className="text-slate-200 font-medium">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 inline-flex items-center gap-2 bg-red-900/40 border border-red-700/50 text-red-300 rounded-2xl px-6 py-3 text-sm font-semibold">
            ❌ The result? You're leaving money on the table every time you shop.
          </div>
        </div>
      </section>

      {/* 3. SOLUTION */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Meet THRFT: Your Intelligent Grocery Assistant</h2>
          <p className="text-slate-500 text-lg mb-14">Three simple steps to smarter shopping.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex flex-col items-center text-center p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white font-extrabold text-lg shadow-lg" style={{ backgroundColor: THRFT_BLUE }}>
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE PRICE OPTIMIZATION DEMO */}
      <section className="py-20 px-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-3">Live Price Optimization</p>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                See exactly how much<br />you'll save on every trip
              </h2>
              <p className="text-slate-500 text-lg mb-6">THRFT compares 50+ stores in seconds and shows you the cheapest option for your entire list — in-store, pickup, or delivery.</p>
              <Button onClick={handleCTA} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
                Create Your Free Account →
              </Button>
              <p className="text-xs text-slate-400 mt-3">No charge for 7 days. Cancel anytime.</p>
            </div>
            <div>
              <PriceOptimizationDemo />
              <p className="text-xs text-slate-400 mt-3 text-center">Live demo — prices updated in real time across 50+ stores</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEMO */}

      <section className="py-20 px-5 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">See Price Differences Instantly</h2>
          <p className="text-slate-500 text-lg mb-12">Same list. Different totals. Your savings = the difference.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {MOCK_STORES.map((store) => (
              <div key={store.name} className={`relative rounded-2xl border p-5 text-center ${store.badge ? 'border-blue-300 bg-white shadow-xl shadow-blue-100 scale-105' : 'border-slate-100 bg-white'}`}>
                {store.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: THRFT_BLUE, color: 'white' }}>
                    🏆 Best Price
                  </span>
                )}
                <p className="text-sm text-slate-500 font-semibold mb-2">{store.name}</p>
                <p className={`text-2xl font-extrabold ${store.badge ? 'text-blue-600' : 'text-slate-700'}`}>${store.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <p className="text-emerald-600 font-bold text-lg">You could save up to $14.50 on this trip alone 💚</p>
        </div>
      </section>

      {/* 5. FEATURES */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-12">Everything You Need to Save More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4 p-6 rounded-2xl border border-slate-100 bg-slate-50 text-left">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e8f0fd' }}>
                    <Icon className="w-5 h-5" style={{ color: THRFT_BLUE }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                    <p className="text-slate-500 text-sm">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SAVINGS */}
      <section className="py-20 px-5 bg-emerald-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">How Much Are You Overpaying?</h2>
          <p className="text-slate-500 text-lg mb-10">Save $20–$100+ per month. One trip can cover your subscription.</p>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 mb-10 text-left max-w-sm mx-auto">
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-4">Example Cart</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Store A</span>
                <span className="font-semibold text-slate-700 line-through">$63.40</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 font-bold">Store B</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: THRFT_BLUE }}>Best Price</span>
                </div>
                <span className="font-extrabold text-blue-600 text-lg">$48.90</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
              <span className="text-emerald-600 font-bold">Your savings</span>
              <span className="text-emerald-600 font-extrabold text-xl">$14.50</span>
            </div>
          </div>
          <Button onClick={handleCTA} className="h-14 px-10 text-base font-bold rounded-2xl shadow-lg shadow-emerald-200" style={{ backgroundColor: THRFT_BLUE }}>
            See Your Savings Now
          </Button>
        </div>
      </section>

      {/* FREE VS PREMIUM COMPARISON */}
      <FreePremiumComparison onCTA={handleCTA} />

      {/* 7. PRICING */}
      <section id="pricing" className="py-20 px-5 bg-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Simple, Affordable Pricing</h2>
          <p className="text-slate-500 text-lg mb-10">Start free. Cancel anytime.</p>
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-xl shadow-blue-100 p-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 7-Day Free Trial
            </div>
            <div className="mb-6">
              <p className="text-5xl font-extrabold text-slate-900">$3.99<span className="text-xl font-semibold text-slate-400">/mo</span></p>
              <p className="text-sm text-slate-400 mt-1">after your free trial</p>
            </div>
            <ul className="space-y-3 text-left mb-8">
              {['Unlimited price comparisons', 'Unlimited grocery lists', 'Full store access', 'In-store, pickup & delivery', 'Coupon scanner', 'Budget tracker'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button onClick={handleCTA} className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
              Start 7-Day Free Trial
            </Button>
            <p className="text-xs text-slate-400 mt-3">No charge for 7 days. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* 8. REFERRAL */}
      <section className="py-20 px-5 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-5">
            <Gift className="w-7 h-7 text-purple-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Get Free Groceries Just by Sharing</h2>
          <p className="text-slate-500 text-lg mb-8">Invite friends and earn free months, grocery coupons, and bonus rewards.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-purple-100 px-5 py-3 text-sm font-medium text-slate-700">🎁 Free months of THRFT</div>
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-purple-100 px-5 py-3 text-sm font-medium text-slate-700">🏷️ Grocery coupons</div>
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-purple-100 px-5 py-3 text-sm font-medium text-slate-700">⭐ Bonus rewards</div>
          </div>
          <Button onClick={handleCTA} className="h-12 px-8 rounded-xl font-bold text-white" style={{ backgroundColor: '#7c3aed' }}>
            Start Earning Rewards
          </Button>
        </div>
      </section>

      {/* 9. SOCIAL PROOF */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">People Are Saving Every Week</h2>
          <p className="text-slate-500 text-lg mb-10">Join thousands of smart shoppers already using THRFT.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { quote: '"Saved $40 on my first trip. I was shocked at the price difference between stores!"', name: 'Sarah M.', location: 'Columbus, OH' },
              { quote: '"I never realized how much I was overpaying. THRFT paid for itself instantly."', name: 'James T.', location: 'Madison, WI' },
              { quote: '"The delivery fee comparison alone is worth it. So many hidden costs exposed!"', name: 'Maria L.', location: 'San Diego, CA' },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-left">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-slate-700 text-sm mb-4 italic">{t.quote}</p>
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="py-24 px-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-extrabold mb-4">Stop Guessing. Start Saving.</h2>
          <p className="text-blue-200 text-xl mb-10">Your grocery bill—optimized.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleCTA} className="h-14 px-10 text-base font-bold rounded-2xl bg-white text-blue-700 border-2 border-white/80 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
              Start Saving Now
            </Button>
            <Button onClick={handleCTA} className="h-14 px-10 text-base font-bold rounded-2xl bg-white text-blue-700 border-2 border-white/80 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
              Create Your Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-bold text-lg">THRFT</span>
            </div>
            <nav className="flex flex-wrap gap-5 text-sm justify-center">
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <button onClick={handleCTA} className="hover:text-white transition-colors">Features</button>
              <Link to="/FAQ" className="hover:text-white transition-colors">FAQ</Link>
              <a href="mailto:support@thrft.app" className="hover:text-white transition-colors">Contact</a>
            </nav>
            <div className="flex gap-4 text-sm">
              <Link to="/Terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/Privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} THRFT. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}