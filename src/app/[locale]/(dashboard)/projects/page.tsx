import { setRequestLocale } from "next-intl/server";
import { ProjectsList } from "@/components/projects/projects-list";
import { getProjects } from "@/lib/projects/actions";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const projects = await getProjects(locale);

  return <ProjectsList projects={projects} />;
}
