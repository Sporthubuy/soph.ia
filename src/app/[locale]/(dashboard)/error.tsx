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
        <p className="body-sm text-[#8b95ab]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[#5b9bff] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] hover:bg-[#3f7fe0]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-[#212a3e] bg-[var(--sky-2)] px-4 py-2.5 text-sm font-medium text-[#b8c1d4] hover:bg-[#0a0e17]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
