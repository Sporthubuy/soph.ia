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
