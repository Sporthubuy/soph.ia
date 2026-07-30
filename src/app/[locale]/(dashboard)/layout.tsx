import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardChrome } from "@/components/shared/dashboard-chrome";

/**
 * Shell compartido de las rutas autenticadas.
 *
 * El sidebar vive aca y no en cada page: asi no se re-monta al navegar entre
 * secciones, y la comprobacion de sesion queda en un solo lugar.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
    <div className="flex h-screen flex-col bg-[var(--sky-1)] md:flex-row">
      <AppSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardChrome />
        <main className="flex-1 overflow-auto bg-[var(--sky-1)]">{children}</main>
      </div>
    </div>
  );
}
