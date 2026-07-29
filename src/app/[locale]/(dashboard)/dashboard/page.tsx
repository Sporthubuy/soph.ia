import { setRequestLocale } from "next-intl/server";
import { DashboardOverview } from "@/components/shared/dashboard-overview";
import { GettingStartedChecklist } from "@/components/shared/getting-started";
import { getRecentActivityLogs } from "@/lib/activity/actions";
import { getProjects } from "@/lib/projects/actions";
import { getKnowledgeUnits } from "@/lib/knowledge/actions";
import { getAgents } from "@/lib/agents/actions";
import { getGettingStartedProgress } from "@/lib/organization/actions";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [projects, knowledgeUnits, agents, activityLogs, progress] =
    await Promise.all([
      getProjects(locale),
      getKnowledgeUnits(locale),
      getAgents(locale),
      getRecentActivityLogs(8),
      getGettingStartedProgress(),
    ]);

  const isNewWorkspace =
    progress.kuCount === 0 && progress.agentCount === 0 && projects.length === 0;

  return (
    <div className="space-y-0">
      {(!progress.hasApproved || isNewWorkspace) && (
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 max-w-full">
          <GettingStartedChecklist
            progress={progress}
            welcome={isNewWorkspace}
          />
        </div>
      )}
      <DashboardOverview
        projects={projects}
        knowledgeUnits={knowledgeUnits}
        agents={agents}
        activityLogs={activityLogs}
      />
    </div>
  );
}
