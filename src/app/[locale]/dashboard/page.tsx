import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardOverview } from "@/components/shared/dashboard-overview";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  // Fetch recent projects, knowledge units, and agents
  const [projectsResult, kuResult, agentsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("organization_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("knowledge_units")
      .select("*")
      .eq("organization_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("agents")
      .select("*")
      .eq("organization_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const projects = projectsResult.data || [];
  const knowledgeUnits = kuResult.data || [];
  const agents = agentsResult.data || [];

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <DashboardOverview
            projects={projects}
            knowledgeUnits={knowledgeUnits}
            agents={agents}
          />
        </main>
      </div>
    </div>
  );
}
