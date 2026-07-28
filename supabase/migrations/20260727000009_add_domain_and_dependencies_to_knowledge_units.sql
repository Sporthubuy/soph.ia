-- Add domain and dependencies columns to knowledge_units
alter table public.knowledge_units
  add column domain text default '' not null,
  add column dependencies uuid[] default '{}' not null;
