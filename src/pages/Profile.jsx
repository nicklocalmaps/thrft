import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2, CreditCard, CheckCircle2, Clock, XCircle,
  User, Edit2, Check, X, MapPin, Truck, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE = '#4181ed';

const STATUS_CONFIG = {
  trialing: { label: 'Free Trial',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   icon: Clock        },
  active:   { label: 'Active',       color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200',icon: CheckCircle2 },
  canceled: { label: 'Canceled',     color: 'text-red-500',    bg: 'bg-red-50 border-red-200',        icon: XCircle      },
  past_due: { label: 'Past Due',     color: 'text-red-500',    bg: 'bg-red-50 border-red-200',        icon: XCircle      },
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

// ─── Inline editable field ────────────────────────────────────────────────────

function EditableField({ label, value, onSave, placeholder = '—', type = 'text', children }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value || '');
  const [saving, setSaving]   = useState(false);

  useEffect(() => { setVal(value || ''); }, [value]);

  const save = async () => {
    if (val.trim() === (value || '')) { setEditing(false); return; }
    setSaving(true);
    await onSave(val.trim());
    setSaving(false);
    setEditing(false);
  };

  return (
    <div>
      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</label>
      {editing ? (
        <div className="flex items-center gap-2 mt-1">
          {children ? (
            React.cloneElement(children, { value: val, onChange: e => setVal(e.target.value) })
          ) : (
            <Input
              type={type}
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder={placeholder}
              className="h-9 rounded-lg text-sm flex-1 focus-visible:ring-blue-400"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            />
          )}
          <Button size="icon" className="h-9 w-9 rounded-lg shrink-0" style={{ backgroundColor: THRFT_BLUE }} disabled={saving} onClick={save}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg shrink-0 text-slate-400"
            onClick={() => { setVal(value || ''); setEditing(false); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-0.5">
          <p className={`text-sm font-medium ${val ? 'text-slate-800' : 'text-slate-300'}`}>{val || placeholder}</p>
          <button onClick={() => setEditing(true)} className="text-slate-300 hover:text-slate-500 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Delivery address section ─────────────────────────────────────────────────

function DeliveryAddressSection({ user, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving]     = useState(false);

  const addr       = user?.delivery_address || {};
  const hasAddress = addr.street && addr.city && addr.state && addr.zip;

  const saveField = async (field, value) => {
    setSaving(true);
    const updated = { ...addr, [field]: value };
    await base44.auth.updateMe({ delivery_address: updated });
    onUpdate({ ...user, delivery_address: updated });
    setSaving(false);
  };

  const clearAddress = async () => {
    await base44.auth.updateMe({ delivery_address: {} });
    onUpdate({ ...user, delivery_address: {} });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" style={{ color: THRFT_BLUE }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Delivery Address</p>
            {hasAddress ? (
              <p className="text-xs text-slate-400 truncate max-w-[220px]">
                {addr.street}{addr.apt ? `, ${addr.apt}` : ''}, {addr.city}, {addr.state} {addr.zip}
              </p>
            ) : (
              <p className="text-xs text-slate-400">Not set · add for faster delivery checkout</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasAddress && (
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
              Saved ✓
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-4">
          <EditableField label="Street address" value={addr.street} placeholder="123 Main St" onSave={val => saveField('street', val)} />
          <EditableField label="Apt, suite, unit (optional)" value={addr.apt} placeholder="Apt 4B" onSave={val => saveField('apt', val)} />

          <div className="grid grid-cols-2 gap-3">
            <EditableField label="City" value={addr.city} placeholder="Cincinnati" onSave={val => saveField('city', val)} />
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">State</label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={addr.state || ''}
                  onChange={async e => {
                    const val = e.target.value;
                    setSaving(true);
                    const updated = { ...addr, state: val };
                    await base44.auth.updateMe({ delivery_address: updated });
                    onUpdate({ ...user, delivery_address: updated });
                    setSaving(false);
                  }}
                  className="flex-1 h-9 rounded-lg border border-slate-200 text-sm px-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">State</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {saving && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />}
              </div>
            </div>
          </div>

          <EditableField label="Zip code" value={addr.zip} placeholder="45202" onSave={val => saveField('zip', val)} />
          <EditableField label="Delivery instructions (optional)" value={addr.instructions} placeholder="Leave at front door, ring bell" onSave={val => saveField('instructions', val)} />

          {hasAddress && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{addr.street}{addr.apt ? `, ${addr.apt}` : ''}</p>
                  <p className="text-sm text-slate-600">{addr.city}, {addr.state} {addr.zip}</p>
                  {addr.instructions && <p className="text-xs text-slate-400 mt-1 italic">"{addr.instructions}"</p>}
                </div>
                <button onClick={clearAddress} className="text-slate-300 hover:text-red-400 transition-colors shrink-0" title="Clear address">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Your address is used to find nearby stores and pre-fill delivery checkout. It's never shared without your permission.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Profile component ───────────────────────────────────────────────────

export default function Profile() {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [willieEnabled, setWillieEnabled] = useState(true);
  const [savingWillie, setSavingWillie]   = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setWillieEnabled(u?.willie_enabled !== false);
      setLoading(false);
    });
  }, []);

  const toggleWillie = async () => {
    setSavingWillie(true);
    const newValue = !willieEnabled;
    setWillieEnabled(newValue);
    await base44.auth.updateMe({ willie_enabled: newValue });
    setUser(prev => ({ ...prev, willie_enabled: newValue }));
    setSavingWillie(false);
  };

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

  const saveField = async (field, value) => {
    await base44.auth.updateMe({ [field]: value });
    setUser(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
    </div>
  );

  const status     = user?.subscription_status;
  const statusCfg  = STATUS_CONFIG[status] || { label: 'No Subscription', color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200', icon: XCircle };
  const StatusIcon = statusCfg.icon;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="space-y-4 max-w-lg">

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            Account Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Name</label>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{user?.full_name || '—'}</p>
            </div>
            <EditableField label="Email" value={user?.email} placeholder="your@email.com" type="email" onSave={val => saveField('email', val)} />
            <EditableField label="Phone (optional)" value={user?.phone} placeholder="+1 (555) 000-0000" type="tel" onSave={val => saveField('phone', val)} />
          </div>
        </div>

        {/* Delivery address */}
        <DeliveryAddressSection user={user} onUpdate={setUser} />

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Subscription
          </h2>

          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-5 ${statusCfg.bg}`}>
            <StatusIcon className={`w-5 h-5 shrink-0 ${statusCfg.color}`} />
            <div>
              <p className={`font-semibold text-sm ${statusCfg.color}`}>{statusCfg.label}</p>
              <p className="text-xs text-slate-500">
                {status === 'trialing' && 'Free trial active — $3.99/month after trial ends.'}
                {status === 'active'   && 'Active subscription at $3.99/month.'}
                {(status === 'canceled' || status === 'past_due') && 'Your subscription is not active.'}
                {!status               && 'No active subscription found.'}
              </p>
            </div>
          </div>

          {user?.stripe_customer_id ? (
            <Button onClick={handleManageBilling} disabled={portalLoading} variant="outline"
              className="w-full h-11 rounded-xl border-slate-200 gap-2 font-medium text-sm">
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage Billing &amp; Payment Methods
            </Button>
          ) : (
            <Button onClick={() => window.location.href = '/Subscribe'}
              className="w-full h-11 rounded-xl gap-2 font-medium text-sm text-white"
              style={{ backgroundColor: THRFT_BLUE }}>
              Start Free Trial
            </Button>
          )}
        </div>

        {/* Willie preference */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Show Willie the Wise Savings Owl</p>
              <p className="text-xs text-slate-400 mt-0.5">THRFT's savings mascot and tips</p>
            </div>
            <Switch checked={willieEnabled} onCheckedChange={toggleWillie} disabled={savingWillie} />
          </div>
        </div>

      </div>
    </div>
  );
}