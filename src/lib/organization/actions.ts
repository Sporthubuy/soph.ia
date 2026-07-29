"use server";

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
