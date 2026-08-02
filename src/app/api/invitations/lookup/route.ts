import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Public lookup of a pending invitation by its secret token. The invited
 * person is not a member yet, so RLS would hide the row — the token itself
 * is the capability. Returns only the minimal info the signup page needs.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: inv, error } = await service
    .from("invitations")
    .select("email, role, status, expires_at, organization_id")
    .eq("token", token)
    .maybeSingle();

  if (error || !inv) {
    return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
  }
  if (inv.status !== "pending") {
    return NextResponse.json({ error: "Invitación ya utilizada o revocada" }, { status: 410 });
  }
  if (new Date(inv.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invitación vencida" }, { status: 410 });
  }

  const { data: org } = await service
    .from("organizations")
    .select("name")
    .eq("id", inv.organization_id)
    .maybeSingle();

  return NextResponse.json({
    email: inv.email,
    role: inv.role,
    organizationName: org?.name ?? "una organización",
  });
}
