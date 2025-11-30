-- Complete RLS Policy Fix for Konex
-- Run this entire script in Supabase SQL Editor

-- ============================================================================
-- 1. PUBLICATION PROOFS - Fix RLS Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view proofs for their collaborations" ON publication_proofs;
DROP POLICY IF EXISTS "Creators can submit proofs" ON publication_proofs;
DROP POLICY IF EXISTS "SaaS can validate proofs" ON publication_proofs;

-- Enable RLS
ALTER TABLE publication_proofs ENABLE ROW LEVEL SECURITY;

-- Policy 1: View proofs (both creator and SaaS)
CREATE POLICY "Users can view proofs for their collaborations"
  ON publication_proofs FOR SELECT
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

-- Policy 2: Insert proofs (creators only)
CREATE POLICY "Creators can submit proofs"
  ON publication_proofs FOR INSERT
  WITH CHECK ( 
    collaboration_id IN (
      SELECT c.id FROM collaborations c
      JOIN applications a ON a.id = c.application_id
      JOIN creator_profiles cp ON cp.id = a.creator_id
      WHERE cp.profile_id = auth.uid()
      AND c.status = 'active'
    )
  );

-- Policy 3: Update proofs (SaaS only - for validation)
CREATE POLICY "SaaS can validate proofs"
  ON publication_proofs FOR UPDATE
  USING ( 
    collaboration_id IN (
      SELECT c.id FROM collaborations c
      JOIN applications a ON a.id = c.application_id
      JOIN saas_companies sc ON sc.id = a.saas_id
      WHERE sc.profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. COLLABORATIONS - Verify RLS Policies
-- ============================================================================

-- Drop and recreate collaboration policies
DROP POLICY IF EXISTS "Users can view their collaborations" ON collaborations;

CREATE POLICY "Users can view their collaborations"
  ON collaborations FOR SELECT
  USING ( 
    auth.uid() IN (
      SELECT cp.profile_id FROM creator_profiles cp
      JOIN applications a ON a.creator_id = cp.id
      WHERE a.id = collaborations.application_id
    )
    OR
    auth.uid() IN (
      SELECT sc.profile_id FROM saas_companies sc
      JOIN applications a ON a.saas_id = sc.id
      WHERE a.id = collaborations.application_id
    )
  );

-- ============================================================================
-- 3. APPLICATIONS - Verify RLS Policies
-- ============================================================================

-- Ensure applications policies exist
DROP POLICY IF EXISTS "Creators can view their own applications" ON applications;
DROP POLICY IF EXISTS "SaaS can view applications to their company" ON applications;
DROP POLICY IF EXISTS "Creators can create applications" ON applications;
DROP POLICY IF EXISTS "SaaS can update application status" ON applications;

-- Recreate application policies
CREATE POLICY "Creators can view their own applications"
  ON applications FOR SELECT
  USING ( 
    auth.uid() IN (
      SELECT profile_id FROM creator_profiles WHERE id = applications.creator_id
    )
  );

CREATE POLICY "SaaS can view applications to their company"
  ON applications FOR SELECT
  USING ( 
    auth.uid() IN (
      SELECT profile_id FROM saas_companies WHERE id = applications.saas_id
    )
  );

CREATE POLICY "Creators can create applications"
  ON applications FOR INSERT
  WITH CHECK ( 
    auth.uid() IN (
      SELECT profile_id FROM creator_profiles WHERE id = applications.creator_id
    )
  );

CREATE POLICY "SaaS can update application status"
  ON applications FOR UPDATE
  USING ( 
    auth.uid() IN (
      SELECT profile_id FROM saas_companies WHERE id = applications.saas_id
    )
  );

-- ============================================================================
-- 4. VERIFY ALL TABLES HAVE RLS ENABLED
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. TEST QUERIES (Run these after to verify)
-- ============================================================================

-- Test 1: Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'publication_proofs';

-- Test 2: Try to select (should work if you're authenticated)
-- SELECT * FROM publication_proofs;

-- Test 3: Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('publication_proofs', 'collaborations', 'applications');

