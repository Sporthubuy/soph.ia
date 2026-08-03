"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import { EDITOR_ROLES } from "@/lib/knowledge/constants";
import type { ActionResult } from "@/lib/action-result";

export interface CreateKnowledgeUnitInput {
  title: string;
  content: string;
  /** Nombre del dominio; se resuelve a domain_id, creandolo si no existe. */
  domain: string;
}

/** Hash de la version, segun el modelo de KU: identifica el contenido inmutable. */
async function hashVersion(title: string, content: string, version: number) {
  const data = new TextEncoder().encode(`${version}:${title}:${content}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Resuelve el dominio por nombre dentro de la organizacion.
 * domain_id es NOT NULL, asi que si el dominio no existe se crea.
 */
async function resolveDomainId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  ownerId: string,
  name: string
) {
  const domainName = name.trim() || "General";

  const { data: existing } = await supabase
    .from("domains")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("name", domainName)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("domains")
    .insert({
      name: domainName,
      organization_id: organizationId,
      owner_id: ownerId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function createKnowledgeUnit(input: CreateKnowledgeUnitInput, locale: string) {
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

  try {
    const domainId = await resolveDomainId(
      supabase,
      organizationId,
      user!.id,
      input.domain
    );

    const version = 1;

    const hash = await hashVersion(input.title, input.content, version);

    const { data, error } = await supabase
      .from("knowledge_units")
      .insert({
        title: input.title,
        content: input.content,
        hash,
        domain_id: domainId,
        owner_id: user!.id,
        organization_id: organizationId,
        status: "draft",
        version,
      })
      .select()
      .single();

    if (error) throw error;

    // Articulo 4: todo conocimiento tiene historia desde su primera version.
    const { error: versionError } = await supabase.from("ku_versions").insert({
      ku_id: data.id,
      version,
      hash,
      title: input.title,
      content: input.content,
      changed_by: user!.id,
      change_message: "Creacion inicial",
    });

    if (versionError) {
      console.error("Error guardando version inicial:", versionError);
    }

    revalidatePath(`/${locale}/knowledge`, "page");
    revalidatePath(`/${locale}/dashboard`, "page");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating knowledge unit:", error);
    throw error;
  }
}

/** Dominios existentes en la organizacion, para sugerir al crear una KU. */
export async function getDomains() {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("domains")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching domains:", error);
    return [];
  }

  return data ?? [];
}

export async function getKnowledgeUnits(locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const organizationId = await getCurrentOrganizationId();

  if (!organizationId) return [];

  try {
    const { data, error } = await supabase
      .from("knowledge_units")
      .select("*, domains(name)")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // Aplana domains.name a `domain` para que la UI no dependa del shape del join.
    return (data ?? []).map(({ domains, ...ku }) => ({
      ...ku,
      domain: (domains as { name: string } | null)?.name ?? "General",
    }));
  } catch (error) {
    console.error("Error fetching knowledge units:", error);
    return [];
  }
}

type EditGuard =
  | { error: string }
  | {
      supabase: Awaited<ReturnType<typeof createClient>>;
      userId: string;
      organizationId: string;
    };

// Tipo de retorno explicito: sin el, TS no siempre angosta correctamente
// `guard` en los callers que hacen `if ("error" in guard) return guard`.
async function assertCanEdit(kuId?: string): Promise<EditGuard> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "El usuario no pertenece a ninguna organizacion." };

  const isOrgEditor = EDITOR_ROLES.includes(membership.role);

  // Si no es editor a nivel org, verificar si es editor de esta KU específica
  if (!isOrgEditor && kuId) {
    const { data: kuMember } = await supabase
      .from("ku_members")
      .select("role")
      .eq("ku_id", kuId)
      .eq("user_id", user.id)
      .single();

    if (!kuMember || kuMember.role !== "editor") {
      return { error: "No tenes permisos para editar esta Knowledge Unit." };
    }
  } else if (!isOrgEditor && !kuId) {
    return { error: "No tenes permisos para editar Knowledge Units." };
  }

  return { supabase, userId: user.id, organizationId: membership.organization_id };
}

/**
 * Propone una KU en borrador para revision (Articulo 6: la IA/las personas
 * proponen, los owners/admins aprueban en el Review Center).
 */
export async function proposeKnowledgeUnit(kuId: string): Promise<ActionResult> {
  const guard = await assertCanEdit();
  if ("error" in guard) return guard;

  const { supabase, organizationId } = guard;

  const { data: ku } = await supabase
    .from("knowledge_units")
    .select("id, status")
    .eq("id", kuId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!ku) return { error: "Knowledge Unit no encontrada." };
  if (ku.status !== "draft") {
    return { error: "Solo se pueden proponer Knowledge Units en estado 'draft'." };
  }

  const { error } = await supabase
    .from("knowledge_units")
    .update({ status: "proposed" })
    .eq("id", kuId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/knowledge", "page");
  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/dashboard", "page");

  return { success: true };
}

/** Roles que pueden aprobar o rechazar cambios (Articulo 6: las personas aprueban). */
const REVIEWER_ROLES = ["owner", "admin"];

/**
 * Trust Score minimo que garantiza una aprobacion humana.
 * Si la KU ya venia con mas confianza, se respeta y no se baja.
 * Este valor es el que anuncia el toast de aprobacion (review.approvedDesc).
 */
const APPROVED_TRUST_SCORE = 80;

async function assertCanReview() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." as const };

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "El usuario no pertenece a ninguna organizacion." as const };

  if (!REVIEWER_ROLES.includes(membership.role)) {
    return { error: "Solo owners y admins pueden revisar cambios." as const };
  }

  return { supabase, userId: user.id, organizationId: membership.organization_id };
}

/**
 * Aprueba una KU propuesta y congela la version en ku_versions.
 * El historial es inmutable (Articulo 4): nunca se sobrescribe, se agrega.
 */
export async function approveKnowledgeUnit(kuId: string) {
  const guard = await assertCanReview();
  if ("error" in guard) return guard;

  const { supabase, userId, organizationId } = guard;

  const { data: ku, error: fetchError } = await supabase
    .from("knowledge_units")
    .select("id, status, trust_score")
    .eq("id", kuId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError || !ku) return { error: "Knowledge Unit no encontrada." };
  if (ku.status !== "proposed") {
    return { error: "Solo se pueden aprobar Knowledge Units en estado 'proposed'." };
  }

  const { error: updateError } = await supabase
    .from("knowledge_units")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: userId,
      trust_score: Math.max(ku.trust_score ?? 0, APPROVED_TRUST_SCORE),
    })
    .eq("id", kuId);

  if (updateError) return { error: updateError.message };

  // No se crea snapshot: aprobar no cambia el contenido, y la version ya
  // quedo registrada en ku_versions al crearse o editarse la KU.

  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/knowledge", "page");
  revalidatePath("/[locale]/dashboard", "page");

  return { success: true };
}

/** Rechaza una propuesta: vuelve a draft para que el autor la corrija. */
export async function rejectKnowledgeUnit(kuId: string) {
  const guard = await assertCanReview();
  if ("error" in guard) return guard;

  const { supabase, organizationId } = guard;

  const { data: ku } = await supabase
    .from("knowledge_units")
    .select("id, status")
    .eq("id", kuId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!ku) return { error: "Knowledge Unit no encontrada." };
  if (ku.status !== "proposed") {
    return { error: "Solo se pueden rechazar Knowledge Units en estado 'proposed'." };
  }

  const { error } = await supabase
    .from("knowledge_units")
    .update({ status: "draft" })
    .eq("id", kuId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/knowledge", "page");
  revalidatePath("/[locale]/dashboard", "page");

  return { success: true };
}

/** KUs propuestas pendientes de revision, con autor y dominio. */
export async function getPendingProposals() {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("knowledge_units")
    .select(
      "id, title, status, trust_score, version, updated_at, domain_id, domains(name), profiles!knowledge_units_owner_id_fkey(full_name, email)"
    )
    .eq("organization_id", organizationId)
    .eq("status", "proposed")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }

  // PostgREST devuelve un objeto en relaciones to-one, pero los tipos generados
  // lo declaran como array. Normalizamos para que tipo y runtime coincidan.
  const one = <T,>(rel: T | T[] | null): T | null =>
    Array.isArray(rel) ? (rel[0] ?? null) : rel;

  return (data ?? []).map((ku) => ({
    ...ku,
    domains: one(ku.domains),
    profiles: one(ku.profiles),
  }));
}

/** Rol del usuario actual dentro de su organizacion. */
export async function getCurrentUserRole() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "viewer";

  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return data?.role ?? "viewer";
}

/**
 * Version actual vs. anterior de cada KU, para el diff del Review Center.
 * Devuelve null cuando la KU todavia no tiene historial.
 */
export async function getProposalDiffs(kuIds: string[]) {
  const diffs: Record<
    string,
    {
      current: { title: string; content: string; change_message: string | null; created_at: string };
      previous: { title: string; content: string } | null;
    } | null
  > = {};

  if (kuIds.length === 0) return diffs;

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("knowledge_units")
    .select("id, title, content, updated_at, version")
    .in("id", kuIds);

  const { data: history } = await supabase
    .from("ku_versions")
    .select("ku_id, version, title, content, change_message, created_at")
    .in("ku_id", kuIds)
    .order("version", { ascending: false });

  for (const ku of current ?? []) {
    // Version previa = snapshot mas reciente anterior a la version actual.
    const previous = (history ?? []).find(
      (v) => v.ku_id === ku.id && v.version < ku.version
    );

    diffs[ku.id] = {
      current: {
        title: ku.title,
        content: ku.content,
        change_message: null,
        created_at: ku.updated_at,
      },
      previous: previous
        ? { title: previous.title, content: previous.content }
        : null,
    };
  }

  return diffs;
}

export async function getKnowledgeUnit(id: string) {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const { data, error } = await supabase
    .from("knowledge_units")
    .select("*, domains(name)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Error fetching knowledge unit:", error);
    return null;
  }

  const { domains, ...ku } = data;
  return {
    ...ku,
    domain: (domains as { name: string } | null)?.name ?? "General",
  };
}

/** Normaliza relaciones to-one: PostgREST devuelve objeto, los tipos las declaran como array. */
function one<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

/** KU completa para el editor: incluye dominio y responsable para la barra lateral. */
export async function getKnowledgeUnitForEdit(id: string) {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const { data, error } = await supabase
    .from("knowledge_units")
    .select(
      "*, domains(name), profiles!knowledge_units_owner_id_fkey(full_name, email)"
    )
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Error fetching knowledge unit para editar:", error);
    return null;
  }

  const { domains, profiles, ...ku } = data;
  return {
    ...ku,
    domains: one(domains as { name: string } | { name: string }[] | null),
    profiles: one(
      profiles as
        | { full_name: string | null; email: string }
        | { full_name: string | null; email: string }[]
        | null
    ),
  };
}

/**
 * Edita una KU y propone la nueva version para revision.
 * El historial es inmutable (Articulo 4): se agrega una fila nueva a
 * ku_versions, nunca se sobrescribe la anterior.
 */
export async function updateKnowledgeUnit(formData: FormData): Promise<ActionResult> {
  const kuId = formData.get("kuId") as string;
  const guard = await assertCanEdit(kuId);
  if ("error" in guard) return guard;

  const { supabase, userId, organizationId } = guard;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string) ?? "";
  const changeMessage = (formData.get("changeMessage") as string)?.trim() || null;

  if (!kuId) return { error: "Falta el identificador de la Knowledge Unit." };
  if (!title) return { error: "El titulo es obligatorio." };

  const { data: ku, error: fetchError } = await supabase
    .from("knowledge_units")
    .select("id, version")
    .eq("id", kuId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError || !ku) return { error: "Knowledge Unit no encontrada." };

  const version = ku.version + 1;
  const hash = await hashVersion(title, content, version);

  const { error: versionError } = await supabase.from("ku_versions").insert({
    ku_id: kuId,
    version,
    hash,
    title,
    content,
    changed_by: userId,
    change_message: changeMessage,
  });

  if (versionError) return { error: versionError.message };

  // Toda edicion de contenido vuelve a pedir aprobacion humana (Articulo 6),
  // sin importar el estado previo.
  const { error: updateError } = await supabase
    .from("knowledge_units")
    .update({
      title,
      content,
      hash,
      version,
      status: "proposed",
      approved_at: null,
      approved_by: null,
    })
    .eq("id", kuId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/[locale]/knowledge", "page");
  revalidatePath(`/[locale]/knowledge/${kuId}`, "page");
  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/dashboard", "page");

  return { success: true };
}

/** Historial de versiones de una KU, mas reciente primero. */
export async function getKUVersions(kuId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ku_versions")
    .select("id, version, hash, title, change_message, created_at, profiles(full_name, email)")
    .eq("ku_id", kuId)
    .order("version", { ascending: false });

  if (error) {
    console.error("Error fetching version history:", error);
    return [];
  }

  return (data ?? []).map((v) => ({
    ...v,
    profiles: one(
      v.profiles as
        | { full_name: string | null; email: string }
        | { full_name: string | null; email: string }[]
        | null
    ),
  }));
}

/** Dependencias (aristas) donde la KU participa como origen o destino. */
export async function getKUDependencies(kuId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ku_dependencies")
    .select("source_ku_id, target_ku_id")
    .or(`source_ku_id.eq.${kuId},target_ku_id.eq.${kuId}`);

  if (error) {
    console.error("Error fetching dependencies:", error);
    return [];
  }

  return data ?? [];
}

/** Resto de KUs de la organizacion, candidatas a ser dependencia. */
export async function getKUDependencyCandidates(excludeId: string) {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("knowledge_units")
    .select("id, title, status, version")
    .eq("organization_id", organizationId)
    .neq("id", excludeId)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching dependency candidates:", error);
    return [];
  }

  return data ?? [];
}

/** Agrega "sourceId depende de targetId". */
export async function addKUDependency(sourceId: string, targetId: string): Promise<ActionResult> {
  const guard = await assertCanEdit();
  if ("error" in guard) return guard;

  if (sourceId === targetId) {
    return { error: "Una Knowledge Unit no puede depender de si misma." };
  }

  const { supabase } = guard;

  const { error } = await supabase
    .from("ku_dependencies")
    .insert({ source_ku_id: sourceId, target_ku_id: targetId });

  if (error) {
    if (error.code === "23505") return { error: "Esa dependencia ya existe." };
    return { error: error.message };
  }

  revalidatePath("/[locale]/knowledge/[kuId]", "page");

  return { success: true };
}

/** Quita la dependencia "sourceId depende de targetId". */
export async function removeKUDependency(sourceId: string, targetId: string): Promise<ActionResult> {
  const guard = await assertCanEdit();
  if ("error" in guard) return guard;

  const { supabase } = guard;

  const { error } = await supabase
    .from("ku_dependencies")
    .delete()
    .eq("source_ku_id", sourceId)
    .eq("target_ku_id", targetId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/knowledge/[kuId]", "page");

  return { success: true };
}

/** Datos para el Knowledge Graph: KUs + dependencias + dominios de la org. */
export async function getKnowledgeGraphData() {
  const supabase = await createClient();
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return { organizationId: null as string | null, kus: [], dependencies: [], domains: [] };
  }

  const [kusRes, domainsRes] = await Promise.all([
    supabase
      .from("knowledge_units")
      .select("id, title, status, trust_score, version, domain_id, domains(name)")
      .eq("organization_id", organizationId)
      .order("title", { ascending: true }),
    supabase
      .from("domains")
      .select("id, name")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true }),
  ]);

  if (kusRes.error) {
    console.error("Error fetching graph KUs:", kusRes.error);
  }
  if (domainsRes.error) {
    console.error("Error fetching graph domains:", domainsRes.error);
  }

  const kus = (kusRes.data ?? []).map((row) => {
    const { domains, ...ku } = row as typeof row & {
      domains: { name: string } | { name: string }[] | null;
    };
    const domain = one(domains as { name: string } | { name: string }[] | null);
    return {
      id: ku.id as string,
      title: ku.title as string,
      status: ku.status as "draft" | "proposed" | "approved" | "archived",
      trust_score: ku.trust_score as number,
      version: ku.version as number,
      domain_id: ku.domain_id as string,
      domainName: domain?.name ?? "General",
    };
  });

  const kuIds = kus.map((k) => k.id);
  let dependencies: { source_ku_id: string; target_ku_id: string }[] = [];

  if (kuIds.length > 0) {
    const { data: deps, error: depsError } = await supabase
      .from("ku_dependencies")
      .select("source_ku_id, target_ku_id")
      .in("source_ku_id", kuIds);

    if (depsError) {
      console.error("Error fetching graph dependencies:", depsError);
    } else {
      dependencies = deps ?? [];
    }
  }

  return {
    organizationId,
    kus,
    dependencies,
    domains: domainsRes.data ?? [],
  };
}

/** KUs aprobadas listas para compilar en un agente. */
export async function getApprovedKnowledgeUnits() {
  const supabase = await createClient();
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("knowledge_units")
    .select("id, title, content, version, trust_score, domain_id, domains(name)")
    .eq("organization_id", organizationId)
    .eq("status", "approved")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching approved KUs:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const { domains, ...ku } = row as typeof row & {
      domains: { name: string } | { name: string }[] | null;
    };
    const domain = one(domains as { name: string } | { name: string }[] | null);
    return {
      id: ku.id as string,
      title: ku.title as string,
      content: ku.content as string,
      version: ku.version as number,
      trust_score: ku.trust_score as number,
      domain_id: ku.domain_id as string,
      domainName: domain?.name ?? "General",
    };
  });
}

export async function compileAgentContext(organizationId: string, selectedKuIds: string[] = []) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("knowledge_units")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "approved");

    if (selectedKuIds.length > 0) {
      query = query.in("id", selectedKuIds);
    }

    const { data: units, error } = await query;

    if (error) throw error;

    // Compile context from all approved knowledge units
    const context = (units || [])
      .map((unit) => `# ${unit.title}\n\n${unit.content}`)
      .join("\n\n---\n\n");

    return {
      context: context || "No approved knowledge units available",
      units: units || [],
    };
  } catch (error) {
    console.error("Error compiling agent context:", error);
    return {
      context: "Error compiling knowledge base",
      units: [],
    };
  }
}

/** Obtener miembros colaboradores de una Knowledge Unit. */
export async function getKuMembers(kuId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("ku_members")
      .select("id, role, user_id, profiles:user_id(full_name, email)")
      .eq("ku_id", kuId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error getting KU members:", error);
    return [];
  }
}

/** Obtener invitaciones pendientes para una Knowledge Unit. */
export async function getKuInvitations(kuId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("ku_invitations")
      .select("id, email, role")
      .eq("ku_id", kuId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error getting KU invitations:", error);
    return [];
  }
}

/** Invitar a colaborador a Knowledge Unit. */
export async function inviteToKnowledgeUnit(
  kuId: string,
  email: string,
  role: string
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: ku, error: kuError } = await supabase
      .from("knowledge_units")
      .select("id, owner_id")
      .eq("id", kuId)
      .single();

    if (kuError || !ku) return { error: "Knowledge Unit no encontrada" };
    if (ku.owner_id !== user.id) return { error: "No tenes permiso para invitar" };

    const { error } = await supabase
      .from("ku_invitations")
      .insert({
        ku_id: kuId,
        email: email.toLowerCase().trim(),
        role,
        invited_by: user.id,
      });

    if (error) {
      if (error.code === "23505") return { error: "Este email ya fue invitado" };
      throw error;
    }

    revalidatePath("/knowledge/[kuId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error inviting to KU:", error);
    return { error: "Error al invitar colaborador" };
  }
}

/** Actualizar rol de miembro colaborador. */
export async function updateKuMemberRole(
  kuId: string,
  memberId: string,
  role: string
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: ku } = await supabase
      .from("knowledge_units")
      .select("owner_id")
      .eq("id", kuId)
      .single();

    if (ku?.owner_id !== user.id) return { error: "No tenes permiso" };

    const { error } = await supabase
      .from("ku_members")
      .update({ role })
      .eq("id", memberId)
      .eq("ku_id", kuId);

    if (error) throw error;

    revalidatePath("/knowledge/[kuId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error updating KU member role:", error);
    return { error: "Error al actualizar rol" };
  }
}

/** Remover colaborador de Knowledge Unit. */
export async function removeKuMember(
  kuId: string,
  memberId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: ku } = await supabase
      .from("knowledge_units")
      .select("owner_id")
      .eq("id", kuId)
      .single();

    if (ku?.owner_id !== user.id) return { error: "No tenes permiso" };

    const { error } = await supabase
      .from("ku_members")
      .delete()
      .eq("id", memberId)
      .eq("ku_id", kuId);

    if (error) throw error;

    revalidatePath("/knowledge/[kuId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error removing KU member:", error);
    return { error: "Error al remover colaborador" };
  }
}

/** Cancelar invitación a Knowledge Unit. */
export async function cancelKuInvitation(
  kuId: string,
  invitationId: string
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: ku } = await supabase
      .from("knowledge_units")
      .select("owner_id")
      .eq("id", kuId)
      .single();

    if (ku?.owner_id !== user.id) return { error: "No tenes permiso" };

    const { error } = await supabase
      .from("ku_invitations")
      .delete()
      .eq("id", invitationId)
      .eq("ku_id", kuId);

    if (error) throw error;

    revalidatePath("/knowledge/[kuId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error canceling KU invitation:", error);
    return { error: "Error al cancelar invitación" };
  }
}

/** Cambiar visibilidad de Knowledge Unit. */
export async function setKuVisibility(
  kuId: string,
  visibility: "private" | "public"
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: ku } = await supabase
      .from("knowledge_units")
      .select("owner_id")
      .eq("id", kuId)
      .single();

    if (ku?.owner_id !== user.id) return { error: "No tenes permiso" };

    const { error } = await supabase
      .from("knowledge_units")
      .update({ visibility })
      .eq("id", kuId);

    if (error) throw error;

    revalidatePath("/knowledge/[kuId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Error setting KU visibility:", error);
    return { error: "Error al cambiar visibilidad" };
  }
}
