"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateKUHash } from "@/lib/knowledge/hash";

// ─── Organization / Onboarding ─────────────────────────────────────

export const createOrganization = async (formData: FormData) => {
  const name = formData.get("name") as string;
  if (!name?.trim()) {
    return { error: "El nombre es obligatorio" };
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: name.trim(), slug })
    .select()
    .single();

  if (orgError) {
    if (orgError.code === "23505") {
      return { error: "Ya existe una organizacion con ese nombre" };
    }
    return { error: orgError.message };
  }

  const { error: memberError } = await supabase.from("memberships").insert({
    user_id: user.id,
    organization_id: org.id,
    role: "owner",
  });

  if (memberError) return { error: memberError.message };

  const { error: domainError } = await supabase.from("domains").insert({
    organization_id: org.id,
    name: "General",
    owner_id: user.id,
  });

  if (domainError) return { error: domainError.message };

  redirect("/editor");
};

// ─── Domains ────────────────────────────────────────────────────────

export const getDomains = async (organizationId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("domains")
    .select("id, name, parent_id, owner_id")
    .eq("organization_id", organizationId)
    .order("name");

  return data ?? [];
};

export const createDomain = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const organizationId = formData.get("organizationId") as string;
  const parentId = (formData.get("parentId") as string) || null;

  if (!name?.trim() || !organizationId) {
    return { error: "Nombre y organizacion son obligatorios" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("domains").insert({
    organization_id: organizationId,
    name: name.trim(),
    parent_id: parentId,
    owner_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/editor");
  return { success: true };
};

// ─── Knowledge Units ────────────────────────────────────────────────

export const getKnowledgeUnits = async (
  organizationId: string,
  filters?: { domainId?: string; status?: string; search?: string }
) => {
  const supabase = await createClient();

  let query = supabase
    .from("knowledge_units")
    .select(
      "id, title, status, trust_score, version, created_at, updated_at, domain_id, owner_id, domains(name), profiles!knowledge_units_owner_id_fkey(full_name, email)"
    )
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (filters?.domainId) {
    query = query.eq("domain_id", filters.domainId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
};

export const getKnowledgeUnit = async (kuId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_units")
    .select(
      "*, domains(name), profiles!knowledge_units_owner_id_fkey(full_name, email)"
    )
    .eq("id", kuId)
    .single();

  if (error) return null;
  return data;
};

export const getKUVersions = async (kuId: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("ku_versions")
    .select("*, profiles!ku_versions_changed_by_fkey(full_name, email)")
    .eq("ku_id", kuId)
    .order("version", { ascending: false });

  return data ?? [];
};

export const createKnowledgeUnit = async (formData: FormData) => {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const domainId = formData.get("domainId") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title?.trim() || !domainId || !organizationId) {
    return { error: "Titulo, dominio y organizacion son obligatorios" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const hash = generateKUHash(title.trim(), content || "");

  const { data: ku, error } = await supabase
    .from("knowledge_units")
    .insert({
      title: title.trim(),
      content: content || "",
      hash,
      domain_id: domainId,
      organization_id: organizationId,
      owner_id: user.id,
      status: "draft",
      version: 1,
      trust_score: 50,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const { error: versionError } = await supabase.from("ku_versions").insert({
    ku_id: ku.id,
    version: 1,
    hash,
    title: title.trim(),
    content: content || "",
    changed_by: user.id,
    change_message: "Creacion inicial",
  });

  if (versionError) return { error: versionError.message };

  revalidatePath("/editor");
  redirect(`/editor/${ku.id}`);
};

export const updateKnowledgeUnit = async (formData: FormData) => {
  const kuId = formData.get("kuId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const changeMessage = formData.get("changeMessage") as string;

  if (!kuId || !title?.trim()) {
    return { error: "ID y titulo son obligatorios" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: current } = await supabase
    .from("knowledge_units")
    .select("version, title, content")
    .eq("id", kuId)
    .single();

  if (!current) return { error: "Knowledge Unit no encontrada" };

  const newHash = generateKUHash(title.trim(), content || "");
  const currentHash = generateKUHash(current.title, current.content);

  if (newHash === currentHash) {
    return { error: "No hay cambios para guardar" };
  }

  const newVersion = current.version + 1;

  const { error: updateError } = await supabase
    .from("knowledge_units")
    .update({
      title: title.trim(),
      content: content || "",
      hash: newHash,
      version: newVersion,
      status: "proposed",
    })
    .eq("id", kuId);

  if (updateError) return { error: updateError.message };

  const { error: versionError } = await supabase.from("ku_versions").insert({
    ku_id: kuId,
    version: newVersion,
    hash: newHash,
    title: title.trim(),
    content: content || "",
    changed_by: user.id,
    change_message: changeMessage || null,
  });

  if (versionError) return { error: versionError.message };

  revalidatePath(`/editor/${kuId}`);
  revalidatePath("/editor");
  return { success: true };
};

// ─── Review Actions ─────────────────────────────────────────────────

export const getProposedKnowledgeUnits = async (organizationId: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("knowledge_units")
    .select(
      "id, title, status, trust_score, version, updated_at, domain_id, owner_id, domains(name), profiles!knowledge_units_owner_id_fkey(full_name, email)"
    )
    .eq("organization_id", organizationId)
    .eq("status", "proposed")
    .order("updated_at", { ascending: false });

  return data ?? [];
};

export const approveKnowledgeUnit = async (kuId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Solo owners y admins pueden aprobar" };
  }

  const { error } = await supabase
    .from("knowledge_units")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      trust_score: 80,
    })
    .eq("id", kuId)
    .eq("status", "proposed");

  if (error) return { error: error.message };

  revalidatePath("/review");
  revalidatePath("/editor");
  revalidatePath(`/editor/${kuId}`);
  return { success: true };
};

export const rejectKnowledgeUnit = async (kuId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Solo owners y admins pueden rechazar" };
  }

  const { error } = await supabase
    .from("knowledge_units")
    .update({ status: "draft" })
    .eq("id", kuId)
    .eq("status", "proposed");

  if (error) return { error: error.message };

  revalidatePath("/review");
  revalidatePath("/editor");
  revalidatePath(`/editor/${kuId}`);
  return { success: true };
};

export const archiveKnowledgeUnit = async (kuId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("knowledge_units")
    .update({ status: "archived" })
    .eq("id", kuId);

  if (error) return { error: error.message };

  revalidatePath("/review");
  revalidatePath("/editor");
  revalidatePath(`/editor/${kuId}`);
  return { success: true };
};

// ─── Organization Settings ──────────────────────────────────────────

export const getOrganization = async (organizationId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();
  return data;
};

export const updateOrganization = async (formData: FormData) => {
  const organizationId = formData.get("organizationId") as string;
  const name = formData.get("name") as string;

  if (!organizationId || !name?.trim()) {
    return { error: "ID y nombre son obligatorios" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim() })
    .eq("id", organizationId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
};

export const deleteDomain = async (domainId: string) => {
  const supabase = await createClient();

  const { count } = await supabase
    .from("knowledge_units")
    .select("id", { count: "exact", head: true })
    .eq("domain_id", domainId);

  if (count && count > 0) {
    return { error: `No se puede eliminar: tiene ${count} Knowledge Unit(s) asociada(s)` };
  }

  const { error } = await supabase
    .from("domains")
    .delete()
    .eq("id", domainId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
};

// ─── Members ────────────────────────────────────────────────────────

export const getMembers = async (organizationId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, role, user_id, created_at, profiles(full_name, email)")
    .eq("organization_id", organizationId)
    .order("created_at");

  return data ?? [];
};

export const updateMemberRole = async (membershipId: string, role: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const validRoles = ["owner", "admin", "editor", "viewer"];
  if (!validRoles.includes(role)) {
    return { error: "Rol invalido" };
  }

  const { error } = await supabase
    .from("memberships")
    .update({ role: role as "owner" | "admin" | "editor" | "viewer" })
    .eq("id", membershipId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
};

export const removeMember = async (membershipId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
};
