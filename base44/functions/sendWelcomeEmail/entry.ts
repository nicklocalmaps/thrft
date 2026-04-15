import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const firstName = user.full_name?.split(' ')[0] || 'there';

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to THRFT</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 40px;text-align:center;border-bottom:1px solid #e5e7eb;">
              <img src="https://media.base44.com/images/public/69b782bc4deba77b6b05ba34/ac0f23609_THRFTappheader.png" alt="THRFT" style="height:48px;width:auto;display:block;margin:0 auto;" />
              <p style="margin:12px 0 0;color:#333333;font-size:14px;">Smarter Grocery Shopping</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Hi ${firstName},</p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                Welcome to THRFT! We're so glad you're here.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                THRFT is your intelligent grocery store assistant—designed to help you shop smarter, save money, and make the most of every trip to the store. Whether you're planning meals for the week or just picking up a few essentials, THRFT works alongside you to make grocery shopping easier and more efficient.
              </p>

              <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;font-weight:600;">
                Here's what you can do with THRFT:
              </p>

              <ul style="margin:0 0 24px;padding-left:24px;color:#333333;font-size:15px;line-height:1.8;">
                <li><strong>Use our Pricing Optimization Engine</strong> to see where you'll get the best deals</li>
                <li><strong>Create shared family grocery lists</strong> for your whole family to work together</li>
                <li><strong>Build smarter shopping lists</strong> tailored to your needs</li>
                <li><strong>Track and manage your grocery budget</strong> in real time</li>
                <li><strong>Scan your coupons into the app</strong> instead of bringing coupons to the checkout line</li>
              </ul>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                Our goal is simple: help you spend your grocery budget wisely—without sacrificing the things you love.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                Want to take it even further? Upgrading to a premium account unlocks powerful features for you and your family, helping everyone stay on the same page and make smarter decisions together.
              </p>

              <p style="margin:0 0 8px;font-size:15px;color:#333333;line-height:1.6;">
                Ready to get started?
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.6;">
                Upgrade to Premium and start making every dollar count.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#4181ed;border-radius:8px;">
                    <a href="https://thrft.app/Subscribe" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Upgrade to Premium →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:15px;color:#333333;line-height:1.6;">
                We're excited to be part of your grocery journey.
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:15px;color:#333333;line-height:1.6;">Warmly,</p>
              <p style="margin:4px 0 0;font-size:15px;color:#333333;font-weight:600;">The THRFT Team</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f6f8;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:13px;color:#6b7280;">
                Questions? Email us at <a href="mailto:support@thrft.app" style="color:#4181ed;text-decoration:none;">support@thrft.app</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">© 2025 THRFT. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'THRFT',
      subject: 'Welcome to THRFT – Smarter Grocery Shopping Starts Here',
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});