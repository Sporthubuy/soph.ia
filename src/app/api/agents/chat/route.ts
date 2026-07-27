import { NextResponse } from "next/server";
import { compileAgentContext } from "@/lib/knowledge/actions";
import { chat } from "@/lib/ai/model-router";
import { createServiceClient } from "@/lib/supabase/server";

interface ChatRequestBody {
  query?: string;
  organizationId?: string;
  selectedKuIds?: string[];
  history?: { role: "user" | "assistant"; content: string }[];
  agentId?: string;
}

const SYSTEM_BASE =
  "Eres un agente de IA alimentado por el conocimiento verificado de una organizacion. Responde de forma clara y precisa. Cita el titulo de la Knowledge Unit de la que obtienes la informacion cuando sea relevante.";

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  const organizationId = body.organizationId ?? "";
  const selectedKuIds = body.selectedKuIds ?? [];
  const history = body.history ?? [];

  if (!query || !organizationId) {
    return NextResponse.json(
      { error: "query and organizationId are required" },
      { status: 400 }
    );
  }

  const { context } = await compileAgentContext(
    organizationId,
    selectedKuIds
  );

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    {
      role: "user" as const,
      content: context
        ? `${query}\n\n---\n\n[Contexto verificado]\n${context}`
        : query,
    },
  ];

  try {
    const result = await chat(messages, {
      system: SYSTEM_BASE,
      temperature: 0.4,
      maxTokens: 800,
    });

    // Monitoring: bump invocation count when tied to a deployed agent
    if (body.agentId) {
      try {
        const service = createServiceClient();
        await service.rpc("increment_agent_invocations", {
          agent_id: body.agentId,
        });
      } catch (e) {
        // Non-fatal; log and continue
        console.warn(
          "agent invocation tracking failed:",
          e instanceof Error ? e.message : e
        );
      }
    }

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      model: result.model,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 502 }
    );
  }
}