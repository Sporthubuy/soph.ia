import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

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
    <div className="min-h-screen bg-[#f7f9fb] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="headline-xl text-black font-bold mb-2">
          Welcome, {user.user_metadata?.full_name || user.email}
        </h1>
        <p className="body-md text-[#45464d] mb-8">
          Dashboard - Knowledge Operating System
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="panel p-6 space-y-2">
            <p className="label-sm text-[#7c839b] uppercase tracking-wide">
              Knowledge Units
            </p>
            <p className="headline-lg text-black font-bold">0</p>
          </div>

          <div className="panel p-6 space-y-2">
            <p className="label-sm text-[#7c839b] uppercase tracking-wide">
              Pending Review
            </p>
            <p className="headline-lg text-black font-bold">0</p>
          </div>

          <div className="panel p-6 space-y-2">
            <p className="label-sm text-[#7c839b] uppercase tracking-wide">
              Agents
            </p>
            <p className="headline-lg text-black font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
