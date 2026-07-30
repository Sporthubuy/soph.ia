import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/shared/icon";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import {
  getProject,
  getProjectMembers,
  getProjectKnowledgeUnits,
  getProjectAgents,
  getProjectLinkCandidates,
  getProjectPermission,
} from "@/lib/projects/actions";
import { ProjectMembers } from "@/components/projects/project-members";
import {
  ProjectKnowledge,
  ProjectAgents,
} from "@/components/projects/project-resources";
import { ShareDialog } from "@/components/shared/share-dialog";
import { VisibilityToggle } from "@/components/shared/visibility-toggle";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[rgb(52_211_153_/_0.12)] text-[var(--verified)] border-[rgb(52_211_153_/_0.28)]",
  paused: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  paused: "En pausa",
  archived: "Archivado",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const project = await getProject(projectId);
  if (!project) notFound();

  const [{ members, invitations }, knowledgeUnits, agents, candidates, permission] =
    await Promise.all([
      getProjectMembers(projectId),
      getProjectKnowledgeUnits(projectId),
      getProjectAgents(projectId),
      getProjectLinkCandidates(projectId),
      getProjectPermission(projectId),
    ]);

  const status = project.status as string;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#8b95ab]">
        <Link href="/projects" className="hover:text-[var(--star-1)] transition-colors">
          Proyectos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#b8c1d4]">{project.name}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.color || "#16233d" }}
          >
            <Icon name="projects" size={26} className="text-[var(--azure-ink)]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="headline-xl text-[var(--star-1)] font-bold">{project.name}</h1>
              <span
                className={`label-sm px-2 py-1 rounded border ${
                  STATUS_STYLES[status] ?? STATUS_STYLES.archived
                }`}
              >
                {STATUS_LABELS[status] ?? status}
              </span>
              <ShareDialog
                path={`/projects/${project.id}`}
                title={project.name}
                description="Share this project link with teammates who already have access, or invite them below."
              />
            </div>
            <p className="body-sm text-[#8b95ab] mt-1">
              Responsable{" "}
              <span className="font-semibold text-[#b8c1d4]">
                {project.owner?.full_name ?? project.owner?.email ?? "—"}
              </span>
            </p>
          </div>
        </div>

        {project.description && (
          <div className="panel p-6">
            <h2 className="section-heading mb-3">OBJETIVO</h2>
            <p className="body-md text-[#b8c1d4] whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}
      </header>

      <section className="panel p-6">
        <h2 className="section-heading mb-4">COMPARTIR</h2>
        <VisibilityToggle
          itemId={projectId}
          itemType="project"
          currentVisibility={project.visibility ?? "private"}
          organizationId={project.organization_id}
          onlyOwner={project.owner_id !== user?.id && !permission.canManage}
        />
      </section>

      <ProjectMembers
        projectId={projectId}
        ownerId={project.owner_id}
        members={members}
        invitations={invitations}
        canManage={permission.canManage}
      />

      <ProjectKnowledge
        projectId={projectId}
        knowledgeUnits={knowledgeUnits}
        candidates={candidates.knowledgeUnits}
        canManage={permission.canManage}
      />

      <ProjectAgents
        projectId={projectId}
        agents={agents}
        candidates={candidates.agents}
        canManage={permission.canManage}
      />
    </div>
  );
}
