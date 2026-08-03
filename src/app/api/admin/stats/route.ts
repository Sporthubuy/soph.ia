import { checkAdminAuth } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get knowledge units stats
    const { count: totalKUs } = await supabase
      .from("knowledge_units")
      .select("*", { count: "exact", head: true });

    const { count: approvedKUs } = await supabase
      .from("knowledge_units")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: proposedKUs } = await supabase
      .from("knowledge_units")
      .select("*", { count: "exact", head: true })
      .eq("status", "proposed");

    const { count: draftKUs } = await supabase
      .from("knowledge_units")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft");

    // Get agents stats
    const { count: totalAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true });

    const { count: activeAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get projects count
    const { count: totalProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
      },
      knowledgeUnits: {
        total: totalKUs || 0,
        approved: approvedKUs || 0,
        proposed: proposedKUs || 0,
        draft: draftKUs || 0,
      },
      agents: {
        total: totalAgents || 0,
        active: activeAgents || 0,
      },
      projects: {
        total: totalProjects || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
