-- Drop the existing restrictive policy
drop policy if exists "Only admins can read admin_roles" on public.admin_roles;

-- Create a new policy that allows users to read their own admin role
-- and allows admins to read all admin roles
create policy "Users can read their own admin role, admins can read all"
on public.admin_roles for select
to authenticated
using (
  -- Allow reading own row
  user_id = auth.uid()
  OR
  -- Allow admins to read all rows
  exists (
    select 1 from public.admin_roles
    where user_id = auth.uid() and role = 'admin'
  )
);
