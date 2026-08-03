import { checkAdminAuth } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const domain = searchParams.get("domain");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("knowledge_units")
      .select("*", { count: "exact" });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Domain filtering would require joining with domains table
    // if (domain && domain !== "all") {
    //   query = query.eq("domain_id", domain);
    // }

    const { data, count, error } = await query
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
    console.error("Error fetching knowledge units:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge units" },
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
    const { title, content, domain, status } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("knowledge_units")
      .insert({
        title,
        content,
        domain: domain || "general",
        status: status || "draft",
        owner_id: auth.user!.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating knowledge unit:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge unit" },
      { status: 500 }
    );
  }
}
