import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { KnowledgeGraph } from "@/components/graph/knowledge-graph";
import { SemanticSearch } from "@/components/graph/semantic-search";
import { getKnowledgeGraphData } from "@/lib/knowledge/actions";

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
          <h1 className="headline-xl text-black font-bold">{t("pageTitle")}</h1>
          <p className="body-md text-[#45464d]">{t("graphDesc")}</p>
        </div>
        <Link
          href="/knowledge/new"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[#4648d4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3b3db8]"
        >
          <span className="text-lg" aria-hidden>
            add
          </span>
          New KU
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="panel p-4">
          <p className="label-sm text-[#7c839b]">{t("statKUs")}</p>
          <p className="headline-md font-bold text-black mt-1">{kus.length}</p>
        </div>
        <div className="panel p-4">
          <p className="label-sm text-[#7c839b]">{t("statVerified")}</p>
          <p className="headline-md font-bold text-emerald-700 mt-1">{approved}</p>
          <p className="label-sm text-[#7c839b] mt-0.5">{t("statVerifiedSub")}</p>
        </div>
        <div className="panel p-4">
          <p className="label-sm text-[#7c839b]">{t("statPending")}</p>
          <p className="headline-md font-bold text-amber-700 mt-1">{proposed}</p>
        </div>
        <div className="panel p-4">
          <p className="label-sm text-[#7c839b]">{t("statDomains")}</p>
          <p className="headline-md font-bold text-black mt-1">{domains.length}</p>
        </div>
      </div>

      {kus.length === 0 ? (
        <div className="panel p-12 text-center space-y-4">
          <span className="text-5xl text-[#7c839b]" aria-hidden>
            hub
          </span>
          <p className="body-md text-black font-medium">{t("emptyTitle")}</p>
          <p className="body-sm text-[#7c839b] max-w-md mx-auto">{t("emptyDesc")}</p>
          <Link
            href="/knowledge/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#4648d4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3b3db8]"
          >
            Create first knowledge unit
          </Link>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="section-heading">{t("graphTitle")}</h2>
              <p className="body-sm text-[#7c839b]">{t("graphDesc")}</p>
            </div>
            <KnowledgeGraph
              kus={kus}
              dependencies={dependencies}
              domains={domains}
            />
          </section>

          {organizationId && (
            <section className="panel p-6 space-y-3">
              <div>
                <h2 className="section-heading">{t("semanticTitle")}</h2>
                <p className="body-sm text-[#7c839b]">{t("semanticDesc")}</p>
              </div>
              <SemanticSearch organizationId={organizationId} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
