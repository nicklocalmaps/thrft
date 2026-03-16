import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ListCard({ list, index, onDelete }) {
  const itemCount = list.items?.length || 0;
  const hasComparison = !!list.price_data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/ListDetail?id=${list.id}`}
        className="block group"
      >
        <div className="relative rounded-2xl border border-slate-100 bg-white p-5 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {list.name}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
                {list.last_compared && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Compared {format(new Date(list.last_compared), 'MMM d')}
                  </span>
                )}
              </div>
              {hasComparison && (
                <div className="flex gap-2 mt-3">
                  {['kroger', 'walmart', 'amazon'].map(store => {
                    const total = list.price_data?.[store]?.reduce((s, i) => s + (i.price || 0), 0) || 0;
                    return (
                      <span key={store} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {store.charAt(0).toUpperCase() + store.slice(1)}: ${total.toFixed(2)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(list.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}