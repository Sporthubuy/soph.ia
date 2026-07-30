import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { KnowledgeGraphFlow } from "@/components/graph/knowledge-graph-flow";
import { SemanticSearch } from "@/components/graph/semantic-search";
import { getKnowledgeGraphData } from "@/lib/knowledge/actions";
import { Icon } from "@/components/shared/icon";

export default async function GraphPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("graph");
  const { organizationId, kus, dependencies, domains } =
    await getKnowledgeGraphData();

  const approved = kus.filter((k) => k.status === "approved").length;
  const proposed = kus.filter((k) => k.status === "proposed").length;

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="headline-xl text-[var(--star-1)] font-bold">{t("pageTitle")}</h1>
          <p className="body-md text-[#b8c1d4]">{t("graphDesc")}</p>
        </div>
        <Link
          href="/knowledge/new"
          className="inline-flex items-center gap-1.5 self-start rounded-[10px] bg-[var(--azure)] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] hover:bg-[var(--azure-bright)]"
        >
          <Icon name="plus" size={16} strokeWidth={2.2} />
          New KU
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="panel p-4">
          <p className="label-sm text-[#8b95ab]">{t("statKUs")}</p>
          <p className="headline-md font-bold text-[var(--star-1)] mt-1">{kus.length}</p>
        </div>
        <div className="panel p-4">
          <p className="label-sm text-[#8b95ab]">{t("statVerified")}</p>
          <p className="headline-md font-bold text-[var(--verified)] mt-1">{approved}</p>
          <p className="label-sm text-[#8b95ab] mt-0.5">{t("statVerifiedSub", { percent: kus.length > 0 ? Math.round((approved / kus.length) * 100) : 0 })}</p>
        </div>
        <div className="panel p-4">
          <p className="label-sm text-[#8b95ab]">{t("statPending")}</p>
          <p className="headline-md font-bold text-[var(--pending)] mt-1">{proposed}</p>
        </div>
        <div className="panel p-4">
          <p className="label-sm text-[#8b95ab]">{t("statDomains")}</p>
          <p className="headline-md font-bold text-[var(--star-1)] mt-1">{domains.length}</p>
        </div>
      </div>

      {kus.length === 0 ? (
        <div className="panel p-12 text-center space-y-4">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(91_155_255_/_0.12)] text-[var(--azure)]" aria-hidden>
            <Icon name="graph" size={28} />
          </span>
          <p className="body-md text-[var(--star-1)] font-medium">{t("emptyTitle")}</p>
          <p className="body-sm text-[#8b95ab] max-w-md mx-auto">{t("emptyDesc")}</p>
          <Link
            href="/knowledge/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5b9bff] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] hover:bg-[#3f7fe0]"
          >
            Create first knowledge unit
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="section-heading">{t("graphTitle")}</h2>
              <p className="body-sm text-[#8b95ab]">{t("graphDesc")}</p>
            </div>
            <div className="w-full h-[600px] rounded-lg border border-[#212a3e]">
              <KnowledgeGraphFlow
                kus={kus}
                dependencies={dependencies}
                domains={domains}
              />
            </div>
          </section>

          {organizationId && (
            <section className="panel p-6 space-y-3">
              <div>
                <h2 className="section-heading">{t("semanticTitle")}</h2>
                <p className="body-sm text-[#8b95ab]">{t("semanticDesc")}</p>
              </div>
              <SemanticSearch organizationId={organizationId} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
