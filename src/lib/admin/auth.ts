import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function checkAdminAuth(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Unauthorized", status: 401 };
  }

  // Check if user is admin
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("*")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  if (!adminRole) {
    return { authorized: false, error: "Forbidden", status: 403 };
  }

  return { authorized: true, user, status: 200 };
}
