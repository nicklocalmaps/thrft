import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

/**
 * Shown in StoreCard in place of Pickup/Delivery prices for free users.
 */
export default function UpgradePriceRow({ label }) {
  return (
    <Link to="/Subscribe">
      <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-amber-500" />
          <span className="text-amber-700 font-medium">{label}</span>
        </div>
        <span className="text-amber-600 font-semibold">Upgrade →</span>
      </div>
    </Link>
  );
}