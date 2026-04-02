import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { return_url } = await req.json();

    if (!user.stripe_customer_id) {
      return Response.json({ error: 'No subscription found for this account.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: return_url || 'https://thrft.base44.app/Profile',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});