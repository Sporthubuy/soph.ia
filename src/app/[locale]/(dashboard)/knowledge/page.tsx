import { setRequestLocale } from "next-intl/server";
import { KnowledgeOverview } from "@/components/shared/knowledge-overview";
import { getKnowledgeUnits } from "@/lib/knowledge/actions";

export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const knowledgeUnits = await getKnowledgeUnits(locale);

  return <KnowledgeOverview knowledgeUnits={knowledgeUnits} />;
}
