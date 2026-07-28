"use server";

import { createClient } from "@/lib/supabase/server";

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

  // Get user's organization
  const { data: membershipData } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  const organizationId = membershipData?.organization_id || user.id;

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
