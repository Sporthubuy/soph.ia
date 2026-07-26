-- Enable extensions
create extension if not exists "vector" with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Organizations
create table public.organizations (
  id uuid default extensions.uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.organizations enable row level security;

-- Memberships
create type public.member_role as enum ('owner', 'admin', 'editor', 'viewer');

create table public.memberships (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  role public.member_role default 'viewer' not null,
  created_at timestamptz default now() not null,
  unique(user_id, organization_id)
);

alter table public.memberships enable row level security;

-- RLS: users can see orgs they belong to
create policy "Users can view their organizations"
  on public.organizations for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = organizations.id
        and memberships.user_id = auth.uid()
    )
  );

create policy "Org owners can update their organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = organizations.id
        and memberships.user_id = auth.uid()
        and memberships.role = 'owner'
    )
  );

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

-- RLS: users can see their own memberships
create policy "Users can view their memberships"
  on public.memberships for select
  using (user_id = auth.uid());

create policy "Org owners/admins can manage memberships"
  on public.memberships for all
  using (
    exists (
      select 1 from public.memberships as m
      where m.organization_id = memberships.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

-- Domains (knowledge tree)
create table public.domains (
  id uuid default extensions.uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  name text not null,
  parent_id uuid references public.domains(id) on delete set null,
  owner_id uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.domains enable row level security;

create policy "Org members can view domains"
  on public.domains for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = domains.organization_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "Editors and above can manage domains"
  on public.domains for all
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = domains.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

-- Knowledge Units
create type public.ku_status as enum ('draft', 'proposed', 'approved', 'archived');

create table public.knowledge_units (
  id uuid default extensions.uuid_generate_v4() primary key,
  hash text not null,
  version integer default 1 not null,
  domain_id uuid references public.domains(id) on delete cascade not null,
  owner_id uuid references public.profiles(id) not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  content text default '' not null,
  embedding extensions.vector(1536),
  trust_score integer default 50 not null check (trust_score >= 0 and trust_score <= 100),
  status public.ku_status default 'draft' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id)
);

alter table public.knowledge_units enable row level security;

create policy "Org members can view knowledge units"
  on public.knowledge_units for select
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = knowledge_units.organization_id
        and memberships.user_id = auth.uid()
    )
  );

create policy "Editors and above can create knowledge units"
  on public.knowledge_units for insert
  with check (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = knowledge_units.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

create policy "Editors and above can update knowledge units"
  on public.knowledge_units for update
  using (
    exists (
      select 1 from public.memberships
      where memberships.organization_id = knowledge_units.organization_id
        and memberships.user_id = auth.uid()
        and memberships.role in ('owner', 'admin', 'editor')
    )
  );

-- KU Versions (immutable history)
create table public.ku_versions (
  id uuid default extensions.uuid_generate_v4() primary key,
  ku_id uuid references public.knowledge_units(id) on delete cascade not null,
  version integer not null,
  hash text not null,
  title text not null,
  content text not null,
  changed_by uuid references public.profiles(id) not null,
  change_message text,
  created_at timestamptz default now() not null,
  unique(ku_id, version)
);

alter table public.ku_versions enable row level security;

create policy "Org members can view ku versions"
  on public.ku_versions for select
  using (
    exists (
      select 1 from public.knowledge_units ku
      join public.memberships m on m.organization_id = ku.organization_id
      where ku.id = ku_versions.ku_id
        and m.user_id = auth.uid()
    )
  );

create policy "Editors can create ku versions"
  on public.ku_versions for insert
  with check (
    exists (
      select 1 from public.knowledge_units ku
      join public.memberships m on m.organization_id = ku.organization_id
      where ku.id = ku_versions.ku_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin', 'editor')
    )
  );

-- KU Dependencies
create table public.ku_dependencies (
  id uuid default extensions.uuid_generate_v4() primary key,
  source_ku_id uuid references public.knowledge_units(id) on delete cascade not null,
  target_ku_id uuid references public.knowledge_units(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(source_ku_id, target_ku_id),
  check (source_ku_id != target_ku_id)
);

alter table public.ku_dependencies enable row level security;

create policy "Org members can view dependencies"
  on public.ku_dependencies for select
  using (
    exists (
      select 1 from public.knowledge_units ku
      join public.memberships m on m.organization_id = ku.organization_id
      where ku.id = ku_dependencies.source_ku_id
        and m.user_id = auth.uid()
    )
  );

create policy "Editors can manage dependencies"
  on public.ku_dependencies for all
  using (
    exists (
      select 1 from public.knowledge_units ku
      join public.memberships m on m.organization_id = ku.organization_id
      where ku.id = ku_dependencies.source_ku_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin', 'editor')
    )
  );

-- Indexes
create index idx_knowledge_units_org on public.knowledge_units(organization_id);
create index idx_knowledge_units_domain on public.knowledge_units(domain_id);
create index idx_knowledge_units_status on public.knowledge_units(status);
create index idx_knowledge_units_owner on public.knowledge_units(owner_id);
create index idx_ku_versions_ku_id on public.ku_versions(ku_id);
create index idx_domains_org on public.domains(organization_id);
create index idx_domains_parent on public.domains(parent_id);
create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_org on public.memberships(organization_id);

-- Updated_at trigger function
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.update_updated_at();

create trigger set_domains_updated_at
  before update on public.domains
  for each row execute function public.update_updated_at();

create trigger set_knowledge_units_updated_at
  before update on public.knowledge_units
  for each row execute function public.update_updated_at();
