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
          className="text-4xl text-red-500"
          aria-hidden
        >
          error
        </span>
        <h1 className="headline-md font-bold text-black">Something went wrong</h1>
        <p className="body-sm text-[#7c839b]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-[#4648d4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3b3db8]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-medium text-[#45464d] hover:bg-[#f7f9fb]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
