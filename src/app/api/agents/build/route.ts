import { NextResponse } from "next/server";
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