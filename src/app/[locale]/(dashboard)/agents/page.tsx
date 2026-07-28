import { setRequestLocale } from "next-intl/server";
import { AgentsOverview } from "@/components/shared/agents-overview";
import { getAgents } from "@/lib/agents/actions";

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const agents = await getAgents(locale);

  return <AgentsOverview agents={agents} locale={locale} />;
}
