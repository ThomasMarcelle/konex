# 🔗 Tracking Links System - Documentation

## Overview

The tracking links system is the **core value proposition** of Konex. It allows creators to share unique URLs that:
- Track every click with detailed metadata
- Redirect visitors to the SaaS website
- Provide analytics for both creators and SaaS companies
- Enable commission calculation based on traffic

---

## How It Works

### 1. Link Generation

When a collaboration is created (SaaS accepts creator), the system:
- Generates a unique 8-character hash (e.g., `x7k9m2a1`)
- Stores it in the `tracked_links` table
- Associates it with the collaboration and SaaS website URL

### 2. Link Sharing

The creator receives a tracking URL:
```
https://konex.app/t/x7k9m2a1
```

They share this link:
- In LinkedIn post comments
- In their LinkedIn bio
- In direct messages
- Anywhere they promote the SaaS

### 3. Click Tracking

When someone clicks the link:
1. Request goes to `/t/[hash]` endpoint
2. System logs click data:
   - Timestamp
   - IP address
   - User agent (browser/device)
   - Referrer (where they came from)
3. System redirects to SaaS website with UTM parameters:
   ```
   https://saas-website.com?utm_source=konex&utm_medium=ambassador&utm_content=creator-name
   ```

### 4. Analytics

Both creator and SaaS can see:
- Total click count
- Click history (future: charts, graphs)
- Geographic distribution (future)
- Device breakdown (future)

---

## Database Schema

### Table: `tracked_links`

Stores the unique tracking URLs for each collaboration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `collaboration_id` | UUID | Foreign key to collaborations |
| `hash` | TEXT | Unique short code (e.g., "x7k9m2a1") |
| `destination_url` | TEXT | SaaS website URL to redirect to |
| `created_at` | TIMESTAMPTZ | When link was created |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### Table: `link_clicks`

Logs every click on a tracked link.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tracked_link_id` | UUID | Foreign key to tracked_links |
| `clicked_at` | TIMESTAMPTZ | When click happened |
| `ip_address` | TEXT | IP address of clicker |
| `user_agent` | TEXT | Browser/device info |
| `referrer` | TEXT | Where they came from |
| `country` | TEXT | Optional: geo-location |
| `city` | TEXT | Optional: geo-location |

---

## API Endpoints

### GET `/t/[hash]`

**Purpose:** Redirect endpoint for tracking links

**Flow:**
1. Look up hash in database
2. Log click with metadata
3. Redirect to SaaS website with UTM parameters

**Example:**
```
GET /t/x7k9m2a1
→ Logs click
→ Redirects to: https://saas.com?utm_source=konex&utm_medium=ambassador
```

---

## Server Actions

### `getOrCreateTrackingLink(collaborationId: string)`

**Purpose:** Get existing tracking link or create a new one

**Returns:**
```typescript
{
  success: boolean;
  link?: {
    id: string;
    hash: string;
    destination_url: string;
  };
  clickCount?: number;
  error?: string;
}
```

**Used by:** Collaboration detail page to display tracking link

---

## UI Components

### `TrackingLinkCard`

**Location:** `components/collaborations/tracking-link-card.tsx`

**Props:**
- `hash: string` - The tracking link hash
- `clickCount: number` - Total clicks
- `isCreator: boolean` - Whether viewing as creator or SaaS

**Features:**
- Beautiful gradient card design
- One-click copy button with feedback
- Real-time click counter
- Instructions for creators
- Test link button

---

## Security

### Row Level Security (RLS)

**tracked_links:**
- Users can only view links for their own collaborations
- System (service role) can create links

**link_clicks:**
- Users can only view clicks for their own links
- Anyone can log clicks (public endpoint)

### Hash Generation

- 8 random characters (lowercase + numbers)
- Checked for uniqueness before creation
- Extremely low collision probability (~2.8 trillion combinations)

---

## UTM Parameters

All tracking links add these UTM parameters to the destination URL:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `utm_source` | `konex` | Identifies traffic source |
| `utm_medium` | `ambassador` | Identifies marketing channel |
| `utm_content` | `creator-name` | Identifies specific creator |

**Example:**
```
https://hubspot.com?utm_source=konex&utm_medium=ambassador&utm_content=sofia-martin
```

This allows the SaaS to:
- Track Konex traffic in Google Analytics
- Measure ROI from ambassador program
- See which creators drive the most traffic

---

## Future Enhancements

### Phase 2: Advanced Analytics
- Click charts (daily, weekly, monthly)
- Geographic heatmaps
- Device/browser breakdown
- Referrer analysis

### Phase 3: Conversion Tracking
- Cookie-based attribution (30-day window)
- Track signups from clicks
- Track purchases from clicks
- Revenue attribution per creator

### Phase 4: Commission Automation
- Auto-calculate earnings based on clicks
- Configurable price per click
- Automated payouts via Stripe Connect

### Phase 5: Link Customization
- Custom short codes (e.g., `/t/sofia-hubspot`)
- Multiple links per collaboration
- QR code generation
- Link expiration dates

---

## Testing

### Manual Testing Steps

1. **Create Collaboration:**
   - Login as creator → Apply to SaaS
   - Login as SaaS → Accept application

2. **View Tracking Link:**
   - Go to collaboration page
   - Verify blue tracking card appears
   - Verify hash is 8 characters
   - Click "Copier" button → verify "Copié!" feedback

3. **Test Redirect:**
   - Copy tracking link
   - Open in incognito window
   - Verify redirect to SaaS website
   - Verify UTM parameters in URL

4. **Verify Click Logging:**
   - Refresh collaboration page
   - Verify click count increased
   - Check Supabase `link_clicks` table
   - Verify metadata (IP, user agent, referrer)

### Automated Testing (Future)

```typescript
// Example test
describe('Tracking Links', () => {
  it('should generate unique hash', async () => {
    const link = await getOrCreateTrackingLink(collaborationId);
    expect(link.hash).toHaveLength(8);
  });

  it('should redirect and log click', async () => {
    const response = await fetch(`/t/${hash}`);
    expect(response.status).toBe(307); // Redirect
    // Verify click was logged in database
  });
});
```

---

## Troubleshooting

### Issue: "Le SaaS n'a pas de site web configuré"

**Cause:** SaaS company doesn't have a website URL set in their profile

**Fix:** 
1. Login as SaaS
2. Go to Settings
3. Add website URL
4. Refresh collaboration page

### Issue: Click count not increasing

**Possible causes:**
1. Browser cache - try incognito mode
2. Same IP address - try different device/network
3. RLS policy issue - check Supabase logs
4. Page not refreshed - hard refresh (Cmd+Shift+R)

**Debug:**
1. Check browser console for errors
2. Check Supabase `link_clicks` table
3. Verify RLS policies are enabled
4. Check server logs for redirect errors

### Issue: Redirect not working

**Possible causes:**
1. Invalid destination URL
2. Hash not found in database
3. Network error

**Debug:**
1. Check browser network tab
2. Verify hash exists in `tracked_links` table
3. Check `/t/[hash]/route.ts` logs
4. Verify destination URL is valid

---

## Performance Considerations

### Database Indexes

The following indexes are created for optimal performance:
- `idx_tracked_links_hash` - Fast hash lookup
- `idx_tracked_links_collaboration` - Fast collaboration queries
- `idx_link_clicks_tracked_link` - Fast click count queries
- `idx_link_clicks_clicked_at` - Fast time-based queries

### Caching (Future)

For high-traffic links, consider:
- Redis cache for hash → destination URL mapping
- Edge caching for redirect endpoint
- Batch click logging (log every N clicks)

---

## Compliance & Privacy

### GDPR Considerations

- IP addresses are considered personal data
- Store only for legitimate business purposes
- Provide data export for users
- Honor deletion requests

### Best Practices

- Anonymize IP addresses after 30 days
- Don't track sensitive user behavior
- Provide clear privacy policy
- Allow users to opt-out of tracking

---

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs
3. Check browser console
4. Contact support with:
   - Collaboration ID
   - Tracking hash
   - Error message
   - Steps to reproduce

---

**Last Updated:** December 2, 2025  
**Version:** 1.0

