import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Gift, Star, Zap, Trophy, ChevronRight, Copy, Check, Users, Coins, Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const THRFT_BLUE = '#4181ed';

const REDEMPTIONS = [
  { type: 'free_month', label: '1 Free Month', points: 150, icon: '🗓️', desc: 'One month of THRFT free' },
  { type: 'free_3_months', label: '3 Free Months', points: 400, icon: '📅', desc: 'Three months of THRFT free' },
  { type: 'free_12_months', label: '12 Free Months', points: 1000, icon: '🎁', desc: 'A full year of THRFT free' },
];

const MILESTONES = [
  { paid: 1, label: '1 Free Month', icon: '🥉', tier: 'Starter Saver' },
  { paid: 3, label: '3 Free Months', icon: '🥈', tier: 'Smart Shopper' },
  { paid: 5, label: 'Lifetime Access 🔥', icon: '👑', tier: 'THRFT Ambassador' },
  { paid: 10, label: 'Lifetime + Grocery Credits', icon: '⭐', tier: 'Super Referrer' },
];

const STATUS_COLORS = {
  invited: 'bg-slate-100 text-slate-500',
  signed_up: 'bg-blue-100 text-blue-600',
  trial_started: 'bg-amber-100 text-amber-600',
  subscribed: 'bg-emerald-100 text-emerald-600',
};
const STATUS_LABELS = {
  invited: 'Invited',
  signed_up: 'Signed Up',
  trial_started: 'Trial Active',
  subscribed: 'Subscribed ✅',
};

export default function Rewards() {
  const [profile, setProfile] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('referralTracker', { action: 'getMyRewards' });
    setProfile(res.data.profile);
    setReferrals(res.data.referrals || []);
    setLoading(false);
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = async (type) => {
    setRedeeming(type);
    const res = await base44.functions.invoke('referralTracker', { action: 'redeemReward', reward_type: type });
    if (res.data?.success) {
      setRedeemSuccess(type);
      await loadRewards();
      setTimeout(() => setRedeemSuccess(null), 3000);
    }
    setRedeeming(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  const paidCount = profile?.paid_referrals_count || 0;
  const totalPoints = profile?.total_points || 0;
  const nextMilestone = MILESTONES.find(m => m.paid > paidCount) || MILESTONES[MILESTONES.length - 1];
  const progressToNext = nextMilestone ? Math.min((paidCount / nextMilestone.paid) * 100, 100) : 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Gift className="w-7 h-7" style={{ color: THRFT_BLUE }} />
          Rewards
        </h1>
        <p className="text-slate-500 mt-1">Invite friends. Earn free months. Unlock THRFT forever.</p>
      </div>

      {/* Lifetime Access Banner */}
      {profile?.has_lifetime_access && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-center shadow-lg shadow-amber-200">
          <Crown className="w-8 h-8 mx-auto mb-2" />
          <p className="text-lg font-bold">You've unlocked FREE THRFT for life! 🎉</p>
          <p className="text-sm text-amber-100 mt-1">You're a THRFT Ambassador. Keep sharing!</p>
        </motion.div>
      )}

      {/* Progress to Lifetime */}
      {!profile?.has_lifetime_access && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-900">Your Progress to Free THRFT</p>
            <span className="text-sm font-bold" style={{ color: THRFT_BLUE }}>{paidCount} / 5 referrals</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(paidCount / 5) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: THRFT_BLUE }}
            />
          </div>
          <p className="text-sm text-slate-500">
            {5 - paidCount > 0
              ? `${5 - paidCount} more paid referral${5 - paidCount !== 1 ? 's' : ''} until you unlock FREE THRFT for life 🔥`
              : 'You\'ve reached lifetime access!'}
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Points', value: totalPoints.toLocaleString(), icon: Coins, color: 'text-amber-500' },
          { label: 'Paid Referrals', value: paidCount, icon: Users, color: 'text-emerald-500' },
          { label: 'Free Months', value: profile?.free_months_earned || 0, icon: Star, color: 'text-blue-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Invite CTA */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 mb-4">
        <p className="font-bold text-slate-900 text-lg mb-1">Invite Friends. Shop Free Forever.</p>
        <p className="text-sm text-slate-500 mb-4">Share your link — earn 150 pts for every friend who subscribes.</p>

        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-3">
          <span className="text-sm text-slate-600 flex-1 truncate font-mono">
            {window.location.origin}/?ref={profile?.referral_code}
          </span>
          <button onClick={copyReferralLink} className="shrink-0 flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: THRFT_BLUE }}>
            {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>

        <Link to="/InviteFriends">
          <Button className="w-full h-11 rounded-xl font-semibold gap-2" style={{ backgroundColor: THRFT_BLUE }}>
            <Users className="w-4 h-4" />
            Invite Friends Now
          </Button>
        </Link>
      </div>

      {/* Referral Status List */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" /> Your Referrals
          </h2>
          <div className="space-y-2">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.referred_email}</p>
                  <p className="text-xs text-slate-400">+{r.points_awarded} pts earned</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Milestones
        </h2>
        <div className="space-y-2">
          {MILESTONES.map((m) => {
            const achieved = paidCount >= m.paid;
            return (
              <div key={m.paid} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${achieved ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-xl">{achieved ? m.icon : '🔒'}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${achieved ? 'text-emerald-700' : 'text-slate-500'}`}>{m.label}</p>
                  <p className="text-xs text-slate-400">{m.tier} — {m.paid} paid referral{m.paid !== 1 ? 's' : ''}</p>
                </div>
                {achieved && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeem Rewards */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Redeem Rewards
        </h2>
        <p className="text-xs text-slate-400 mb-4">You have <strong className="text-slate-700">{totalPoints} pts</strong> available</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REDEMPTIONS.map((r) => {
            const canAfford = totalPoints >= r.points;
            const isSuccess = redeemSuccess === r.type;
            return (
              <div key={r.type} className={`rounded-xl border p-4 flex flex-col gap-2 transition-all ${canAfford ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{r.label}</p>
                    <p className="text-xs text-slate-400">{r.points} pts</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={!canAfford || redeeming === r.type}
                  onClick={() => handleRedeem(r.type)}
                  className={`h-8 rounded-lg text-xs font-semibold gap-1 ${isSuccess ? 'bg-emerald-500' : ''}`}
                  style={canAfford && !isSuccess ? { backgroundColor: THRFT_BLUE } : {}}
                >
                  {redeeming === r.type ? <Loader2 className="w-3 h-3 animate-spin" /> : isSuccess ? '✅ Redeemed!' : 'Redeem'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}