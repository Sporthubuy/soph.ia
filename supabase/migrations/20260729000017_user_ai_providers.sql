-- Create user_ai_providers table to store user's AI provider API keys
create table public.user_ai_providers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('anthropic', 'openai', 'google', 'deepseek', 'nvidia')),
  api_key text not null,
  model_name text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, organization_id, provider)
);

-- Enable RLS
alter table public.user_ai_providers enable row level security;

-- Policy: Users can only read/write their own provider configs
create policy "Users can manage their own AI provider configs"
  on public.user_ai_providers
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index for faster lookups
create index idx_user_ai_providers_user_org on public.user_ai_providers(user_id, organization_id);
create index idx_user_ai_providers_provider on public.user_ai_providers(provider);

-- Add updated_at trigger
create or replace function update_user_ai_providers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_ai_providers_updated_at_trigger
  before update on public.user_ai_providers
  for each row
  execute function update_user_ai_providers_updated_at();
