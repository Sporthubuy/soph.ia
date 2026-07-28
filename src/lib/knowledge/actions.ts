"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export interface CreateKnowledgeUnitInput {
  title: string;
  description: string;
  content: string;
  domain: string;
  dependencies: string[];
}

export async function createKnowledgeUnit(input: CreateKnowledgeUnitInput, locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  try {
    const { data, error } = await supabase
      .from("knowledge_units")
      .insert({
        title: input.title,
        description: input.description,
        content: input.content,
        domain: input.domain,
        owner_id: user.id,
        organization_id: user.id,
        status: "draft",
        version: 1,
        trust_score: 0,
        dependencies: input.dependencies,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/${locale}/dashboard/knowledge`, "page");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating knowledge unit:", error);
    throw error;
  }
}

export async function getKnowledgeUnits(locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  try {
    const { data, error } = await supabase
      .from("knowledge_units")
      .select("*")
      .eq("organization_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching knowledge units:", error);
    return [];
  }
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
