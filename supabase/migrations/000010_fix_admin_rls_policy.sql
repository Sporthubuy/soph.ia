-- SUPERSEDED — intentionally a no-op.
--
-- This file's numeric prefix (000010) sorts BEFORE the timestamped migrations,
-- so it ran before public.admin_roles existed and could never apply. The policy
-- it tried to install was also self-referential (it queried admin_roles from a
-- policy on admin_roles), which Postgres rejects with 42P17 infinite recursion.
--
-- The correct, non-recursive policy is installed by
-- 20260803171100_fix_admin_roles_rls_recursion.sql, which sorts after
-- 20260803170842_add_admin_roles.sql. Do not add statements here.

select 1;
