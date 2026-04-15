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
        <div className="flex md:hidden flex-col w-full border-b border-slate-100">
          {/* Row 1: Logo | My Lists | New List | Budget */}
          <div className="grid grid-cols-4 w-full divide-x divide-slate-100">
            {/* Logo cell */}
            <div className="relative flex flex-col items-center justify-center min-h-[52px]">
              <Link to="/Home" className="absolute inset-0 z-10" aria-label="Home" />
              <div className="w-8 h-8 rounded-lg overflow-hidden pointer-events-none">
                <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* My Lists, New List, Budget */}
            {navItems.slice(0, 3).map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <div
                  key={path}
                  className="relative flex flex-col items-center justify-center gap-1 min-h-[52px]"
                  style={{ backgroundColor: isActive ? THRFT_BLUE : 'transparent', color: isActive ? 'white' : '#475569' }}
                >
                  <Link to={path} className="absolute inset-0 z-10" aria-label={label} />
                  <Icon className="w-5 h-5 shrink-0 pointer-events-none" />
                  <span className="text-[10px] leading-none font-medium pointer-events-none">{label}</span>
                </div>
              );
            })}
          </div>
          {/* Row 2: Coupons | Store Accounts | Rewards | Profile */}
          <div className="grid grid-cols-4 w-full divide-x divide-slate-100 border-t border-slate-100">
            {navItems.slice(3).map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <div
                  key={path}
                  className="relative flex flex-col items-center justify-center gap-1 min-h-[52px]"
                  style={{ backgroundColor: isActive ? THRFT_BLUE : 'transparent', color: isActive ? 'white' : '#475569' }}
                >
                  <Link to={path} className="absolute inset-0 z-10" aria-label={label} />
                  <Icon className="w-5 h-5 shrink-0 pointer-events-none" />
                  <span className="text-[10px] leading-none font-medium pointer-events-none">{label}</span>
                </div>
              );
            })}
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