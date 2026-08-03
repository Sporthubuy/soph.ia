-- Carpetas dentro de proyectos, estilo Trello: cada carpeta agrupa Knowledge
-- Units del proyecto (ej. "Normativas" contiene "Normativa A", "Normativa B").
-- Una KU puede quedar sin carpeta (folder_id null = "Sin carpeta").
--
-- Idempotente a proposito: se aplica pegandola en el SQL editor de Supabase.

-- ─── Carpetas ────────────────────────────────────────────────────────────────
create table if not exists public.project_folders (
  id uuid default extensions.uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  position int default 0 not null,
  created_at timestamptz default now() not null
);

-- Las KUs del proyecto se pueden colocar dentro de una carpeta.
alter table public.project_knowledge_units
  add column if not exists folder_id uuid references public.project_folders(id) on delete set null;

create index if not exists idx_project_folders_project on public.project_folders(project_id);
create index if not exists idx_project_kus_folder on public.project_knowledge_units(folder_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.project_folders enable row level security;

drop policy if exists "Ver carpetas del proyecto" on public.project_folders;
create policy "Ver carpetas del proyecto"
  on public.project_folders for select
  using (public.can_view_project(project_id));

drop policy if exists "Gestionar carpetas del proyecto" on public.project_folders;
create policy "Gestionar carpetas del proyecto"
  on public.project_folders for all
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));
