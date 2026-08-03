import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import {
  getKnowledgeUnit,
  getCurrentUserRole,
  getKuMembers,
  getKuInvitations,
} from "@/lib/knowledge/actions";
import { getKuComments } from "@/lib/comments/actions";
import { EDITOR_ROLES } from "@/lib/knowledge/constants";
import { renderMarkdown } from "@/lib/knowledge/markdown";
import { ProposeButton } from "@/components/knowledge/propose-button";
import { CommentsThread } from "@/components/shared/comments-thread";
import { ShareDialog } from "@/components/shared/share-dialog";
import { VisibilityToggle } from "@/components/shared/visibility-toggle";
import { KuPeoplePopover } from "@/components/knowledge/ku-people-popover";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";


const trustColor = (score: number) => {
  if (score >= 90) return "text-[var(--verified)]";
  if (score >= 70) return "text-[var(--azure)]";
  if (score >= 50) return "text-[var(--pending)]";
  return "text-[var(--pending)]";
};

export default async function KnowledgeUnitPage({
  params,
}: {
  params: Promise<{ locale: string; kuId: string }>;
}) {
  const { locale, kuId } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [ku, role, comments] = await Promise.all([
    getKnowledgeUnit(kuId),
    getCurrentUserRole(),
    getKuComments(kuId, "general"),
  ]);
  if (!ku) notFound();

  // Obtener miembros e invitaciones (puede fallar si tablas no existen)
  let members = [];
  let invitations = [];
  try {
    [members, invitations] = await Promise.all([
      getKuMembers(kuId),
      getKuInvitations(kuId),
    ]);
  } catch (e) {
    // Tablas no existen aún - usar arrays vacíos
    members = [];
    invitations = [];
  }

  const trust = ku.trust_score ?? 0;
  const status = ku.status as string;

  // Permisos: owner o EDITOR_ROLES a nivel org o editor de KU
  const isOwner = ku.owner_id === user?.id;
  const isOrgEditor = EDITOR_ROLES.includes(role);
  const isKuEditor = members.some(
    (m) => m.user_id === user?.id && m.role === "editor"
  );
  const canEdit = isOwner || isOrgEditor || isKuEditor;
  const canManage = isOwner; // Solo owner puede manejar colaboradores
  const canPropose = status === "draft" && canEdit;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#64748b]">
        <Link href="/knowledge" className="hover:text-[var(--star-1)] transition-colors">
          Knowledge Units
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#94a3b8]">{ku.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="headline-xl text-[var(--star-1)] font-bold">{ku.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} size="sm" />
            <KuPeoplePopover
              kuId={ku.id}
              ownerId={ku.owner_id}
              members={members}
              invitations={invitations}
              canManage={canManage}
            />
            <ShareDialog path={`/knowledge/${ku.id}`} title={ku.title} />
            {canEdit && (
              <Link
                href={`/knowledge/${ku.id}/edit`}
                className="label-sm px-3 py-1.5 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] transition-colors flex items-center gap-1.5"
              >
                <Icon name="edit" size={15} />
                Editar
              </Link>
            )}
            {canPropose && <ProposeButton kuId={ku.id} />}
          </div>
        </div>

        <dl className="flex items-center gap-6 flex-wrap body-sm text-[#64748b]">
          <div className="flex items-center gap-2">
            <dt>Dominio</dt>
            <dd className="font-semibold text-[#94a3b8]">{ku.domain}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Version</dt>
            <dd className="font-semibold text-[#94a3b8]">v{ku.version ?? 1}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Trust Score</dt>
            <dd className={`font-semibold ${trustColor(trust)}`}>{trust}%</dd>
          </div>
          {ku.updated_at && (
            <div className="flex items-center gap-2">
              <dt>Actualizada</dt>
              <dd className="font-semibold text-[#94a3b8]">
                {new Date(ku.updated_at).toLocaleDateString(locale)}
              </dd>
            </div>
          )}
        </dl>
      </header>

      <section className="panel p-6">
        <h2 className="section-heading mb-4">COMPARTIR</h2>
        <VisibilityToggle
          itemId={ku.id}
          itemType="knowledge_unit"
          currentVisibility={ku.visibility ?? "private"}
          organizationId={ku.organization_id}
          onlyOwner={ku.owner_id !== user?.id && !EDITOR_ROLES.includes(role)}
        />
      </section>

      <article className="panel p-6">
        <h2 className="section-heading mb-4">CONTENIDO</h2>
        {ku.content ? (
          <div
            className="ku-content body-md text-[#94a3b8] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(ku.content) }}
          />
        ) : (
          <p className="body-md text-[#64748b]">
            Esta Knowledge Unit todavia no tiene contenido.
          </p>
        )}
      </article>

      <CommentsThread
        kuId={ku.id}
        comments={comments}
        currentUserId={user?.id ?? ""}
        context="general"
        title="DISCUSSION"
      />

      <div className="panel p-4">
        <p className="label-sm text-[#64748b] mb-1">HASH DE VERSION</p>
        <code className="body-sm text-[#94a3b8] break-all">{ku.hash}</code>
      </div>
    </div>
  );
}
