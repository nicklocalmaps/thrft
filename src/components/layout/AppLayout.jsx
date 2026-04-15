import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Store, UserCircle, Gift, DollarSign, Ticket } from 'lucide-react';
import ReferralBanner from '@/components/rewards/ReferralBanner';
import { base44 } from '@/api/base44Client';

const THRFT_BLUE = '#4181ed';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

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
      <header className="sticky top-0 z-50 bg-white border-b border-blue-100/50">
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

        {/* Mobile header — 2 rows of 4, each cell is a native button that calls navigate() */}
        <div className="flex md:hidden flex-col w-full">
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: 52 }}>
            <button onClick={() => navigate('/Home')} style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f1f5f9', background: 'none', border: 'none', borderRight: '1px solid #f1f5f9', cursor: 'pointer', padding: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden' }}>
                <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg" alt="THRFT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </button>
            <button onClick={() => navigate('/Home')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRight: '1px solid #f1f5f9', backgroundColor: location.pathname === '/Home' ? THRFT_BLUE : 'transparent', color: location.pathname === '/Home' ? 'white' : '#475569', cursor: 'pointer', border: 'none', borderRight: '1px solid #f1f5f9', padding: 0 }}>
              <ShoppingCart style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>My Lists</span>
            </button>
            <button onClick={() => navigate('/NewList')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRight: '1px solid #f1f5f9', backgroundColor: location.pathname === '/NewList' ? THRFT_BLUE : 'transparent', color: location.pathname === '/NewList' ? 'white' : '#475569', cursor: 'pointer', border: 'none', borderRight: '1px solid #f1f5f9', padding: 0 }}>
              <Plus style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>New List</span>
            </button>
            <button onClick={() => navigate('/Budget')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: location.pathname === '/Budget' ? THRFT_BLUE : 'transparent', color: location.pathname === '/Budget' ? 'white' : '#475569', cursor: 'pointer', border: 'none', padding: 0 }}>
              <DollarSign style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>Budget</span>
            </button>
          </div>
          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: 52, borderTop: '1px solid #f1f5f9' }}>
            <button onClick={() => navigate('/Coupons')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRight: '1px solid #f1f5f9', backgroundColor: location.pathname === '/Coupons' ? THRFT_BLUE : 'transparent', color: location.pathname === '/Coupons' ? 'white' : '#475569', cursor: 'pointer', border: 'none', borderRight: '1px solid #f1f5f9', padding: 0 }}>
              <Ticket style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>Coupons</span>
            </button>
            <button onClick={() => navigate('/StoreAccounts')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRight: '1px solid #f1f5f9', backgroundColor: location.pathname === '/StoreAccounts' ? THRFT_BLUE : 'transparent', color: location.pathname === '/StoreAccounts' ? 'white' : '#475569', cursor: 'pointer', border: 'none', borderRight: '1px solid #f1f5f9', padding: 0 }}>
              <Store style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>Store Accounts</span>
            </button>
            <button onClick={() => navigate('/Rewards')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRight: '1px solid #f1f5f9', backgroundColor: location.pathname === '/Rewards' ? THRFT_BLUE : 'transparent', color: location.pathname === '/Rewards' ? 'white' : '#475569', cursor: 'pointer', border: 'none', borderRight: '1px solid #f1f5f9', padding: 0 }}>
              <Gift style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>Rewards</span>
            </button>
            <button onClick={() => navigate('/Profile')} style={{ height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: location.pathname === '/Profile' ? THRFT_BLUE : 'transparent', color: location.pathname === '/Profile' ? 'white' : '#475569', cursor: 'pointer', border: 'none', padding: 0 }}>
              <UserCircle style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, lineHeight: 1, fontWeight: 500 }}>Profile</span>
            </button>
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