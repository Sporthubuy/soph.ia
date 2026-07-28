import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardOverview } from "@/components/shared/dashboard-overview";
import { getRecentActivityLogs } from "@/lib/activity/actions";

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

  // Get user's organization
  const { data: membershipData } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  const organizationId = membershipData?.organization_id || user.id;

  // Fetch recent projects, knowledge units, agents, and activity logs
  const [projectsResult, kuResult, agentsResult, activityLogs] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("knowledge_units")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("agents")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(5),
    getRecentActivityLogs(5),
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
            activityLogs={activityLogs}
          />
        </main>
      </div>
    </div>
  );
}
