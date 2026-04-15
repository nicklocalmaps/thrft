import React from 'react';
import { Link } from 'react-router-dom';

export default function Refund() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-slate-900">THRFT</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Refund Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: April 2026</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Overview</h2>
            <p>
              THRFT is committed to ensuring your satisfaction with our premium subscription service. We offer a straightforward refund policy to protect your interests while maintaining the integrity of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">7-Day Money Back Guarantee</h2>
            <p>
              If you are not satisfied with THRFT Premium, we offer a full refund within <strong>7 days of your initial purchase</strong> or first charge. No questions asked.
            </p>
            <p className="text-sm text-slate-600 italic">
              This applies to your first billing cycle only. Subsequent months follow our standard subscription cancellation policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">How to Request a Refund</h2>
            <p>
              To request a refund during your first 7 days:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Contact us at <a href="mailto:support@thrft.app" className="text-blue-600 hover:text-blue-700 font-medium">support@thrft.app</a></li>
              <li>Include your order details and account email</li>
              <li>Explain why you'd like to cancel</li>
              <li>We'll process your refund within 5–10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Subscription Cancellation After 7 Days</h2>
            <p>
              After your 7-day money back period ends, you can cancel your subscription at any time through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Your THRFT Account:</strong> Profile → Manage Billing & Payment Methods → Cancel Subscription</li>
              <li><strong>Email:</strong> <a href="mailto:support@thrft.app" className="text-blue-600 hover:text-blue-700 font-medium">support@thrft.app</a> with your cancellation request</li>
            </ul>
            <p>
              Cancellations take effect at the end of your current billing cycle. You will not be charged for the next period. No refunds are issued for partial months after the initial 7-day period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Payment Issues & Disputed Charges</h2>
            <p>
              If you believe you were charged in error or did not authorize a charge, contact us immediately:
            </p>
            <p className="font-medium">
              <a href="mailto:support@thrft.app" className="text-blue-600 hover:text-blue-700">support@thrft.app</a>
            </p>
            <p>
              We'll investigate and resolve billing disputes promptly. You may also contact your credit card issuer to dispute the charge if you prefer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Family Plan Refunds</h2>
            <p>
              The same 7-day money back guarantee applies to THRFT Family Plan purchases. After 7 days, the subscription can be canceled anytime with no refund for the remainder of the billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Trial Period Refunds</h2>
            <p>
              If you cancel your subscription during your free trial period (before your first charge), no refund is necessary — your payment method simply will not be charged.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Refund Processing Time</h2>
            <p>
              Approved refunds are typically processed within 5–10 business days. Depending on your bank or credit card company, the credit may take an additional 3–5 business days to appear in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Exceptions</h2>
            <p>
              Refunds may not be available for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Subscriptions canceled after the initial 7-day period</li>
              <li>Promotional or discounted purchases (unless expressly stated in the promotion)</li>
              <li>Unauthorized transactions (which should be reported to your bank)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions?</h2>
            <p>
              For any questions about our refund policy or to request a refund, please contact our support team:
            </p>
            <p className="font-medium">
              <a href="mailto:support@thrft.app" className="text-blue-600 hover:text-blue-700">support@thrft.app</a>
            </p>
            <p className="text-sm text-slate-600">
              We aim to respond within 24 hours.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-sm text-slate-500">
          <Link to="/Terms" className="hover:text-slate-700 transition-colors">Terms of Service</Link>
          <Link to="/Privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
        </div>
      </main>
    </div>
  );
}