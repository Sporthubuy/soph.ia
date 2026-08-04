"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { type PublicAgent, cloneAgent } from "@/lib/agents/actions";

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  const t = useTranslations("marketplace");
  return (
    <div className="flex items-center gap-1">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[var(--pending)]">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-semibold text-[var(--pending)]">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
      {count > 0 && (
        <span className="text-xs text-[var(--star-4)]">
          ({t("ratingCount", { count })})
        </span>
      )}
    </div>
  );
}

export function AgentCard({
  agent,
  isOwn,
}: {
  agent: PublicAgent;
  isOwn: boolean;
}) {
  const t = useTranslations("marketplace");
  const router = useRouter();
  const [cloning, setCloning] = useState(false);
  const [cloned, setCloned] = useState(false);
  const [cloneErr, setCloneErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCloning(true);
    setCloneErr(null);
    startTransition(async () => {
      const res = await cloneAgent(agent.id);
      setCloning(false);
      if (res?.error) {
        setCloneErr(res.error);
      } else {
        setCloned(true);
        setTimeout(() => {
          router.push("/agents");
        }, 800);
      }
    });
  };

  return (
    <article
      onClick={() => router.push(`/agents/${agent.id}`)}
      className="group relative flex flex-col rounded-2xl border border-[var(--edge)] bg-[var(--sky-2)] p-5 cursor-pointer transition-all duration-200 hover:border-[var(--azure)]/40 hover:bg-[var(--sky-3)] hover:shadow-[0_0_24px_rgb(91_155_255_/_0.07)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="label-md text-[var(--star-1)] truncate group-hover:text-[var(--azure)] transition-colors">
            {agent.name}
          </h3>
          {agent.organizations?.name && (
            <p className="text-xs text-[var(--star-4)] mt-0.5">
              {t("from")} {agent.organizations.name}
            </p>
          )}
        </div>
        <StarDisplay rating={agent.rating} count={agent.ratings_count} />
      </div>

      {/* Description */}
      <p className="body-sm text-[var(--star-3)] line-clamp-2 flex-1 mb-3">
        {agent.description || t("noDesc")}
      </p>

      {/* Tags */}
      {agent.tags && agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--edge)] text-[var(--star-3)] bg-[var(--sky-3)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[var(--edge)]">
        <div className="flex items-center gap-3 text-xs text-[var(--star-4)]">
          <span className="capitalize">{agent.provider ?? "—"}</span>
          {agent.invocations > 0 && (
            <>
              <span>·</span>
              <span>{agent.invocations.toLocaleString()} {t("uses")}</span>
            </>
          )}
        </div>

        {isOwn ? (
          <span className="px-2.5 py-1 rounded-[8px] text-xs border border-[var(--azure)]/30 text-[var(--azure)] bg-[var(--azure)]/8">
            {t("ownAgent")}
          </span>
        ) : (
          <button
            onClick={handleClone}
            disabled={cloning || cloned}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
              cloned
                ? "bg-[var(--verified)]/15 text-[var(--verified)] border border-[var(--verified)]/30"
                : "bg-[var(--azure)]/12 text-[var(--azure)] border border-[var(--azure)]/30 hover:bg-[var(--azure)]/20"
            } disabled:opacity-60`}
          >
            {cloned ? "✓ " + t("cloned") : cloning ? "…" : t("clone")}
          </button>
        )}
      </div>

      {cloneErr && (
        <p className="mt-2 text-xs text-[var(--danger)]">{t("cloneError")}</p>
      )}
    </article>
  );
}
