import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, CheckCircle2, Clock, XCircle, User, Mail, Edit2, Check, X } from 'lucide-react';

const STATUS_CONFIG = {
  trialing: { label: 'Free Trial', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  canceled: { label: 'Canceled', color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: XCircle },
  past_due: { label: 'Past Due', color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: XCircle },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setEmailValue(u?.email || '');
      setLoading(false);
    });
  }, []);

  const handleManageBilling = async () => {
    if (window.self !== window.top) {
      alert('Billing portal only works from the published app.');
      return;
    }
    setPortalLoading(true);
    const res = await base44.functions.invoke('createPortalSession', {
      return_url: window.location.origin + '/Profile',
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      alert(res.data?.error || 'Could not open billing portal. Please try again.');
      setPortalLoading(false);
    }
  };

  const saveEmail = async () => {
    if (!emailValue.trim() || emailValue === user.email) {
      setEditingEmail(false);
      return;
    }
    setSavingEmail(true);
    await base44.auth.updateMe({ email: emailValue.trim() });
    setUser(prev => ({ ...prev, email: emailValue.trim() }));
    setSavingEmail(false);
    setEditingEmail(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
      </div>
    );
  }

  const status = user?.subscription_status;
  const statusCfg = STATUS_CONFIG[status] || { label: 'No Subscription', color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200', icon: XCircle };
  const StatusIcon = statusCfg.icon;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account and subscription.</p>
      </div>

      <div className="space-y-4 max-w-lg">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Account Info
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Name</label>
              <p className="text-slate-800 font-medium mt-0.5">{user?.full_name || '—'}</p>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Email</label>
              {editingEmail ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={emailValue}
                    onChange={e => setEmailValue(e.target.value)}
                    className="h-9 rounded-lg text-sm flex-1 focus-visible:ring-blue-400"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveEmail(); if (e.key === 'Escape') setEditingEmail(false); }}
                  />
                  <Button size="icon" className="h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: '#4181ed' }} disabled={savingEmail} onClick={saveEmail}>
                    {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg shrink-0 text-slate-400" onClick={() => setEditingEmail(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-slate-800 font-medium">{user?.email || '—'}</p>
                  <button onClick={() => setEditingEmail(true)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Subscription
          </h2>

          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-5 ${statusCfg.bg}`}>
            <StatusIcon className={`w-5 h-5 shrink-0 ${statusCfg.color}`} />
            <div>
              <p className={`font-semibold ${statusCfg.color}`}>{statusCfg.label}</p>
              <p className="text-xs text-slate-500">
                {status === 'trialing' && 'You are on a 30-day free trial — $3.99/month after trial ends.'}
                {status === 'active' && 'Your subscription is active at $3.99/month.'}
                {(status === 'canceled' || status === 'past_due') && 'Your subscription is not active.'}
                {!status && 'No active subscription found.'}
              </p>
            </div>
          </div>

          {user?.stripe_customer_id ? (
            <Button
              onClick={handleManageBilling}
              disabled={portalLoading}
              variant="outline"
              className="w-full h-11 rounded-xl border-slate-200 gap-2 font-medium"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage Billing & Payment Methods
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = '/Subscribe'}
              className="w-full h-11 rounded-xl gap-2 font-medium"
              style={{ backgroundColor: '#4181ed' }}
            >
              Start Free Trial
            </Button>
          )}
        </div>


      </div>
    </div>
  );
}