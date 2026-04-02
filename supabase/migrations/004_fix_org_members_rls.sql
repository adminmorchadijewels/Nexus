-- Migration 004: Fix org_members RLS conflict + add safe org lookup function
--
-- Problem: "org owners can manage members" FOR ALL creates a shadowing SELECT policy
-- that uses a self-referential subquery. When combined with "users can view their
-- memberships" FOR SELECT, PostgreSQL can short-circuit visibility in some cases.
--
-- Fix: Drop the conflicting FOR ALL policy, replace with explicit per-operation policies.
-- Add a SECURITY DEFINER helper for safe org_id lookup that bypasses RLS.

-- Drop the conflicting catch-all policy
DROP POLICY IF EXISTS "org owners can manage members" ON org_members;

-- Recreate as explicit separate policies
CREATE POLICY "org_members_insert" ON org_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "org_members_update" ON org_members
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "org_members_delete" ON org_members
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Safe SECURITY DEFINER function to look up the calling user's org_id
-- Used by the dashboard as a reliable fallback when RLS SELECT is flaky
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM org_members WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_org_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
