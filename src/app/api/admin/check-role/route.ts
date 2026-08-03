import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    const { data: adminRole } = await supabase
      .from("admin_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    return NextResponse.json({
      isAdmin: !!adminRole,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error("Error checking admin role:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
