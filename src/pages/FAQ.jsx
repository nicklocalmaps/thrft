import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const FAQS = [
  {
    q: 'What is THRFT.app?',
    a: 'THRFT.app is your intelligent grocery shopping assistant. It helps you plan, shop, and save on groceries by providing personalized suggestions, price comparisons, and efficient shopping lists—making your grocery trips faster, cheaper, and more enjoyable.',
  },
  {
    q: 'How does THRFT.app work?',
    a: 'Our AI-powered assistant analyzes your shopping habits, preferred brands, and budget to suggest products you might like, compare prices across stores, recommend healthier or more sustainable alternatives, and organize your shopping list for maximum efficiency. All you need to do is tell THRFT what you need—or even just what\'s in your fridge—and we\'ll handle the rest.',
  },
  {
    q: 'Can THRFT.app help me save money?',
    a: 'Absolutely! THRFT identifies deals, discounts, and lower-cost alternatives while still matching your preferences. Think of us as your personal shopping strategist.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'Creating an account lets you save your preferences, shopping lists, and favorite stores. You can still explore the app without an account, but the experience is more tailored when you sign up.',
  },
  {
    q: 'Which stores does THRFT.app support?',
    a: 'THRFT works with over 50 major grocery chains, local stores, and delivery services (we\'re constantly adding more!). Check our app for a full, up-to-date list of supported stores in your area.',
  },
  {
    q: 'Is my data safe with THRFT.app?',
    a: 'Your privacy is our priority. All personal information is encrypted and never shared with third parties without your consent. You control what data you share with the app.',
  },
  {
    q: 'How do I get started?',
    a: 'Sign up for a free account at THRFT.app. Set up your preferences and favorite stores. Start planning your grocery list, or let THRFT suggest what to buy. Enjoy smarter, faster, and cheaper grocery shopping!',
  },
  {
    q: 'Who can I contact for support?',
    a: 'If you have questions or need help, email us at support@thrft.app. Our team loves helping users save time and money!',
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {faq.a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-slate-900">THRFT</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-500 text-lg">Everything you need to know about THRFT.app</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} faq={faq} />
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-blue-50 rounded-3xl border border-blue-100">
          <p className="text-slate-700 font-semibold mb-2">Still have questions?</p>
          <p className="text-slate-500 text-sm mb-4">Our support team is happy to help.</p>
          <a href="mailto:support@thrft.app" className="text-blue-600 font-semibold hover:underline">support@thrft.app</a>
        </div>
      </div>
    </div>
  );
}