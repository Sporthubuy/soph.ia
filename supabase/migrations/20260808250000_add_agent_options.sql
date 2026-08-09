-- Extend agents with builder options:
-- * restrict_to_kus: when true, the agent may only use content from assigned KUs
-- * web_search: reserved for future browsing capability

alter table public.agents
  add column if not exists restrict_to_kus boolean not null default false,
  add column if not exists web_search boolean not null default false;
