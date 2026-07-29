import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { compileAgentContext } from "@/lib/knowledge/actions";

interface BuildRequestBody {
  organizationId?: string;
  selectedKuIds?: string[];
}

export async function POST(request: Request) {
  let body: BuildRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const organizationId = body.organizationId ?? "";
  const selectedKuIds = body.selectedKuIds ?? [];

  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  // Check auth and membership
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "Access denied: not a member of this organization" },
      { status: 403 }
    );
  }

  const { context, units } = await compileAgentContext(
    organizationId,
    selectedKuIds
  );

  return NextResponse.json({
    context,
    units: units.map((u) => u.id),
    titles: units.map((u) => `${u.title} (${u.domain} v${u.version})`),
  });
}