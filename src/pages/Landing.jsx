import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Star, Users, Scan, TrendingDown, Truck, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import FreePremiumComparison from '@/components/landing/FreePremiumComparison';
import HookCards from '@/components/landing/HookCards';
import DeliveryAppsSection from '@/components/landing/DeliveryAppsSection';
import PriceOptimizationDemo from '@/components/grocery/PriceOptimizationDemo';

const THRFT_BLUE = '#4181ed';

const STORE_LOGOS = [
  { name: 'Walmart', color: '#0071CE' },
  { name: 'Kroger', color: '#CC0000' },
  { name: 'Whole Foods', color: '#00704A' },
  { name: 'Amazon Fresh', color: '#FF9900' },
  { name: "Trader Joe's", color: '#CC0000' },
  { name: 'Instacart', color: '#43B02A' },
];

const STEPS = [
  { num: '1', title: 'Create Your Grocery List', desc: 'Enter items or reuse a saved list in seconds' },
  { num: '2', title: 'We Compare Every Store', desc: 'In-store, pickup & delivery — all at once' },
  { num: '3', title: 'Shop Smarter, Save Instantly', desc: 'Know your total before you ever leave home' },
];

const TESTIMONIALS = [
  { quote: '"Saved $40 on my first trip. I was shocked at the price difference between stores!"', name: 'Sarah M.', location: 'Columbus, OH' },
  { quote: '"The budget tool alone is worth it — I finally know what I\'ll spend before I go."', name: 'James T.', location: 'Madison, WI' },
  { quote: '"The coupon scanner is genius. I just show my phone at checkout. No more paper coupons!"', name: 'Maria L.', location: 'San Diego, CA' },
];

function handleCTA() {
  base44.auth.redirectToLogin(window.location.origin + '/app');
}

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Landing() {
  const [userCount, setUserCount] = React.useState(217);

  React.useEffect(() => {
    base44.functions.invoke('getUserCount', {}).then(res => {
      if (res.data?.count) setUserCount(Math.floor(res.data.count / 100) * 100);
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
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">Pricing</a>
            <Button onClick={handleCTA} className="h-10 rounded-xl px-6 text-sm font-semibold whitespace-nowrap" style={{ backgroundColor: THRFT_BLUE }}>
              Free Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-12 pb-16 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fade} initial="hidden" animate="show">
            <div className="flex justify-center mb-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="text-base">⭐</span>
                <span className="text-sm font-semibold text-slate-700">Avg. family saves $47/week</span>
              </div>
            </div>

            <div className="flex flex-col items-center mb-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
                Your grocery list, done in 15 minutes.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed mb-4">
                THRFT handles the 80% you buy every week — automatically finding the lowest price across 50+ stores before you leave home.
              </p>
            </div>

            {/* Explainer Video */}
            <div className="mt-2 mb-8 max-w-2xl mx-auto w-full">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-100 border border-slate-100 aspect-video">
                <video className="w-full h-full object-cover" controls playsInline preload="metadata">
                  <source src="https://res.cloudinary.com/dqjd0eg05/video/upload/v1777315911/THRFT.Whiteboard.Explainer.Video.2_k3qxqm.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <img
                src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/2736b1685_image7.jpg"
                alt="THRFT compares grocery prices across 50+ stores"
                className="w-full rounded-3xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button onClick={handleCTA} className="h-14 px-10 text-base font-bold rounded-2xl shadow-lg shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
                Get started free — no card needed →
              </Button>
            </div>
            <p className="text-xs text-slate-400">Takes 60 seconds · Free forever plan included</p>
          </motion.div>

          {/* Store logos */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-10">
            {STORE_LOGOS.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                <span className="w-3 h-3 rounded-full shrink-0 inline-block" style={{ backgroundColor: s.color }} />
                {s.name}
              </div>
            ))}
            <span className="text-sm text-slate-400">+ 44 more stores</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-5 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Simple as 1-2-3</h2>
          <p className="text-slate-500 text-lg mb-14">No learning curve. Start saving on your very first trip.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center p-6 rounded-3xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white font-extrabold text-lg shadow-lg" style={{ backgroundColor: THRFT_BLUE }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button onClick={handleCTA} className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
              Get Started Free →
            </Button>
          </div>
        </div>
      </section>

      {/* HOOK CARDS */}
      <section id="features" className="pt-8 pb-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Everything Your Family Needs to Save More</h2>
            <p className="text-slate-500 text-lg">Four powerful tools. One simple app.</p>
          </div>
          <HookCards onCTA={handleCTA} />
        </div>
      </section>

      {/* PRICE OPTIMIZATION ENGINE */}
      <section className="pt-8 pb-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: THRFT_BLUE }}>Live Price Optimization Engine</p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
                See exactly how much<br className="hidden sm:block" /> you'll save on every trip
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                THRFT compares 50+ stores in seconds and shows you the cheapest option for your entire list — in-store, pickup, or delivery.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <PriceOptimizationDemo />
              <p className="text-2xl font-bold text-slate-700 text-center mt-3">Now Imagine What You'll Save On Your Weekly Shopping List!</p>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY APPS */}
      <DeliveryAppsSection onCTA={handleCTA} />

      {/* FREE VS PREMIUM */}
      <FreePremiumComparison onCTA={handleCTA} />

      {/* SOCIAL PROOF */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Families Are Saving Every Week</h2>
          <p className="text-slate-500 text-lg mb-10">Join {userCount.toLocaleString()}+ users already saving with THRFT.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
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

      {/* PRICING */}
      <section id="pricing" className="py-20 px-5 bg-white">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Simple, Affordable Pricing</h2>
          <p className="text-slate-500 text-lg mb-10">Start free. Upgrade when you're ready.</p>

          {/* Free plan */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-5 text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base font-bold text-emerald-800">Free forever</p>
              <span className="text-xs font-semibold bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full">Start here</span>
            </div>
            <p className="text-sm text-emerald-700 mb-4 leading-relaxed">
              Walmart, Kroger, Amazon Fresh + 50 more stores · up to 5 lists/month · no card, no catch
            </p>
            <Button onClick={handleCTA} className="w-full h-12 rounded-xl text-sm font-bold" style={{ backgroundColor: '#16a34a' }}>
              Get Started Free
            </Button>
          </div>

          {/* Premium card */}
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-xl shadow-blue-100 p-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Try free for 7 days
            </div>
            <div className="mb-6">
              <p className="text-5xl font-extrabold text-slate-900">$3.99<span className="text-xl font-semibold text-slate-400">/mo</span></p>
              <p className="text-sm text-slate-400 mt-1">then just $3.99/month — cancel anytime</p>
            </div>
            <ul className="space-y-3 text-left mb-8">
              {['Everything in free, plus:', 'Unlimited lists · 50+ stores nationwide', 'In-store, pickup & delivery pricing', 'Coupon scanner + budget tracker', 'Shared family lists (up to 5)', 'Price history + AI smart suggestions'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button onClick={handleCTA} className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-blue-200" style={{ backgroundColor: THRFT_BLUE }}>
              Start 7-Day Premium Free Trial →
            </Button>
            <p className="text-xs text-slate-400 mt-3">No charge today · Cancel in one tap · No questions asked</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-extrabold mb-4">Stop Guessing. Start Saving.</h2>
          <p className="text-blue-200 text-xl mb-10">Your family's grocery budget — finally under control.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleCTA} className="h-14 px-10 text-base font-bold rounded-2xl bg-white text-blue-700 hover:bg-blue-50 transition-all">
              Get Started Free
            </Button>
            <Button onClick={handleCTA} className="h-14 px-10 text-base font-bold rounded-2xl bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 transition-all">
              Start 7-Day Premium Free Trial →
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
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