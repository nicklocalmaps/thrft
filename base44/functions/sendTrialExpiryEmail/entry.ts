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
      subject: '⏰ Your THRFT trial ends in 2 days',
      body: `Hi ${firstName},

Your 7-day free trial ends in 2 days.

Don't lose access to:
🛒 Price comparisons across 50+ stores
🏷️ Your Coupon Scanner
💰 The Grocery Budget Tool
📈 Price History

Keep saving for just $3.99/month — less than the cost of a single extra grocery item you'd overpay for without THRFT.

👉 Continue your subscription: https://thrft.app/Subscribe

If you have any questions, reply to this email or reach out at support@thrft.app

The THRFT Team`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendTrialExpiryEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});