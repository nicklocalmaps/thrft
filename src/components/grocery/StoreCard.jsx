import { motion } from 'framer-motion';
import { TrendingDown, PackageX, Store, Car, Truck } from 'lucide-react';
import { COLOR_MAP } from '@/lib/storeConfig';

function PriceRow({ icon: Icon, label, total, fee, available, isBaseline }) {
  if (!available && !isBaseline) return null;
  return (
    <div className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs ${
      available || isBaseline ? 'bg-slate-50' : 'bg-red-50/40'
    }`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-slate-600 font-medium">{label}</span>
        {fee > 0 && <span className="text-slate-400">(+${fee.toFixed(2)} fee)</span>}
      </div>
      <span className={`font-semibold ${available || isBaseline ? 'text-slate-900' : 'text-slate-400'}`}>
        {available || isBaseline ? `$${total.toFixed(2)}` : 'N/A'}
      </span>
    </div>
  );
}

export default function StoreCard({ storeKey, storeName, storeColor = 'blue', storeData, isCheapest, index, shoppingMethod }) {
  const colors = COLOR_MAP[storeColor] || COLOR_MAP.blue;

  // Support both old format (array) and new format (object with items)
  const items = Array.isArray(storeData) ? storeData : (storeData?.items || []);
  const instoreTotal = Array.isArray(storeData)
    ? items.reduce((s, i) => s + (i.price || 0), 0)
    : (storeData?.instore_total ?? items.reduce((s, i) => s + (i.price || 0), 0));

  const pickupTotal = storeData?.pickup_total ?? instoreTotal;
  const pickupAvailable = storeData?.pickup_available ?? false;
  const instacartFee = storeData?.instacart_fee ?? 0;
  const instacartAvailable = storeData?.instacart_available ?? false;
  const shiptFee = storeData?.shipt_fee ?? 0;
  const shiptAvailable = storeData?.shipt_available ?? false;

  const instacartTotal = instoreTotal + instacartFee;
  const shiptTotal = instoreTotal + shiptFee;

  const availableCount = items.filter(i => i.in_stock).length;
  const totalItems = items.length;

  const showPickup = shoppingMethod === 'pickup' || shoppingMethod === 'all';
  const showDelivery = shoppingMethod === 'delivery' || shoppingMethod === 'all';

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
        <h3 className="text-base font-bold text-slate-900 mb-1">{storeName}</h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <span className="text-emerald-600 font-medium">{availableCount}</span>/{totalItems} items available
          {availableCount < totalItems && <PackageX className="w-3 h-3 text-amber-500" />}
        </div>

        {/* Price breakdown by method */}
        <div className="space-y-1.5 mb-3">
          <PriceRow icon={Store} label="In-Store" total={instoreTotal} available isBaseline />
          {showPickup && (
            <PriceRow icon={Car} label="Curbside Pickup" total={pickupTotal} available={pickupAvailable} />
          )}
          {showDelivery && (
            <>
              <PriceRow icon={Truck} label="Instacart" total={instacartTotal} fee={instacartFee} available={instacartAvailable} />
              <PriceRow icon={Truck} label="Shipt" total={shiptTotal} fee={shiptFee} available={shiptAvailable} />
            </>
          )}
        </div>

        {/* Item list */}
        <div className="space-y-1 max-h-40 overflow-y-auto border-t border-slate-100 pt-2 mt-2">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs ${
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