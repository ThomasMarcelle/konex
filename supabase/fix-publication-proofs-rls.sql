-- Fix RLS policies for publication_proofs table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view proofs for their collaborations" ON publication_proofs;
DROP POLICY IF EXISTS "Creators can submit proofs" ON publication_proofs;
DROP POLICY IF EXISTS "SaaS can validate proofs" ON publication_proofs;

-- Recreate policies with correct permissions

-- 1. Allow users to view proofs for their collaborations
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

-- 2. Allow creators to insert proofs for their collaborations
CREATE POLICY "Creators can submit proofs"
  ON publication_proofs FOR INSERT
  WITH CHECK ( 
    collaboration_id IN (
      SELECT c.id FROM collaborations c
      JOIN applications a ON a.id = c.application_id
      JOIN creator_profiles cp ON cp.id = a.creator_id
      WHERE cp.profile_id = auth.uid()
    )
  );

-- 3. Allow SaaS to update (validate) proofs for their collaborations
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

-- Verify RLS is enabled
ALTER TABLE publication_proofs ENABLE ROW LEVEL SECURITY;

-- Test query to verify policies work (run as authenticated user)
-- SELECT * FROM publication_proofs; -- Should only show your proofs

