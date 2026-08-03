"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  approveKnowledgeUnit,
  rejectKnowledgeUnit,
} from "@/lib/knowledge/actions";
import { toast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/shared/status-badge";
import { KUDiffView } from "@/components/review/ku-diff-view";
import { ContradictionChecker } from "@/components/review/contradiction-checker";
import { CommentsThread } from "@/components/shared/comments-thread";
import { ShareDialog } from "@/components/shared/share-dialog";
import type { KuComment } from "@/lib/comments/actions";

type DiffData = {
  current: {
    title: string;
    content: string;
    change_message: string | null;
    created_at: string;
  };
  previous: { title: string; content: string } | null;
};

interface ProposedKU {
  id: string;
  title: string;
  status: string;
  trust_score: number;
  version: number;
  updated_at: string;
  domain_id: string;
  // Relaciones to-one: PostgREST las devuelve como objeto, no como array.
  domains: { name: string } | null;
  profiles: { full_name: string | null; email: string } | null;
}

export const ReviewList = ({
  proposals,
  userRole,
  diffs,
  commentsByKu,
  currentUserId,
}: {
  proposals: ProposedKU[];
  userRole: string;
  diffs: Record<string, DiffData | null>;
  commentsByKu: Record<string, KuComment[]>;
  currentUserId: string;
}) => {
  const t = useTranslations("review");
  const canReview = ["owner", "admin"].includes(userRole);

  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <CheckCircleIcon />
        <p className="mt-3 font-medium">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("emptyDesc")}
        </p>
        <Separator className="my-6 w-48" />
        <p className="text-sm text-muted-foreground">{t("nextStep")}</p>
        <Button
          render={<Link href="/agents/new" />}
          variant="outline"
          size="sm"
          className="mt-2 rounded-xl"
        >
          {t("compileAgent")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t("pendingCount", { count: proposals.length })}
      </p>
      {proposals.map((ku) => (
        <ReviewCard
          key={ku.id}
          ku={ku}
          canReview={canReview}
          diff={diffs[ku.id] ?? null}
          comments={commentsByKu[ku.id] ?? []}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({
  ku,
  canReview,
  diff,
  comments,
  currentUserId,
}: {
  ku: ProposedKU;
  canReview: boolean;
  diff: DiffData | null;
  comments: KuComment[];
  currentUserId: string;
}) => {
  const t = useTranslations("review");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveKnowledgeUnit(ku.id);
      if (res?.error) {
        setResult({ type: "error", message: res.error });
        toast.add({ type: "error", title: t("approveError"), description: res.error });
      } else {
        setResult({ type: "success", message: t("approved") });
        toast.add({ type: "success", title: t("approvedToast", { title: ku.title }), description: t("approvedDesc") });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectKnowledgeUnit(ku.id);
      if (res?.error) {
        setResult({ type: "error", message: res.error });
        toast.add({ type: "error", title: t("rejectError"), description: res.error });
      } else {
        setResult({ type: "success", message: t("rejected") });
        toast.add({ type: "info", title: t("rejectedToast", { title: ku.title }), description: t("rejectedDesc") });
      }
    });
  };

  if (result?.type === "success") {
    return null;
  }

  const ownerName = ku.profiles?.full_name ?? ku.profiles?.email ?? "—";
  const domainName = ku.domains?.name ?? "—";
  const oldText = diff?.previous?.content ?? "";
  const newText = diff?.current.content ?? "";

  return (
    <div className="panel p-6 space-y-4 border border-[#1e293b]">
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1e293b]">
        <div className="min-w-0">
          <h3 className="section-heading">
            <Link href={`/knowledge/${ku.id}`} className="hover:text-[var(--azure)] transition-colors">
              {ku.title}
            </Link>
          </h3>
          <p className="body-sm text-[#64748b] mt-1">
            {ownerName} · {domainName} · v{ku.version} ·{" "}
            {new Date(ku.updated_at).toLocaleDateString(locale)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ShareDialog
            path={`/knowledge/${ku.id}`}
            title={ku.title}
            triggerClassName="label-sm px-2 py-1 rounded border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] inline-flex items-center gap-1"
          />
          <StatusBadge status={ku.status} size="sm" />
        </div>
      </div>
      <div className="space-y-4">
        <ContradictionChecker proposedKuId={ku.id} />

        {diff?.current.change_message && (
          <p className="text-sm italic text-muted-foreground">
            &ldquo;{diff.current.change_message}&rdquo;
          </p>
        )}

        {diff && (
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setDiffOpen((v) => !v)}
          >
            {diffOpen ? t("hideDiff") : t("showDiff")}
          </button>
        )}

        {diffOpen && diff ? (
          <>
            {diff.previous &&
              diff.previous.title !== diff.current.title && (
                <div className="mb-3 text-sm">
                  <span className="text-muted-foreground">{t("titleLabel")}</span>
                  <span className="text-[var(--danger)] line-through">
                    {diff.previous.title}
                  </span>{" "}
                  <span className="text-[var(--verified)]">
                    {diff.current.title}
                  </span>
                </div>
              )}
            <KUDiffView oldText={oldText} newText={newText} />
          </>
        ) : diffOpen ? (
          <p className="text-sm text-muted-foreground">
            {t("noDiffHistory")}
          </p>
        ) : null}

        <div className="rounded-lg border border-[#1e293b] bg-[#07090e] p-4">
          <CommentsThread
            kuId={ku.id}
            comments={comments}
            currentUserId={currentUserId}
            context="review"
            title="Review feedback"
            compact
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1e293b] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="body-sm text-[#64748b]">
              {t("trustLabel")}
            </span>
            <span className="label-sm font-medium text-[#94a3b8]">
              {ku.trust_score}%
            </span>
          </div>
          {canReview ? (
            <div className="flex items-center gap-2">
              {result?.type === "error" && (
                <p className="body-sm text-[var(--danger)]">{result.message}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isPending}
                className="border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e]"
              >
                {t("reject")}
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              >
                {isPending ? tc("processing") : t("approve")}
              </Button>
            </div>
          ) : (
            <p className="body-sm text-[#64748b]">{t("ownersOnly")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg
    className="h-10 w-10 text-muted-foreground/50"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);
