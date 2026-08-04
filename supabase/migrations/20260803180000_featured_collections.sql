-- Featured collections: curated groups of public agents for marketplace discovery

create table public.featured_collections (
  id uuid default extensions.uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text default 'sparkle', -- icon name from icon system
  position integer default 0, -- for ordering
  agent_ids uuid[] default '{}' not null, -- references to public agents
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.featured_collections enable row level security;

-- Everyone can view featured collections
create policy "Anyone can view featured collections"
  on public.featured_collections for select
  using (true);

-- Only admins can manage featured collections (check via admin_roles table)
create policy "Admins can manage featured collections"
  on public.featured_collections for all
  using (
    exists (
      select 1 from public.admin_roles
      where admin_roles.user_id = auth.uid() and admin_roles.role = 'admin'
    )
  );

create index idx_featured_collections_position on public.featured_collections(position);
create trigger set_featured_collections_updated_at
  before update on public.featured_collections
  for each row execute function public.update_updated_at();
