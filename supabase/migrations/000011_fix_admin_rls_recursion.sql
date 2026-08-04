-- SUPERSEDED — intentionally a no-op.
--
-- Same ordering problem as 000010: this prefix sorts before the timestamped
-- migrations, so it ran before public.admin_roles existed and its DROP/CREATE
-- POLICY statements failed (the `if exists` guard covers the policy, not the
-- missing table).
--
-- The correct, non-recursive policy is installed by
-- 20260803171100_fix_admin_roles_rls_recursion.sql. Do not add statements here.

select 1;
