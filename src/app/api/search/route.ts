import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";

export async function POST(request: Request) {
  let body: { query?: string; organizationId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  const organizationId = body.organizationId ?? "";
  if (!query || !organizationId) {
    return NextResponse.json(
      { error: "query and organizationId are required" },
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

  // Check if org is public
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .maybeSingle();

  if (!membership && !org) {
    return NextResponse.json(
      { error: "Organization not found or access denied" },
      { status: 403 }
    );
  }

  let embedding: number[];
  try {
    embedding = await generateEmbedding(query);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Embedding generation failed" },
      { status: 502 }
    );
  }

  let service;
  try {
    service = createServiceClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Service client unavailable" },
      { status: 500 }
    );
  }

  const { data, error } = await service.rpc("match_kus", {
    query_embedding: embedding,
    query_organization_id: organizationId,
    match_count: 10,
    filter_status: (body.status ?? null) as never,
    include_public: !membership, // if not a member, only get public items
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}