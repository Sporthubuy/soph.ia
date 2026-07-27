import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";

export default async function DashboardPage({
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

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="headline-xl text-black font-bold mb-2">
                Overview
              </h1>
              <p className="body-md text-[#45464d]">
                Welcome back, {user.user_metadata?.full_name || user.email}
              </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <div className="panel p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                    Knowledge Units
                  </p>
                  <div className="icon-tile-ku w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">menu_book</span>
                  </div>
                </div>
                <div>
                  <p className="headline-lg text-black font-bold">0</p>
                  <p className="body-sm text-[#7c839b] mt-1">+0 this week</p>
                </div>
              </div>

              <div className="panel p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                    Pending Review
                  </p>
                  <div className="icon-tile-review w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">fact_check</span>
                  </div>
                </div>
                <div>
                  <p className="headline-lg text-black font-bold">0</p>
                  <p className="body-sm text-[#7c839b] mt-1">Awaiting approval</p>
                </div>
              </div>

              <div className="panel p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                    Active Agents
                  </p>
                  <div className="icon-tile-agent w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                  </div>
                </div>
                <div>
                  <p className="headline-lg text-black font-bold">0</p>
                  <p className="body-sm text-[#7c839b] mt-1">Deployed</p>
                </div>
              </div>

              <div className="panel p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="label-sm text-[#7c839b] uppercase tracking-wide">
                    Team Members
                  </p>
                  <div className="icon-tile-domain w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">people</span>
                  </div>
                </div>
                <div>
                  <p className="headline-lg text-black font-bold">1</p>
                  <p className="body-sm text-[#7c839b] mt-1">You</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Recent Knowledge Units */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="headline-md text-black font-bold">Recent Knowledge Units</h2>
                  <a href="/knowledge" className="body-sm text-[#4648d4] hover:underline">
                    View all
                  </a>
                </div>
                <div className="panel overflow-hidden">
                  <div className="divide-y divide-[#e2e8f0]">
                    <div className="p-6 hover:bg-[#f7f9fb] transition-colors">
                      <p className="body-md text-[#45464d]">No knowledge units yet</p>
                      <p className="label-sm text-[#7c839b] mt-2">Start by creating your first knowledge unit</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h2 className="headline-md text-black font-bold">Quick Actions</h2>
                <div className="panel overflow-hidden">
                  <div className="divide-y divide-[#e2e8f0]">
                    <a href="/knowledge?new=true" className="block p-4 hover:bg-[#f7f9fb] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="icon-tile-ku w-8 h-8 rounded flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                        <span className="body-md text-black font-medium">New Knowledge</span>
                      </div>
                    </a>
                    <a href="/projects?new=true" className="block p-4 hover:bg-[#f7f9fb] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="icon-tile-domain w-8 h-8 rounded flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                        <span className="body-md text-black font-medium">New Project</span>
                      </div>
                    </a>
                    <a href="/agents?new=true" className="block p-4 hover:bg-[#f7f9fb] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="icon-tile-agent w-8 h-8 rounded flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                        <span className="body-md text-black font-medium">New Agent</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State Help */}
            <div className="panel p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#e1e0ff] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#4648d4] text-xl">help</span>
                </div>
                <div className="flex-1">
                  <h3 className="headline-md text-black font-bold mb-2">Getting Started</h3>
                  <p className="body-md text-[#45464d] mb-4">
                    SOPH.IA is your knowledge operating system. Create knowledge units, organize them into projects,
                    and compile them into AI agents.
                  </p>
                  <a href="/docs" className="inline-flex items-center gap-2 text-[#4648d4] hover:underline body-md font-medium">
                    Learn more <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
