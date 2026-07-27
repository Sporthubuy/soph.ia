import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getOrganization,
  getDomains,
  getMembers,
} from "@/lib/knowledge/actions";
import { OrgSettings } from "@/components/settings/org-settings";
import { DomainSettings } from "@/components/settings/domain-settings";
import { MemberSettings } from "@/components/settings/member-settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return null;

  const [organization, domains, members] = await Promise.all([
    getOrganization(membership.organization_id),
    getDomains(membership.organization_id),
    getMembers(membership.organization_id),
  ]);

  if (!organization) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configura tu organizacion, dominios y equipo.
        </p>
      </div>
      <div className="grid max-w-2xl gap-6">
        <OrgSettings organization={organization} userRole={membership.role} />
        <DomainSettings
          domains={domains}
          organizationId={membership.organization_id}
          userRole={membership.role}
        />
        <MemberSettings
          members={members}
          currentUserId={user.id}
          userRole={membership.role}
        />
      </div>
    </div>
  );
}
