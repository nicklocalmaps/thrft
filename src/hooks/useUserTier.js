import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Returns { isPremium, isFamily, hasLifetime, isFree, listsThisMonth, canCreateList, loading, user }
 *
 * Free tier: 2 lists/month, Walmart+Kroger+Amazon Fresh only, in-store prices only
 * Premium: active/trialing Stripe sub, lifetime access, or family plan
 */
export const FREE_TIER_STORES = ['walmart', 'kroger', 'amazon'];
export const FREE_TIER_LIST_LIMIT = 5;

export default function useUserTier() {
  const [state, setState] = useState({
    isPremium: false,
    isFamily: false,
    hasLifetime: false,
    isFree: true,
    listsThisMonth: 0,
    canCreateList: true,
    loading: true,
    user: null,
  });

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.GroceryList.list('-created_date', 20),
    ]).then(([user, allLists]) => {
      const activeStatuses = ['trialing', 'active'];
      const stripeActive = activeStatuses.includes(user?.subscription_status);
      const hasLifetime = !!user?.has_lifetime_access;
      const isFamily = user?.account_type === 'family';
      const isPremium = hasLifetime || stripeActive || user?.account_type === 'premium' || isFamily;
      const isFree = !isPremium;

      // Count lists created this calendar month
      let listsThisMonth = 0;
      if (isFree) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        listsThisMonth = allLists.filter(l => l.created_date >= monthStart).length;
      }

      const canCreateList = isPremium || listsThisMonth < FREE_TIER_LIST_LIMIT;

      setState({
        isPremium,
        isFamily,
        hasLifetime,
        isFree,
        listsThisMonth,
        canCreateList,
        loading: false,
        user,
      });
    }).catch(() => setState(s => ({ ...s, loading: false })));
  }, []);

  return state;
}