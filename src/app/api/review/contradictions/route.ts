import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { chat } from "@/lib/ai/model-router";

interface ReqBody {
  proposedKuId?: string;
}

interface Candidate {
  id: string;
  title: string;
  content: string;
  similarity: number;
}

const MAX_CANDIDATES = 4;
const SIMILARITY_THRESHOLD = 0.7;

export async function POST(request: Request) {
  let body: ReqBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const proposedKuId = body.proposedKuId;
  if (!proposedKuId) {
    return NextResponse.json(
      { error: "proposedKuId is required" },
      { status: 400 }
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

  const { data: proposed, error: propErr } = await supabase
    .from("knowledge_units")
    .select("id, title, content, organization_id")
    .eq("id", proposedKuId)
    .single();

  if (propErr || !proposed) {
    return NextResponse.json(
      { error: "Proposed KU not found" },
      { status: 404 }
    );
  }

  // Find candidates via embedding similarity if embedding exists; else compute it.
  let embedding = null as number[] | null;
  try {
    const { data: row } = await supabase
      .from("knowledge_units")
      .select("embedding")
      .eq("id", proposed.id)
      .single();
    const e = row?.embedding as unknown;
    if (Array.isArray(e)) embedding = e as number[];
  } catch {
    // ignore
  }
  if (!embedding) {
    try {
      embedding = await generateEmbedding(
        `${proposed.title}\n\n${proposed.content}`
      );
    } catch {
      return NextResponse.json({ contradictions: [] });
    }
  }

  const { data: matches, error: matchErr } = await supabase.rpc("match_kus", {
    query_embedding: embedding,
    query_organization_id: proposed.organization_id,
    match_count: MAX_CANDIDATES + 1,
    filter_status: "approved" as never,
  });

  if (matchErr || !matches) {
    return NextResponse.json({ contradictions: [] });
  }

  const candidates = (matches as Candidate[])
    .filter((m) => m.id !== proposed.id && m.similarity >= SIMILARITY_THRESHOLD)
    .slice(0, MAX_CANDIDATES);

  if (candidates.length === 0) {
    return NextResponse.json({ contradictions: [] });
  }

  // Single LLM call over all candidate pairs.
  const pairs = candidates
    .map(
      (c, i) =>
        `Pair ${i + 1}\n[Aprobada: ${c.title}]\n${truncate(c.content, 600)}\n\n[Propuesta: ${proposed.title}]\n${truncate(proposed.content, 600)}`
    )
    .join("\n\n---\n\n");

  const system = [
    "Eres un verificador de consistencia de conocimiento organizacional.",
    "Para cada par, decide si la propuesta CONTRADICE a la aprobada existente.",
    'Responde SOLO con JSON {"results":[{"pair":number,"contradicts":boolean,"reason":"short"}]}.',
    "No agregues markdown.",
  ].join(" ");

  try {
    const result = await chat(
      [
        {
          role: "user",
          content: `Evalua los siguientes pares y devuelve el JSON.\n\n${pairs}`,
        },
      ],
      { system, temperature: 0, maxTokens: 700 }
    );

    const parsed = parseJsonLoose(result.content);
    if (!parsed || !Array.isArray(parsed.results)) {
      return NextResponse.json({ contradictions: [] });
    }

    const contradictions = parsed.results
      .filter((r: { contradicts?: boolean }) => r.contradicts)
      .map((r: { pair: number; reason?: string }) => {
        const idx = (r.pair ?? 1) - 1;
        const c = candidates[idx] ?? candidates[0];
        return {
          candidateId: c.id,
          candidateTitle: c.title,
          similarity: c.similarity,
          reason: r.reason ?? "Sin razon provisto",
        };
      });

    return NextResponse.json({ contradictions });
  } catch {
    return NextResponse.json({ contradictions: [] });
  }
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n) + "…";
}

function parseJsonLoose(text: string): { results?: unknown } | null {
  try {
    // Strip optional ```json fences and any surrounding prose.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fenced ? fenced[1] : text;
    return JSON.parse(candidate.trim());
  } catch {
    return null;
  }
}