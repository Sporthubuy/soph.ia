import { NextResponse } from "next/server";
import { compileAgentContext } from "@/lib/knowledge/actions";
import { chat } from "@/lib/ai/model-router";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface ChatRequestBody {
  query?: string;
  organizationId?: string;
  selectedKuIds?: string[];
  history?: { role: "user" | "assistant"; content: string }[];
  agentId?: string;
  provider?: "anthropic" | "openai" | "google" | "deepseek" | "nvidia" | "gemini";
}

const SYSTEM_BASE =
  "Eres un agente de IA alimentado por el conocimiento verificado de una organizacion. Responde de forma clara y precisa. Cita el titulo de la Knowledge Unit de la que obtienes la informacion cuando sea relevante.";

const PROVIDER_LABEL: Record<
  "anthropic" | "openai" | "google" | "deepseek" | "nvidia",
  string
> = {
  anthropic: "Anthropic Claude",
  openai: "OpenAI",
  google: "Google Gemini",
  deepseek: "DeepSeek",
  nvidia: "Nvidia NIM",
};

const hasServerKey = (
  provider: "anthropic" | "openai" | "google" | "deepseek" | "nvidia"
): boolean => {
  const envByProvider: Record<typeof provider, string | undefined> = {
    anthropic: process.env.ANTHROPIC_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    google: process.env.GOOGLE_AI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    nvidia: process.env.NVIDIA_API_KEY,
  };
  return Boolean(envByProvider[provider]);
};

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

  const { context } = await compileAgentContext(
    organizationId,
    selectedKuIds
  );

  // Map providers: gemini -> google, support all others
  let provider: "anthropic" | "openai" | "google" | "deepseek" | "nvidia" = "anthropic";
  if (body.provider === "openai") {
    provider = "openai";
  } else if (body.provider === "gemini") {
    provider = "google";
  } else if (body.provider === "deepseek") {
    provider = "deepseek";
  } else if (body.provider === "nvidia") {
    provider = "nvidia";
  }

  // Each user runs the agent on their own credentials: pull this user's stored
  // key for the chosen provider. RLS scopes the row to the authenticated user.
  const { data: providerRow } = await supabase
    .from("user_ai_providers")
    .select("api_key, model_name")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .eq("provider", provider)
    .eq("is_active", true)
    .maybeSingle();

  const userApiKey = providerRow?.api_key ?? undefined;
  const userModel = providerRow?.model_name ?? undefined;

  // No user key and no server fallback -> tell them exactly what to do.
  if (!userApiKey && !hasServerKey(provider)) {
    return NextResponse.json(
      {
        error: `No configuraste una API key para ${PROVIDER_LABEL[provider]}. Agregala en Settings → AI Providers para usar este agente.`,
      },
      { status: 400 }
    );
  }

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
      provider,
      apiKey: userApiKey,
      model: userModel,
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