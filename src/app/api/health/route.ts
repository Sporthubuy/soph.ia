import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check Supabase
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      checks.supabase = "not_configured";
    } else {
      const supabase = createClient(url, key);
      const { error } = await supabase.from("profiles").select("id").limit(1);
      checks.supabase = error ? `error: ${error.message}` : "ok";
    }
  } catch (e) {
    checks.supabase = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  // Check Neo4j
  try {
    const uri = process.env.NEO4J_URI;
    if (!uri) {
      checks.neo4j = "not_configured";
    } else {
      const { getDriver } = await import("@/lib/neo4j/client");
      const driver = getDriver();
      const session = driver.session();
      await session.run("RETURN 1");
      await session.close();
      checks.neo4j = "ok";
    }
  } catch (e) {
    checks.neo4j = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  const allOk = Object.values(checks).every((v) => v === "ok" || v === "not_configured");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
