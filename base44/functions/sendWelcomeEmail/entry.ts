import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const firstName = user.full_name?.split(' ')[0] || 'there';

    await base44.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'THRFT',
      subject: `Welcome to THRFT, ${firstName}! 🛒 Here's how to save on your first trip`,
      body: `
Hi ${firstName},

Welcome to THRFT! You're all set to start saving money on groceries. Here's a quick guide to get the most out of the app:

🛒 CREATE YOUR FIRST LIST
Head to "New List" and add your weekly grocery items. You can type items manually or search by product name.

🏪 PICK YOUR STORES
Choose from 50+ stores including Walmart, Kroger, Whole Foods, Shipt & more. We'll remember your favorites.

💰 COMPARE PRICES INSTANTLY
Hit "Compare Prices" on any list to see side-by-side totals across every store — including delivery fees.

🏷️ SCAN COUPONS
Got paper coupons? Photograph them in the Coupons tab. Our AI extracts the details and matches them to your list automatically.

📊 SET A BUDGET
Use the Budget tool to set a spending limit per list. We'll tell you which store keeps you on track.

Ready to save?
👉 ${process?.env?.APP_URL || 'https://thrft.app'}/Home

Happy savings,
The THRFT Team

---
You're receiving this because you just signed up for THRFT.
      `.trim(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});