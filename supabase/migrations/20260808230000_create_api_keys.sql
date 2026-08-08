-- API keys table: each user stores their own keys per AI provider
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('anthropic', 'openai', 'google')),
  encrypted_key text not null,
  key_hint text not null,
  is_valid boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, provider)
);

create index idx_api_keys_profile_id on public.api_keys(profile_id);
create index idx_api_keys_org_id on public.api_keys(organization_id);

alter table public.api_keys enable row level security;

-- Users can only see their own keys
create policy "users can view own api keys"
on public.api_keys for select to authenticated
using (profile_id = (select auth.uid()));

-- Users can insert their own keys
create policy "users can insert own api keys"
on public.api_keys for insert to authenticated
with check (profile_id = (select auth.uid()));

-- Users can update their own keys
create policy "users can update own api keys"
on public.api_keys for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

-- Users can delete their own keys
create policy "users can delete own api keys"
on public.api_keys for delete to authenticated
using (profile_id = (select auth.uid()));
