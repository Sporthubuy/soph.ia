-- Insert admin role for rg.aviaga@gmail.com
insert into public.admin_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'rg.aviaga@gmail.com'
on conflict (user_id) do update
set role = 'admin', updated_at = now();
