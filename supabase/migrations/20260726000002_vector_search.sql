-- Semantic search for Knowledge Units using pgvector
-- Returns KUs ordered by cosine distance to the query embedding, scoped to org.

create or replace function public.match_kus(
  query_embedding extensions.vector(1536),
  query_organization_id uuid,
  match_count integer default 10,
  filter_status public.ku_status default null
)
returns table (
  id uuid,
  title text,
  content text,
  status public.ku_status,
  domain_id uuid,
  organization_id uuid,
  similarity float
)
language sql
security definer set search_path = 'extensions'
as $$
  select
    ku.id,
    ku.title,
    ku.content,
    ku.status,
    ku.domain_id,
    ku.organization_id,
    1 - (ku.embedding <=> query_embedding) as similarity
  from public.knowledge_units ku
  where ku.organization_id = query_organization_id
    and ku.embedding is not null
    and (filter_status is null or ku.status = filter_status)
  order by ku.embedding <=> query_embedding
  limit match_count
$$;