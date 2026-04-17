import React from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THRFT_BLUE = '#4181ed';

const DELIVERY_APPS = [
  { name: 'Instacart', color: '#43B02A', emoji: '🛒', desc: 'Same-day delivery from 1,400+ retailers' },
  { name: 'Shipt', color: '#E31837', emoji: '🚗', desc: 'Same-day delivery from Target & more' },
  { name: 'Walmart+', color: '#0071CE', emoji: '🏪', desc: 'Free delivery on groceries & more' },
  { name: 'Amazon Fresh', color: '#FF9900', emoji: '📦', desc: 'Fast delivery for Prime members' },
  { name: 'DoorDash', color: '#FF3008', emoji: '🍔', desc: 'Grocery delivery from local stores' },
  { name: 'Kroger Delivery', color: '#CC0000', emoji: '🥦', desc: 'Direct delivery from Kroger family stores' },
  { name: 'Uber Eats', color: '#06C167', emoji: '🛵', desc: 'Grocery delivery in under an hour' },
  { name: 'Gopuff', color: '#5C2D91', emoji: '⚡', desc: '30-minute delivery from micro-warehouses' },
];

export default function DeliveryAppsSection({ onCTA }) {
  return (
    <section className="py-20 px-5 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-sm font-semibold mb-4">
            <Truck className="w-4 h-4" /> Delivery Price Comparison
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-3">Find The Cheapest Price For Your Grocery List Every Time</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            THRFT compares delivery fees, service charges, and total costs across all major delivery apps so you always know the true price before ordering.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {DELIVERY_APPS.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-4 text-center hover:border-slate-500 transition-colors"
            >
              <div className="text-3xl mb-2">{app.emoji}</div>
              <p className="text-white font-bold text-sm mb-1">{app.name}</p>
              <p className="text-slate-400 text-xs leading-snug">{app.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-900/60 to-blue-800/40 rounded-3xl border border-blue-700/40 p-8 text-center">
          <p className="text-white text-xl font-bold mb-2">Stop paying hidden delivery fees</p>
          <p className="text-blue-300 mb-6">THRFT shows you the all-in total — groceries + fees + tips — across every delivery option so you pick the real winner.</p>
          <Button onClick={onCTA} className="h-12 px-8 rounded-xl font-bold text-slate-900 bg-white hover:bg-blue-50 transition-all mx-auto block">
            Compare Grocery Prices Free →
          </Button>
        </div>
      </div>
    </section>
  );
}