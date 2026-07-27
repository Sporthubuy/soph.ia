import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { OrgProvider } from "@/lib/knowledge/org-context";
import { OnboardingForm } from "@/components/shared/onboarding-form";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role, organizations(id, name, slug)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return (
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <OnboardingForm />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const orgs = membership.organizations as unknown as {
    id: string;
    name: string;
    slug: string;
  }[];
  const org = orgs[0];

  return (
    <OrgProvider
      value={{
        organizationId: org.id,
        organizationName: org.name,
        role: membership.role,
      }}
    >
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </OrgProvider>
  );
}
