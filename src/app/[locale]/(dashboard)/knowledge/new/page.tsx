import { setRequestLocale } from "next-intl/server";
import { KUCreateForm } from "@/components/knowledge/ku-create-form";
import { getDomains } from "@/lib/knowledge/actions";

export default async function NewKnowledgeUnitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const domains = await getDomains();

  return <KUCreateForm locale={locale} domains={domains} />;
}
