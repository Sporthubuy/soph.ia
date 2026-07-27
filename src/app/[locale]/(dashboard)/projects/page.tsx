import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { ProjectsOverview } from "@/components/shared/projects-overview";
import { getProjects } from "@/lib/projects/actions";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const projects = await getProjects(locale);

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <ProjectsOverview projects={projects} locale={locale} />
        </main>
      </div>
    </div>
  );
}
