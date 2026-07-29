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

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-50 text-green-700 border-green-100",
  proposed: "bg-blue-50 text-blue-700 border-blue-100",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-100",
  archived: "bg-gray-50 text-gray-700 border-gray-100",
};

const trustColor = (score: number) => {
  if (score >= 90) return "text-green-700";
  if (score >= 70) return "text-blue-700";
  if (score >= 50) return "text-yellow-700";
  return "text-orange-700";
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
      <nav aria-label="Migas de pan" className="body-sm text-[#7c839b]">
        <Link href="/knowledge" className="hover:text-black transition-colors">
          Knowledge Units
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#45464d]">{ku.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="headline-xl text-black font-bold">{ku.title}</h1>
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
                className="label-sm px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-[#45464d] hover:bg-[#f7f9fb] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base" aria-hidden>
                  edit
                </span>
                Editar
              </Link>
            )}
            {canPropose && <ProposeButton kuId={ku.id} />}
          </div>
        </div>

        <dl className="flex items-center gap-6 flex-wrap body-sm text-[#7c839b]">
          <div className="flex items-center gap-2">
            <dt>Dominio</dt>
            <dd className="font-semibold text-[#45464d]">{ku.domain}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Version</dt>
            <dd className="font-semibold text-[#45464d]">v{ku.version ?? 1}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>Trust Score</dt>
            <dd className={`font-semibold ${trustColor(trust)}`}>{trust}%</dd>
          </div>
          {ku.updated_at && (
            <div className="flex items-center gap-2">
              <dt>Actualizada</dt>
              <dd className="font-semibold text-[#45464d]">
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
          onlyOwner={ku.owner_id !== user?.id && !EDITOR_ROLES.includes(role)}
        />
      </section>

      <article className="panel p-6">
        <h2 className="section-heading mb-4">CONTENIDO</h2>
        {ku.content ? (
          <div
            className="ku-content body-md text-[#45464d] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(ku.content) }}
          />
        ) : (
          <p className="body-md text-[#7c839b]">
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
        <p className="label-sm text-[#7c839b] mb-1">HASH DE VERSION</p>
        <code className="body-sm text-[#45464d] break-all">{ku.hash}</code>
      </div>
    </div>
  );
}
