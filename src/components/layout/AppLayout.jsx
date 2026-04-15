import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Store, UserCircle, Gift, DollarSign, Ticket } from 'lucide-react';
import ReferralBanner from '@/components/rewards/ReferralBanner';

const THRFT_BLUE = '#4181ed';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/Home', label: 'My Lists', icon: ShoppingCart },
    { path: '/NewList', label: 'New List', icon: Plus },
    { path: '/Budget', label: 'Budget', icon: DollarSign },
    { path: '/Coupons', label: 'Coupons', icon: Ticket },
    { path: '/StoreAccounts', label: 'Stores', icon: Store },
    { path: '/Rewards', label: 'Rewards', icon: Gift },
    { path: '/Profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50/30">
      {/* Desktop header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-blue-100/50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/Home" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">THRFT</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={isActive ? { backgroundColor: THRFT_BLUE, color: 'white' } : { color: '#475569' }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between px-4" style={{ height: 56 }}>
        <Link to="/Home">
          <img
            src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/ac0f23609_THRFTappheader.png"
            alt="THRFT"
            style={{ height: 40, width: 'auto' }}
          />
        </Link>
        <Link
          to="/NewList"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, backgroundColor: THRFT_BLUE, flexShrink: 0 }}
        >
          <Plus style={{ width: 20, height: 20, color: 'white' }} />
        </Link>
      </header>

      {/* Referral Banner */}
      <ReferralBanner variant="banner" />

      {/* Main Content — extra bottom padding on mobile to clear the bottom nav */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-7">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  height: 60,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: isActive ? THRFT_BLUE : '#94a3b8',
                }}
              >
                <Icon style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 9, lineHeight: 1, fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}