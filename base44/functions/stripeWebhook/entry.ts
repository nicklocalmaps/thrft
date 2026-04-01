import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response('Webhook Error', { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const getSubStatus = (sub) => {
      if (sub.status === 'trialing') return 'trialing';
      if (sub.status === 'active') return 'active';
      if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(sub.status)) return 'inactive';
      return sub.status;
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription') {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          const customerId = session.customer;
          // Find user by stripe_customer_id via listCustomers
          const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
          if (users.length > 0) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_status: getSubStatus(sub),
              subscription_id: sub.id,
              trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
            });
            console.log(`Updated user ${users[0].id} to status: ${getSubStatus(sub)}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: getSubStatus(sub),
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          });
          console.log(`Subscription event ${event.type}: updated user ${users[0].id} to ${getSubStatus(sub)}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});