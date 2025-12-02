-- =====================================================
-- FIX: Make all tracking ALWAYS ON
-- =====================================================

-- 1. Update ALL existing tracked_links to have tracking ON
UPDATE tracked_links
SET 
  track_impressions = TRUE,
  track_clicks = TRUE,
  track_revenue = TRUE;

-- 2. Update ALL existing saas_tracking_config to have tracking ON
UPDATE saas_tracking_config
SET 
  track_impressions = TRUE,
  track_clicks = TRUE,
  track_revenue = TRUE;

-- 3. Change the default values for future rows
ALTER TABLE tracked_links
  ALTER COLUMN track_impressions SET DEFAULT TRUE,
  ALTER COLUMN track_clicks SET DEFAULT TRUE,
  ALTER COLUMN track_revenue SET DEFAULT TRUE;

ALTER TABLE saas_tracking_config
  ALTER COLUMN track_impressions SET DEFAULT TRUE,
  ALTER COLUMN track_clicks SET DEFAULT TRUE,
  ALTER COLUMN track_revenue SET DEFAULT TRUE;

-- Done! All tracking is now ALWAYS ON 🎉

