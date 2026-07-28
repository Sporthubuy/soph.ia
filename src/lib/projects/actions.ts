"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";

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

  const organizationId = await getCurrentOrganizationId();

  if (!organizationId) {
    throw new Error("El usuario no pertenece a ninguna organizacion.");
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: input.name,
        description: input.description,
        icon: input.icon,
        color: input.color,
        owner_id: user!.id,
        organization_id: organizationId,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/${locale}/dashboard`, "page");

    return { success: true, data };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function deleteProject(projectId: string, locale: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("owner_id", user!.id);

    if (error) throw error;

    revalidatePath(`/${locale}/dashboard`, "page");

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
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
    const organizationId = await getCurrentOrganizationId();

    if (!organizationId) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}
