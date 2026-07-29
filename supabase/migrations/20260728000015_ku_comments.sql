-- Collaborative comments on Knowledge Units (Drive/Docs-style threads).

create table if not exists public.ku_comments (
  id uuid default extensions.uuid_generate_v4() primary key,
  ku_id uuid references public.knowledge_units(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 4000),
  context text not null default 'general' check (context in ('general', 'review')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_ku_comments_ku on public.ku_comments(ku_id, created_at desc);
create index if not exists idx_ku_comments_org on public.ku_comments(organization_id);

alter table public.ku_comments enable row level security;

drop policy if exists "Org members can view KU comments" on public.ku_comments;
create policy "Org members can view KU comments"
  on public.ku_comments for select
  using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = ku_comments.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Org members can create KU comments" on public.ku_comments;
create policy "Org members can create KU comments"
  on public.ku_comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.memberships m
      where m.organization_id = ku_comments.organization_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Authors can update own KU comments" on public.ku_comments;
create policy "Authors can update own KU comments"
  on public.ku_comments for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "Authors or admins can delete KU comments" on public.ku_comments;
create policy "Authors or admins can delete KU comments"
  on public.ku_comments for delete
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.memberships m
      where m.organization_id = ku_comments.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

drop trigger if exists set_ku_comments_updated_at on public.ku_comments;
create trigger set_ku_comments_updated_at
  before update on public.ku_comments
  for each row execute function public.update_updated_at();
