import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check, Mail, MessageSquare, Share2, Loader2, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const THRFT_BLUE = '#4181ed';

export default function InviteFriends() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    base44.functions.invoke('referralTracker', { action: 'getMyRewards' }).then(res => {
      setProfile(res.data.profile);
      setLoading(false);
    });
  }, []);

  const referralLink = profile ? `https://thrft.app/?ref=${profile.referral_code}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaText = () => {
    const msg = encodeURIComponent(`I use THRFT to compare grocery prices across every store and save money every trip! Try it free: ${referralLink}`);
    window.open(`sms:?body=${msg}`, '_blank');
  };

  const shareViaEmail = async () => {
    if (!emailInput.trim()) return;
    setSendingEmail(true);
    await base44.integrations.Core.SendEmail({
      to: emailInput.trim(),
      from_name: 'THRFT',
      subject: 'Your friend invited you to save money on groceries',
      body: `Hey!\n\nI've been using THRFT to compare grocery prices across every store near me — it saves me real money every trip.\n\nYou can try it free for 30 days. Use my referral link:\n${referralLink}\n\nHope it helps you save too!\n\n— Sent via THRFT`,
    });
    setEmailSent(true);
    setEmailInput('');
    setSendingEmail(false);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const shareViaWeb = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Save money on groceries with THRFT',
        text: 'Compare prices across all grocery stores. Try free for 30 days!',
        url: referralLink,
      });
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <Link to="/Rewards" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Rewards
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" style={{ color: THRFT_BLUE }} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Share THRFT.<br />Start Saving More.</h1>
        <p className="text-slate-500">For every friend who subscribes, you earn <strong className="text-slate-800">150 points</strong> toward free months — and 5 paid referrals unlock <strong className="text-slate-800">lifetime access</strong>.</p>
      </motion.div>

      {/* Reward steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {[
          { step: 'Invite Sent', pts: '+2 pts', icon: '✉️' },
          { step: 'Signs Up', pts: '+25 pts', icon: '👤' },
          { step: 'Trial Starts', pts: '+25 pts', icon: '⏳' },
          { step: 'Subscribes', pts: '+150 pts', icon: '💰' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <span className="text-xl block mb-1">{s.icon}</span>
            <p className="text-xs text-slate-500 font-medium leading-tight">{s.step}</p>
            <p className="text-xs font-bold mt-1" style={{ color: THRFT_BLUE }}>{s.pts}</p>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Your Referral Link</p>
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 mb-3">
          <span className="text-sm text-slate-600 flex-1 truncate font-mono text-xs">{referralLink}</span>
          <button onClick={copyLink} className="shrink-0 flex items-center gap-1.5 text-sm font-semibold" style={{ color: THRFT_BLUE }}>
            {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={copyLink} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <Copy className="w-5 h-5 text-slate-500" />
            <span className="text-xs font-medium text-slate-600">Copy Link</span>
          </button>
          <button onClick={shareViaText} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-slate-500" />
            <span className="text-xs font-medium text-slate-600">Text</span>
          </button>
          <button onClick={shareViaWeb} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <Share2 className="w-5 h-5 text-slate-500" />
            <span className="text-xs font-medium text-slate-600">Share</span>
          </button>
        </div>
      </div>

      {/* Email Invite */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" /> Invite via Email
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@email.com"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && shareViaEmail()}
            className="h-10 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-400 flex-1"
          />
          <Button
            onClick={shareViaEmail}
            disabled={sendingEmail || !emailInput.trim()}
            className="h-10 px-4 rounded-xl text-sm font-semibold shrink-0"
            style={{ backgroundColor: THRFT_BLUE }}
          >
            {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? '✅ Sent!' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Progress reminder */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5 text-center">
        <Star className="w-5 h-5 text-amber-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-900">Invite 5 friends who subscribe</p>
        <p className="text-sm text-slate-500 mt-0.5">= <strong>THRFT Free Forever</strong> 🔥</p>
        <Link to="/Rewards">
          <button className="text-xs font-semibold mt-3 underline" style={{ color: THRFT_BLUE }}>View your progress →</button>
        </Link>
      </div>
    </div>
  );
}