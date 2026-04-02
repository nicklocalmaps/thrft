import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Points config
const POINTS = {
  invite_sent: 2,
  signed_up: 25,
  trial_started: 25,
  subscribed: 150,
  monthly_active: 25,
};

function generateReferralCode(email) {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${rand}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // --- GET OR CREATE user rewards profile ---
    if (action === 'getMyRewards') {
      let records = await base44.asServiceRole.entities.UserRewards.filter({ user_id: user.id });
      if (records.length === 0) {
        const code = generateReferralCode(user.email);
        const newRecord = await base44.asServiceRole.entities.UserRewards.create({
          user_id: user.id,
          user_email: user.email,
          referral_code: code,
          total_points: 0,
          lifetime_points_earned: 0,
          paid_referrals_count: 0,
          total_referrals_count: 0,
          free_months_earned: 0,
          has_lifetime_access: false,
        });
        records = [newRecord];
      }
      const profile = records[0];

      // Get referrals made by this user
      const referrals = await base44.asServiceRole.entities.Referral.filter({ referrer_id: user.id });

      return Response.json({ profile, referrals });
    }

    // --- TRACK REFERRAL (called when someone uses a referral code on signup) ---
    if (action === 'trackReferral') {
      const { referral_code, referred_email, referred_user_id, event } = body;

      // Find referrer by code
      const referrerRecords = await base44.asServiceRole.entities.UserRewards.filter({ referral_code });
      if (referrerRecords.length === 0) {
        return Response.json({ error: 'Invalid referral code' }, { status: 404 });
      }
      const referrerRewards = referrerRecords[0];

      // Find or create the referral record
      let referralRecords = await base44.asServiceRole.entities.Referral.filter({ referral_code, referred_email });
      let referral = referralRecords[0];

      const STATUS_ORDER = ['invited', 'signed_up', 'trial_started', 'subscribed'];

      if (!referral) {
        referral = await base44.asServiceRole.entities.Referral.create({
          referrer_id: referrerRewards.user_id,
          referrer_email: referrerRewards.user_email,
          referred_email,
          referred_user_id: referred_user_id || '',
          status: event,
          points_awarded: POINTS[event] || 0,
          referral_code,
        });
      } else {
        // Only upgrade status, never downgrade
        const currentIdx = STATUS_ORDER.indexOf(referral.status);
        const newIdx = STATUS_ORDER.indexOf(event);
        if (newIdx <= currentIdx) {
          return Response.json({ message: 'Already at this status or higher', referral });
        }
        await base44.asServiceRole.entities.Referral.update(referral.id, {
          status: event,
          referred_user_id: referred_user_id || referral.referred_user_id,
          points_awarded: (referral.points_awarded || 0) + (POINTS[event] || 0),
        });
      }

      // Award points to referrer
      const pointsToAdd = POINTS[event] || 0;
      const newTotal = (referrerRewards.total_points || 0) + pointsToAdd;
      const newLifetime = (referrerRewards.lifetime_points_earned || 0) + pointsToAdd;
      const newPaidCount = event === 'subscribed'
        ? (referrerRewards.paid_referrals_count || 0) + 1
        : referrerRewards.paid_referrals_count || 0;
      const newTotalCount = event === 'signed_up'
        ? (referrerRewards.total_referrals_count || 0) + 1
        : referrerRewards.total_referrals_count || 0;

      // Check lifetime access (5 paid referrals)
      const hasLifetime = newPaidCount >= 5;

      await base44.asServiceRole.entities.UserRewards.update(referrerRewards.id, {
        total_points: newTotal,
        lifetime_points_earned: newLifetime,
        paid_referrals_count: newPaidCount,
        total_referrals_count: newTotalCount,
        has_lifetime_access: hasLifetime,
      });

      return Response.json({ success: true, points_awarded: pointsToAdd, new_total: newTotal });
    }

    // --- REDEEM REWARD ---
    if (action === 'redeemReward') {
      const { reward_type } = body;

      const REDEMPTION_COSTS = {
        free_month: 150,
        free_3_months: 400,
        free_12_months: 1000,
        grocery_credit_2: 100,
        grocery_credit_7: 300,
        grocery_credit_25: 1000,
      };

      const cost = REDEMPTION_COSTS[reward_type];
      if (!cost) return Response.json({ error: 'Invalid reward type' }, { status: 400 });

      const records = await base44.asServiceRole.entities.UserRewards.filter({ user_id: user.id });
      if (records.length === 0) return Response.json({ error: 'No rewards profile found' }, { status: 404 });

      const profile = records[0];
      if ((profile.total_points || 0) < cost) {
        return Response.json({ error: 'Not enough points' }, { status: 400 });
      }

      await base44.asServiceRole.entities.RewardRedemption.create({
        user_id: user.id,
        user_email: user.email,
        reward_type,
        points_spent: cost,
        status: 'pending',
      });

      await base44.asServiceRole.entities.UserRewards.update(profile.id, {
        total_points: profile.total_points - cost,
      });

      return Response.json({ success: true, points_remaining: profile.total_points - cost });
    }

    // --- REGISTER REFERRAL CODE at signup ---
    if (action === 'registerReferralCode') {
      const { referral_code } = body;

      // Make sure user doesn't already have a rewards profile
      const existing = await base44.asServiceRole.entities.UserRewards.filter({ user_id: user.id });
      if (existing.length > 0) {
        return Response.json({ message: 'Already registered' });
      }

      const code = generateReferralCode(user.email);
      await base44.asServiceRole.entities.UserRewards.create({
        user_id: user.id,
        user_email: user.email,
        referral_code: code,
        referred_by_code: referral_code || '',
        total_points: 0,
        lifetime_points_earned: 0,
        paid_referrals_count: 0,
        total_referrals_count: 0,
        free_months_earned: 0,
        has_lifetime_access: false,
      });

      // If referred, log the signup event for the referrer
      if (referral_code) {
        await base44.functions.invoke('referralTracker', {
          action: 'trackReferral',
          referral_code,
          referred_email: user.email,
          referred_user_id: user.id,
          event: 'signed_up',
        });
      }

      return Response.json({ success: true, referral_code: code });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('referralTracker error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});