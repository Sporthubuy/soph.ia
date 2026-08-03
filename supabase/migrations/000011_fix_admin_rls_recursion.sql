-- Drop the problematic policy
drop policy if exists "Users can read their own admin role, admins can read all" on public.admin_roles;

-- Create a simple policy that allows users to read their own admin role
-- No recursion, no complex checks
create policy "Users can read their own admin role"
on public.admin_roles for select
to authenticated
using (user_id = auth.uid());
