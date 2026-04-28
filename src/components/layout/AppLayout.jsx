import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  UserCircle,
  Tag,
  Store,
  Gift,
  DollarSign,
  MapPin,
  ChevronRight,
} from 'lucide-react';

import Profile       from '@/pages/Profile';
import Rewards       from '@/pages/Rewards';
import Coupons       from '@/pages/Coupons';
import Budget        from '@/pages/Budget';
import StoreAccounts from '@/pages/StoreAccounts';
import useUserTier   from '@/hooks/useUserTier';
import { base44 }   from '@/api/base44Client';

// ─── Constants ────────────────────────────────────────────────────────────────

const THRFT_BLUE   = '#4181ed';
const THRFT_LOGO   = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/c6dd00316_cartcomparelogo1024x1024.jpg';
const THRFT_HEADER = 'https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/ac0f23609_THRFTappheader.png';

// ─── Profile tab content ──────────────────────────────────────────────────────

function ProfileTab() {
  const [section, setSection] = useState('profile');
  const { isPremium } = useUserTier();

  const sections = [
    { key: 'profile', label: 'Account',   icon: UserCircle, color: '#4181ed', bg: '#eff6ff' },
    { key: 'stores',  label: 'My Stores', icon: Store,      color: '#16a34a', bg: '#f0fdf4' },
    { key: 'rewards', label: 'Rewards',   icon: Gift,       color: '#7c3aed', bg: '#faf5ff' },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {sections.map(s => {
          const Icon = s.icon;
          const active = section === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:  active ? s.bg            : '#f8fafc',
                borderColor: active ? s.color + '55'  : '#e2e8f0',
                color:       active ? s.color         : '#94a3b8',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {section === 'profile' && <Profile />}
          {section === 'stores'  && <StoreAccounts />}
          {section === 'rewards' && <Rewards />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Save tab content ─────────────────────────────────────────────────────────

function SaveTab() {
  const [section, setSection] = useState('coupons');

  return (
    <div>
      <div className="flex gap-1 rounded-2xl p-1 mb-5 bg-slate-100">
        {[
          { key: 'coupons', label: '🏷️ Coupons' },
          { key: 'budget',  label: '💵 Budget'  },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: section === tab.key ? 'white'    : 'transparent',
              color:      section === tab.key ? '#0f172a'  : '#94a3b8',
              boxShadow:  section === tab.key ? '0 1px 4px rgba(0,0,0,.07)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {section === 'coupons' && <Coupons />}
          {section === 'budget'  && <Budget  />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────

function BottomNav({ activeTab, onTabChange }) {
  const navigate = useNavigate();

  const tabs = [
    {
      key:    'lists',
      label:  'Lists',
      icon:   ShoppingCart,
      action: () => { onTabChange('lists'); navigate('/Home'); },
    },
    {
      key:    'newlist',
      label:  'New list',
      isFab:  true,
      action: () => { onTabChange('lists'); navigate('/NewList'); },
    },
    {
      key:    'profile',
      label:  'Profile',
      icon:   UserCircle,
      action: () => onTabChange('profile'),
    },
    {
      key:    'save',
      label:  'Save',
      icon:   Tag,
      action: () => onTabChange('save'),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;

          if (tab.isFab) {
            return (
              <button
                key={tab.key}
                onClick={tab.action}
                className="flex flex-col items-center justify-center"
                style={{ height: 62 }}
                aria-label="New list"
              >
                <div
                  className="flex items-center justify-center rounded-2xl transition-transform active:scale-95"
                  style={{
                    width:           44,
                    height:          44,
                    backgroundColor: THRFT_BLUE,
                    marginTop:       -14,
                    boxShadow:       '0 4px 16px rgba(65,129,237,.45)',
                  }}
                >
                  <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-medium" style={{ fontSize: 10, marginTop: 3, color: '#94a3b8' }}>
                  {tab.label}
                </span>
              </button>
            );
          }

          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={tab.action}
              className="flex flex-col items-center justify-center transition-all active:scale-95"
              style={{ height: 62, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={tab.label}
            >
              <Icon
                className="w-5 h-5 mb-0.5 transition-colors"
                style={{ color: isActive ? THRFT_BLUE : '#94a3b8' }}
              />
              <span
                className="transition-colors"
                style={{
                  fontSize:   10,
                  fontWeight: isActive ? 600 : 400,
                  color:      isActive ? THRFT_BLUE : '#94a3b8',
                  lineHeight: 1,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Desktop nav ──────────────────────────────────────────────────────────────

function DesktopNav({ activeTab, onTabChange, location }) {
  const navigate = useNavigate();

  const items = [
    { key: 'lists',   label: 'My Lists', path: '/Home'    },
    { key: 'newlist', label: 'New List', path: '/NewList' },
    { key: 'profile', label: 'Profile',  path: null       },
    { key: 'save',    label: 'Save',     path: null       },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/Home" className="flex items-center gap-2.5" onClick={() => onTabChange('lists')}>
          <div className="w-8 h-8 rounded-xl overflow-hidden">
            <img src={THRFT_LOGO} alt="THRFT" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">THRFT</span>
        </Link>

        <nav className="flex items-center gap-1">
          {items.map(item => {
            const isActive = item.path
              ? location.pathname === item.path
              : activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.path) { navigate(item.path); onTabChange(item.key === 'newlist' ? 'lists' : item.key); }
                  else           { onTabChange(item.key); navigate('/Home'); }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: THRFT_BLUE, color: '#fff' }
                    : { color: '#475569' }
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

// ─── Main AppLayout ───────────────────────────────────────────────────────────

export default function AppLayout() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [activeTab, setActiveTab] = useState('lists');

  React.useEffect(() => {
    const p = location.pathname;
    if (['/Stores', '/Profile', '/Rewards'].includes(p))  { setActiveTab('profile'); }
    else if (['/Budget', '/Coupons'].includes(p))          { setActiveTab('save'); }
    else                                                   { setActiveTab('lists'); }
  }, []);

  const handleTabChange = tab => {
    setActiveTab(tab);
    if (tab === 'lists' && !['/Home', '/NewList'].includes(location.pathname)) {
      navigate('/Home');
    }
  };

  const showOutlet = activeTab === 'lists';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f0f7ff 0%, white 50%)' }}>

      {/* ── Desktop header ──────────────────────────────────────────────── */}
      <DesktopNav activeTab={activeTab} onTabChange={handleTabChange} location={location} />

      {/* ── Mobile header ───────────────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-50 bg-white border-b border-slate-100 flex items-center justify-between px-4"
        style={{ height: 54 }}
      >
        <button onClick={() => handleTabChange('lists')} className="flex items-center gap-2">
          <img src={THRFT_HEADER} alt="THRFT" style={{ height: 36, width: 'auto' }} />
        </button>

        <button
          onClick={() => { handleTabChange('lists'); navigate('/NewList'); }}
          className="flex items-center justify-center rounded-xl transition-transform active:scale-95"
          style={{ width: 34, height: 34, backgroundColor: THRFT_BLUE, flexShrink: 0 }}
          aria-label="New list"
        >
          <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">
        <AnimatePresence mode="wait">
          {showOutlet ? (
            <motion.div
              key="outlet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          ) : activeTab === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileTab />
            </motion.div>
          ) : activeTab === 'save' ? (
            <motion.div
              key="save"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SaveTab />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}