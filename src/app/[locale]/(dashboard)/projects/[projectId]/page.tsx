import { setRequestLocale } from "next-intl/server";
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
  active: "bg-green-50 text-green-700 border-green-100",
  paused: "bg-yellow-50 text-yellow-700 border-yellow-100",
  archived: "bg-gray-50 text-gray-700 border-gray-100",
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
      <nav aria-label="Migas de pan" className="body-sm text-[#7c839b]">
        <Link href="/projects" className="hover:text-black transition-colors">
          Proyectos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#45464d]">{project.name}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start gap-4 flex-wrap">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.color || "#e1e0ff" }}
          >
            <span className="material-symbols-outlined text-2xl">
              {project.icon || "folder_open"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="headline-xl text-black font-bold">{project.name}</h1>
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
            <p className="body-sm text-[#7c839b] mt-1">
              Responsable{" "}
              <span className="font-semibold text-[#45464d]">
                {project.owner?.full_name ?? project.owner?.email ?? "—"}
              </span>
            </p>
          </div>
        </div>

        {project.description && (
          <div className="panel p-6">
            <h2 className="section-heading mb-3">OBJETIVO</h2>
            <p className="body-md text-[#45464d] whitespace-pre-wrap">
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
