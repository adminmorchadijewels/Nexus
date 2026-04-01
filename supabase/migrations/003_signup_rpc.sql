-- Migration 003: SECURITY DEFINER RPC for safe org creation
-- Bypasses RLS chicken-and-egg on organisations + org_members during signup

CREATE OR REPLACE FUNCTION public.create_org_for_user(org_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Prevent duplicate orgs per user
  IF EXISTS (SELECT 1 FROM org_members WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User already belongs to an organisation';
  END IF;

  INSERT INTO organisations (name) VALUES (org_name) RETURNING id INTO new_org_id;
  INSERT INTO org_members (org_id, user_id, role) VALUES (new_org_id, auth.uid(), 'owner');
  RETURN new_org_id;
END;
$$;

-- Restrict execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.create_org_for_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_org_for_user(text) TO authenticated;
