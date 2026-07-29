"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  description: string;
  created_at: string;
  profiles: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
}

const one = <T>(value: T | T[] | null | undefined): T | null => {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
};

export async function getRecentActivityLogs(limit: number = 10): Promise<ActivityLog[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const organizationId = await getCurrentOrganizationId();

  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, user_id, action_type, entity_type, entity_id, entity_title, description, created_at, profiles(full_name, email, avatar_url)"
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const { profiles, ...rest } = row as typeof row & {
      profiles:
        | { full_name: string | null; email: string | null; avatar_url: string | null }
        | { full_name: string | null; email: string | null; avatar_url: string | null }[]
        | null;
    };
    return {
      ...rest,
      profiles: one(profiles),
    } as ActivityLog;
  });
}
