"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export interface CreateProjectInput {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export async function createProject(input: CreateProjectInput, locale: string) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        owner_id: user.id,
        organization_id: user.id, // TODO: Get from org context
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    // Revalidate the projects page
    revalidatePath(`/${locale}/dashboard/projects`, "page");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function getProjects(locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}
