import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    supabase = await createClient();
  }

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
      selected_ku_ids: body.selectedKuIds ?? [],
      status: "deployed",
      visibility: body.visibility || "private",
      tags: body.tags ?? [],
      created_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: agent.id, name: agent.name });
}