import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, ChevronRight } from 'lucide-react';

/**
 * A compact, reusable CTA banner for earning rewards.
 * variant: 'banner' (full-width bar) | 'card' (rounded card with more detail)
 */
export default function ReferralBanner({ variant = 'banner', savedAmount = null }) {
  if (variant === 'card') {
    return (
      <Link to="/Rewards">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Earn Free THRFT</p>
            <p className="text-xs text-slate-500 truncate">
              {savedAmount
                ? `You saved $${savedAmount.toFixed(2)} today — invite friends & shop free forever`
                : 'Invite 5 friends → Lifetime access free 🔥'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </Link>
    );
  }

  // Banner variant
  return (
    <Link to="/InviteFriends">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 shrink-0" />
          <span>Invite Friends → Unlock THRFT Free Forever</span>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </div>
    </Link>
  );
}