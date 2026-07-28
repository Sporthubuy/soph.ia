-- Colaboracion en proyectos: participantes con permisos propios, invitaciones
-- por email, y vinculo del proyecto con sus Knowledge Units y agentes.
--
-- Idempotente a proposito: esta migracion se aplica pegandola en el SQL editor
-- de Supabase, asi que re-ejecutarla no debe fallar.

-- ─── Rol dentro de un proyecto ──────────────────────────────────────────────
-- Independiente del rol de organizacion (public.member_role). El responsable
-- del proyecto se identifica por projects.owner_id, no por este enum.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_role') then
    create type public.project_role as enum ('admin', 'editor', 'viewer');
  end if;
end
$$;

-- ─── Participantes ──────────────────────────────────────────────────────────
create table if not exists public.project_members (
  id uuid default extensions.uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role public.project_role default 'editor' not null,
  created_at timestamptz default now() not null,
  unique (project_id, user_id)
);

-- ─── Invitaciones pendientes ────────────────────────────────────────────────
-- Para emails que todavia no tienen cuenta. Al registrarse esa persona, el
-- trigger de mas abajo convierte la invitacion en membresia real.
create table if not exists public.project_invitations (
  id uuid default extensions.uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  email text not null,
  role public.project_role default 'editor' not null,
  invited_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  unique (project_id, email)
);

-- ─── Knowledge Units del proyecto ───────────────────────────────────────────
create table if not exists public.project_knowledge_units (
  id uuid default extensions.uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  ku_id uuid references public.knowledge_units(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (project_id, ku_id)
);

-- ─── Agentes del proyecto ───────────────────────────────────────────────────
create table if not exists public.project_agents (
  id uuid default extensions.uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  agent_id uuid references public.agents(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (project_id, agent_id)
);

create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_project_invitations_email on public.project_invitations(lower(email));
create index if not exists idx_project_kus_project on public.project_knowledge_units(project_id);
create index if not exists idx_project_agents_project on public.project_agents(project_id);

-- ─── Helpers de permisos ────────────────────────────────────────────────────
-- security definer + stable: evitan la recursion infinita que ocurre cuando la
-- policy de una tabla consulta a esa misma tabla. Mismo patron que
-- is_org_member / is_org_admin (migracion 20260726000006).

create or replace function public.can_view_project(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.memberships m on m.organization_id = p.organization_id
    where p.id = p_id
      and m.user_id = auth.uid()
  );
$$;

-- Puede gestionar: responsable del proyecto, owner/admin de la organizacion,
-- o participante con rol 'admin' en ese proyecto.
create or replace function public.can_manage_project(p_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = p_id
      and (
        p.owner_id = auth.uid()
        or exists (
          select 1 from public.memberships m
          where m.organization_id = p.organization_id
            and m.user_id = auth.uid()
            and m.role in ('owner', 'admin')
        )
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = auth.uid()
            and pm.role = 'admin'
        )
      )
  );
$$;

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.project_members enable row level security;
alter table public.project_invitations enable row level security;
alter table public.project_knowledge_units enable row level security;
alter table public.project_agents enable row level security;

drop policy if exists "Ver participantes" on public.project_members;
create policy "Ver participantes"
  on public.project_members for select
  using (public.can_view_project(project_id));

drop policy if exists "Gestionar participantes" on public.project_members;
create policy "Gestionar participantes"
  on public.project_members for all
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

drop policy if exists "Ver invitaciones" on public.project_invitations;
create policy "Ver invitaciones"
  on public.project_invitations for select
  using (public.can_view_project(project_id));

drop policy if exists "Gestionar invitaciones" on public.project_invitations;
create policy "Gestionar invitaciones"
  on public.project_invitations for all
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

drop policy if exists "Ver KUs del proyecto" on public.project_knowledge_units;
create policy "Ver KUs del proyecto"
  on public.project_knowledge_units for select
  using (public.can_view_project(project_id));

drop policy if exists "Gestionar KUs del proyecto" on public.project_knowledge_units;
create policy "Gestionar KUs del proyecto"
  on public.project_knowledge_units for all
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

drop policy if exists "Ver agentes del proyecto" on public.project_agents;
create policy "Ver agentes del proyecto"
  on public.project_agents for select
  using (public.can_view_project(project_id));

drop policy if exists "Gestionar agentes del proyecto" on public.project_agents;
create policy "Gestionar agentes del proyecto"
  on public.project_agents for all
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

-- Faltaba poder borrar proyectos: solo el responsable o un admin de la org.
drop policy if exists "Owners can delete projects" on public.projects;
create policy "Owners can delete projects"
  on public.projects for delete
  using (
    owner_id = auth.uid()
    or public.is_org_admin(organization_id)
  );

-- ─── Invitar a un proyecto ──────────────────────────────────────────────────
-- Va como funcion SECURITY DEFINER en vez de hacerse desde el cliente porque
-- la policy memberships_insert es `with check (user_id = auth.uid())`: nadie
-- puede dar de alta a otra persona en una organizacion. Aflojar esa regla
-- global para este caso seria peor que centralizar el permiso aca, donde la
-- unica puerta de entrada es can_manage_project().
--
-- Sumar a alguien tambien le da acceso 'viewer' a la organizacion: sin eso
-- entraria al proyecto pero no veria ninguna KU ni agente, porque todo el
-- contenido esta scopeado por organizacion.
create or replace function public.invite_to_project(
  p_project_id uuid,
  p_email text,
  p_role public.project_role
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_profile_id uuid;
  v_email text := lower(trim(p_email));
begin
  if not public.can_manage_project(p_project_id) then
    return jsonb_build_object('error', 'No tenes permisos para gestionar este proyecto.');
  end if;

  select organization_id into v_org_id
  from public.projects where id = p_project_id;

  if v_org_id is null then
    return jsonb_build_object('error', 'Proyecto no encontrado.');
  end if;

  select id into v_profile_id
  from public.profiles where lower(email) = v_email;

  -- Sin cuenta todavia: queda pendiente hasta que se registre.
  if v_profile_id is null then
    insert into public.project_invitations (project_id, email, role, invited_by)
    values (p_project_id, v_email, p_role, auth.uid())
    on conflict (project_id, email) do nothing;

    if not found then
      return jsonb_build_object('error', 'Ya invitaste a ese email.');
    end if;

    return jsonb_build_object('status', 'invited');
  end if;

  if exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = v_profile_id
  ) then
    return jsonb_build_object('error', 'Esa persona ya participa del proyecto.');
  end if;

  insert into public.memberships (user_id, organization_id, role)
  values (v_profile_id, v_org_id, 'viewer')
  on conflict (user_id, organization_id) do nothing;

  insert into public.project_members (project_id, user_id, role)
  values (p_project_id, v_profile_id, p_role);

  return jsonb_build_object('status', 'added');
end;
$$;

grant execute on function public.invite_to_project(uuid, text, public.project_role) to authenticated;

-- ─── Resolucion de invitaciones al registrarse ──────────────────────────────
-- Cuando se crea un profile, cualquier invitacion pendiente para ese email
-- pasa a ser participacion real y se limpia.
--
-- Ojo con el orden: al registrarse, el trigger de 20260727000010 le crea al
-- usuario su PROPIA organizacion. Eso no alcanza para ver el proyecto que lo
-- invito, porque can_view_project() exige pertenecer a la organizacion DEL
-- PROYECTO. Por eso aca tambien se lo suma a esa organizacion como 'viewer':
-- sin esa membresia veria el proyecto vacio.
create or replace function public.resolve_project_invitations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Acceso de lectura a la organizacion de cada proyecto que lo invito.
  insert into public.memberships (user_id, organization_id, role)
  select distinct new.id, p.organization_id, 'viewer'::public.member_role
  from public.project_invitations i
  join public.projects p on p.id = i.project_id
  where lower(i.email) = lower(new.email)
  on conflict (user_id, organization_id) do nothing;

  insert into public.project_members (project_id, user_id, role)
  select i.project_id, new.id, i.role
  from public.project_invitations i
  where lower(i.email) = lower(new.email)
  on conflict (project_id, user_id) do nothing;

  delete from public.project_invitations
  where lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_profile_created_resolve_invitations on public.profiles;
create trigger on_profile_created_resolve_invitations
  after insert on public.profiles
  for each row execute function public.resolve_project_invitations();
