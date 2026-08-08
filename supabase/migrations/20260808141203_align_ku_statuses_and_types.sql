-- Align knowledge_units model with the Knowledge Units design:
-- * 5 statuses: Publicada, En revisión, Borrador, Aprobada, Por vencer
-- * type Dataset added to the allowed set
-- * expires_at (Vence) and source (Fuente) columns for the detail drawer

-- This migration predates the schema creation migration in this repository.
-- Keep it harmless on a clean database; the creation migration now defines
-- the final schema and deployed databases have already run these changes.
do $$
begin
  if to_regclass('public.knowledge_units') is not null then
    alter table public.knowledge_units
      drop constraint if exists knowledge_units_status_check,
      add constraint knowledge_units_status_check
        check (status in ('Borrador', 'En revisión', 'Aprobada', 'Publicada', 'Por vencer'));

    alter table public.knowledge_units
      drop constraint if exists knowledge_units_type_check,
      add constraint knowledge_units_type_check
        check (type in ('Documento', 'Proceso', 'FAQ', 'Política', 'Guía', 'Dataset'));

    alter table public.knowledge_units
      add column if not exists expires_at timestamptz,
      add column if not exists source text not null default 'Manual';
  end if;
end
$$;
