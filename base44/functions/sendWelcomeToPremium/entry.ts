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
  <title>Welcome to THRFT Premium</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#4181ed;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">THRFT</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Welcome to Premium</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Hi ${firstName},</p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                Welcome to THRFT Premium! Your 7-day free trial has officially begun—and we're excited for you to experience a smarter, more powerful way to grocery shop.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                With Premium, you're unlocking the full potential of THRFT, designed to help you and your household make better decisions, stay aligned, and get the most out of every grocery dollar.
              </p>

              <p style="margin:0 0 12px;font-size:15px;color:#333333;line-height:1.6;font-weight:600;">
                Here's what you can start exploring right away:
              </p>

              <ul style="margin:0 0 24px;padding-left:24px;color:#333333;font-size:15px;line-height:1.8;">
                <li><strong>Create Unlimited Grocery Lists</strong></li>
                <li><strong>Advanced budget tracking</strong> to help you stay in control and avoid overspending</li>
                <li><strong>Shared access for your household</strong> so everyone can plan and shop together</li>
                <li><strong>Smarter recommendations</strong> to find the best value on the items you love</li>
                <li><strong>Enhanced organization tools</strong> to simplify every shopping trip</li>
              </ul>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                This trial is your opportunity to see how THRFT Premium can help you truly <em>spend your grocery budget wisely</em> – without the stress.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                No pressure—just results. Try it out, explore the features, and see the difference for yourself.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                When your trial ends, you'll have the option to continue enjoying Premium and keep the momentum going.
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.6;">
                If you have any questions or need help getting started, we're here for you every step of the way.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#4181ed;border-radius:8px;">
                    <a href="https://thrft.app/Home" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Start Exploring THRFT →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:15px;color:#333333;">Enjoy your Premium experience!</p>
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
      subject: 'Welcome to THRFT Premium – Your Free Trial Starts Now',
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendWelcomeToPremium error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});