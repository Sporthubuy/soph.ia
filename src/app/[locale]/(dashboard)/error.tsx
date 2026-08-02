"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 sm:p-8 max-w-lg mx-auto">
      <div className="panel p-8 text-center space-y-4">
        <span
          className="text-4xl text-[var(--danger)]"
          aria-hidden
        >
          error
        </span>
        <h1 className="headline-md font-bold text-[var(--star-1)]">Something went wrong</h1>
        <p className="body-sm text-[#64748b]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] hover:bg-[#2563eb]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-[#1e293b] bg-[var(--sky-2)] px-4 py-2.5 text-sm font-medium text-[#94a3b8] hover:bg-[#07090e]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
