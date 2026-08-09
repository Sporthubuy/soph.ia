-- KU visibility: 'private' (author only), 'team' (default, whole org), 'org'
-- (also whole org today, kept for future team-vs-org distinction). RLS is
-- tightened: private KUs are visible only to their author.

alter table public.knowledge_units
  add column if not exists visibility text not null default 'team'
    check (visibility in ('private', 'team', 'org'));

create index if not exists idx_knowledge_units_visibility on public.knowledge_units(visibility);

drop policy if exists "members can view org knowledge units" on public.knowledge_units;

create policy "members can view org knowledge units"
on public.knowledge_units
for select
to authenticated
using (
  organization_id = (select public.current_organization_id())
  and (visibility <> 'private' or author_id = (select auth.uid()))
);
