import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getKnowledgeUnit, getCurrentUserRole } from "@/lib/knowledge/actions";
import { getKuComments } from "@/lib/comments/actions";
import { EDITOR_ROLES } from "@/lib/knowledge/constants";
import { renderMarkdown } from "@/lib/knowledge/markdown";
import { ProposeButton } from "@/components/knowledge/propose-button";
import { CommentsThread } from "@/components/shared/comments-thread";
import { ShareDialog } from "@/components/shared/share-dialog";
import { VisibilityToggle } from "@/components/shared/visibility-toggle";
import { Icon } from "@/components/shared/icon";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-[rgb(52_211_153_/_0.12)] text-[var(--verified)] border-[rgb(52_211_153_/_0.28)]",
  proposed: "bg-[rgb(91_155_255_/_0.12)] text-[var(--azure)] border-[rgb(91_155_255_/_0.28)]",
  draft: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

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

  const trust = ku.trust_score ?? 0;
  const status = ku.status as string;
  const canEdit = EDITOR_ROLES.includes(role);
  const canPropose = status === "draft" && canEdit;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#8b95ab]">
        <Link href="/knowledge" className="hover:text-[var(--star-1)] transition-colors">
          Knowledge Units
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#b8c1d4]">{ku.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="headline-xl text-[var(--star-1)] font-bold">{ku.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`label-sm px-2 py-1 rounded border ${
                STATUS_STYLES[status] ?? STATUS_STYLES.archived
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <ShareDialog path={`/knowledge/${ku.id}`} title={ku.title} />
            {canEdit && (
              <Link
                href={`/knowledge/${ku.id}/edit`}
                className="label-sm px-3 py-1.5 rounded-lg border border-[#212a3e] text-[#b8c1d4] hover:bg-[#0a0e17] transition-colors flex items-center gap-1.5"
              >
                <Icon name="edit" size={15} />
                Editar
              </Link>
            )}
            {canPropose && <ProposeButton kuId={ku.id} />}
          </div>
        </div>

        <dl className="flex items-center gap-6 flex-wrap body-sm text-[#8b95ab]">
          <div className="flex items-center gap-2">
            <dt>Dominio</dt>
            <dd className="font-semibold text-[#b8c1d4]">{ku.domain}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Version</dt>
            <dd className="font-semibold text-[#b8c1d4]">v{ku.version ?? 1}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Trust Score</dt>
            <dd className={`font-semibold ${trustColor(trust)}`}>{trust}%</dd>
          </div>
          {ku.updated_at && (
            <div className="flex items-center gap-2">
              <dt>Actualizada</dt>
              <dd className="font-semibold text-[#b8c1d4]">
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
            className="ku-content body-md text-[#b8c1d4] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(ku.content) }}
          />
        ) : (
          <p className="body-md text-[#8b95ab]">
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
        <p className="label-sm text-[#8b95ab] mb-1">HASH DE VERSION</p>
        <code className="body-sm text-[#b8c1d4] break-all">{ku.hash}</code>
      </div>
    </div>
  );
}
