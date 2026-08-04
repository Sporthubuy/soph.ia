"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  addKuComment,
  deleteKuComment,
  type KuComment,
} from "@/lib/comments/actions";
import { toast } from "@/components/ui/toast";

const initials = (name: string | null | undefined, email: string | null | undefined) => {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
};

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

export const CommentsThread = ({
  kuId,
  comments: initialComments,
  currentUserId,
  context = "general",
  title = "Comments",
  compact = false,
}: {
  kuId: string;
  comments: KuComment[];
  currentUserId: string;
  context?: "general" | "review";
  title?: string;
  compact?: boolean;
}) => {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const comments = initialComments;

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const result = await addKuComment({ kuId, body: text, context });
      if (result?.error) {
        setError(result.error);
        toast.add({ type: "error", title: "Error", description: result.error });
        return;
      }
      setBody("");
      toast.add({ type: "success", title: "Comment added" });
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteKuComment(id);
      if (result?.error) {
        toast.add({ type: "error", title: "Error", description: result.error });
        return;
      }
      toast.add({ type: "success", title: "Comment removed" });
      router.refresh();
    });
  };

  return (
    <section className={compact ? "space-y-3" : "panel p-6 space-y-4"}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={compact ? "text-sm font-semibold text-[var(--star-1)]" : "section-heading"}>
          {title}
          <span className="ml-2 font-normal text-[var(--star-4)]">{comments.length}</span>
        </h2>
      </div>

      <div className={`space-y-3 ${compact ? "max-h-56 overflow-y-auto" : ""}`}>
        {comments.length === 0 ? (
          <p className="body-sm text-[var(--star-4)]">
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((c) => {
            const name = c.profiles?.full_name || c.profiles?.email || "Someone";
            const canDelete = c.author_id === currentUserId;
            return (
              <div key={c.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full bg-[var(--azure-deep)] text-[#3b82f6] flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  aria-hidden
                >
                  {initials(c.profiles?.full_name, c.profiles?.email)}
                </div>
                <div className="flex-1 min-w-0 rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--star-1)]">{name}</span>
                    <span className="text-xs text-[var(--star-4)]">{timeAgo(c.created_at)}</span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        disabled={isPending}
                        className="ml-auto text-xs text-[var(--star-4)] hover:text-[var(--danger)]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--star-3)] whitespace-pre-wrap break-words">
                    {c.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            context === "review"
              ? "Leave review feedback…"
              : "Write a comment…"
          }
          rows={compact ? 2 : 3}
          className="input-workspace resize-none"
          maxLength={4000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
        {error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="label-sm text-[var(--star-4)]">⌘/Ctrl + Enter to send</p>
          <Button
            type="button"
            size="sm"
            onClick={submit}
            disabled={isPending || !body.trim()}
            className="rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] hover:bg-[#2563eb]"
          >
            {isPending ? "Sending…" : "Comment"}
          </Button>
        </div>
      </div>
    </section>
  );
};
