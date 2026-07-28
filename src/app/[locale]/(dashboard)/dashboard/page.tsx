import { setRequestLocale } from "next-intl/server";
import { DashboardOverview } from "@/components/shared/dashboard-overview";
import { getRecentActivityLogs } from "@/lib/activity/actions";
import { getProjects } from "@/lib/projects/actions";
import { getKnowledgeUnits } from "@/lib/knowledge/actions";
import { getAgents } from "@/lib/agents/actions";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Cada action resuelve la organizacion del usuario y filtra por ella.
  const [projects, knowledgeUnits, agents, activityLogs] = await Promise.all([
    getProjects(locale),
    getKnowledgeUnits(locale),
    getAgents(locale),
    getRecentActivityLogs(5),
  ]);

  return (
    <DashboardOverview
      projects={projects}
      knowledgeUnits={knowledgeUnits}
      agents={agents}
      activityLogs={activityLogs}
    />
  );
}
