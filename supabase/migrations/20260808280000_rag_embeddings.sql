-- Semantic search over Knowledge Units.
-- KUs are chunked (paragraph-based), each chunk is embedded with OpenAI's
-- text-embedding-3-small (1536 dims), stored in pgvector. At query time we
-- embed the user's message and pull the top-K chunks by cosine similarity,
-- filtered to the KUs assigned to the agent.

create extension if not exists vector with schema extensions;

create table if not exists public.knowledge_unit_chunks (
  id uuid primary key default gen_random_uuid(),
  knowledge_unit_id uuid not null references public.knowledge_units(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(1536),
  tokens integer,
  created_at timestamptz not null default now(),
  unique (knowledge_unit_id, chunk_index)
);

create index if not exists idx_ku_chunks_ku on public.knowledge_unit_chunks(knowledge_unit_id);
create index if not exists idx_ku_chunks_org on public.knowledge_unit_chunks(organization_id);
-- HNSW index for cosine similarity; only meaningful once we have data
create index if not exists idx_ku_chunks_embedding
  on public.knowledge_unit_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.knowledge_unit_chunks enable row level security;

create policy "org members select their ku chunks"
on public.knowledge_unit_chunks for select to authenticated
using (organization_id = (select public.current_organization_id()));

create policy "org members insert their ku chunks"
on public.knowledge_unit_chunks for insert to authenticated
with check (organization_id = (select public.current_organization_id()));

create policy "org members update their ku chunks"
on public.knowledge_unit_chunks for update to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy "org members delete their ku chunks"
on public.knowledge_unit_chunks for delete to authenticated
using (organization_id = (select public.current_organization_id()));

grant select, insert, update, delete on public.knowledge_unit_chunks to authenticated;

-- Semantic search function. Filters by RLS-scoped org automatically because
-- it's called as `security invoker`, so it inherits the caller's policies.
create or replace function public.match_ku_chunks(
  query_embedding extensions.vector(1536),
  ku_ids uuid[],
  match_count integer default 5
)
returns table (
  chunk_id uuid,
  ku_id uuid,
  content text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id as chunk_id,
    c.knowledge_unit_id as ku_id,
    c.content,
    1 - (c.embedding operator(extensions.<=>) query_embedding) as similarity
  from public.knowledge_unit_chunks c
  where c.knowledge_unit_id = any(ku_ids)
    and c.embedding is not null
  order by c.embedding operator(extensions.<=>) query_embedding
  limit match_count;
$$;

revoke all on function public.match_ku_chunks(extensions.vector, uuid[], integer) from public, anon;
grant execute on function public.match_ku_chunks(extensions.vector, uuid[], integer) to authenticated;
