import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Users, Star } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';
const THRFT_DARK = '#1e3a5f';
const THRFT_LOGO = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';

const PREMIUM_FEATURES = [
  'Unlimited grocery lists',
  '50+ stores nationwide',
  'In-store, pickup & delivery pricing',
  'Coupon scanner',
  'Budget tracker',
  'Price history tracking',
  'Shopping mode & item check-off',
  'AI smart suggestions',
];

const FREE_FEATURES = [
  '5 lists per month',
  'Walmart, Kroger & Amazon Fresh',
  'Basic budget tracker',
];

const FAQS = [
  {
    q: 'Will I be charged today?',
    a: "No. Your 7-day trial starts today and your card is charged on day 8. We'll send you a reminder on day 5 so you're never surprised.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel from your profile page at any time, no questions asked. If you cancel before day 8, you pay nothing.',
  },
  {
    q: 'Can I switch between plans?',
    a: 'Yes. Upgrade from Individual to Family or downgrade at any time. Changes take effect immediately.',
  },
  {
    q: 'What stores do you support?',
    a: '50+ stores including Walmart, Kroger, Whole Foods, Aldi, Target, Publix, Meijer, H-E-B, and more — with new stores added regularly.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. We use Stripe for all payments — your card details are never stored on our servers.',
  },
];

const STATS = [
  { value: '$14',  label: 'avg saved/trip'  },
  { value: '50+',  label: 'stores compared' },
  { value: '217+', label: 'families saving'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CheckItem({ text, muted = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${muted ? 'bg-slate-100' : 'bg-emerald-100'}`}>
        <Check className={`w-3 h-3 ${muted ? 'text-slate-400' : 'text-emerald-600'}`} strokeWidth={3} />
      </div>
      <span className={`text-sm ${muted ? 'text-slate-400' : 'text-slate-700'}`}>{text}</span>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-900 pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm">
              <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">THRFT</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">
              Home
            </Link>
            <Link to="/Subscribe">
              <button
                className="h-9 px-4 rounded-xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: THRFT_BLUE }}
              >
                Start free trial
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-5 text-center"
        style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #fff 60%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: THRFT_BLUE }}>
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Pay less for groceries,<br className="hidden sm:block" /> starting today
          </h1>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            Families save an average of <strong className="text-slate-800">$14 per trip</strong>.
            Plans start at $0 — no card needed.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
                <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* ── Premium Individual — FEATURED ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl overflow-hidden relative"
              style={{ border: `2px solid ${THRFT_BLUE}`, boxShadow: '0 12px 40px rgba(65,129,237,.18)' }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: THRFT_BLUE }}
              >
                Most popular
              </div>

              <div
                className="px-6 pt-8 pb-5"
                style={{ background: `linear-gradient(135deg, ${THRFT_BLUE}, #3672d4)` }}
              >
                <p className="text-sm font-semibold text-white/80 mb-1">Premium Individual</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">$3.99</span>
                  <span className="text-base text-white/70">/month</span>
                </div>
                <p className="text-xs text-white/60">after 7-day free trial</p>
              </div>

              <div className="px-6 py-5 bg-white">
                <div className="space-y-3 mb-6">
                  {PREMIUM_FEATURES.map(f => <CheckItem key={f} text={f} />)}
                </div>
                <Link to="/Subscribe">
                  <button
                    className="w-full h-12 rounded-2xl text-sm font-bold text-white uppercase tracking-wide transition-all mb-3"
                    style={{ backgroundColor: THRFT_BLUE, boxShadow: '0 4px 16px rgba(65,129,237,.3)' }}
                  >
                    Start Free Trial →
                  </button>
                </Link>
                <p className="text-xs text-slate-400 text-center">No charge for 7 days · Cancel anytime</p>
              </div>
            </motion.div>

            {/* ── Family Plan ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-3xl overflow-hidden border border-purple-200"
              style={{ background: 'linear-gradient(135deg, #faf5ff, #eff6ff)' }}
            >
              <div className="px-6 pt-7 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Premium Family</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">$6.99</span>
                      <span className="text-sm text-slate-500">/month</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">after 7-day free trial</p>
                  </div>
                  <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full shrink-0">
                    Best value
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2 mb-5">
                  <Users className="w-4 h-4 text-purple-600 shrink-0" />
                  <p className="text-xs text-slate-600 font-medium">Up to 5 accounts · share everything</p>
                </div>

                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Everything in Premium, shared across your whole household. Each person gets their own lists.
                </p>

                <Link to="/FamilyInvite">
                  <button className="w-full h-12 rounded-2xl text-sm font-bold text-white uppercase tracking-wide transition-all mb-3 bg-purple-600 hover:bg-purple-700">
                    Start Family Trial →
                  </button>
                </Link>
                <p className="text-xs text-slate-400 text-center">No charge for 7 days · Cancel anytime</p>
              </div>
            </motion.div>

            {/* ── Free Plan ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-3xl border border-slate-100 bg-white overflow-hidden"
            >
              <div className="px-6 pt-7 pb-5">
                <p className="text-sm font-semibold text-slate-500 mb-1">Free</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-slate-900">$0</span>
                </div>
                <p className="text-xs text-slate-400 mb-5">Forever free · no card needed</p>

                <div className="space-y-3 mb-6">
                  {FREE_FEATURES.map(f => <CheckItem key={f} text={f} muted />)}
                </div>

                <div className="bg-blue-50 rounded-xl p-3 mb-5 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Upgrade to unlock:</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    50+ stores, unlimited lists, coupon scanner, delivery pricing, price history + more
                  </p>
                </div>

                <Link to="/">
                  <button
                    className="w-full h-12 rounded-2xl text-sm font-bold uppercase tracking-wide border-2 transition-all hover:bg-blue-50 mb-3"
                    style={{ borderColor: THRFT_BLUE, color: THRFT_BLUE, background: '#fff' }}
                  >
                    Create Free Account
                  </button>
                </Link>
                <p className="text-xs text-slate-400 text-center">No credit card required</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature comparison ────────────────────────────────────────────── */}
      <section className="py-12 px-5 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">What's included</h2>
          <p className="text-slate-500 text-center mb-8">Every plan starts with a free account. Upgrade when you're ready.</p>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 gap-0 border-b border-slate-100">
              <div className="py-4 px-5 col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Feature</p>
              </div>
              <div className="py-4 px-2 text-center border-l border-slate-100">
                <p className="text-xs font-bold text-slate-400">Free</p>
              </div>
              <div className="py-4 px-2 text-center border-l border-slate-100" style={{ background: '#f0f7ff' }}>
                <p className="text-xs font-bold" style={{ color: THRFT_BLUE }}>Premium</p>
              </div>
            </div>

            {[
              { label: 'Grocery lists',          free: '5/month',  premium: 'Unlimited' },
              { label: 'Stores compared',         free: '3 stores', premium: '50+ stores' },
              { label: 'Shopping methods',        free: 'In-store', premium: 'In-store, Pickup, Delivery' },
              { label: 'Budget tracker',          free: true,       premium: true         },
              { label: 'Coupon scanner',          free: false,      premium: true         },
              { label: 'Price history',           free: false,      premium: true         },
              { label: 'AI smart suggestions',    free: false,      premium: true         },
              { label: 'Family plan (up to 5)',   free: false,      premium: 'Add-on $6.99' },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 gap-0 border-b border-slate-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}
              >
                <div className="py-3.5 px-5 col-span-2 flex items-center">
                  <span className="text-sm text-slate-700">{row.label}</span>
                </div>
                <div className="py-3.5 px-2 flex items-center justify-center border-l border-slate-100">
                  {typeof row.free === 'boolean' ? (
                    row.free
                      ? <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                      : <span className="text-slate-200 text-lg font-light">—</span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium text-center">{row.free}</span>
                  )}
                </div>
                <div className="py-3.5 px-2 flex items-center justify-center border-l border-slate-100" style={{ background: '#f0f7ff' }}>
                  {typeof row.premium === 'boolean' ? (
                    row.premium
                      ? <Check className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                      : <span className="text-slate-200 text-lg font-light">—</span>
                  ) : (
                    <span className="text-xs font-semibold text-center" style={{ color: THRFT_BLUE }}>{row.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">Common questions</h2>
          <p className="text-slate-500 text-center mb-8">Everything you need to know before subscribing.</p>
          <div className="space-y-2">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-5" style={{ backgroundColor: THRFT_DARK }}>
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
            Ready to stop overpaying?
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Join 217+ families shopping smarter with THRFT.
          </p>
          <div className="space-y-3">
            <Link to="/Subscribe">
              <button className="w-full h-14 rounded-2xl text-sm font-bold text-slate-900 bg-white uppercase tracking-wide hover:bg-blue-50 transition-colors">
                Start 7-Day Free Trial →
              </button>
            </Link>
            <Link to="/">
              <button
                className="w-full h-12 rounded-2xl text-sm font-bold uppercase tracking-wide border border-white/25 text-white/80 hover:bg-white/10 transition-colors"
                style={{ background: 'rgba(255,255,255,.1)' }}
              >
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold text-sm">THRFT</span>
          </div>
          <div className="flex gap-5 text-sm">
            <Link to="/FAQ"       className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/Privacy"   className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/Terms"     className="hover:text-white transition-colors">Terms</Link>
            <Link to="/ContactUs" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} THRFT</p>
        </div>
      </footer>
    </div>
  );
}