import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function ContactUs() {
  const [form, setForm] = useState({ email: '', name: '', issue: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill email if user is logged in
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.email) setForm(prev => ({ ...prev, email: user.email, name: user.full_name || '' }));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.issue) return;
    setSending(true);
    setError(null);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@thrft.app',
        from_name: 'THRFT Support',
        subject: `Support Request from ${form.email}`,
        body: `Name: ${form.name || 'Not provided'}
Email: ${form.email}

Issue:
${form.issue}

---
Sent from the THRFT app Contact Us form.`,
      });
      setSent(true);
    } catch (err) {
      setError('Failed to send your message. Please email us directly at support@thrft.app.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back link */}
        <Link to="/Subscribe" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Subscribe
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow">
            <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">THRFT Support</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 p-8">

          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h2>
              <p className="text-slate-500 text-sm mb-6">
                We've received your message and will follow up at <strong>{form.email}</strong> as soon as possible.
              </p>
              <Link to="/Subscribe">
                <Button className="rounded-xl" style={{ backgroundColor: '#4181ed' }}>
                  Back to Subscribe
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Contact Us</h1>
              <p className="text-slate-500 text-sm mb-6">
                Having trouble signing up or subscribing? Fill out the form below and we'll help you get started.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
                    Your Login Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">The email address you use to log in to THRFT</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
                    Describe the Problem <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    placeholder="e.g. I clicked 'Start Free Trial' but nothing happened / I was not taken to a payment page / I keep seeing a loading spinner..."
                    value={form.issue}
                    onChange={e => setForm(prev => ({ ...prev, issue: e.target.value }))}
                    required
                    rows={5}
                    className="rounded-xl border-slate-200 focus-visible:ring-blue-400 resize-none text-sm"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={sending || !form.email || !form.issue}
                  className="w-full h-12 rounded-xl text-sm font-semibold gap-2"
                  style={{ backgroundColor: '#4181ed' }}
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </Button>
              </form>

              <p className="text-xs text-slate-400 text-center mt-4">
                Or email us directly at{' '}
                <a href="mailto:support@thrft.app" className="underline text-blue-500">
                  support@thrft.app
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}