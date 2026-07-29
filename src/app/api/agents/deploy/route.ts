import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: {
    organizationId?: string;
    name?: string;
    description?: string;
    systemPrompt?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    selectedKuIds?: string[];
    visibility?: string;
    tags?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const organizationId = body.organizationId ?? "";
  const name = (body.name ?? "").trim();
  if (!organizationId || !name) {
    return NextResponse.json(
      { error: "organizationId and name are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!membership || !["owner", "admin", "editor"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const selectedKuIds = body.selectedKuIds ?? [];
  const visibility =
    body.visibility === "public" || body.visibility === "unlisted"
      ? body.visibility
      : "private";
  const tags = (body.tags ?? [])
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const { data: agent, error } = await supabase
    .from("agents")
    .insert({
      organization_id: organizationId,
      name,
      description: body.description || null,
      system_prompt: body.systemPrompt || null,
      provider: body.provider || "anthropic",
      model: body.model || "claude-3-5-sonnet-latest",
      temperature: body.temperature ?? 0.4,
      selected_ku_ids: selectedKuIds,
      status: "deployed",
      visibility,
      tags,
      created_by: user.id,
    })
    .select("id, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: agent.id, name: agent.name });
}
