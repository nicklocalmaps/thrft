import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Mail, Loader2, Check, ArrowLeft, Crown, UserPlus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useUserTier from '@/hooks/useUserTier';

const THRFT_BLUE = '#4181ed';

export default function FamilyInvite() {
  const navigate = useNavigate();
  const { isPremium, isFamily, loading: tierLoading } = useUserTier();
  const [user, setUser] = useState(null);
  const [familyGroup, setFamilyGroup] = useState(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingFamily, setLoadingFamily] = useState(true);

  useEffect(() => {
    // Check if arriving via family invite link
    const urlParams = new URLSearchParams(window.location.search);
    const familyId = urlParams.get('family');
    if (familyId) {
      acceptFamilyInvite(familyId);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingFamily(true);
    const u = await base44.auth.me().catch(() => null);
    setUser(u);
    if (u?.family_group_id) {
      const groups = await base44.entities.FamilyGroup.filter({ id: u.family_group_id }).catch(() => []);
      setFamilyGroup(groups[0] || null);
    } else if (u?.id) {
      // Check if user is the admin of a family group
      const groups = await base44.entities.FamilyGroup.filter({ admin_user_id: u.id }).catch(() => []);
      if (groups[0]) {
        setFamilyGroup(groups[0]);
        await base44.auth.updateMe({ family_group_id: groups[0].id }).catch(() => {});
      }
    }
    setLoadingFamily(false);
  };

  const acceptFamilyInvite = async (familyId) => {
    try {
      const res = await base44.functions.invoke('familyInviteAccept', { family_group_id: familyId });
      if (res.data?.success) {
        window.history.replaceState({}, '', '/FamilyInvite');
        await loadData();
      }
    } catch (e) {
      setError('Could not join family group. The link may be invalid or expired.');
    }
  };

  const startFamilySubscription = async () => {
    setLoadingCheckout(true);
    const returnUrl = window.location.origin + '/FamilyInvite';
    const res = await base44.functions.invoke('createFamilyCheckoutSession', { return_url: returnUrl });
    if (res.data?.url) {
      window.open(res.data.url, '_blank');
    }
    setLoadingCheckout(false);
  };

  const handleFamilySubscribed = async () => {
    // After Stripe redirects back, create the FamilyGroup record
    if (user && !familyGroup) {
      const group = await base44.entities.FamilyGroup.create({
        admin_user_id: user.id,
        admin_email: user.email,
        members: [],
        status: 'active',
      });
      await base44.auth.updateMe({
        account_type: 'family',
        family_group_id: group.id,
        subscription_status: 'trialing',
      });
      setFamilyGroup(group);
    }
    await loadData();
  };

  const sendInvite = async () => {
    if (!email.trim() || !familyGroup) return;
    const members = familyGroup.members || [];
    if (members.length >= 4) {
      setError('Your family plan is full (4 members maximum).');
      return;
    }
    if (members.some(m => m.email === email.trim())) {
      setError('This email has already been invited.');
      return;
    }

    setSending(true);
    setError('');

    const link = `${window.location.origin}/FamilyInvite?family=${familyGroup.id}`;
    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      from_name: 'THRFT',
      subject: `${user?.full_name || 'Someone'} invited you to their THRFT Family Plan`,
      body: `Hi there!\n\n${user?.full_name || 'A THRFT user'} has invited you to join their THRFT Family Plan — so you can save money on groceries together!\n\nWith a Family Plan you get:\n✅ Unlimited price comparisons across 50+ stores\n✅ In-Store, Curbside Pickup & Delivery pricing\n✅ Coupon Scanner & Budget Tools\n✅ Shared grocery lists & price history\n\nClick below to join:\n👉 ${link}\n\nHappy saving!\nThe THRFT Team\n\nQuestions? support@thrft.app`,
    });

    // Update family group with new invited member
    const updatedMembers = [...members, { email: email.trim(), status: 'invited', invited_at: new Date().toISOString() }];
    const updated = await base44.entities.FamilyGroup.update(familyGroup.id, { members: updatedMembers });
    setFamilyGroup({ ...familyGroup, members: updatedMembers });

    setSent(true);
    setEmail('');
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  const removeMember = async (memberEmail) => {
    const updatedMembers = (familyGroup.members || []).filter(m => m.email !== memberEmail);
    await base44.entities.FamilyGroup.update(familyGroup.id, { members: updatedMembers });
    setFamilyGroup({ ...familyGroup, members: updatedMembers });
  };

  // Handle return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('family_subscribed') === 'true') {
      window.history.replaceState({}, '', '/FamilyInvite');
      handleFamilySubscribed();
    }
  }, []);

  if (tierLoading || loadingFamily) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  const members = familyGroup?.members || [];
  const memberCount = members.length;
  const isAdmin = familyGroup?.admin_user_id === user?.id;
  const isMember = !isAdmin && user?.family_group_id === familyGroup?.id;

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/Profile" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" style={{ color: THRFT_BLUE }} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Family Plan</h1>
        <p className="text-slate-500">5 accounts for $6.99/mo — all with full premium access.</p>
      </div>

      {/* Not on family plan — upsell */}
      {!familyGroup && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-lg">Get the Family Plan</h2>
          </div>
          <ul className="space-y-2 mb-6">
            {[
              '5 separate accounts (you + 4 family members)',
              'Full premium access for everyone',
              'In-Store, Pickup & Delivery pricing',
              'Coupon Scanner & Budget Tools',
              '7-day free trial included',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={startFamilySubscription}
            disabled={loadingCheckout}
            className="w-full h-12 rounded-xl font-bold shadow-md shadow-blue-200 gap-2"
            style={{ backgroundColor: THRFT_BLUE }}
          >
            {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Family Plan — $6.99/mo →'}
          </Button>
          <p className="text-xs text-slate-400 text-center mt-2">7-day free trial. Cancel anytime.</p>
        </div>
      )}

      {/* Family group exists — manage members */}
      {familyGroup && isAdmin && (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <Crown className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">You're the Family Admin</p>
              <p className="text-xs text-emerald-600">{memberCount}/4 members invited · Slots remaining: {4 - memberCount}</p>
            </div>
          </div>

          {/* Invite form */}
          {memberCount < 4 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-400" /> Invite a Family Member
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="family@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
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
          )}

          {/* Members list */}
          {members.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Family Members</h3>
              <div className="space-y-2">
                {/* Admin row */}
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user?.email}</p>
                    <p className="text-xs text-blue-600 font-semibold">Admin</p>
                  </div>
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                {members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.email}</p>
                      <p className={`text-xs font-semibold ${m.status === 'joined' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {m.status === 'joined' ? '✅ Joined' : '📧 Invited'}
                      </p>
                    </div>
                    <button onClick={() => removeMember(m.email)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Member (not admin) view */}
      {familyGroup && isMember && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4 text-center">
          <Check className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <h2 className="font-bold text-slate-900 mb-1">You're on the Family Plan!</h2>
          <p className="text-sm text-slate-500">You have full premium access courtesy of the family admin.</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-sm text-blue-700">
        <p className="font-semibold mb-1">How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li>Invite up to 4 family members by email</li>
          <li>They click the link, create their own account, and get linked to your plan</li>
          <li>Everyone gets full premium access under one $6.99/mo subscription</li>
        </ul>
      </div>
    </div>
  );
}