import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const firstName = user.full_name?.split(' ')[0] || 'there';

    await base44.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'THRFT',
      subject: '🎉 Welcome to THRFT Premium!',
      body: `Hi ${firstName},

You're now on THRFT Premium — here's everything you've unlocked:

✅ Unlimited price comparisons across 50+ stores
✅ In-store, curbside pickup & delivery pricing
✅ Coupon Scanner — photograph coupons, leave the paper at home
✅ Grocery Budget Tool — set limits, stay on track
✅ Price History Tracking
✅ Shopping Mode & Item Check-Off

Your grocery bill is about to get a whole lot smaller. 🛒

To get the most out of THRFT:
1. Create a grocery list and add your items
2. Select your nearby stores
3. Hit "Compare Prices" and watch the savings appear

Questions? Reply to this email or reach us at support@thrft.app

Happy saving,
The THRFT Team`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendWelcomeToPremium error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});