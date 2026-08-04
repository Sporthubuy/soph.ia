-- Add vector embeddings to agents table for semantic search

alter table public.agents
  add column if not exists embedding vector(1536); -- OpenAI/Anthropic embedding dimension

-- Create index for fast semantic search using cosine similarity
create index if not exists idx_agents_embedding on public.agents using ivfflat (embedding vector_cosine_ops);

-- Function to perform semantic search on agents
create or replace function public.search_agents_semantic(
  query_embedding vector,
  limit_count int default 10
)
returns table (
  id uuid,
  name text,
  description text,
  provider text,
  model text,
  rating real,
  ratings_count integer,
  invocations integer,
  tags text[],
  organization_id uuid,
  similarity float8
)
language sql
stable
as $$
  select
    agents.id,
    agents.name,
    agents.description,
    agents.provider,
    agents.model,
    agents.rating,
    agents.ratings_count,
    agents.invocations,
    agents.tags,
    agents.organization_id,
    (1 - (agents.embedding <=> query_embedding)) as similarity
  from public.agents
  where agents.embedding is not null
    and agents.visibility = 'public'
    and agents.status = 'deployed'
  order by agents.embedding <=> query_embedding
  limit limit_count;
$$;
