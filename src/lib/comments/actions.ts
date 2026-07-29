"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import type { ActionResult } from "@/lib/action-result";

export type KuComment = {
  id: string;
  ku_id: string;
  body: string;
  context: "general" | "review";
  created_at: string;
  author_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

const one = <T>(value: T | T[] | null | undefined): T | null => {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

export async function getKuComments(
  kuId: string,
  context?: "general" | "review"
): Promise<KuComment[]> {
  const supabase = await createClient();
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  let query = supabase
    .from("ku_comments")
    .select(
      "id, ku_id, body, context, created_at, author_id, profiles(full_name, email)"
    )
    .eq("ku_id", kuId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (context) {
    query = query.eq("context", context);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching KU comments:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const { profiles, ...rest } = row as typeof row & {
      profiles:
        | { full_name: string | null; email: string | null }
        | { full_name: string | null; email: string | null }[]
        | null;
    };
    return {
      ...rest,
      context: rest.context as "general" | "review",
      profiles: one(profiles),
    } as KuComment;
  });
}

export async function getKuCommentsBatch(
  kuIds: string[],
  context: "general" | "review" = "review"
): Promise<Record<string, KuComment[]>> {
  const empty: Record<string, KuComment[]> = {};
  if (kuIds.length === 0) return empty;

  const supabase = await createClient();
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return empty;

  const { data, error } = await supabase
    .from("ku_comments")
    .select(
      "id, ku_id, body, context, created_at, author_id, profiles(full_name, email)"
    )
    .in("ku_id", kuIds)
    .eq("organization_id", organizationId)
    .eq("context", context)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching KU comments batch:", error);
    return empty;
  }

  const map: Record<string, KuComment[]> = {};
  for (const id of kuIds) map[id] = [];

  for (const row of data ?? []) {
    const { profiles, ...rest } = row as typeof row & {
      profiles:
        | { full_name: string | null; email: string | null }
        | { full_name: string | null; email: string | null }[]
        | null;
      ku_id: string;
    };
    const comment = {
      ...rest,
      context: rest.context as "general" | "review",
      profiles: one(profiles),
    } as KuComment;
    if (!map[comment.ku_id]) map[comment.ku_id] = [];
    map[comment.ku_id].push(comment);
  }

  return map;
}

export async function addKuComment(input: {
  kuId: string;
  body: string;
  context?: "general" | "review";
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: "Sin organizacion." };

  const body = input.body.trim();
  if (!body) return { error: "El comentario no puede estar vacio." };
  if (body.length > 4000) return { error: "Comentario demasiado largo." };

  const { data: ku } = await supabase
    .from("knowledge_units")
    .select("id, organization_id")
    .eq("id", input.kuId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!ku) return { error: "Knowledge Unit no encontrada." };

  const { error } = await supabase.from("ku_comments").insert({
    ku_id: input.kuId,
    organization_id: organizationId,
    author_id: user.id,
    body,
    context: input.context ?? "general",
  });

  if (error) return { error: error.message };

  revalidatePath("/[locale]/knowledge/[kuId]", "page");
  revalidatePath("/[locale]/review", "page");
  return { success: true };
}

export async function deleteKuComment(commentId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { error } = await supabase
    .from("ku_comments")
    .delete()
    .eq("id", commentId);

  if (error) return { error: error.message };

  revalidatePath("/[locale]/knowledge/[kuId]", "page");
  revalidatePath("/[locale]/review", "page");
  return { success: true };
}
