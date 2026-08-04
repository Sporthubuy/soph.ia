-- Replace the recursive SELECT policy created in
-- 20260803170842_add_admin_roles.sql.
--
-- That policy read public.admin_roles from inside a policy ON public.admin_roles,
-- which Postgres rejects at query time with 42P17 (infinite recursion detected in
-- policy for relation "admin_roles"). Every admin check through the anon/authenticated
-- client therefore errored, so checkAdminAuth() fell through to 403.
--
-- Reading your own row is enough for the admin check, and it needs no recursion.

drop policy if exists "Only admins can read admin_roles" on public.admin_roles;
drop policy if exists "Users can read their own admin role, admins can read all" on public.admin_roles;
drop policy if exists "Users can read their own admin role" on public.admin_roles;

create policy "Users can read their own admin role"
on public.admin_roles for select
to authenticated
using (user_id = auth.uid());
