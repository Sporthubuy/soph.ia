"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  approveKnowledgeUnit,
  rejectKnowledgeUnit,
} from "@/lib/knowledge/actions";
import { toast } from "@/components/ui/toast";
import { KUStatusBadge } from "@/components/shared/ku-status-badge";
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base">
              <Link href={`/knowledge/${ku.id}`} className="hover:underline">
                {ku.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">
              {ownerName} · {domainName} · v{ku.version} ·{" "}
              {new Date(ku.updated_at).toLocaleDateString(locale)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ShareDialog
              path={`/knowledge/${ku.id}`}
              title={ku.title}
              triggerClassName="label-sm px-2 py-1 rounded border border-[#e2e8f0] text-[#45464d] hover:bg-[#f7f9fb] inline-flex items-center gap-1"
            />
            <KUStatusBadge status={ku.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  <span className="text-red-600 line-through">
                    {diff.previous.title}
                  </span>{" "}
                  <span className="text-emerald-600">
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

        <div className="rounded-lg border border-[#e2e8f0] bg-[#f7f9fb] p-4">
          <CommentsThread
            kuId={ku.id}
            comments={comments}
            currentUserId={currentUserId}
            context="review"
            title="Review feedback"
            compact
          />
        </div>

        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {t("trustLabel")}
              {ku.trust_score}
            </span>
          </div>
          {canReview ? (
            <div className="flex items-center gap-2">
              {result?.type === "error" && (
                <p className="text-sm text-destructive">{result.message}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isPending}
              >
                {t("reject")}
              </Button>
              <Button size="sm" onClick={handleApprove} disabled={isPending}>
                {isPending ? tc("processing") : t("approve")}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("ownersOnly")}</p>
          )}
        </div>
      </CardContent>
    </Card>
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
