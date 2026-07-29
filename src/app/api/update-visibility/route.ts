import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface UpdateVisibilityBody {
  itemId?: string;
  itemType?: "knowledge_unit" | "project" | "agent";
  visibility?: "private" | "public" | "unlisted";
}

export async function POST(request: Request) {
  let body: UpdateVisibilityBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { itemId, itemType, visibility } = body;

  if (!itemId || !itemType || !visibility) {
    return NextResponse.json(
      { error: "itemId, itemType, and visibility are required" },
      { status: 400 }
    );
  }

  if (!["private", "public", "unlisted"].includes(visibility)) {
    return NextResponse.json(
      { error: "Invalid visibility value" },
      { status: 400 }
    );
  }

  // Check auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Map item type to table and get organization_id
    const tableMap: Record<string, string> = {
      knowledge_unit: "knowledge_units",
      project: "projects",
      agent: "agents",
    };

    const table = tableMap[itemType];

    // Fetch the item to verify ownership
    const { data: item, error: fetchError } = await supabase
      .from(table)
      .select("organization_id, owner_id, created_by")
      .eq("id", itemId)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify user is owner or admin of the organization
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", item.organization_id)
      .maybeSingle();

    const isOwner = item.owner_id === user.id || item.created_by === user.id;
    const isAdmin = membership?.role === "admin" || membership?.role === "owner";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied: only owner or admin can change visibility" },
        { status: 403 }
      );
    }

    // Update visibility
    const { error: updateError } = await supabase
      .from(table)
      .update({ visibility })
      .eq("id", itemId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      itemId,
      itemType,
      visibility,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update visibility" },
      { status: 500 }
    );
  }
}
