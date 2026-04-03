import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  {
    emoji: '🛒',
    title: 'Create A Grocery List',
    description:
      'Add your weekly items in seconds. Give your list a name, choose how you\'ll shop (in-store, pickup, or delivery), and start adding items — even scan barcodes for branded products.',
  },
  {
    emoji: '🏪',
    title: 'Pick Your Stores',
    description:
      'Select which stores to compare — we support 50+ including Walmart, Kroger, Whole Foods, Shipt & more. We\'ll remember your favorites for every future list.',
  },
  {
    emoji: '💰',
    title: 'Compare Prices',
    description:
      'Hit "Compare Prices" and we\'ll instantly find the best deal across every store you selected — including in-store totals, curbside pickup, and delivery fees.',
  },
  {
    emoji: '🏷️',
    title: 'Scan Coupons',
    description:
      'Photograph your paper coupons and our AI will extract the details automatically. We\'ll match them to items on your list so you never miss a saving.',
  },
  {
    emoji: '📊',
    title: 'Track Your Budget',
    description:
      'Set a spending target for each list. We\'ll show you which store keeps you under budget and flag items to remove if you\'re over.',
  },
];

export default function FeatureTour({ onComplete }) {
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-6 h-2 bg-blue-500' : 'w-2 h-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="px-8 py-6 text-center"
          >
            <div className="text-6xl mb-5">{current.emoji}</div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{current.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{current.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 pb-8 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="gap-1 text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          <span className="text-xs text-slate-400 font-medium">
            {step + 1} / {STEPS.length}
          </span>

          <Button
            size="sm"
            onClick={() => (isLast ? onComplete() : setStep(s => s + 1))}
            className="gap-1 rounded-xl px-5"
            style={{ backgroundColor: '#4181ed' }}
          >
            {isLast ? 'Get Started 🎉' : <>Next <ChevronRight className="w-4 h-4" /></>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}