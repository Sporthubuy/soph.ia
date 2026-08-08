-- Supabase's platform automation grants EXECUTE on newly created public
-- schema functions directly to anon/authenticated (separate from, and not
-- removed by, revoking the PUBLIC pseudo-role grant). These two functions
-- are trigger-only (handle_new_user on auth.users, set_updated_at on
-- knowledge_units) and must never be callable as a direct RPC.

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
