import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useUserTier from '@/hooks/useUserTier';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import WillieOwl from '@/components/WillieOwl';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Gift, Star, Zap, Trophy, Copy, Check, Users, Coins, Crown, Flame, Target, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const THRFT_BLUE = '#4181ed';

const EARNING_ACTIONS = [
  { action: 'Daily login / check deals', points: 2, icon: '📅' },
  { action: 'Complete grocery list', points: 5, icon: '✅' },
  { action: 'Mark items as purchased', points: 3, icon: '🛒' },
  { action: 'Run price comparison', points: 5, icon: '💰' },
  { action: 'Scan receipt / log purchase', points: 10, icon: '🧾' },
  { action: 'Refer a friend who subscribes', points: 100, icon: '👑' },
];

const STREAK_BONUSES = [
  { days: 3, points: 5 },
  { days: 7, points: 15 },
  { days: 14, points: 35 },
  { days: 30, points: 100 },
];

const REDEMPTIONS = [
  { type: 'free_month', label: '1 Free Month', points: 100, icon: '🗓️' },
  { type: 'free_3_months', label: '3 Free Months', points: 250, icon: '📅' },
  { type: 'free_6_months', label: '6 Free Months', points: 500, icon: '🎁' },
];

const GIVEAWAY_TIERS = [
  { min: 50, max: 99, entries: 1 },
  { min: 100, max: 199, entries: 2 },
  { min: 200, max: null, entries: 3 },
];

export default function Rewards() {
  const { isPremium } = useUserTier();
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
    try {
      const res = await base44.functions.invoke('referralTracker', { action: 'getMyRewards' });
      setProfile(res.data.profile);
      setReferrals(res.data.referrals || []);
    } catch {}
    setLoading(false);
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?ref=${profile?.referral_code}`;
    const text = 'I use THRFT to compare grocery prices across every store and save money every trip! Try it free:';
    if (navigator.share) {
      navigator.share({ title: 'Save money on groceries with THRFT', text, url });
    } else {
      copyReferralLink();
    }
  };

  const handleRedeem = async (type) => {
    setRedeeming(type);
    try {
      const res = await base44.functions.invoke('referralTracker', { action: 'redeemReward', reward_type: type });
      if (res.data?.success) {
        setRedeemSuccess(type);
        await loadRewards();
        setTimeout(() => setRedeemSuccess(null), 3000);
      }
    } catch {}
    setRedeeming(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return <UpgradePrompt feature="Rewards" description="Earn points, win weekly $50 gift cards, and get free months by inviting friends — all with a Premium account." />;
  }

  const totalPoints = profile?.total_points || 0;
  const weeklyPoints = totalPoints; // simplified — in prod you'd track weekly separately
  const giveawayEntries = weeklyPoints >= 200 ? 3 : weeklyPoints >= 100 ? 2 : weeklyPoints >= 50 ? 1 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <WillieOwl pageKey="rewards" hint="Earn points by using THRFT daily — and win a $50 Visa gift card every week! Invite friends to level up faster." />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Gift className="w-7 h-7" style={{ color: THRFT_BLUE }} />
          Rewards
        </h1>
        <p className="text-slate-500 mt-1">Earn points daily. Win $50 grocery gift cards every week.</p>
      </div>

      {/* Weekly Giveaway Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4181ed 0%, #7c3aed 100%)' }}
      >
        <div className="p-6 text-white text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-2xl font-extrabold mb-1">Weekly $50 Visa Gift Card</h2>
          <p className="text-blue-100 text-sm mb-4">Win free groceries every week! Winner announced in-app & via email.</p>
          <div className="bg-white/20 rounded-2xl p-4 mb-4">
            <p className="text-white font-bold text-lg">You have <span className="text-yellow-300 text-2xl">{giveawayEntries}</span> {giveawayEntries === 1 ? 'entry' : 'entries'} this week</p>
            <p className="text-blue-100 text-xs mt-1">Earn more points to unlock additional entries</p>
          </div>
          <div className="flex justify-center gap-3 text-xs">
            {GIVEAWAY_TIERS.map(t => (
              <div key={t.entries} className={`px-3 py-1.5 rounded-full font-semibold ${weeklyPoints >= t.min ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-blue-100'}`}>
                {t.entries} {t.entries === 1 ? 'entry' : 'entries'} = {t.min}{t.max ? `–${t.max}` : '+'} pts
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Points', value: totalPoints.toLocaleString(), icon: Coins, color: 'text-amber-500' },
          { label: 'Referrals', value: profile?.total_referrals_count || 0, icon: Users, color: 'text-emerald-500' },
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
        <p className="font-bold text-slate-900 text-lg mb-1">Invite Friends & Earn Big</p>
        <p className="text-sm text-slate-500 mb-4">Earn <strong>100 pts</strong> for every friend who subscribes + bonus giveaway entries!</p>

        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-3">
          <span className="text-sm text-slate-600 flex-1 truncate font-mono">
            {window.location.origin}/?ref={profile?.referral_code}
          </span>
          <button onClick={copyReferralLink} className="shrink-0 flex items-center gap-1.5 text-sm font-semibold transition-colors" style={{ color: THRFT_BLUE }}>
            {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleShare} className="flex-1 h-11 rounded-xl font-semibold gap-2" style={{ backgroundColor: THRFT_BLUE }}>
            <Share2 className="w-4 h-4" />
            Share Your Link
          </Button>
          <Link to="/InviteFriends" className="flex-1">
            <Button variant="outline" className="w-full h-11 rounded-xl font-semibold gap-2">
              <Users className="w-4 h-4" />
              Invite via Email
            </Button>
          </Link>
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> How to Earn Points
        </h2>
        <div className="space-y-2">
          {EARNING_ACTIONS.map(a => (
            <div key={a.action} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{a.icon}</span>
                <span className="text-sm text-slate-700">{a.action}</span>
              </div>
              <span className="text-sm font-bold text-amber-600">+{a.points} pts</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> Streak Bonuses</p>
          <div className="flex flex-wrap gap-2">
            {STREAK_BONUSES.map(s => (
              <div key={s.days} className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-orange-700">
                {s.days}-day streak → +{s.points} pts
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Rewards */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Redeem Points
        </h2>
        <p className="text-xs text-slate-400 mb-4">You have <strong className="text-slate-700">{totalPoints} pts</strong> available</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      {/* Referrals list */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
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
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === 'subscribed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {r.status === 'subscribed' ? 'Subscribed ✅' : r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 mt-6">
        Questions? <a href="mailto:support@thrft.app" className="underline">support@thrft.app</a>
      </p>
    </div>
  );
}