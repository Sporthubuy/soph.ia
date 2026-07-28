"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import type { ActionResult } from "@/lib/action-result";

export interface CreateProjectInput {
  name: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Normaliza relaciones to-one: en runtime PostgREST devuelve un objeto, pero
 * los tipos generados las declaran como array. `Rel<T>` cubre ambas formas para
 * que los casts no tengan que repetir la union.
 */
type Rel<T> = T | T[] | null;

function one<T>(rel: Rel<T>): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

function revalidateProject(projectId?: string) {
  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]/dashboard", "page");
  if (projectId) revalidatePath(`/[locale]/projects/${projectId}`, "page");
}

// ─── Guards ──────────────────────────────────────────────────────────────────

type ProjectGuard =
  | { error: string }
  | {
      supabase: Awaited<ReturnType<typeof createClient>>;
      userId: string;
      organizationId: string;
    };

/**
 * Verifica que el usuario pueda gestionar el proyecto. Refleja la funcion SQL
 * can_manage_project(): responsable del proyecto, owner/admin de la
 * organizacion, o participante con rol 'admin'.
 *
 * La RLS ya bloquea el acceso; esto existe para devolver un error legible en
 * vez de un update silencioso de 0 filas.
 */
async function assertCanManageProject(projectId: string): Promise<ProjectGuard> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: project } = await supabase
    .from("projects")
    .select("id, owner_id, organization_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return { error: "Proyecto no encontrado." };

  if (project.owner_id === user.id) {
    return { supabase, userId: user.id, organizationId: project.organization_id };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", project.organization_id)
    .maybeSingle();

  if (membership && ["owner", "admin"].includes(membership.role)) {
    return { supabase, userId: user.id, organizationId: project.organization_id };
  }

  const { data: projectMember } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectMember?.role === "admin") {
    return { supabase, userId: user.id, organizationId: project.organization_id };
  }

  return { error: "No tenes permisos para gestionar este proyecto." };
}

// ─── Lectura ─────────────────────────────────────────────────────────────────

export async function getProjects(locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  // Intenta traer los proyectos con sus conteos de gente/KUs/agentes. Si las
  // tablas de colaboracion todavia no existen (migracion sin aplicar), cae a
  // la query base con conteos en 0 en vez de dejar el dashboard sin proyectos.
  const enriched = await supabase
    .from("projects")
    .select("*, project_members(count), project_knowledge_units(count), project_agents(count)")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  const { data, error } = enriched.error
    ? await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false })
    : enriched;

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  // PostgREST devuelve los agregados como [{count: n}]; ausentes en el fallback.
  const countOf = (rel: unknown) =>
    Array.isArray(rel) && rel.length > 0
      ? ((rel[0] as { count?: number }).count ?? 0)
      : 0;

  type ProjectRow = {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    status: string;
    updated_at: string;
    project_members?: unknown;
    project_knowledge_units?: unknown;
    project_agents?: unknown;
  };

  return ((data ?? []) as ProjectRow[]).map((p) => {
    const { project_members, project_knowledge_units, project_agents, ...project } = p;
    return {
      ...project,
      memberCount: countOf(project_members),
      kuCount: countOf(project_knowledge_units),
      agentCount: countOf(project_agents),
    };
  });
}

export async function getProject(projectId: string) {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles!projects_owner_id_fkey(full_name, email)")
    .eq("id", projectId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Error fetching project:", error);
    return null;
  }

  const { profiles, ...project } = data;
  return {
    ...project,
    owner: one(profiles as Rel<{ full_name: string | null; email: string }>),
  };
}

/** Participantes confirmados + invitaciones pendientes de aceptar. */
export async function getProjectMembers(projectId: string) {
  const supabase = await createClient();

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from("project_members")
      .select("id, role, user_id, created_at, profiles(full_name, email)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
    supabase
      .from("project_invitations")
      .select("id, email, role, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }),
  ]);

  return {
    members: (members ?? []).map((m) => ({
      ...m,
      profiles: one(m.profiles as Rel<{ full_name: string | null; email: string }>),
    })),
    invitations: invitations ?? [],
  };
}

export async function getProjectKnowledgeUnits(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_knowledge_units")
    .select("id, ku_id, knowledge_units(id, title, status, trust_score, version, domains(name))")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching project KUs:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const ku = one(
        row.knowledge_units as Rel<{
          id: string;
          title: string;
          status: string;
          trust_score: number | null;
          version: number | null;
          domains: Rel<{ name: string }>;
        }>
      );
      if (!ku) return null;
      return {
        linkId: row.id,
        id: ku.id,
        title: ku.title,
        status: ku.status,
        trust_score: ku.trust_score,
        version: ku.version,
        domain: one(ku.domains)?.name ?? "General",
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
}

export async function getProjectAgents(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("project_agents")
    .select("id, agent_id, agents(id, name, description, status, model, provider)")
    .eq("project_id", projectId);

  if (error) {
    console.error("Error fetching project agents:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const agent = one(
        row.agents as Rel<{
          id: string;
          name: string;
          description: string | null;
          status: string;
          model: string;
          provider: string | null;
        }>
      );
      if (!agent) return null;
      return { linkId: row.id, ...agent };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
}

/** KUs y agentes de la organizacion que todavia no estan en el proyecto. */
export async function getProjectLinkCandidates(projectId: string) {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { knowledgeUnits: [], agents: [] };

  const [{ data: linkedKUs }, { data: linkedAgents }] = await Promise.all([
    supabase.from("project_knowledge_units").select("ku_id").eq("project_id", projectId),
    supabase.from("project_agents").select("agent_id").eq("project_id", projectId),
  ]);

  const linkedKuIds = new Set((linkedKUs ?? []).map((r) => r.ku_id));
  const linkedAgentIds = new Set((linkedAgents ?? []).map((r) => r.agent_id));

  const [{ data: kus }, { data: agents }] = await Promise.all([
    supabase
      .from("knowledge_units")
      .select("id, title, status, domains(name)")
      .eq("organization_id", organizationId)
      .order("title", { ascending: true }),
    supabase
      .from("agents")
      .select("id, name, status")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true }),
  ]);

  return {
    knowledgeUnits: (kus ?? [])
      .filter((ku) => !linkedKuIds.has(ku.id))
      .map((ku) => ({
        id: ku.id,
        title: ku.title,
        status: ku.status,
        domain: one(ku.domains as Rel<{ name: string }>)?.name ?? "General",
      })),
    agents: (agents ?? []).filter((a) => !linkedAgentIds.has(a.id)),
  };
}

// ─── Escritura ───────────────────────────────────────────────────────────────

export async function createProject(input: CreateProjectInput, locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    throw new Error("El usuario no pertenece a ninguna organizacion.");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description,
      icon: input.icon,
      color: input.color,
      owner_id: user!.id,
      organization_id: organizationId,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  // El responsable queda como participante admin, para que aparezca en la
  // lista de gente del proyecto sin tener que agregarse a si mismo.
  const { error: memberError } = await supabase
    .from("project_members")
    .insert({ project_id: data.id, user_id: user!.id, role: "admin" });

  if (memberError) console.error("Error agregando al responsable:", memberError);

  revalidateProject(data.id);

  return { success: true, data };
}

export async function updateProject(
  projectId: string,
  input: Partial<CreateProjectInput> & { status?: string }
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase
    .from("projects")
    .update(input)
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidateProject(projectId);
  return { success: true };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase.from("projects").delete().eq("id", projectId);

  if (error) return { error: error.message };

  revalidateProject();
  return { success: true };
}

// ─── Participantes ───────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Invita a alguien por email.
 * - Si ya tiene cuenta: se suma al proyecto en el acto.
 * - Si no: queda pendiente y el trigger resolve_project_invitations la
 *   convierte en participacion real cuando se registre.
 *
 * Delega en el RPC invite_to_project (SECURITY DEFINER): agregar a otra
 * persona a la organizacion no es posible desde el cliente, porque la policy
 * memberships_insert solo deja insertarte a vos mismo.
 */
export async function inviteToProject(
  projectId: string,
  email: string,
  role: string
): Promise<ActionResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) return { error: "El email no es valido." };
  if (!["admin", "editor", "viewer"].includes(role)) {
    return { error: "Rol invalido." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("invite_to_project", {
    p_project_id: projectId,
    p_email: cleanEmail,
    p_role: role,
  });

  if (error) return { error: error.message };

  const result = data as { error?: string; status?: string } | null;
  if (result?.error) return { error: result.error };

  revalidateProject(projectId);
  return { success: true };
}

export async function updateProjectMemberRole(
  projectId: string,
  memberId: string,
  role: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  if (!["admin", "editor", "viewer"].includes(role)) {
    return { error: "Rol invalido." };
  }

  const { error } = await guard.supabase
    .from("project_members")
    .update({ role })
    .eq("id", memberId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidateProject(projectId);
  return { success: true };
}

export async function removeProjectMember(
  projectId: string,
  memberId: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { data: project } = await guard.supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();

  const { data: member } = await guard.supabase
    .from("project_members")
    .select("user_id")
    .eq("id", memberId)
    .maybeSingle();

  // Articulo 3: nunca conocimiento huerfano. El proyecto siempre conserva a su
  // responsable como participante.
  if (member && project && member.user_id === project.owner_id) {
    return { error: "No se puede quitar al responsable del proyecto." };
  }

  const { error } = await guard.supabase
    .from("project_members")
    .delete()
    .eq("id", memberId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidateProject(projectId);
  return { success: true };
}

export async function cancelProjectInvitation(
  projectId: string,
  invitationId: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase
    .from("project_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidateProject(projectId);
  return { success: true };
}

// ─── Knowledge Units y agentes del proyecto ──────────────────────────────────

export async function addKnowledgeUnitToProject(
  projectId: string,
  kuId: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase
    .from("project_knowledge_units")
    .insert({ project_id: projectId, ku_id: kuId });

  if (error) {
    if (error.code === "23505") return { error: "Esa Knowledge Unit ya esta en el proyecto." };
    return { error: error.message };
  }

  revalidateProject(projectId);
  return { success: true };
}

export async function removeKnowledgeUnitFromProject(
  projectId: string,
  linkId: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase
    .from("project_knowledge_units")
    .delete()
    .eq("id", linkId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidateProject(projectId);
  return { success: true };
}

export async function addAgentToProject(
  projectId: string,
  agentId: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase
    .from("project_agents")
    .insert({ project_id: projectId, agent_id: agentId });

  if (error) {
    if (error.code === "23505") return { error: "Ese agente ya esta en el proyecto." };
    return { error: error.message };
  }

  revalidateProject(projectId);
  return { success: true };
}

export async function removeAgentFromProject(
  projectId: string,
  linkId: string
): Promise<ActionResult> {
  const guard = await assertCanManageProject(projectId);
  if ("error" in guard) return guard;

  const { error } = await guard.supabase
    .from("project_agents")
    .delete()
    .eq("id", linkId)
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidateProject(projectId);
  return { success: true };
}

/** Permisos del usuario actual sobre el proyecto, para condicionar la UI. */
export async function getProjectPermission(projectId: string) {
  const guard = await assertCanManageProject(projectId);
  return { canManage: !("error" in guard) };
}
