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
      subject: '👋 Welcome to THRFT — Let\'s Save You Money!',
      body: `Hi ${firstName},

Welcome to THRFT! You're now set up and ready to start saving money on groceries. 🎉

Here's how to get started in 3 easy steps:

1️⃣ Create a grocery list — add the items you need this week
2️⃣ Select your stores — we'll find the ones nearest to you
3️⃣ Hit "Compare Prices" — see exactly which store saves you the most

THRFT compares prices across 50+ stores including Walmart, Kroger, Whole Foods, Amazon Fresh, Trader Joe's, and more — for in-store, curbside pickup, and delivery.

💡 Pro tip: Use the Coupon Scanner to photograph paper coupons and add matching items to your list automatically!

Your 7-day free trial gives you full access to all features. After that, it's just $3.99/month — less than the savings you'll see on your very first trip.

Happy saving,
The THRFT Team

Questions? Reply to this email or reach us at support@thrft.app`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});