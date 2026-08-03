import { checkAdminAuth } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const orgId = await getCurrentOrganizationId();
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 400 }
      );
    }

    const { data, count, error } = await supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const {
      name,
      description,
      model,
      system_prompt,
      temperature,
      knowledge_unit_ids,
    } = await request.json();

    if (!name || !model) {
      return NextResponse.json(
        { error: "Name and model are required" },
        { status: 400 }
      );
    }

    const orgId = await getCurrentOrganizationId();
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 400 }
      );
    }

    // Create agent with selected_ku_ids array
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .insert({
        organization_id: orgId,
        name,
        description: description || null,
        model,
        system_prompt: system_prompt || "",
        temperature: temperature || 0.4,
        selected_ku_ids: knowledge_unit_ids || [],
        status: "draft",
        created_by: auth.user!.id,
        provider: "anthropic",
      })
      .select()
      .single();

    if (agentError) throw agentError;

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
