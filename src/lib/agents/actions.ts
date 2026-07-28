"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export interface CreateAgentInput {
  name: string;
  description: string;
  model: string;
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

  try {
    const { data, error } = await supabase
      .from("agents")
      .insert({
        name: input.name,
        description: input.description,
        model: input.model,
        knowledge_ids: input.knowledgeIds,
        owner_id: user.id,
        organization_id: user.id,
        status: "idle",
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/${locale}/dashboard/agents`, "page");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw error;
  }
}

export async function getAgents(locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  try {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("organization_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}
