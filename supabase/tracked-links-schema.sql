-- =====================================================
-- TRACKED LINKS SYSTEM
-- =====================================================
-- This creates the tracking system for creator-SaaS collaborations
-- Each collaboration gets a unique tracking link that logs all clicks

-- Table: tracked_links
-- Stores the unique tracking URLs for each collaboration
CREATE TABLE IF NOT EXISTS tracked_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  hash TEXT NOT NULL UNIQUE, -- The short code in the URL (e.g., "abc123")
  destination_url TEXT NOT NULL, -- The SaaS website URL to redirect to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: link_clicks
-- Logs every click on a tracked link with metadata
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_link_id UUID NOT NULL REFERENCES tracked_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT, -- IP address of the clicker (for analytics)
  user_agent TEXT, -- Browser/device info
  referrer TEXT, -- Where they came from (e.g., linkedin.com)
  country TEXT, -- Optional: geo-location data
  city TEXT -- Optional: geo-location data
);

-- Enable RLS (Row Level Security)
ALTER TABLE tracked_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracked_links
-- Users can view tracking links for their own collaborations
CREATE POLICY "Users can view their collaboration tracking links"
  ON tracked_links FOR SELECT
  USING (
    collaboration_id IN (
      SELECT c.id FROM collaborations c
      JOIN applications a ON a.id = c.application_id
      JOIN creator_profiles cp ON cp.id = a.creator_id
      WHERE cp.profile_id = auth.uid()
    )
    OR
    collaboration_id IN (
      SELECT c.id FROM collaborations c
      JOIN applications a ON a.id = c.application_id
      JOIN saas_companies sc ON sc.id = a.saas_id
      WHERE sc.profile_id = auth.uid()
    )
  );

-- System can insert tracking links (via service role)
CREATE POLICY "System can create tracking links"
  ON tracked_links FOR INSERT
  WITH CHECK (true);

-- RLS Policies for link_clicks
-- Users can view clicks for their collaboration links
CREATE POLICY "Users can view clicks for their links"
  ON link_clicks FOR SELECT
  USING (
    tracked_link_id IN (
      SELECT tl.id FROM tracked_links tl
      JOIN collaborations c ON c.id = tl.collaboration_id
      JOIN applications a ON a.id = c.application_id
      JOIN creator_profiles cp ON cp.id = a.creator_id
      WHERE cp.profile_id = auth.uid()
    )
    OR
    tracked_link_id IN (
      SELECT tl.id FROM tracked_links tl
      JOIN collaborations c ON c.id = tl.collaboration_id
      JOIN applications a ON a.id = c.application_id
      JOIN saas_companies sc ON sc.id = a.saas_id
      WHERE sc.profile_id = auth.uid()
    )
  );

-- System can insert clicks (no auth required for public tracking)
CREATE POLICY "Anyone can log clicks"
  ON link_clicks FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracked_links_hash ON tracked_links(hash);
CREATE INDEX IF NOT EXISTS idx_tracked_links_collaboration ON tracked_links(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_tracked_link ON link_clicks(tracked_link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tracked_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tracked_links_updated_at
  BEFORE UPDATE ON tracked_links
  FOR EACH ROW
  EXECUTE FUNCTION update_tracked_links_updated_at();

-- Function to generate a unique hash for tracking links
CREATE OR REPLACE FUNCTION generate_tracking_hash()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 8 random characters
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get click count for a tracking link
CREATE OR REPLACE FUNCTION get_link_click_count(link_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM link_clicks WHERE tracked_link_id = link_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get click count for a collaboration
CREATE OR REPLACE FUNCTION get_collaboration_click_count(collab_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM link_clicks lc
    JOIN tracked_links tl ON tl.id = lc.tracked_link_id
    WHERE tl.collaboration_id = collab_id
  );
END;
$$ LANGUAGE plpgsql;

