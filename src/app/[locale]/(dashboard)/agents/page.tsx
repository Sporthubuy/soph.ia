import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AgentsOverview } from "@/components/shared/agents-overview";
import { getAgents } from "@/lib/agents/actions";

export default async function AgentsPage({
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

  const agents = await getAgents(locale);

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <AgentsOverview agents={agents} locale={locale} />
        </main>
      </div>
    </div>
  );
}
