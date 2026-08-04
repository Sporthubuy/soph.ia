"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";

export interface CreateAgentInput {
  name: string;
  description: string;
  model: string;
  /** Proveedor de inferencia (Model Router). Por defecto Anthropic. */
  provider?: string;
  systemPrompt?: string;
  knowledgeIds: string[];
}

export async function createAgent(input: CreateAgentInput, locale: string) {
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
    const { data, error } = await supabase
      .from("agents")
      .insert({
        name: input.name,
        description: input.description,
        system_prompt: input.systemPrompt ?? "",
        provider: input.provider ?? "anthropic",
        model: input.model,
        selected_ku_ids: input.knowledgeIds,
        created_by: user!.id,
        organization_id: organizationId,
        // agents.status tiene check constraint:
        // ('draft','deployed','paused','archived'). Un agente nace sin desplegar.
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/${locale}/agents`, "page");
    revalidatePath(`/${locale}/dashboard`, "page");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw error;
  }
}

export async function getAgent(id: string) {
  const supabase = await createClient();

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching agent:", error);
    return null;
  }

  return data;
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export type PublicAgent = {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  model: string;
  rating: number;
  ratings_count: number;
  invocations: number;
  tags: string[];
  organization_id: string;
  created_at: string;
  organizations: { name: string } | null;
};

export async function getPublicAgents({
  search = "",
  tag = "",
  sort = "newest",
}: {
  search?: string;
  tag?: string;
  sort?: string;
} = {}): Promise<PublicAgent[]> {
  const supabase = await createClient();

  let query = supabase
    .from("agents")
    .select(
      "id, name, description, provider, model, rating, ratings_count, invocations, tags, organization_id, created_at"
    )
    .eq("visibility", "public")
    .eq("status", "deployed");

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    );
  }
  if (tag && tag !== "all") {
    query = query.contains("tags", [tag]);
  }
  switch (sort) {
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "popular":
      query = query.order("invocations", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching public agents:", error);
    return [];
  }

  const rows = data || [];
  const orgIds = [...new Set(rows.map((a) => a.organization_id).filter(Boolean))];
  let orgNames: Record<string, string> = {};
  if (orgIds.length > 0) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name")
      .in("id", orgIds);
    orgNames = Object.fromEntries((orgs || []).map((o) => [o.id, o.name]));
  }

  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    provider: a.provider,
    model: a.model,
    rating: a.rating ?? 0,
    ratings_count: a.ratings_count ?? 0,
    invocations: a.invocations ?? 0,
    tags: a.tags ?? [],
    organization_id: a.organization_id,
    created_at: a.created_at,
    organizations: orgNames[a.organization_id] ? { name: orgNames[a.organization_id] } : null,
  }));
}

/** Fetch a single public agent by id (visible to any authenticated user). */
export async function getPublicAgent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("visibility", "public")
    .maybeSingle();
  if (error) {
    console.error("Error fetching public agent:", error);
    return null;
  }
  return data;
}

/** Clone a public agent into the current user's organization. */
export async function cloneAgent(agentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "No organization" };

  const { data: source, error: fetchError } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .eq("visibility", "public")
    .single();

  if (fetchError || !source) return { error: "Agent not found or not public" };

  const { data, error } = await supabase
    .from("agents")
    .insert({
      name: `${source.name} (clone)`,
      description: source.description,
      system_prompt: source.system_prompt,
      provider: source.provider,
      model: source.model,
      selected_ku_ids: [],
      created_by: user.id,
      organization_id: organizationId,
      status: "draft",
      visibility: "private",
      cloned_from: agentId,
      tags: source.tags ?? [],
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/agents", "page");
  return { success: true, data };
}

/** Upsert a 1-5 star rating for a public agent. */
export async function rateAgent(agentId: string, rating: number, review?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("agent_ratings").upsert(
    { agent_id: agentId, user_id: user.id, rating, review: review ?? null },
    { onConflict: "agent_id,user_id" }
  );

  if (error) return { error: error.message };

  await supabase.rpc("recalc_agent_rating", { agent_id: agentId });

  revalidatePath("/marketplace", "page");
  return { success: true };
}

/** Get the current user's rating for an agent, or null. */
export async function getMyRating(agentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("agent_ratings")
    .select("rating, review")
    .eq("agent_id", agentId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data ?? null;
}

// ─── Original getAgents ────────────────────────────────────────────────────────

export async function getAgents(locale: string) {
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
      .from("agents")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

// ─── Phase 2: Advanced Marketplace Features ────────────────────────────────────

export interface MarketplaceStats {
  totalPublicAgents: number;
  averageRating: number;
  totalInvocations: number;
  topAgentInvocations: number;
}

export interface TrendingAgent {
  id: string;
  name: string;
  description: string | null;
  rating: number;
  ratings_count: number;
  invocations: number;
  tags: string[];
  organization_id: string;
  organizations: { name: string } | null;
}

export interface AgentReview {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user: {
    id: string;
    email: string;
  } | null;
}

/** Get marketplace statistics (total agents, avg rating, total invocations). */
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .select("id, rating, invocations")
    .eq("visibility", "public")
    .eq("status", "deployed");

  if (error || !data) {
    console.error("Error fetching marketplace stats:", error);
    return {
      totalPublicAgents: 0,
      averageRating: 0,
      totalInvocations: 0,
      topAgentInvocations: 0,
    };
  }

  const totalPublicAgents = data.length;
  const averageRating =
    data.length > 0
      ? data.reduce((sum, a) => sum + (a.rating ?? 0), 0) / data.length
      : 0;
  const totalInvocations = data.reduce((sum, a) => sum + (a.invocations ?? 0), 0);
  const topAgentInvocations = Math.max(
    0,
    ...data.map((a) => a.invocations ?? 0)
  );

  return {
    totalPublicAgents,
    averageRating: Math.round(averageRating * 100) / 100,
    totalInvocations,
    topAgentInvocations,
  };
}

/** Get trending agents: top by rating and top by invocations. */
export async function getTrendingAgents(limit = 6): Promise<{
  topRated: TrendingAgent[];
  mostUsed: TrendingAgent[];
}> {
  const supabase = await createClient();

  // Top rated
  const { data: topRatedData, error: ratingError } = await supabase
    .from("agents")
    .select(
      "id, name, description, provider, model, rating, ratings_count, invocations, tags, organization_id, created_at"
    )
    .eq("visibility", "public")
    .eq("status", "deployed")
    .gt("ratings_count", 0)
    .order("rating", { ascending: false })
    .limit(limit);

  // Most used
  const { data: mostUsedData, error: invocError } = await supabase
    .from("agents")
    .select(
      "id, name, description, provider, model, rating, ratings_count, invocations, tags, organization_id, created_at"
    )
    .eq("visibility", "public")
    .eq("status", "deployed")
    .gt("invocations", 0)
    .order("invocations", { ascending: false })
    .limit(limit);

  if (ratingError || invocError) {
    console.error("Error fetching trending agents:", ratingError || invocError);
    return { topRated: [], mostUsed: [] };
  }

  // Fetch org names for both lists
  const allAgents = [...(topRatedData || []), ...(mostUsedData || [])];
  const orgIds = [...new Set(allAgents.map((a) => a.organization_id).filter(Boolean))];
  let orgNames: Record<string, string> = {};
  if (orgIds.length > 0) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name")
      .in("id", orgIds);
    orgNames = Object.fromEntries((orgs || []).map((o) => [o.id, o.name]));
  }

  const formatAgents = (agents: typeof topRatedData): TrendingAgent[] =>
    (agents || []).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      rating: a.rating ?? 0,
      ratings_count: a.ratings_count ?? 0,
      invocations: a.invocations ?? 0,
      tags: a.tags ?? [],
      organization_id: a.organization_id,
      organizations: orgNames[a.organization_id] ? { name: orgNames[a.organization_id] } : null,
    }));

  return {
    topRated: formatAgents(topRatedData),
    mostUsed: formatAgents(mostUsedData),
  };
}

/** Get all reviews for an agent. */
export async function getAgentReviews(agentId: string): Promise<AgentReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_ratings")
    .select("id, rating, review, created_at, user_id")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching agent reviews:", error);
    return [];
  }

  // Fetch profile info for each reviewer (just email for privacy)
  const userIds = [...new Set(data.map((r) => r.user_id).filter(Boolean))];
  let userEmails: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    userEmails = Object.fromEntries((profiles || []).map((p) => [p.id, p.email]));
  }

  return data.map((r) => ({
    id: r.id,
    rating: r.rating,
    review: r.review,
    created_at: r.created_at,
    user: r.user_id
      ? {
          id: r.user_id,
          email: userEmails[r.user_id] || "Anonymous",
        }
      : null,
  }));
}

export interface FeaturedCollection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  agents: PublicAgent[];
}

/** Semantic search for agents using text query. */
export async function semanticSearchAgents(query: string, limit = 10): Promise<PublicAgent[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();

  interface AnthropicMessage {
    content: Array<{ text: string }>;
  }

  // Generate embedding for the search query using Anthropic
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system:
          "You are a search query analyzer. Extract key concepts and features from the search query.",
        messages: [
          {
            role: "user",
            content: `Analyze this search query and return key features/concepts:\n"${query}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Error generating embedding:", response.statusText);
      // Fallback to keyword search
      return await getPublicAgents({ search: query });
    }

    const data: AnthropicMessage = await response.json();
    const analyzed = data.content?.[0]?.text || query;

    // Use Supabase's built-in full-text search as a semantic approximation
    // In production, you'd call an embedding API and use pgvector
    const { data: results, error } = await supabase
      .from("agents")
      .select(
        "id, name, description, provider, model, rating, ratings_count, invocations, tags, organization_id, created_at"
      )
      .eq("visibility", "public")
      .eq("status", "deployed")
      .or(
        `name.ilike.%${analyzed}%,description.ilike.%${analyzed}%,tags.cs.{${analyzed.split(/\s+/)
          .map((t) => `"${t}"`)
          .join(",")}}`
      )
      .limit(limit);

    if (error || !results) {
      return await getPublicAgents({ search: query });
    }

    // Fetch org names
    const orgIds = [...new Set(results.map((a) => a.organization_id).filter(Boolean))];
    let orgNames: Record<string, string> = {};
    if (orgIds.length > 0) {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name")
        .in("id", orgIds);
      orgNames = Object.fromEntries((orgs || []).map((o) => [o.id, o.name]));
    }

    return results.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      provider: a.provider,
      model: a.model,
      rating: a.rating ?? 0,
      ratings_count: a.ratings_count ?? 0,
      invocations: a.invocations ?? 0,
      tags: a.tags ?? [],
      organization_id: a.organization_id,
      created_at: a.created_at,
      organizations: orgNames[a.organization_id] ? { name: orgNames[a.organization_id] } : null,
    }));
  } catch (error) {
    console.error("Error in semantic search:", error);
    // Fallback to keyword search
    return await getPublicAgents({ search: query });
  }
}

/** Get featured collections with their agents. */
export async function getFeaturedCollections(): Promise<FeaturedCollection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("featured_collections")
    .select("id, name, description, icon, agent_ids")
    .order("position", { ascending: true });

  if (error || !data) {
    console.error("Error fetching featured collections:", error);
    return [];
  }

  // Fetch all agents referenced in collections
  const allAgentIds = data.flatMap((c) => c.agent_ids || []);
  const uniqueAgentIds = [...new Set(allAgentIds)];

  let agentsMap: Record<string, PublicAgent> = {};
  if (uniqueAgentIds.length > 0) {
    const { data: agents } = await supabase
      .from("agents")
      .select(
        "id, name, description, provider, model, rating, ratings_count, invocations, tags, organization_id, created_at"
      )
      .in("id", uniqueAgentIds);

    if (agents && agents.length > 0) {
      // Fetch org names
      const orgIds = [...new Set(agents.map((a) => a.organization_id).filter(Boolean))];
      let orgNames: Record<string, string> = {};
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id, name")
          .in("id", orgIds);
        orgNames = Object.fromEntries((orgs || []).map((o) => [o.id, o.name]));
      }

      agentsMap = Object.fromEntries(
        agents.map((a) => [
          a.id,
          {
            id: a.id,
            name: a.name,
            description: a.description,
            provider: a.provider,
            model: a.model,
            rating: a.rating ?? 0,
            ratings_count: a.ratings_count ?? 0,
            invocations: a.invocations ?? 0,
            tags: a.tags ?? [],
            organization_id: a.organization_id,
            created_at: a.created_at,
            organizations: orgNames[a.organization_id] ? { name: orgNames[a.organization_id] } : null,
          },
        ])
      );
    }
  }

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    icon: c.icon || "sparkle",
    agents: (c.agent_ids || [])
      .map((id: string) => agentsMap[id])
      .filter((a: PublicAgent | undefined): a is PublicAgent => a !== undefined),
  }));
}
