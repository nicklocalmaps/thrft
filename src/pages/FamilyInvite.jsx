import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Mail, Loader2, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const THRFT_BLUE = '#4181ed';

export default function FamilyInvite() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const sendInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const familyId = user?.family_group_id || user?.id;
    const link = `${window.location.origin}/?family=${familyId}`;
    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      from_name: 'THRFT',
      subject: `${user?.full_name || 'Someone'} invited you to their THRFT Family Plan`,
      body: `Hi there!\n\n${user?.full_name || 'A THRFT user'} has invited you to join their THRFT Family Plan — so you can both save money on groceries together!\n\nWith a Family Plan you get:\n✅ Unlimited price comparisons across 50+ stores\n✅ Shared grocery lists & price history\n✅ Coupon Scanner & Budget Tools\n✅ In-store, pickup & delivery pricing\n\nClick below to join the family plan and create your account:\n👉 ${link}\n\nHappy saving!\nThe THRFT Team\n\nQuestions? support@thrft.app`,
    });
    setSent(true);
    setEmail('');
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/Profile" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" style={{ color: THRFT_BLUE }} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Invite Family Members</h1>
        <p className="text-slate-500">Add up to 5 family members to your THRFT Family Plan ($5.99/mo).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" /> Send Family Invite
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="family@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            className="h-11 rounded-xl border-slate-200 text-sm focus-visible:ring-blue-400 flex-1"
          />
          <Button
            onClick={sendInvite}
            disabled={sending || !email.trim()}
            className="h-11 px-5 rounded-xl text-sm font-semibold shrink-0"
            style={{ backgroundColor: THRFT_BLUE }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? <><Check className="w-4 h-4" /> Sent!</> : 'Invite'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-sm text-blue-700">
        <p className="font-semibold mb-1">How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li>They receive an invite email with a signup link</li>
          <li>After signing up, their account links to your family plan</li>
          <li>Everyone shares premium features under one plan</li>
        </ul>
      </div>
    </div>
  );
}