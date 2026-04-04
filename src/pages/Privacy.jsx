import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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

      <div className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-10">Last updated: April 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
          <p className="text-slate-600 leading-relaxed">THRFT ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use THRFT.app. Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed mb-3">We collect information you provide directly to us, including:</p>
          <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
            <li>Account information (name, email address, password)</li>
            <li>Location data (ZIP code for store search)</li>
            <li>Grocery lists and shopping preferences</li>
            <li>Payment information (processed securely by Stripe — we do not store card details)</li>
            <li>Communications you send to us</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">We also collect certain information automatically, including device information, IP address, browser type, and usage data through cookies and similar technologies.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
          <p className="text-slate-600 leading-relaxed mb-3">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
            <li>Provide, operate, and maintain the Service</li>
            <li>Process transactions and send related information</li>
            <li>Send promotional communications (you may opt out at any time)</li>
            <li>Improve and personalize your experience</li>
            <li>Respond to your comments and questions</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Sharing of Information</h2>
          <p className="text-slate-600 leading-relaxed">We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating the Service (such as payment processors and hosting providers), subject to confidentiality agreements. We may also disclose information when required by law or to protect the rights and safety of THRFT and its users.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Retention</h2>
          <p className="text-slate-600 leading-relaxed">We retain your personal information for as long as your account is active or as needed to provide you the Service. You may request deletion of your account and personal data at any time by contacting support@thrft.app.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Security</h2>
          <p className="text-slate-600 leading-relaxed">We implement industry-standard security measures to protect your information, including encryption in transit and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Cookies</h2>
          <p className="text-slate-600 leading-relaxed">We use cookies and similar tracking technologies to track activity on our Service and hold certain information to improve your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Children's Privacy</h2>
          <p className="text-slate-600 leading-relaxed">The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us at support@thrft.app.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Your Rights</h2>
          <p className="text-slate-600 leading-relaxed">You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at support@thrft.app.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
          <p className="text-slate-600 leading-relaxed">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">If you have questions about this Privacy Policy, please contact us at <a href="mailto:support@thrft.app" className="text-blue-600 hover:underline">support@thrft.app</a>.</p>
        </section>
      </div>
    </div>
  );
}