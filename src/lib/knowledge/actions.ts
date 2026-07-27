"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateKUHash } from "@/lib/knowledge/hash";
import { generateEmbeddingOrNull } from "@/lib/ai/embeddings";

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

  // Optional setup payload from guided wizard
  const domainsRaw = (formData.get("domains") as string) || "[]";
  const starterKusRaw = (formData.get("starterKus") as string) || "[]";
  const templateId = (formData.get("templateId") as string) || "blank";

  let domainNames: string[] = [];
  let starterKus: { title: string; domainName: string; content: string }[] = [];
  try {
    domainNames = JSON.parse(domainsRaw) as string[];
  } catch {
    domainNames = ["General"];
  }
  try {
    starterKus = JSON.parse(starterKusRaw) as {
      title: string;
      domainName: string;
      content: string;
    }[];
  } catch {
    starterKus = [];
  }
  if (domainNames.length === 0) domainNames = ["General"];

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

  // Create selected domains
  const domainIdByName: Record<string, string> = {};
  for (const domainName of domainNames) {
    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .insert({
        organization_id: org.id,
        name: domainName.trim(),
        owner_id: user.id,
      })
      .select("id, name")
      .single();
    if (domainError) return { error: domainError.message };
    domainIdByName[domain.name] = domain.id;
  }

  // Seed starter Knowledge Units as drafts (user owns them)
  for (const ku of starterKus) {
    const domainId =
      domainIdByName[ku.domainName] ?? Object.values(domainIdByName)[0];
    if (!domainId) continue;
    const title = ku.title.trim();
    const content = ku.content || "";
    const hash = generateKUHash(title, content);
    const { data: created, error: kuError } = await supabase
      .from("knowledge_units")
      .insert({
        title,
        content,
        hash,
        domain_id: domainId,
        organization_id: org.id,
        owner_id: user.id,
        status: "draft",
        version: 1,
        trust_score: 50,
      })
      .select("id")
      .single();
    if (kuError || !created) continue;
    await supabase.from("ku_versions").insert({
      ku_id: created.id,
      version: 1,
      hash,
      title,
      content,
      changed_by: user.id,
      change_message: `Plantilla ${templateId}`,
    });
  }

  revalidatePath("/[locale]/dashboard", "page");
  revalidatePath("/[locale]/graph", "page");
  revalidatePath("/[locale]/editor", "page");
  const locale = await getLocale();
  redirect(`/${locale}/dashboard`);
};

export const getGettingStartedProgress = async (organizationId: string) => {
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

  const list = kus.data ?? [];
  return {
    hasDomains: (domains.count ?? 0) > 0,
    hasKus: list.length > 0,
    hasProposed: list.some((k) => k.status === "proposed"),
    hasApproved: list.some((k) => k.status === "approved"),
    hasAgent: (agents.count ?? 0) > 0,
    domainCount: domains.count ?? 0,
    kuCount: list.length,
    agentCount: agents.count ?? 0,
  };
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

  revalidatePath("/[locale]/editor", "page");
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

export const semanticSearchKUs = async (
  organizationId: string,
  query: string,
  options?: { matchCount?: number; status?: string }
) => {
  const { generateEmbedding } = await import("@/lib/ai/embeddings");
  const embedding = await generateEmbedding(query).catch(() => null);
  if (!embedding) return [];

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    // Service client unavailable — fall back to user client
    supabase = await createClient();
  }

  const filterStatus = options?.status ?? null;

  const { data, error } = await supabase.rpc("match_kus", {
    query_embedding: embedding,
    query_organization_id: organizationId,
    match_count: options?.matchCount ?? 10,
    filter_status: filterStatus as never,
  });

  if (error) {
    console.warn("semanticSearchKUs error:", error.message);
    return [];
  }
  return (data ?? []) as {
    id: string;
    title: string;
    content: string;
    status: string;
    domain_id: string;
    organization_id: string;
    similarity: number;
  }[];
};

export const getApprovedKnowledgeUnits = async (
  organizationId: string,
  domainId?: string
) => {
  const supabase = await createClient();
  let query = supabase
    .from("knowledge_units")
    .select(
      "id, title, content, version, trust_score, domain_id, domains(name), updated_at"
    )
    .eq("organization_id", organizationId)
    .eq("status", "approved")
    .order("domain_id")
    .order("updated_at", { ascending: false });

  if (domainId) {
    query = query.eq("domain_id", domainId);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
};

export const compileAgentContext = async (
  organizationId: string,
  selectedKuIds: string[]
) => {
  if (selectedKuIds.length === 0) return { context: "", units: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_units")
    .select("id, title, content, version, domains(name)")
    .eq("organization_id", organizationId)
    .eq("status", "approved")
    .in("id", selectedKuIds)
    .order("domain_id")
    .order("updated_at", { ascending: false });

  if (error || !data) return { context: "", units: [] };

  const units = data.map((u) => ({
    id: u.id,
    title: u.title,
    domain: (u.domains as unknown as { name: string }[] | null)?.[0]?.name ?? "General",
    version: u.version,
  }));

  const sections = data.map((u) => {
    const domain =
      (u.domains as unknown as { name: string }[] | null)?.[0]?.name ?? "General";
    return `## ${u.title}\n*Dominio: ${domain} · v${u.version}*\n\n${u.content}`;
  });

  const header = `# Contexto de conocimiento organizacional\n\nEste contexto fue compilado desde ${data.length} Knowledge Unit(s) verificada(s) de SOPH.IA. Responde al usuario usando esta informacion como fuente de autoridad. Si una pregunta excede el contexto, di que no tienes informacion suficiente y sugiere crear una nueva Knowledge Unit.\n`;
  const context = `${header}\n${sections.join("\n\n---\n\n")}`;

  return { context, units };
};

// ─── Agents (deploy + monitor) ──────────────────────────────────────

export const getAgents = async (organizationId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select(
      "id, name, description, provider, model, status, visibility, rating, ratings_count, invocations, last_invoked_at, created_at, updated_at"
    )
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });
  return (data ?? []) as AgentRow[];
};

type AgentRow = {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model: string;
  status: string;
  visibility: string;
  rating: number;
  ratings_count: number;
  invocations: number;
  last_invoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export const deployAgent = async (formData: FormData) => {
  const organizationId = formData.get("organizationId") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const systemPrompt = (formData.get("systemPrompt") as string) || null;
  const provider = (formData.get("provider") as string) || "anthropic";
  const model = (formData.get("model") as string) || "claude-3-5-sonnet-latest";
  const temperature = Number(formData.get("temperature") ?? 0.4);
  const selectedKuIdsRaw = (formData.get("selectedKuIds") as string) || "[]";

  if (!organizationId || !name?.trim()) {
    return { error: "Nombre y organizacion son obligatorios" };
  }

  let selectedKuIds: string[] = [];
  try {
    selectedKuIds = JSON.parse(selectedKuIdsRaw) as string[];
  } catch {
    return { error: "selectedKuIds debe ser JSON array" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("agents").insert({
    organization_id: organizationId,
    name: name.trim(),
    description,
    system_prompt: systemPrompt,
    provider,
    model,
    temperature,
    selected_ku_ids: selectedKuIds,
    status: "deployed",
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/[locale]/agents", "page");
  return { success: true };
};

export const updateAgentStatus = async (agentId: string, status: string) => {
  const valid = ["draft", "deployed", "paused", "archived"];
  if (!valid.includes(status)) return { error: "Estado invalido" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({ status })
    .eq("id", agentId);

  if (error) return { error: error.message };
  revalidatePath("/[locale]/agents", "page");
  return { success: true };
};

export const deleteAgent = async (agentId: string) => {
  const supabase = await createClient();
  const { error } = await supabase.from("agents").delete().eq("id", agentId);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/agents", "page");
  return { success: true };
};

export const getAgent = async (agentId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*, organizations(name), profiles!agents_created_by_fkey(full_name, email)")
    .eq("id", agentId)
    .single();
  if (error) return null;
  return data;
};

// ─── Marketplace ──────────────────────────────────────────────────────

export const publishAgent = async (agentId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({ visibility: "public" })
    .eq("id", agentId);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/agents", "page");
  revalidatePath(`/[locale]/agents/${agentId}`, "page");
  revalidatePath("/[locale]/marketplace", "page");
  return { success: true };
};

export const unpublishAgent = async (agentId: string) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({ visibility: "private" })
    .eq("id", agentId);
  if (error) return { error: error.message };
  revalidatePath("/[locale]/agents", "page");
  revalidatePath(`/[locale]/agents/${agentId}`, "page");
  revalidatePath("/[locale]/marketplace", "page");
  return { success: true };
};

export const getPublicAgents = async (options?: {
  search?: string;
  tag?: string;
  sort?: "newest" | "rating" | "popular";
}) => {
  const supabase = await createClient();
  let query = supabase
    .from("agents")
    .select(
      "id, name, description, provider, model, status, rating, ratings_count, invocations, tags, organization_id, created_at, organizations(name)"
    )
    .eq("visibility", "public")
    .eq("status", "deployed");

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,description.ilike.%${options.search}%`
    );
  }
  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  switch (options?.sort) {
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "popular":
      query = query.order("invocations", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data } = await query.limit(24);
  return data ?? [];
};

export const getMarketplaceTags = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("tags")
    .eq("visibility", "public")
    .eq("status", "deployed");

  const tagSet = new Set<string>();
  for (const row of data ?? []) {
    for (const t of row.tags ?? []) {
      if (t) tagSet.add(t.toLowerCase());
    }
  }
  return Array.from(tagSet).sort();
};

export const cloneAgent = async (sourceAgentId: string, organizationId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: source, error: sourceErr } = await supabase
    .from("agents")
    .select("*")
    .eq("id", sourceAgentId)
    .single();

  if (sourceErr || !source) return { error: "Agente no encontrado" };
  if (source.visibility !== "public" && source.organization_id !== organizationId) {
    return { error: "Este agente no es publico" };
  }

  const { data: cloned, error: insertErr } = await supabase
    .from("agents")
    .insert({
      organization_id: organizationId,
      name: `${source.name} (clon)`,
      description: source.description,
      system_prompt: source.system_prompt,
      provider: source.provider,
      model: source.model,
      temperature: source.temperature,
      selected_ku_ids: source.selected_ku_ids,
      status: "draft",
      visibility: "private",
      cloned_from: sourceAgentId,
      tags: source.tags,
      created_by: user.id,
    })
    .select()
    .single();

  if (insertErr) return { error: insertErr.message };

  revalidatePath("/[locale]/agents", "page");
  revalidatePath("/[locale]/marketplace", "page");
  const locale = await getLocale();
  redirect(`/${locale}/agents/${cloned.id}`);
};

export const rateAgent = async (agentId: string, rating: number, review?: string) => {
  if (rating < 1 || rating > 5) return { error: "Rating debe ser entre 1 y 5" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.from("agent_ratings").upsert({
    agent_id: agentId,
    user_id: user.id,
    rating,
    review: review || null,
  });

  if (error) return { error: error.message };

  try {
    const service = createServiceClient();
    await service.rpc("recalc_agent_rating", { agent_id: agentId });
  } catch {
    // non-fatal
  }

  revalidatePath(`/[locale]/agents/${agentId}`, "page");
  revalidatePath("/[locale]/marketplace", "page");
  return { success: true };
};

export const updateAgentConfig = async (formData: FormData) => {
  const agentId = formData.get("agentId") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const systemPrompt = (formData.get("systemPrompt") as string) || null;
  const provider = (formData.get("provider") as string) || "anthropic";
  const model = (formData.get("model") as string) || "claude-3-5-sonnet-latest";
  const temperature = Number(formData.get("temperature") ?? 0.4);
  const tagsRaw = (formData.get("tags") as string) || "";

  if (!agentId || !name?.trim()) {
    return { error: "ID y nombre son obligatorios" };
  }

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const supabase = await createClient();
  const { error } = await supabase
    .from("agents")
    .update({
      name: name.trim(),
      description,
      system_prompt: systemPrompt,
      provider,
      model,
      temperature,
      tags,
    })
    .eq("id", agentId);

  if (error) return { error: error.message };

  revalidatePath(`/[locale]/agents/${agentId}`, "page");
  return { success: true };
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

export const getKUDependencies = async (kuIds: string[]) => {
  if (kuIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("ku_dependencies")
    .select("source_ku_id, target_ku_id")
    .in("source_ku_id", kuIds);
  return (data ?? []) as { source_ku_id: string; target_ku_id: string }[];
};

export const getKURelations = async (kuId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ku_dependencies")
    .select("source_ku_id, target_ku_id")
    .or(`source_ku_id.eq.${kuId},target_ku_id.eq.${kuId}`);
  return (data ?? []) as {
    source_ku_id: string;
    target_ku_id: string;
  }[];
};

export const addKUDependency = async (
  sourceKuId: string,
  targetKuId: string
) => {
  if (sourceKuId === targetKuId) {
    return { error: "Una KU no puede depender de si misma" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("ku_dependencies")
    .insert({ source_ku_id: sourceKuId, target_ku_id: targetKuId });

  if (error) {
    if (error.code === "23505") {
      return { error: "Esta dependencia ya existe" };
    }
    return { error: error.message };
  }

  revalidatePath(`/[locale]/editor/${sourceKuId}`, "page");
  return { success: true };
};

export const removeKUDependency = async (
  sourceKuId: string,
  targetKuId: string
) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("ku_dependencies")
    .delete()
    .eq("source_ku_id", sourceKuId)
    .eq("target_ku_id", targetKuId);

  if (error) return { error: error.message };

  revalidatePath(`/[locale]/editor/${sourceKuId}`, "page");
  return { success: true };
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

export const getKUDiff = async (kuId: string) => {
  const supabase = await createClient();

  const { data: versions } = await supabase
    .from("ku_versions")
    .select("version, title, content, changed_by, change_message, created_at")
    .eq("ku_id", kuId)
    .order("version", { ascending: false })
    .limit(2);

  if (!versions || versions.length === 0) return null;

  const current = versions[0];
  const previous = versions[1] ?? null;

  return {
    current,
    previous,
  };
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

  // Populate embedding asynchronously with service role (RLS-safe write)
  const embedText = `${title.trim()}\n\n${content || ""}`;
  const embedding = await generateEmbeddingOrNull(embedText);
  if (embedding) {
    try {
      const service = createServiceClient();
      await service
        .from("knowledge_units")
        .update({ embedding })
        .eq("id", ku.id);
    } catch (e) {
      console.warn(
        "No se pudo actualizar embedding en create:",
        e instanceof Error ? e.message : e
      );
    }
  }

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

  revalidatePath("/[locale]/editor", "page");
  const locale = await getLocale();
  redirect(`/${locale}/editor/${ku.id}`);
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

  // Refresh embedding after content change
  if (newHash !== currentHash) {
    const embedText = `${title.trim()}\n\n${content || ""}`;
    const embedding = await generateEmbeddingOrNull(embedText);
    if (embedding) {
      try {
        const service = createServiceClient();
        await service
          .from("knowledge_units")
          .update({ embedding })
          .eq("id", kuId);
      } catch (e) {
        console.warn(
          "No se pudo actualizar embedding en update:",
          e instanceof Error ? e.message : e
        );
      }
    }
  }

  revalidatePath(`/[locale]/editor/${kuId}`, "page");
  revalidatePath("/[locale]/editor", "page");
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

  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/editor", "page");
  revalidatePath(`/[locale]/editor/${kuId}`, "page");
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

  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/editor", "page");
  revalidatePath(`/[locale]/editor/${kuId}`, "page");
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

  revalidatePath("/[locale]/review", "page");
  revalidatePath("/[locale]/editor", "page");
  revalidatePath(`/[locale]/editor/${kuId}`, "page");
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

  revalidatePath("/[locale]/settings", "page");
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

  revalidatePath("/[locale]/settings", "page");
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

  revalidatePath("/[locale]/settings", "page");
  return { success: true };
};

export const removeMember = async (membershipId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/settings", "page");
  return { success: true };
};
