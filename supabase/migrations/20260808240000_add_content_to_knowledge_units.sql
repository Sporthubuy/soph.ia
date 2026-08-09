-- Add content column to knowledge_units for storing the actual knowledge text.
-- Uses 'text' type to support arbitrary-length Markdown content.

alter table public.knowledge_units
  add column if not exists content text not null default '';
