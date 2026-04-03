import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tag, Calendar, Store, CheckCircle2, Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isPast, parseISO } from 'date-fns';

export default function CouponCard({ coupon, onAddToList, onDelete, lists = [] }) {
  const isExpired = coupon.expiry_date && isPast(parseISO(coupon.expiry_date));
  const statusColor = {
    active: isExpired ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600',
    used: 'bg-slate-100 text-slate-500',
    expired: 'bg-red-100 text-red-500',
  }[coupon.status] || 'bg-slate-100 text-slate-500';

  const statusLabel = isExpired && coupon.status === 'active' ? 'Expired' : {
    active: 'Active',
    used: 'Used',
    expired: 'Expired',
  }[coupon.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${isExpired || coupon.status !== 'active' ? 'opacity-60' : ''}`}
    >
      <div className="flex">
        {coupon.image_url && (
          <div className="w-24 h-full shrink-0">
            <img src={coupon.image_url} alt="coupon" className="w-full h-full object-cover min-h-[96px]" />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">{coupon.product_name}</p>
              {coupon.brand && <p className="text-xs text-slate-400">{coupon.brand}</p>}
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>{statusLabel}</span>
          </div>

          {coupon.discount_description && (
            <div className="flex items-center gap-1.5 mt-2 mb-2">
              <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-blue-600">{coupon.discount_description}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            {coupon.expiry_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Exp: {format(parseISO(coupon.expiry_date), 'MMM d, yyyy')}
              </span>
            )}
            {coupon.store_restriction && (
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3" />
                {coupon.store_restriction}
              </span>
            )}
          </div>

          {coupon.status === 'active' && !isExpired && (
            <div className="flex items-center gap-2 mt-3">
              <select
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                defaultValue=""
                onChange={(e) => e.target.value && onAddToList(coupon, e.target.value)}
              >
                <option value="" disabled>Add to list...</option>
                {lists.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <button
                onClick={() => onDelete(coupon.id)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {(coupon.status === 'used' || coupon.status === 'expired' || isExpired) && (
            <div className="flex justify-end mt-2">
              <button
                onClick={() => onDelete(coupon.id)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}