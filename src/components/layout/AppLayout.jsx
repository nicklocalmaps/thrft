import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Plus, Store, UserCircle, Gift, DollarSign, Ticket } from 'lucide-react';
import ReferralBanner from '@/components/rewards/ReferralBanner';
import { base44 } from '@/api/base44Client';

const THRFT_BLUE = '#4181ed';



export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/Home', label: 'My Lists', icon: ShoppingCart },
    { path: '/NewList', label: 'New List', icon: Plus },
    { path: '/Budget', label: 'Budget', icon: DollarSign },
    { path: '/Coupons', label: 'Coupons', icon: Ticket },
    { path: '/StoreAccounts', label: 'Store Accounts', icon: Store },
    { path: '/Rewards', label: 'Rewards', icon: Gift },
    { path: '/Profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-blue-100/50">
        {/* Desktop header */}
        <div className="hidden md:flex max-w-5xl mx-auto px-6 items-center justify-between h-16">
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

        {/* Mobile header — 2 rows of 4, full width buttons */}
        {(() => {
          const row1 = [
            { path: '/Home', label: null, isLogo: true },
            { path: '/Home', label: 'My Lists', icon: ShoppingCart },
            { path: '/NewList', label: 'New List', icon: Plus },
            { path: '/Budget', label: 'Budget', icon: DollarSign },
          ];
          const row2 = [
            { path: '/Coupons', label: 'Coupons', icon: Ticket },
            { path: '/StoreAccounts', label: 'Store Accounts', icon: Store },
            { path: '/Rewards', label: 'Rewards', icon: Gift },
            { path: '/Profile', label: 'Profile', icon: UserCircle },
          ];
          const renderCell = (item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 52,
                  gap: 4,
                  backgroundColor: (!item.isLogo && isActive) ? THRFT_BLUE : 'transparent',
                  color: (!item.isLogo && isActive) ? 'white' : '#475569',
                  borderRight: '1px solid #f1f5f9',
                }}
              >
                {/* Transparent clickable link ON TOP of everything */}
                <Link
                  to={item.path}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 20,
                    display: 'block',
                  }}
                  aria-label={item.label || 'Home'}
                />
                {/* Visual content below the link */}
                {item.isLogo ? (
                  <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', pointerEvents: 'none' }}>
                    <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <>
                    <item.icon style={{ width: 20, height: 20, pointerEvents: 'none', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500, pointerEvents: 'none' }}>{item.label}</span>
                  </>
                )}
              </div>
            );
          };
          return (
            <div className="flex md:hidden flex-col w-full border-b border-slate-100">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', width: '100%' }}>
                {row1.map(renderCell)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', width: '100%', borderTop: '1px solid #f1f5f9' }}>
                {row2.map(renderCell)}
              </div>
            </div>
          );
        })()}
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