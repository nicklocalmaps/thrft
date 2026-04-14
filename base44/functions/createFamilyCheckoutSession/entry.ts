import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const FAMILY_PRICE_ID = 'price_1TMBT3JPCOqL1GKgM3F1ASK7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (body.warm) return Response.json({ ok: true });
    const { return_url } = body;

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { base44_user_id: user.id },
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: FAMILY_PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { plan_type: 'family', user_id: user.id },
      },
      success_url: `${return_url}?family_subscribed=true`,
      cancel_url: return_url,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_id: user.id,
        plan_type: 'family',
      },
    });

    console.log(`Family checkout session created for user ${user.email}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Family checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});