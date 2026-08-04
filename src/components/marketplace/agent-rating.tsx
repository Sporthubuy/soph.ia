"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { rateAgent } from "@/lib/agents/actions";

export function AgentRating({
  agentId,
  initialRating,
  initialReview,
}: {
  agentId: string;
  initialRating: number | null;
  initialReview: string | null;
}) {
  const t = useTranslations("marketplace");
  const [selected, setSelected] = useState<number>(initialRating ?? 0);
  const [hovered, setHovered] = useState<number>(0);
  const [review, setReview] = useState(initialReview ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = hovered || selected;

  const handleSave = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await rateAgent(agentId, selected, review || undefined);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="space-y-3">
      <p className="label-sm text-[var(--star-3)] uppercase tracking-wider">
        {initialRating ? t("yourRating") : t("rateThis")}
      </p>

      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => setSelected(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
            aria-label={`${star} stars`}
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-6 w-6 transition-colors ${
                star <= active
                  ? "fill-[var(--pending)] text-[var(--pending)]"
                  : "fill-[var(--sky-3)] text-[var(--star-4)]"
              }`}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {selected > 0 && (
          <span className="ml-1 label-sm text-[var(--star-3)]">
            {selected}/5
          </span>
        )}
      </div>

      {selected > 0 && (
        <div className="space-y-2">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={t("ratingReviewPlaceholder")}
            rows={2}
            className="w-full rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 py-2 text-sm text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none resize-none"
          />
          {error && (
            <p className="text-xs text-[var(--danger)]">{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="label-sm px-3 py-1.5 rounded-[8px] bg-[var(--azure)] text-white hover:bg-[var(--azure-bright)] disabled:opacity-50 transition-colors"
          >
            {saved ? "✓ " + t("submitted") : isPending ? "…" : t("saveRating")}
          </button>
        </div>
      )}
    </div>
  );
}
