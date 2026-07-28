import { setRequestLocale } from "next-intl/server";
import { ProjectCreateForm } from "@/components/projects/project-create-form";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProjectCreateForm locale={locale} />;
}
