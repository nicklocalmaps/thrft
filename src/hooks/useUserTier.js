import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Returns { isPremium, isFamily, hasLifetime, loading, user }
 * Premium = account_type premium/family OR has_lifetime_access OR active stripe subscription
 */
export default function useUserTier() {
  const [state, setState] = useState({ isPremium: false, isFamily: false, hasLifetime: false, loading: true, user: null });

  useEffect(() => {
    base44.auth.me().then(user => {
      const activeStatuses = ['trialing', 'active'];
      const stripeActive = activeStatuses.includes(user?.subscription_status);
      const hasLifetime = !!user?.has_lifetime_access;
      const isFamily = user?.account_type === 'family';
      const isPremium = hasLifetime || stripeActive || user?.account_type === 'premium' || isFamily;
      setState({ isPremium, isFamily, hasLifetime, loading: false, user });
    }).catch(() => setState(s => ({ ...s, loading: false })));
  }, []);

  return state;
}