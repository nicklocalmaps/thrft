import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Users, PiggyBank, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THRFT_BLUE = '#4181ed';

const HOOKS = [
  {
    icon: TrendingDown,
    color: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: 'Price Comparison Engine',
    desc: 'Compare 50+ grocery stores side-by-side — in-store, curbside pickup, and delivery. See exactly which store wins for your specific list.',
    badge: '50+ Stores',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: PiggyBank,
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    title: 'Budget Before You Go',
    desc: 'Set a grocery budget and see your estimated total before you ever leave home. No more surprise totals at checkout.',
    badge: 'Plan Ahead',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Users,
    color: 'bg-purple-50',
    iconColor: 'text-purple-500',
    title: 'Shared Family Lists',
    desc: 'Create and share grocery lists with your whole family. Everyone sees updates in real time — no more duplicate purchases.',
    badge: 'Up to 5 Members',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Scan,
    color: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Coupon Scanner',
    desc: 'Photograph your paper coupons and store them in the app. Show your phone at checkout — no more fumbling with paper at the register.',
    badge: 'Go Paperless',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
];

export default function HookCards({ onCTA }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {HOOKS.map((hook, i) => {
        const Icon = hook.icon;
        return (
          <motion.div
            key={hook.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col p-7 rounded-3xl border border-slate-100 bg-white hover:shadow-lg transition-shadow"
          >
            <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${hook.color} flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${hook.iconColor}`} />
            </div>
            <div className="mb-1">
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${hook.badgeColor} mb-1.5`}>{hook.badge}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{hook.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed flex-1">{hook.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
}