import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { randomUUID } from 'crypto';

/**
 * ADVANCED TRACKING LINK REDIRECT ENDPOINT
 * 
 * URL format: naano.com/c/[CREATOR_ID]-[SAAS_ID]-[UNIQUE_HASH]
 * 
 * Features:
 * 1. Logs impressions (when link is loaded)
 * 2. Logs clicks (when link is clicked)
 * 3. Sets 30-day cookie for revenue attribution
 * 4. Respects SaaS tracking preferences
 * 5. Redirects to SaaS website with UTM parameters
 */

const COOKIE_NAME = 'naano_attribution';
const COOKIE_LIFETIME_DAYS = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  
  // Use service role client to bypass RLS (tracking links are public)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  const cookieStore = await cookies();

  try {
    // 1. Look up the tracking link by hash
    const { data: trackingLink, error: linkError } = await supabase
      .from('tracked_links')
      .select(`
        id,
        destination_url,
        track_impressions,
        track_clicks,
        track_revenue,
        collaboration_id,
        collaborations:collaboration_id (
          id,
          applications:application_id (
            creator_id,
            saas_id,
            creator_profiles:creator_id (
              id,
              profiles:profile_id (
                full_name
              )
            ),
            saas_companies:saas_id (
              company_name
            )
          )
        )
      `)
      .eq('hash', hash)
      .single();

    if (linkError || !trackingLink) {
      // Link not found - redirect to homepage
      console.error('Tracking link not found:', hash, linkError);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Debug: Log what we found
    console.log('Found tracking link:', {
      hash,
      destination: trackingLink.destination_url,
      collaboration_id: trackingLink.collaboration_id
    });

    // 2. Extract metadata from the request
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referrer = headersList.get('referer') || 'direct';

    // 3. Get or create session ID (for 30-day attribution)
    let sessionId = cookieStore.get(COOKIE_NAME)?.value;
    if (!sessionId) {
      sessionId = randomUUID();
    }

    // 4. Determine event type
    // If this is a click (has referrer or is direct), log as click
    // Otherwise, it's an impression (e.g., link preview, bot crawl)
    const isClick = referrer !== 'direct' || request.headers.get('sec-fetch-dest') === 'document';
    const eventType = isClick && trackingLink.track_clicks ? 'click' : 
                     trackingLink.track_impressions ? 'impression' : null;

    // 5. Log the event (async, don't wait for it)
    if (eventType) {
      supabase
        .from('link_events')
        .insert({
          tracked_link_id: trackingLink.id,
          event_type: eventType,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          session_id: sessionId,
        })
        .then(({ error }) => {
          if (error) {
            console.error(`Error logging ${eventType}:`, error);
          }
        });
    }

    // 6. Build the destination URL with UTM parameters
    console.log('Building destination URL from:', trackingLink.destination_url);
    
    // Validate destination URL
    if (!trackingLink.destination_url || trackingLink.destination_url.trim() === '') {
      console.error('Empty destination URL!');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    const destinationUrl = new URL(trackingLink.destination_url);
    
    // Add UTM parameters for tracking
    destinationUrl.searchParams.set('utm_source', 'naano');
    destinationUrl.searchParams.set('utm_medium', 'ambassador');
    
    // Add creator ID for attribution
    const creatorId = trackingLink.collaborations?.applications?.creator_id;
    if (creatorId) {
      destinationUrl.searchParams.set('utm_content', creatorId);
    }

    // Add campaign name (collaboration ID)
    destinationUrl.searchParams.set('utm_campaign', trackingLink.collaboration_id);

    // 7. Create response with redirect
    const response = NextResponse.redirect(destinationUrl.toString());

    // 8. Set 30-day attribution cookie (if revenue tracking is enabled)
    if (trackingLink.track_revenue) {
      response.cookies.set({
        name: COOKIE_NAME,
        value: sessionId,
        maxAge: COOKIE_LIFETIME_DAYS * 24 * 60 * 60, // 30 days in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Tracking redirect error:', error);
    // On error, redirect to homepage
    return NextResponse.redirect(new URL('/', request.url));
  }
}

/**
 * HEAD request handler (for link previews)
 * Logs impressions without redirecting
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  const supabase = await createClient();

  try {
    const { data: trackingLink } = await supabase
      .from('tracked_links')
      .select('id, track_impressions')
      .eq('hash', hash)
      .single();

    if (trackingLink && trackingLink.track_impressions) {
      // Log impression for link preview
      const headersList = await headers();
      const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const userAgent = headersList.get('user-agent') || 'unknown';

      await supabase.from('link_events').insert({
        tracked_link_id: trackingLink.id,
        event_type: 'impression',
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: 'preview',
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('HEAD request error:', error);
    return new NextResponse(null, { status: 200 });
  }
}

