import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { base44 } from '@/api/base44Client';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import NewList from '@/pages/NewList';
import ListDetail from '@/pages/ListDetail';
import Onboarding from '@/pages/Onboarding';
import StoreAccounts from '@/pages/StoreAccounts';
import SearchProducts from '@/pages/SearchProducts';
import Subscribe from '@/pages/Subscribe';
import Profile from '@/pages/Profile';
import SubscriptionGate from '@/components/subscription/SubscriptionGate';
import Landing from '@/pages/Landing';
import ContactUs from '@/pages/ContactUs';
import Rewards from '@/pages/Rewards';
import InviteFriends from '@/pages/InviteFriends';
import FAQ from '@/pages/FAQ';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Budget from '@/pages/Budget';
import Coupons from '@/pages/Coupons';
import FamilyInvite from '@/pages/FamilyInvite.jsx';

const OnboardingGate = () => {
  const [checking, setChecking] = React.useState(true);
  const [needsOnboarding, setNeedsOnboarding] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(user => {
      if (!user?.onboarding_complete) {
        setNeedsOnboarding(true);
      }
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  if (checking) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );

  if (needsOnboarding) return <Navigate to="/Onboarding" replace />;
  return <Navigate to="/Home" replace />;

};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Allow public landing page without login
      const isPublicRoute = ['/', '/landing'].includes(window.location.pathname);
      if (!isPublicRoute) {
        navigateToLogin();
        return null;
      }
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/Onboarding" element={<Onboarding />} />
      <Route path="/Subscribe" element={<Subscribe />} />
      <Route path="/ContactUs" element={<ContactUs />} />
      <Route path="/FAQ" element={<FAQ />} />
      <Route path="/Terms" element={<Terms />} />
      <Route path="/Privacy" element={<Privacy />} />
      <Route element={<AppLayout />}>
        <Route path="/app" element={<OnboardingGate />} />
        <Route path="/Home" element={<SubscriptionGate><Home /></SubscriptionGate>} />
        <Route path="/NewList" element={<SubscriptionGate><NewList /></SubscriptionGate>} />
        <Route path="/ListDetail" element={<SubscriptionGate><ListDetail /></SubscriptionGate>} />
        <Route path="/StoreAccounts" element={<SubscriptionGate><StoreAccounts /></SubscriptionGate>} />
        <Route path="/Profile" element={<SubscriptionGate><Profile /></SubscriptionGate>} />
        <Route path="/SearchProducts" element={<SubscriptionGate><SearchProducts /></SubscriptionGate>} />
        <Route path="/Rewards" element={<SubscriptionGate><Rewards /></SubscriptionGate>} />
        <Route path="/InviteFriends" element={<SubscriptionGate><InviteFriends /></SubscriptionGate>} />
        <Route path="/Budget" element={<SubscriptionGate><Budget /></SubscriptionGate>} />
        <Route path="/Coupons" element={<SubscriptionGate><Coupons /></SubscriptionGate>} />
        <Route path="/FamilyInvite" element={<SubscriptionGate><FamilyInvite /></SubscriptionGate>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App