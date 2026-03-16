import { motion } from 'framer-motion';
import { ExternalLink, TrendingDown, PackageX } from 'lucide-react';
import { COLOR_MAP } from '@/lib/storeConfig';

export default function StoreCard({ storeKey, storeName, storeColor = 'blue', items, isCheapest, index }) {
  const colors = COLOR_MAP[storeColor] || COLOR_MAP.blue;
  const total = items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
  const availableCount = items?.filter(i => i.in_stock).length || 0;
  const totalItems = items?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`relative rounded-2xl border overflow-hidden bg-white ${
        isCheapest ? `${colors.border} ${colors.shadow} shadow-lg` : 'border-slate-100'
      }`}
    >
      {isCheapest && (
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full ${colors.light} text-xs font-semibold ${colors.badge.split(' ')[1]}`}>
          <TrendingDown className="w-3 h-3" />
          Best Price
        </div>
      )}

      <div className={`h-1.5 bg-gradient-to-r ${colors.bar}`} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 leading-tight">{storeName}</h3>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
        </div>

        <div className="mb-3">
          <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
          <span className="text-xs text-slate-500 ml-1.5">est. total</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <span className="text-emerald-600 font-medium">{availableCount}</span>/{totalItems} items
          {availableCount < totalItems && <PackageX className="w-3 h-3 text-amber-500" />}
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {items?.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs ${
                item.in_stock ? 'bg-slate-50' : 'bg-red-50/40'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${item.in_stock ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                  {item.item_name}
                </p>
                <p className="text-slate-400 truncate">{item.product_name}</p>
              </div>
              <span className={`font-semibold ml-2 shrink-0 ${item.in_stock ? 'text-slate-900' : 'text-slate-400'}`}>
                {item.in_stock ? `$${item.price?.toFixed(2)}` : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}