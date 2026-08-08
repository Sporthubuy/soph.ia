-- Postgres grants EXECUTE to the PUBLIC pseudo-role on every new function
-- by default, which made these SECURITY DEFINER functions callable via
-- RPC by anon/authenticated even though revoking from `anon` alone did not
-- remove that implicit grant. Lock them down to what each actually needs.

revoke execute on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.set_updated_at() from public;
