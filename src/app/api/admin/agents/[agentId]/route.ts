import { checkAdminAuth } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", params.agentId)
      .single();

    if (error) throw error;

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const {
      name,
      description,
      system_prompt,
      temperature,
      status,
      knowledge_unit_ids,
    } = await request.json();

    // Update agent
    const { error: updateError } = await supabase
      .from("agents")
      .update({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(system_prompt !== undefined && { system_prompt }),
        ...(temperature !== undefined && { temperature }),
        ...(status && { status }),
        ...(knowledge_unit_ids && { selected_ku_ids: knowledge_unit_ids }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.agentId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Agent updated successfully" });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    // Delete agent (knowledge units are stored in selected_ku_ids array, no junction table)
    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", params.agentId);

    if (error) throw error;

    return NextResponse.json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
