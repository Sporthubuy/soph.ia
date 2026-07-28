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
}

export async function getRecentActivityLogs(limit: number = 10) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const organizationId = await getCurrentOrganizationId();

  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, user_id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }

  return data || [];
}
