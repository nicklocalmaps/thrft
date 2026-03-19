import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';

const THRFT_BLUE = '#4181ed';

export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/Home', label: 'My Lists', icon: ShoppingCart },
    { path: '/NewList', label: 'New List', icon: Plus },
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
                Cart<span style={{ color: THRFT_BLUE }}>Compare</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-slate-600 hover:bg-blue-50'
                    }`}
                    style={isActive ? { backgroundColor: THRFT_BLUE } : {}}
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}