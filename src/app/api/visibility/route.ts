import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

interface UpdateVisibilityBody {
  itemId?: string;
  itemType?: "knowledge_unit" | "project" | "agent";
  visibility?: "private" | "public" | "unlisted";
  organizationId?: string;
}

export async function POST(request: Request) {
  try {
    let body: UpdateVisibilityBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { itemId, itemType, visibility, organizationId } = body;

    if (!itemId || !itemType || !visibility || !organizationId) {
      return NextResponse.json(
        { error: "itemId, itemType, visibility, and organizationId are required" },
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

    // Map item type to table
    const tableMap: Record<string, string> = {
      knowledge_unit: "knowledge_units",
      project: "projects",
      agent: "agents",
    };

    const table = tableMap[itemType];
    if (!table) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    // Use service client for both fetch and update
    const serviceClient = createServiceClient();

    console.log(`[Visibility API] Looking for ${itemType}:${itemId} in table ${table}`);

    // Select correct owner column based on item type
    const ownerColumn = itemType === "agent" ? "created_by" : "owner_id";
    const selectColumns = `organization_id, ${ownerColumn}`;

    // Fetch the item to verify ownership
    const { data: item, error: fetchError } = await serviceClient
      .from(table)
      .select(selectColumns)
      .eq("id", itemId)
      .single();

    console.log(`[Visibility API] Fetch result:`, { item, fetchError });

    if (fetchError || !item) {
      return NextResponse.json({
        error: `Item not found: ${fetchError?.message || 'no data'}`
      }, { status: 404 });
    }

    // The dynamic `select` string defeats Supabase's row-type inference, so
    // narrow the verified row to the shape we actually queried.
    const ownedItem = item as unknown as {
      organization_id: string;
    } & Record<string, string | null>;

    // Verify user is member of the organization
    const { data: membership } = await serviceClient
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", ownedItem.organization_id)
      .maybeSingle();

    const isOwner = ownedItem[ownerColumn] === user.id;
    const isAdmin = membership?.role === "admin" || membership?.role === "owner";
    const isMember = !!membership;

    if (!isMember) {
      return NextResponse.json(
        { error: "Access denied: not a member of this organization" },
        { status: 403 }
      );
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied: only owner or admin can change visibility" },
        { status: 403 }
      );
    }

    // Update visibility using service client
    const { error: updateError } = await serviceClient
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
    console.error("Error in visibility API:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update visibility" },
      { status: 500 }
    );
  }
}
