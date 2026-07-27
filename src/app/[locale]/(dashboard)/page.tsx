import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { GettingStarted } from "@/components/shared/getting-started";
import { AppSidebar } from "@/components/shared/app-sidebar";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="headline-xl text-black font-bold">
                {t("welcome")}, {user.user_metadata?.full_name || user.email}
              </h1>
              <p className="body-md text-[#45464d] mt-1">
                {t("subtitle")}
              </p>
            </div>

            <GettingStarted />

            <div className="grid gap-6 md:grid-cols-3">
              <div className="panel p-6 space-y-2">
                <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                  Knowledge Units
                </p>
                <p className="headline-lg text-black font-bold">0</p>
                <p className="body-sm text-[#45464d]">
                  {t("kuCount")}
                </p>
              </div>

              <div className="panel p-6 space-y-2">
                <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                  Pending Review
                </p>
                <p className="headline-lg text-black font-bold">0</p>
                <p className="body-sm text-[#45464d]">
                  {t("reviewCount")}
                </p>
              </div>

              <div className="panel p-6 space-y-2">
                <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                  Agents
                </p>
                <p className="headline-lg text-black font-bold">0</p>
                <p className="body-sm text-[#45464d]">
                  {t("agentCount")}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
