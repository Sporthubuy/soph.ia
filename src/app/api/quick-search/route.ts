import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Hit = {
  id: string;
  type: "knowledge" | "project" | "agent";
  title: string;
  subtitle: string;
  href: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 1) {
    return NextResponse.json({ results: [] as Hit[] });
  }

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
    .maybeSingle();

  if (!membership?.organization_id) {
    return NextResponse.json({ results: [] as Hit[] });
  }

  const orgId = membership.organization_id;
  const pattern = `%${q}%`;

  const [kus, projects, agents] = await Promise.all([
    supabase
      .from("knowledge_units")
      .select("id, title, status, domains(name)")
      .eq("organization_id", orgId)
      .ilike("title", pattern)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("projects")
      .select("id, name, status")
      .eq("organization_id", orgId)
      .ilike("name", pattern)
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("agents")
      .select("id, name, status, model")
      .eq("organization_id", orgId)
      .ilike("name", pattern)
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const results: Hit[] = [];

  for (const ku of kus.data ?? []) {
    const domain = Array.isArray(ku.domains)
      ? ku.domains[0]?.name
      : (ku.domains as { name: string } | null)?.name;
    results.push({
      id: ku.id,
      type: "knowledge",
      title: ku.title,
      subtitle: `${domain ?? "General"} · ${ku.status}`,
      href: `/knowledge/${ku.id}`,
    });
  }

  for (const p of projects.data ?? []) {
    results.push({
      id: p.id,
      type: "project",
      title: p.name,
      subtitle: `Project · ${p.status ?? "active"}`,
      href: `/projects/${p.id}`,
    });
  }

  for (const a of agents.data ?? []) {
    results.push({
      id: a.id,
      type: "agent",
      title: a.name,
      subtitle: `${a.model ?? "agent"} · ${a.status}`,
      href: `/agents/${a.id}`,
    });
  }

  return NextResponse.json({ results });
}
