import { checkAdminAuth } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { kuId: string } }
) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("knowledge_units")
      .select("*")
      .eq("id", params.kuId)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching knowledge unit:", error);
    return NextResponse.json(
      { error: "Knowledge unit not found" },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { kuId: string } }
) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const { title, content, domain, status } = await request.json();

    const { data, error } = await supabase
      .from("knowledge_units")
      .update({
        ...(title && { title }),
        ...(content && { content }),
        ...(domain && { domain }),
        ...(status && { status }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.kuId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating knowledge unit:", error);
    return NextResponse.json(
      { error: "Failed to update knowledge unit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { kuId: string } }
) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("knowledge_units")
      .delete()
      .eq("id", params.kuId);

    if (error) throw error;

    return NextResponse.json({ message: "Knowledge unit deleted successfully" });
  } catch (error) {
    console.error("Error deleting knowledge unit:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge unit" },
      { status: 500 }
    );
  }
}
