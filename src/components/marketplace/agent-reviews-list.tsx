"use client";

import { AgentReview } from "@/lib/agents/actions";

export function AgentReviewsList({ reviews }: { reviews: AgentReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--star-4)]">
        <p>No reviews yet. Be the first to rate this agent.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4"
        >
          {/* Rating stars and user */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex text-[var(--pending)]">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                ))}
              </div>
              <span className="text-xs font-medium text-[var(--star-3)]">
                {review.rating}/5
              </span>
            </div>
            <span className="text-xs text-[var(--star-4)]">
              {new Date(review.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Review text */}
          {review.review && (
            <p className="body-sm text-[var(--star-2)] mb-2">{review.review}</p>
          )}

          {/* User info (anonymized) */}
          <p className="text-xs text-[var(--star-4)]">
            {review.user ? `by ${review.user.email.split("@")[0]}` : "Anonymous"}
          </p>
        </div>
      ))}
    </div>
  );
}
