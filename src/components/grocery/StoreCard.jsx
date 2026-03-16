import { motion } from 'framer-motion';
import { ExternalLink, TrendingDown, PackageX } from 'lucide-react';

const storeConfig = {
  kroger: {
    name: 'Kroger',
    color: 'from-blue-500 to-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-100',
    url: 'https://www.kroger.com',
  },
  walmart: {
    name: 'Walmart',
    color: 'from-amber-500 to-yellow-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    shadowColor: 'shadow-amber-100',
    url: 'https://www.walmart.com',
  },
  amazon: {
    name: 'Amazon Fresh',
    color: 'from-orange-500 to-orange-600',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    shadowColor: 'shadow-orange-100',
    url: 'https://www.amazon.com/fresh',
  },
};

export default function StoreCard({ storeKey, items, isCheapest, index }) {
  const store = storeConfig[storeKey];
  const total = items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
  const availableCount = items?.filter(i => i.in_stock).length || 0;
  const totalItems = items?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl border overflow-hidden bg-white ${
        isCheapest ? `${store.borderColor} ${store.shadowColor} shadow-lg` : 'border-slate-100'
      }`}
    >
      {isCheapest && (
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full ${store.lightColor} ${store.textColor} text-xs font-semibold`}>
          <TrendingDown className="w-3 h-3" />
          Best Price
        </div>
      )}

      <div className={`h-1.5 bg-gradient-to-r ${store.color}`} />

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{store.name}</h3>
          <a
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="mb-4">
          <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          <span className="text-sm text-slate-500 ml-2">estimated total</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <span className="text-emerald-600 font-medium">{availableCount}</span> of {totalItems} items found
          {availableCount < totalItems && (
            <PackageX className="w-3.5 h-3.5 text-amber-500" />
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items?.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${
                item.in_stock ? 'bg-slate-50' : 'bg-red-50/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${item.in_stock ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                  {item.item_name}
                </p>
                <p className="text-xs text-slate-400 truncate">{item.product_name}</p>
              </div>
              <span className={`font-semibold ml-3 ${item.in_stock ? 'text-slate-900' : 'text-slate-400'}`}>
                {item.in_stock ? `$${item.price?.toFixed(2)}` : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}