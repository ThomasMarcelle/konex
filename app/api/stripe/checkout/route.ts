import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 503 });
    }

    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { collaborationId, amount } = await request.json();

    // Get collaboration details
    const { data: collaboration } = await supabase
      .from('collaborations')
      .select(`
        id,
        applications:application_id (
          saas_companies:saas_id (
            profile_id,
            company_name
          ),
          creator_profiles:creator_id (
            stripe_account_id,
            profiles:profile_id (
              full_name
            )
          )
        )
      `)
      .eq('id', collaborationId)
      .single();

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration non trouvée' }, { status: 404 });
    }

    const app = collaboration.applications as any;
    const saasProfileId = app?.saas_companies?.profile_id;
    const creatorStripeAccountId = app?.creator_profiles?.stripe_account_id;
    const creatorName = app?.creator_profiles?.profiles?.full_name || 'Créateur';
    const companyName = app?.saas_companies?.company_name || 'Entreprise';

    // Verify the current user is the SaaS owner
    if (saasProfileId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (!creatorStripeAccountId) {
      return NextResponse.json({ 
        error: 'Le créateur n\'a pas encore configuré son compte Stripe' 
      }, { status: 400 });
    }

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.10);

    // Create Stripe Checkout Session with Connect
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Collaboration avec ${creatorName}`,
              description: `Paiement pour collaboration LinkedIn - ${companyName}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: creatorStripeAccountId,
        },
        metadata: {
          collaboration_id: collaborationId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/collaborations?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/collaborations?payment=cancelled`,
      metadata: {
        collaboration_id: collaborationId,
      },
    });

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        collaboration_id: collaborationId,
        amount,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'pending',
      });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

