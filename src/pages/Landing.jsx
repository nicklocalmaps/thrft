import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import {
  TrendingDown,
  Clock,
  Users,
  Camera,
  Check,
  Star,
  ChevronRight,
  Play,
} from 'lucide-react';
import PriceOptimizationDemo from '@/components/grocery/PriceOptimizationDemo';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';
const THRFT_DARK = '#1e3a5f';

const VIDEO_URL =
  'https://res.cloudinary.com/dqjd0eg05/video/upload/v1777315911/THRFT.Whiteboard.Explainer.Video.2_k3qxqm.mp4';

const STORE_PRICES = [
  { name: 'Walmart', price: 48.9, color: '#0071CE', best: true },
  { name: 'Kroger', price: 54.2, color: '#CC0000', best: false },
  { name: 'Whole Foods', price: 63.4, color: '#00704A', best: false },
];

const STEPS = [
  {
    num: '1',
    title: 'Add your grocery list',
    desc: 'Type items or pick from our catalog of thousands of products',
  },
  {
    num: '2',
    title: 'We compare every store',
    desc: 'In-store, pickup, and delivery — all at once, across 50+ stores near you',
  },
  {
    num: '3',
    title: 'Shop smarter, save instantly',
    desc: 'Know your total before you ever leave home',
  },
];

const FEATURES = [
  {
    icon: TrendingDown,
    title: 'Price comparison',
    desc: '50+ stores side-by-side',
    bg: '#eff6ff',
    iconBg: '#dbeafe',
    iconColor: '#1d4ed8',
    titleColor: '#1e3a8a',
    descColor: '#1d4ed8',
  },
  {
    icon: Clock,
    title: 'Budget tracker',
    desc: 'Know your total before you go',
    bg: '#f0fdf4',
    iconBg: '#dcfce7',
    iconColor: '#15803d',
    titleColor: '#14532d',
    descColor: '#15803d',
  },
  {
    icon: Users,
    title: 'Family lists',
    desc: 'Share with up to 5 members',
    bg: '#faf5ff',
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    titleColor: '#3b0764',
    descColor: '#7c3aed',
  },
  {
    icon: Camera,
    title: 'Coupon scanner',
    desc: 'Go paperless at checkout',
    bg: '#fffbeb',
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    titleColor: '#451a03',
    descColor: '#b45309',
  },
];

const PREMIUM_FEATURES = [
  'Unlimited price comparisons',
  '50+ stores nationwide',
  'In-store, pickup & delivery pricing',
  'Coupon scanner + budget tracker',
  'Shared family lists (up to 5)',
  'Price history tracking',
  'AI smart suggestions',
];

const TESTIMONIALS = [
  {
    quote: 'Saved $40 on my first trip. I was shocked at the price difference between stores!',
    name: 'Sarah M.',
    location: 'Columbus, OH',
  },
  {
    quote: "The budget tool alone is worth it — I finally know what I'll spend before I go.",
    name: 'James T.',
    location: 'Madison, WI',
  },
  {
    quote: 'The coupon scanner is genius. I just show my phone at checkout. No more paper coupons!',
    name: 'Maria L.',
    location: 'San Diego, CA',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleCTA() {
  base44.auth.redirectToLogin(window.location.origin + '/app');
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FadeSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StarRow() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
      </div>
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  );
}

// Animated price comparison widget used in the hero
function HeroPriceWidget() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Example · weekly cart
      </p>
      <div className="space-y-1.5 mb-3">
        {STORE_PRICES.map((store, i) => (
          <motion.div
            key={store.name}
            initial={{ opacity: 0, x: -12 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 + i * 0.12, duration: 0.4, ease: 'easeOut' }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl ${
              store.best ? 'bg-emerald-50' : 'bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: store.color }}
              />
              <span
                className={`text-sm font-medium ${
                  store.best ? 'text-emerald-800' : 'text-slate-600'
                }`}
              >
                {store.name}
              </span>
              {store.best && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                  Best price
                </span>
              )}
            </div>
            <span
              className={`text-sm font-semibold ${
                store.best ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              ${store.price.toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ delay: 1.0, duration: 0.4 }}
        className="border-t border-slate-100 pt-3 flex items-center justify-between"
      >
        <span className="text-xs text-slate-400">You save vs. highest</span>
        <span className="text-sm font-bold text-emerald-600">$14.50</span>
      </motion.div>
    </div>
  );
}

// Video player with poster overlay
function VideoPlayer() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video w-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls={playing}
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {!playing && (
        <motion.button
          onClick={handlePlay}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/40 hover:bg-slate-900/50 transition-colors"
          aria-label="Play video"
        >
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 fill-current" style={{ color: THRFT_BLUE }} />
          </div>
          <span className="text-white text-sm font-medium">See how it works</span>
        </motion.button>
      )}

      {/* Label badge top-left */}
      {!playing && (
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
          <span className="text-white text-xs font-medium">2 min explainer</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Landing() {
  const [userCount, setUserCount] = useState(217);

  useEffect(() => {
    base44.functions
      .invoke('getUserCount', {})
      .then((res) => {
        if (res.data?.count) setUserCount(res.data.count);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm">
              <img
                src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg"
                alt="THRFT"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">THRFT</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#features"
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block px-3 py-1.5"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block px-3 py-1.5"
            >
              Pricing
            </a>
            <Button
              onClick={handleCTA}
              className="h-9 rounded-xl px-5 text-sm font-semibold"
              style={{ backgroundColor: THRFT_BLUE }}
            >
              Sign up free
            </Button>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-0"
        style={{ background: `linear-gradient(180deg, ${THRFT_BLUE} 0%, #3672d4 100%)` }}
      >
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-0">
          {/* Social pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2">
              <div className="flex">
                {['#a5f3c0', '#fde68a', '#c4b5fd'].map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: c, marginLeft: i > 0 ? -6 : 0 }}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-900 font-medium">
                {userCount.toLocaleString()} Families Saving Money
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-center mb-4"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
              Stop Overpaying
              <br />
              For Groceries
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-md mx-auto leading-relaxed">
              Compare 50+ stores in seconds. Know your total before you leave home.
            </p>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-5 px-2"
          >
            <VideoPlayer />
          </motion.div>

          {/* Price widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="max-w-sm mx-auto mb-6 px-2"
          >
            <HeroPriceWidget />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="max-w-sm mx-auto px-2 pb-10"
          >
            <button
              onClick={handleCTA}
              className="w-full py-4 rounded-2xl text-base font-bold text-blue-700 bg-white hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg mb-2.5"
            >
              Create Free Account
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-center text-xs text-white/50">
              No credit card required · Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 2: SOCIAL PROOF ──────────────────────────────────────────── */}
      <FadeSection>
        <div className="border-b border-slate-100">
          {/* Stat strip */}
          <div className="max-w-5xl mx-auto px-5 grid grid-cols-4 divide-x divide-slate-100 py-4">
            {[
              { value: `${userCount.toLocaleString()}+`, label: 'users' },
              { value: '4.9', label: 'rating', stars: true },
              { value: '50+', label: 'stores' },
              { value: '$3.99', label: '/month' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-1 px-2">
                {stat.stars ? (
                  <>
                    <StarRow />
                    <span className="text-xs text-slate-400 mt-1">{stat.value} rating</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                    <span className="text-xs text-slate-400">{stat.label}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Testimonial strip */}
          <div className="bg-slate-50 border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-6 space-y-3 sm:space-y-0">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="flex flex-col gap-1.5">
                  <StarRow />
                  <p className="text-sm text-slate-600 italic leading-relaxed">"{t.quote}"</p>
                  <p className="text-xs text-slate-400 font-medium">
                    — {t.name}, {t.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── SECTION 2b: PRICE OPTIMIZATION ENGINE ───────────────────────────── */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left: copy */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: THRFT_BLUE }}>
                  Live Price Optimization Engine
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                  See exactly how much<br className="hidden sm:block" /> you'll save on every trip
                </h2>
                <p className="text-lg text-slate-500 mb-8">
                  THRFT compares 50+ stores in seconds and shows you the cheapest option for your entire list — in-store, pickup, or delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button
                    onClick={handleCTA}
                    className="h-12 px-8 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: THRFT_BLUE }}
                  >
                    Create Your Free Account →
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">No Charge For 7 Days. Cancel Anytime.</p>
              </div>
              {/* Right: demo */}
              <div className="flex-1 w-full max-w-md">
                <PriceOptimizationDemo />
                <p className="text-xl font-bold text-slate-700 text-center mt-4">
                  Now Imagine What You'll Save On Your Weekly Shopping List!
                </p>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeSection>
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
                Simple as 1-2-3
              </h2>
              <p className="text-slate-500">Start saving on your very first trip.</p>
            </div>
          </FadeSection>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="space-y-6"
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="flex items-start gap-5 p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md"
                  style={{ backgroundColor: THRFT_BLUE }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <FadeSection className="mt-8">
            <Button
              onClick={handleCTA}
              className="h-12 px-8 rounded-xl font-bold shadow-md shadow-blue-100"
              style={{ backgroundColor: THRFT_BLUE }}
            >
              Get started free →
            </Button>
          </FadeSection>
        </div>
      </section>

      {/* ── SECTION 4: FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-5 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
                Everything you need
              </h2>
              <p className="text-slate-500">Four tools. One simple app.</p>
            </div>
          </FadeSection>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{ backgroundColor: f.bg }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: f.iconBg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.iconColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: f.titleColor }}>
                      {f.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: f.descColor }}>
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 5: PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 px-5 bg-white">
        <div className="max-w-md mx-auto">
          <FadeSection>
            <div className="mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
                Simple pricing
              </h2>
              <p className="text-slate-500">Start free. Upgrade when you're ready.</p>
            </div>
          </FadeSection>

          <FadeSection delay={0.1}>
            {/* Premium card */}
            <div
              className="rounded-3xl overflow-hidden mb-4"
              style={{ border: `2px solid ${THRFT_BLUE}` }}
            >
              {/* Card header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ backgroundColor: THRFT_BLUE }}
              >
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">$3.99</span>
                    <span className="text-base text-white/70">/mo</span>
                  </div>
                  <p className="text-xs text-white/65 mt-0.5">after 7-day free trial</p>
                </div>
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-full">
                  Premium
                </span>
              </div>

              {/* Features list */}
              <div className="px-6 py-5 bg-white space-y-3">
                {PREMIUM_FEATURES.map((feat) => (
                  <CheckItem key={feat} text={feat} />
                ))}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6 bg-white space-y-3">
                <Button
                  onClick={handleCTA}
                  className="w-full h-12 rounded-xl text-sm font-bold shadow-md shadow-blue-100"
                  style={{ backgroundColor: THRFT_BLUE }}
                >
                  Start 7-day free trial
                </Button>
                <Button
                  onClick={handleCTA}
                  variant="outline"
                  className="w-full h-11 rounded-xl text-sm font-medium border-slate-200 text-slate-600"
                >
                  Create free account instead
                </Button>
                <p className="text-center text-xs text-slate-400">
                  No charge for 7 days · Cancel anytime
                </p>
              </div>
            </div>

            {/* Free tier note */}
            <div className="text-center text-sm text-slate-500 bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
              <p>
                <span className="font-semibold text-slate-700">Free plan</span> includes Walmart,
                Kroger & Amazon Fresh — up to 5 lists/month. No card needed.
              </p>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── SECTION 6: FINAL CTA ─────────────────────────────────────────────── */}
      <section
        className="py-20 px-5 text-white text-center"
        style={{ backgroundColor: THRFT_DARK }}
      >
        <FadeSection>
          <div className="max-w-md mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Stop guessing.
              <br />
              Start saving.
            </h2>
            <p className="text-white/60 text-base mb-8 leading-relaxed">
              Your family's grocery budget — finally under control.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleCTA}
                className="w-full h-14 rounded-2xl text-base font-bold text-blue-800 bg-white hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                Create free account →
              </button>
              <button
                onClick={handleCTA}
                className="w-full h-12 rounded-2xl text-sm font-medium text-white border border-white/25 bg-white/10 hover:bg-white/15 transition-colors"
              >
                Start 7-day free trial
              </button>
            </div>
          </div>
        </FadeSection>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden">
                <img
                  src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg"
                  alt="THRFT"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-bold text-base">THRFT</span>
            </div>
            <nav className="flex flex-wrap gap-5 text-sm justify-center">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <Link to="/FAQ" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <a href="mailto:support@thrft.app" className="hover:text-white transition-colors">
                Contact
              </a>
            </nav>
            <div className="flex gap-4 text-sm">
              <Link to="/Terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/Privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/Refund" className="hover:text-white transition-colors">
                Refund
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} THRFT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}