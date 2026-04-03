import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Plus, Store, UserCircle, Gift, Share2, DollarSign } from 'lucide-react';
import ReferralBanner from '@/components/rewards/ReferralBanner';
import { base44 } from '@/api/base44Client';

const THRFT_BLUE = '#4181ed';

async function handleShareInvite() {
  let referralCode = '';
  try {
    const res = await base44.functions.invoke('referralTracker', { action: 'getMyRewards' });
    referralCode = res.data?.profile?.referral_code || '';
  } catch {}
  const url = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : window.location.origin;
  const text = 'I use THRFT to compare grocery prices across every store and save money every trip! Try it free:';
  if (navigator.share) {
    navigator.share({ title: 'Save money on groceries with THRFT', text, url });
  } else {
    navigator.clipboard.writeText(`${text} ${url}`);
    alert('Link copied to clipboard!');
  }
}

export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/Home', label: 'My Lists', icon: ShoppingCart },
    { path: '/NewList', label: 'New List', icon: Plus },
    { path: '/Budget', label: 'Budget', icon: DollarSign },
    { path: '/StoreAccounts', label: 'Store Accounts', icon: Store },
    { path: '/Rewards', label: 'Rewards', icon: Gift },
    { path: '/Profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-blue-100/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/Home" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                THRFT
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <button
                onClick={handleShareInvite}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 bg-purple-100 text-purple-700 hover:bg-purple-200 mr-1"
                title="Invite Friends"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Invite</span>
              </button>
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                    style={isActive ? { backgroundColor: THRFT_BLUE, color: 'white' } : { color: '#475569' }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Referral Banner */}
      <ReferralBanner variant="banner" />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}