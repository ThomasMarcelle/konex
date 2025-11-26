import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook (no user context)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: Request) {
  if (!stripe || !supabaseAdmin) {
    return NextResponse.json({ error: 'Service non configuré' }, { status: 503 });
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const collaborationId = session.metadata?.collaboration_id;
      const paymentIntentId = session.payment_intent as string;

      if (collaborationId) {
        // Update payment status
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'completed',
            paid_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntentId);

        console.log(`Payment completed for collaboration ${collaborationId}`);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      
      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      console.log(`Payment failed: ${paymentIntent.id}`);
      break;
    }

    case 'account.updated': {
      const account = event.data.object;
      
      // Check if onboarding is complete
      if (account.details_submitted && account.charges_enabled) {
        await supabaseAdmin
          .from('creator_profiles')
          .update({ stripe_onboarding_completed: true })
          .eq('stripe_account_id', account.id);

        console.log(`Stripe onboarding completed for account ${account.id}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

