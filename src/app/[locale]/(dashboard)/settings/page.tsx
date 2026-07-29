import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { OrgSettings } from "@/components/settings/org-settings";
import { MemberSettings } from "@/components/settings/member-settings";
import { DomainSettings } from "@/components/settings/domain-settings";
import { AIProviderSettings } from "@/components/settings/ai-provider-settings";
import { getOrganizationSettings } from "@/lib/organization/actions";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("settings");
  const { organization, members, domains, currentUserId, userRole } =
    await getOrganizationSettings();

  if (!organization) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto">
        <div className="panel p-8 text-center">
          <p className="body-md text-[#7c839b]">No organization found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="headline-xl text-black font-bold">{t("pageTitle")}</h1>
        <p className="body-md text-[#45464d]">{t("pageDesc")}</p>
      </header>

      <AIProviderSettings />
      <OrgSettings organization={organization} userRole={userRole} />
      <DomainSettings
        domains={domains}
        organizationId={organization.id}
        userRole={userRole}
      />
      <MemberSettings
        members={members}
        currentUserId={currentUserId}
        userRole={userRole}
      />
    </div>
  );
}
