import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-slate-900">THRFT</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-16 prose prose-slate">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Terms & Conditions</h1>
        <p className="text-slate-500 mb-10">Last updated: April 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">By accessing or using THRFT.app ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. THRFT reserves the right to modify these terms at any time, and continued use of the Service constitutes acceptance of any changes.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">THRFT.app is a grocery price comparison and shopping list management platform. The Service allows users to compare grocery prices across multiple retailers, manage shopping lists, track coupons, and access related features. Price data is provided for informational purposes and may not reflect real-time store pricing.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Account Registration</h2>
          <p className="text-slate-600 leading-relaxed">To access certain features, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately at support@thrft.app of any unauthorized use of your account.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Subscription and Billing</h2>
          <p className="text-slate-600 leading-relaxed">THRFT offers a free trial period followed by a monthly subscription at $1.99/month. Subscriptions are billed monthly and automatically renew unless cancelled. You may cancel your subscription at any time through your account settings. Refunds are not provided for partial billing periods. We reserve the right to modify pricing with 30 days' notice.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Acceptable Use</h2>
          <p className="text-slate-600 leading-relaxed">You agree not to: (a) use the Service for any unlawful purpose; (b) scrape, crawl, or otherwise extract data from the Service in an automated manner; (c) attempt to gain unauthorized access to any portion of the Service; (d) use the Service to transmit spam or malicious content; or (e) impersonate any person or entity.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Intellectual Property</h2>
          <p className="text-slate-600 leading-relaxed">All content, features, and functionality of the Service—including but not limited to text, graphics, logos, and software—are owned by THRFT and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-slate-600 leading-relaxed">The Service is provided "as is" without warranties of any kind. THRFT does not guarantee the accuracy, completeness, or timeliness of any pricing information. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">To the fullest extent permitted by law, THRFT shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability to you shall not exceed the amount paid by you for the Service in the twelve months preceding the claim.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">These Terms shall be governed by the laws of the United States. Any disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
          <p className="text-slate-600 leading-relaxed">For questions regarding these Terms, please contact us at <a href="mailto:support@thrft.app" className="text-blue-600 hover:underline">support@thrft.app</a>.</p>
        </section>
      </div>
    </div>
  );
}