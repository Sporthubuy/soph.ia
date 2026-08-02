"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import type { ActionResult } from "@/lib/action-result";

type MembershipRole = "owner" | "admin" | "editor" | "viewer";

const one = <T>(value: T | T[] | null | undefined): T | null => {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

async function getMembershipContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, role, organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return null;

  return {
    supabase,
    userId: user.id,
    membershipId: membership.id as string,
    role: membership.role as MembershipRole,
    organizationId: membership.organization_id as string,
  };
}

export async function getOrganizationSettings() {
  const ctx = await getMembershipContext();
  if (!ctx) {
    return {
      organization: null,
      members: [] as {
        id: string;
        role: string;
        user_id: string;
        created_at: string;
        profiles: { full_name: string | null; email: string } | null;
      }[],
      domains: [] as {
        id: string;
        name: string;
        parent_id: string | null;
        owner_id: string;
      }[],
      currentUserId: "",
      userRole: "viewer" as MembershipRole,
    };
  }

  const { supabase, organizationId, userId, role } = ctx;

  const [orgRes, membersRes, domainsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("id", organizationId)
      .maybeSingle(),
    supabase
      .from("memberships")
      .select("id, role, user_id, created_at, profiles(full_name, email)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("domains")
      .select("id, name, parent_id, owner_id")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true }),
  ]);

  if (orgRes.error) console.error("Error fetching organization:", orgRes.error);
  if (membersRes.error) console.error("Error fetching members:", membersRes.error);
  if (domainsRes.error) console.error("Error fetching domains:", domainsRes.error);

  const members = (membersRes.data ?? []).map((m) => {
    const { profiles, ...rest } = m as typeof m & {
      profiles:
        | { full_name: string | null; email: string }
        | { full_name: string | null; email: string }[]
        | null;
    };
    return {
      ...rest,
      profiles: one(profiles),
    };
  });

  return {
    organization: orgRes.data,
    members,
    domains: domainsRes.data ?? [],
    currentUserId: userId,
    userRole: role,
  };
}

export interface PersonStats {
  kusOwned: number;
  kusApproved: number;
  avgTrust: number | null;
}

export interface Person {
  id: string;
  role: string;
  user_id: string;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
  stats: PersonStats;
}

/**
 * The organization's people directory: every member plus their knowledge
 * footprint (KUs owned, approved, average trust). Article 3 — all knowledge
 * has an owner — made visible as a who-owns-what view.
 */
export async function getOrganizationPeople(): Promise<{
  people: Person[];
  currentUserId: string;
  userRole: MembershipRole;
}> {
  const ctx = await getMembershipContext();
  if (!ctx) {
    return { people: [], currentUserId: "", userRole: "viewer" };
  }

  const { supabase, organizationId, userId, role } = ctx;

  const [membersRes, kusRes] = await Promise.all([
    supabase
      .from("memberships")
      .select("id, role, user_id, created_at, profiles(full_name, email)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("knowledge_units")
      .select("owner_id, status, trust_score")
      .eq("organization_id", organizationId),
  ]);

  if (membersRes.error) console.error("Error fetching members:", membersRes.error);
  if (kusRes.error) console.error("Error fetching KU stats:", kusRes.error);

  // Aggregate knowledge footprint per owner.
  const statsByOwner = new Map<
    string,
    { total: number; approved: number; trustSum: number; trustCount: number }
  >();
  for (const ku of kusRes.data ?? []) {
    const ownerId = (ku as { owner_id: string | null }).owner_id;
    if (!ownerId) continue;
    const s =
      statsByOwner.get(ownerId) ??
      { total: 0, approved: 0, trustSum: 0, trustCount: 0 };
    s.total += 1;
    if ((ku as { status: string }).status === "approved") s.approved += 1;
    const trust = (ku as { trust_score: number | null }).trust_score;
    if (typeof trust === "number") {
      s.trustSum += trust;
      s.trustCount += 1;
    }
    statsByOwner.set(ownerId, s);
  }

  const people: Person[] = (membersRes.data ?? []).map((m) => {
    const { profiles, ...rest } = m as typeof m & {
      profiles:
        | { full_name: string | null; email: string }
        | { full_name: string | null; email: string }[]
        | null;
    };
    const agg = statsByOwner.get((rest as { user_id: string }).user_id);
    return {
      ...(rest as { id: string; role: string; user_id: string; created_at: string }),
      profiles: one(profiles),
      stats: {
        kusOwned: agg?.total ?? 0,
        kusApproved: agg?.approved ?? 0,
        avgTrust:
          agg && agg.trustCount > 0
            ? Math.round(agg.trustSum / agg.trustCount)
            : null,
      },
    };
  });

  return { people, currentUserId: userId, userRole: role };
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Owner/admin invites an email into the org. Returns the invite token. */
export async function createInvitation(
  email: string,
  role: string
): Promise<ActionResult & { token?: string }> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (!["owner", "admin"].includes(ctx.role)) {
    return { error: "Solo owners y admins pueden invitar." };
  }

  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) return { error: "Email inválido." };
  if (!["admin", "editor", "viewer"].includes(role)) {
    return { error: "Rol inválido." };
  }

  // Already a member?
  const { data: existingProfile } = await ctx.supabase
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  if (existingProfile) {
    const { data: existingMember } = await ctx.supabase
      .from("memberships")
      .select("id")
      .eq("user_id", existingProfile.id)
      .eq("organization_id", ctx.organizationId)
      .maybeSingle();
    if (existingMember) return { error: "Esa persona ya es miembro." };
  }

  // Replace any prior pending invite for the same email in this org.
  await ctx.supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("organization_id", ctx.organizationId)
    .eq("email", normalized)
    .eq("status", "pending");

  const token = randomBytes(24).toString("base64url");
  const { error } = await ctx.supabase.from("invitations").insert({
    organization_id: ctx.organizationId,
    email: normalized,
    role,
    token,
    invited_by: ctx.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/[locale]/people", "page");
  return { success: true, token };
}

export async function getPendingInvitations(): Promise<Invitation[]> {
  const ctx = await getMembershipContext();
  if (!ctx) return [];

  const { data, error } = await ctx.supabase
    .from("invitations")
    .select("id, email, role, token, status, created_at, expires_at")
    .eq("organization_id", ctx.organizationId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    return [];
  }
  return (data ?? []) as Invitation[];
}

export async function revokeInvitation(id: string): Promise<ActionResult> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (!["owner", "admin"].includes(ctx.role)) {
    return { error: "Solo owners y admins pueden revocar invitaciones." };
  }

  const { error } = await ctx.supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/people", "page");
  return { success: true };
}

export async function updateOrganization(formData: FormData): Promise<ActionResult> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (ctx.role !== "owner") return { error: "Solo el owner puede editar la organizacion." };

  const organizationId = String(formData.get("organizationId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!organizationId || organizationId !== ctx.organizationId) {
    return { error: "Organizacion invalida." };
  }
  if (!name) return { error: "El nombre es obligatorio." };

  const { error } = await ctx.supabase
    .from("organizations")
    .update({ name })
    .eq("id", organizationId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/settings", "page");
  revalidatePath("/[locale]/dashboard", "page");
  return { success: true };
}

export async function createDomain(formData: FormData): Promise<ActionResult> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (!["owner", "admin", "editor"].includes(ctx.role)) {
    return { error: "No tenes permisos para crear dominios." };
  }

  const organizationId = String(formData.get("organizationId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!organizationId || organizationId !== ctx.organizationId) {
    return { error: "Organizacion invalida." };
  }
  if (!name) return { error: "El nombre del dominio es obligatorio." };

  const { error } = await ctx.supabase.from("domains").insert({
    name,
    organization_id: organizationId,
    owner_id: ctx.userId,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un dominio con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/[locale]/settings", "page");
  revalidatePath("/[locale]/knowledge", "page");
  revalidatePath("/[locale]/graph", "page");
  return { success: true };
}

export async function deleteDomain(domainId: string): Promise<ActionResult> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (!["owner", "admin", "editor"].includes(ctx.role)) {
    return { error: "No tenes permisos para eliminar dominios." };
  }

  const { data: domain } = await ctx.supabase
    .from("domains")
    .select("id, organization_id")
    .eq("id", domainId)
    .maybeSingle();

  if (!domain || domain.organization_id !== ctx.organizationId) {
    return { error: "Dominio no encontrado." };
  }

  const { count } = await ctx.supabase
    .from("knowledge_units")
    .select("id", { count: "exact", head: true })
    .eq("domain_id", domainId);

  if ((count ?? 0) > 0) {
    return {
      error: "No se puede eliminar: hay Knowledge Units en este dominio.",
    };
  }

  const { error } = await ctx.supabase.from("domains").delete().eq("id", domainId);
  if (error) return { error: error.message };

  revalidatePath("/[locale]/settings", "page");
  revalidatePath("/[locale]/knowledge", "page");
  revalidatePath("/[locale]/graph", "page");
  return { success: true };
}

export async function updateMemberRole(
  membershipId: string,
  newRole: string
): Promise<ActionResult> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (!["owner", "admin"].includes(ctx.role)) {
    return { error: "Solo owners y admins pueden cambiar roles." };
  }

  if (!["admin", "editor", "viewer"].includes(newRole)) {
    return { error: "Rol invalido." };
  }

  const { data: target } = await ctx.supabase
    .from("memberships")
    .select("id, role, user_id, organization_id")
    .eq("id", membershipId)
    .maybeSingle();

  if (!target || target.organization_id !== ctx.organizationId) {
    return { error: "Miembro no encontrado." };
  }
  if (target.user_id === ctx.userId) {
    return { error: "No podes cambiar tu propio rol." };
  }
  if (target.role === "owner") {
    return { error: "No se puede cambiar el rol del owner." };
  }
  if (ctx.role === "admin" && target.role === "admin") {
    return { error: "Un admin no puede modificar a otro admin." };
  }

  const { error } = await ctx.supabase
    .from("memberships")
    .update({ role: newRole as MembershipRole })
    .eq("id", membershipId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/settings", "page");
  return { success: true };
}

export async function removeMember(membershipId: string): Promise<ActionResult> {
  const ctx = await getMembershipContext();
  if (!ctx) return { error: "No autenticado." };
  if (!["owner", "admin"].includes(ctx.role)) {
    return { error: "Solo owners y admins pueden remover miembros." };
  }

  const { data: target } = await ctx.supabase
    .from("memberships")
    .select("id, role, user_id, organization_id")
    .eq("id", membershipId)
    .maybeSingle();

  if (!target || target.organization_id !== ctx.organizationId) {
    return { error: "Miembro no encontrado." };
  }
  if (target.user_id === ctx.userId) {
    return { error: "No podes removerte a vos mismo." };
  }
  if (target.role === "owner") {
    return { error: "No se puede remover al owner." };
  }
  if (ctx.role === "admin" && target.role === "admin") {
    return { error: "Un admin no puede remover a otro admin." };
  }

  const { error } = await ctx.supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/settings", "page");
  return { success: true };
}

export async function getGettingStartedProgress() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return {
      hasDomains: false,
      hasKus: false,
      hasProposed: false,
      hasApproved: false,
      hasAgent: false,
      domainCount: 0,
      kuCount: 0,
      agentCount: 0,
    };
  }

  const supabase = await createClient();

  const [domains, kus, agents] = await Promise.all([
    supabase
      .from("domains")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("knowledge_units")
      .select("id, status")
      .eq("organization_id", organizationId),
    supabase
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
  ]);

  const kuRows = kus.data ?? [];
  const domainCount = domains.count ?? 0;
  const kuCount = kuRows.length;
  const agentCount = agents.count ?? 0;

  return {
    hasDomains: domainCount > 0,
    hasKus: kuCount > 0,
    hasProposed: kuRows.some((k) => k.status === "proposed" || k.status === "approved"),
    hasApproved: kuRows.some((k) => k.status === "approved"),
    hasAgent: agentCount > 0,
    domainCount,
    kuCount,
    agentCount,
  };
}
