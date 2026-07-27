import { NextResponse } from "next/server";
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

  let embedding: number[];
  try {
    embedding = await generateEmbedding(query);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Embedding generation failed" },
      { status: 502 }
    );
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Service client unavailable" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase.rpc("match_kus", {
    query_embedding: embedding,
    query_organization_id: organizationId,
    match_count: 10,
    filter_status: (body.status ?? null) as never,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}