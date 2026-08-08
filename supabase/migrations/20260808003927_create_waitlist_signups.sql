create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  source text not null default 'hero',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_key on public.waitlist_signups (lower(email));

alter table public.waitlist_signups enable row level security;

create policy "anon can insert waitlist signups"
on public.waitlist_signups
for insert
to anon, authenticated
with check (true);

grant insert on public.waitlist_signups to anon, authenticated;
grant usage on schema public to anon, authenticated;
