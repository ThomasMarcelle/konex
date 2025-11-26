import Stripe from 'stripe';

// Initialize Stripe only if the key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

export const getStripeConnectUrl = async (accountId: string) => {
  if (!stripe) throw new Error('Stripe not configured');
  
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=success`,
    type: 'account_onboarding',
  });
  return accountLink.url;
};

