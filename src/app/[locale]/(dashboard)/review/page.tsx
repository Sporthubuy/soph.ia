import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ReviewList } from "@/components/review/review-list";
import {
  getPendingProposals,
  getCurrentUserRole,
  getProposalDiffs,
} from "@/lib/knowledge/actions";
import { getKuCommentsBatch } from "@/lib/comments/actions";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("review");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [proposals, userRole] = await Promise.all([
    getPendingProposals(),
    getCurrentUserRole(),
  ]);

  const [diffs, commentsByKu] = await Promise.all([
    getProposalDiffs(proposals.map((p) => p.id)),
    getKuCommentsBatch(
      proposals.map((p) => p.id),
      "review"
    ),
  ]);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="headline-xl text-[var(--star-1)] font-bold">{t("pageTitle")}</h1>
        <p className="body-md text-[var(--star-3)]">{t("pageDesc")}</p>
      </header>

      <ReviewList
        proposals={proposals}
        userRole={userRole}
        diffs={diffs}
        commentsByKu={commentsByKu}
        currentUserId={user?.id ?? ""}
      />
    </div>
  );
}
