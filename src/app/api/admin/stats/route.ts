import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get total knowledge units count
    const { count: totalKUs } = await supabase
      .from("knowledge_units")
      .select("*", { count: "exact", head: true });

    // Get active agents count
    const { count: activeAgents } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get total projects count
    const { count: totalProjects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalKUs: totalKUs || 0,
      activeAgents: activeAgents || 0,
      totalProjects: totalProjects || 0,
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
