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
  <title>Your THRFT Premium Trial Ends in 2 Days</title>
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
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Hi ${firstName},</p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                Just a quick reminder—your THRFT Premium 7-day free trial will end in 2 days.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                We hope you've been enjoying the full experience and seeing how THRFT can help you shop smarter, stay on budget, and make more confident grocery decisions.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                When your trial ends, your saved payment method will be automatically charged so you can continue uninterrupted access to all Premium features—including shared household access, advanced budgeting tools, and smarter recommendations to help you spend your grocery budget wisely.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                If you'd like to continue, there's nothing you need to do—your Premium access will carry on seamlessly.
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.6;">
                If Premium isn't the right fit for you, you can cancel anytime before your trial ends to avoid being charged.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#4181ed;border-radius:8px;">
                    <a href="https://thrft.app/Profile" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">🔧 Manage Your Subscription →</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.6;">
                No matter what you decide, we're glad you gave THRFT a try and hope it's already made a difference in your grocery routine.
              </p>

              <p style="margin:0 0 4px;font-size:15px;color:#333333;line-height:1.6;">
                If you have any questions, we're always here to help.
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
      subject: 'Your THRFT Premium Trial Ends in 2 Days',
      body: htmlBody,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendTrialExpiryEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});