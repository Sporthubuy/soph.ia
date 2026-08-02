import { setRequestLocale } from "next-intl/server";
import {
  getOrganizationPeople,
  getPendingInvitations,
} from "@/lib/organization/actions";
import { PeopleDirectory } from "@/components/people/people-directory";
import { InvitePeople } from "@/components/people/invite-people";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { people, currentUserId, userRole } = await getOrganizationPeople();
  const canManage = ["owner", "admin"].includes(userRole);
  const invitations = canManage ? await getPendingInvitations() : [];

  const admins = people.filter((p) =>
    ["owner", "admin"].includes(p.role)
  ).length;
  const kusGoverned = people.reduce((sum, p) => sum + p.stats.kusOwned, 0);
  const verified = people.reduce((sum, p) => sum + p.stats.kusApproved, 0);

  const stats = [
    { label: "People", value: people.length, tone: "text-[var(--star-1)]" },
    { label: "Owners & admins", value: admins, tone: "text-[var(--azure)]" },
    { label: "KUs governed", value: kusGoverned, tone: "text-[var(--star-1)]" },
    { label: "Verified", value: verified, tone: "text-[var(--verified)]" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-8">
      <header className="space-y-1">
        <h1 className="headline-xl font-bold text-[var(--star-1)]">People</h1>
        <p className="body-md text-[var(--star-3)]">
          Tu equipo y su huella de conocimiento. Todo conocimiento tiene un
          responsable.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-4">
            <p className="label-sm text-[var(--star-3)]">{s.label}</p>
            <p className={`headline-md font-bold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {canManage && <InvitePeople invitations={invitations} />}

      <PeopleDirectory
        people={people}
        currentUserId={currentUserId}
        userRole={userRole}
      />
    </div>
  );
}
