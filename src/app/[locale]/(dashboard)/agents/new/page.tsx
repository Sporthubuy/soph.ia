import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AgentWizard } from "@/components/agents/agent-wizard";
import { getDomains, getApprovedKnowledgeUnits } from "@/lib/knowledge/actions";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";
import { Icon } from "@/components/shared/icon";

export default async function NewAgentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("agents");
  const [organizationId, units, domains] = await Promise.all([
    getCurrentOrganizationId(),
    getApprovedKnowledgeUnits(),
    getDomains(),
  ]);

  if (!organizationId) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto">
        <div className="panel p-8 text-center space-y-3">
          <p className="body-md text-[var(--star-1)] font-medium">
            No organization found for this account.
          </p>
          <Link href="/dashboard" className="text-[#5b9bff] hover:underline body-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <nav aria-label="Breadcrumb" className="body-sm text-[#8b95ab]">
        <Link href="/agents" className="hover:text-[var(--star-1)] transition-colors">
          {t("pageTitle")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#b8c1d4]">{t("createNew")}</span>
      </nav>

      <header className="space-y-1">
        <h1 className="headline-xl text-[var(--star-1)] font-bold">{t("createNew")}</h1>
        <p className="body-md text-[#b8c1d4]">{t("pageDesc")}</p>
      </header>

      {units.length === 0 ? (
        <div className="panel p-10 text-center space-y-4">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(91_155_255_/_0.12)] text-[var(--azure)]" aria-hidden>
            <Icon name="knowledge" size={26} />
          </span>
          <p className="body-md text-[var(--star-1)] font-medium">
            Need approved Knowledge Units first
          </p>
          <p className="body-sm text-[#8b95ab] max-w-md mx-auto">
            Agents compile approved knowledge into context. Create a KU, propose it,
            and approve it in Review before building an agent.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/knowledge/new"
              className="inline-flex items-center gap-1 rounded bg-[#5b9bff] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] hover:bg-[#3f7fe0]"
            >
              New knowledge unit
            </Link>
            <Link
              href="/review"
              className="inline-flex items-center gap-1 rounded border border-[#212a3e] bg-[var(--sky-2)] px-4 py-2.5 text-sm font-medium text-[#b8c1d4] hover:bg-[#0a0e17]"
            >
              Go to Review
            </Link>
          </div>
        </div>
      ) : (
        <AgentWizard
          organizationId={organizationId}
          units={units}
          domains={domains}
        />
      )}
    </div>
  );
}
