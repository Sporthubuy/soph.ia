import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  getProject,
  getProjectMembers,
  getProjectKnowledgeUnits,
  getProjectAgents,
  getProjectLinkCandidates,
  getProjectPermission,
  getProjectFolders,
} from "@/lib/projects/actions";
import { ProjectPeoplePopover } from "@/components/projects/project-people-popover";
import {
  ProjectKnowledge,
  ProjectAgents,
} from "@/components/projects/project-resources";
import { ProjectObjective } from "@/components/projects/project-objective";
import { ProjectVisibilityLock } from "@/components/projects/project-visibility-lock";
import { ShareDialog } from "@/components/shared/share-dialog";


export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const project = await getProject(projectId);
  if (!project) notFound();

  const [{ members, invitations }, knowledgeUnits, agents, candidates, permission, folders] =
    await Promise.all([
      getProjectMembers(projectId),
      getProjectKnowledgeUnits(projectId),
      getProjectAgents(projectId),
      getProjectLinkCandidates(projectId),
      getProjectPermission(projectId),
      getProjectFolders(projectId),
    ]);

  const status = project.status as string;
  const visibility = (project.visibility ?? "private") as
    | "private"
    | "public"
    | "unlisted";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b border-[var(--edge)] bg-[var(--sky-1)] px-6 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: project.color || "#172554" }}
        >
          <Icon name="projects" size={19} className="text-[var(--azure-ink)]" />
        </div>

        <nav aria-label="Migas de pan" className="min-w-0 body-md text-[var(--star-4)]">
          <Link href="/projects" className="hover:text-[var(--star-1)] transition-colors">
            Proyectos
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-[var(--star-1)]">{project.name}</span>
        </nav>

        <div className="flex items-center gap-2">
          <ProjectPeoplePopover
            projectId={projectId}
            ownerId={project.owner_id}
            members={members}
            invitations={invitations}
            canManage={permission.canManage}
          />
          <ProjectVisibilityLock
            projectId={project.id}
            visibility={visibility}
            canManage={permission.canManage}
          />
          <ShareDialog
            path={`/projects/${project.id}`}
            title={project.name}
            description="Comparti el link del proyecto con quienes ya tienen acceso, o invitalos abajo."
            triggerIcon="link"
            triggerOnlyIcon
            triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] text-[var(--star-3)] hover:bg-[var(--sky-1)] transition-colors"
          />
          <StatusBadge status={status} size="sm" className="ml-1" />
        </div>

        <div className="flex-1" />

        <p className="body-sm text-[var(--star-4)] truncate">
          Responsable{" "}
          <span className="font-semibold text-[var(--star-3)]">
            {project.owner?.full_name ?? project.owner?.email ?? "—"}
          </span>
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[400px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-[var(--edge)] p-4">
          <ProjectObjective
            projectId={project.id}
            description={project.description ?? ""}
            canManage={permission.canManage}
          />

          <ProjectAgents
            projectId={projectId}
            agents={agents}
            candidates={candidates.agents}
            canManage={permission.canManage}
          />
        </aside>

        <ProjectKnowledge
          projectId={projectId}
          knowledgeUnits={knowledgeUnits}
          candidates={candidates.knowledgeUnits}
          canManage={permission.canManage}
          folders={folders}
        />
      </div>
    </div>
  );
}
