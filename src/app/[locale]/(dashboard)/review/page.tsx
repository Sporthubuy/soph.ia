import { setRequestLocale, getTranslations } from "next-intl/server";
import { ReviewList } from "@/components/review/review-list";
import {
  getPendingProposals,
  getCurrentUserRole,
  getProposalDiffs,
} from "@/lib/knowledge/actions";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("review");

  const [proposals, userRole] = await Promise.all([
    getPendingProposals(),
    getCurrentUserRole(),
  ]);

  const diffs = await getProposalDiffs(proposals.map((p) => p.id));

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="headline-xl text-black font-bold">{t("pageTitle")}</h1>
        <p className="body-md text-[#45464d]">{t("pageDesc")}</p>
      </header>

      <ReviewList proposals={proposals} userRole={userRole} diffs={diffs} />
    </div>
  );
}
