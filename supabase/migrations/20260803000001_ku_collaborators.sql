-- Knowledge Unit collaborators and invitations

-- KU members table
create table if not exists ku_members (
  id uuid default gen_random_uuid() primary key,
  ku_id uuid not null references knowledge_units(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(ku_id, user_id)
);

-- KU invitations table
create table if not exists ku_invitations (
  id uuid default gen_random_uuid() primary key,
  ku_id uuid not null references knowledge_units(id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users(id),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(ku_id, email)
);

-- Enable RLS
alter table ku_members enable row level security;
alter table ku_invitations enable row level security;

-- RLS policies for ku_members
create policy "Anyone can view KU members" on ku_members
  for select using (true);

create policy "Only KU owner can manage members" on ku_members
  for all using (
    exists (
      select 1 from knowledge_units
      where id = ku_members.ku_id
      and owner_id = auth.uid()
    )
  );

-- RLS policies for ku_invitations
create policy "Anyone can view KU invitations" on ku_invitations
  for select using (true);

create policy "Only KU owner can manage invitations" on ku_invitations
  for all using (
    exists (
      select 1 from knowledge_units
      where id = ku_invitations.ku_id
      and owner_id = auth.uid()
    )
  );
