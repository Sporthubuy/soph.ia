"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Contradiction = {
  candidateId: string;
  candidateTitle: string;
  similarity: number;
  reason: string;
};

export const ContradictionChecker = ({ proposedKuId }: { proposedKuId: string }) => {
  const t = useTranslations("review");
  const tc = useTranslations("common");
  const [results, setResults] = useState<Contradiction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = () => {
    setError(null);
    setResults(null);
    startTransition(async () => {
      const res = await fetch("/api/review/contradictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedKuId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? tc("errorUnknown"));
        return;
      }
      setResults(json.contradictions ?? []);
    });
  };

  return (
    <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertIcon />
          <span className="text-sm font-medium">
            {t("contradictionCheck")}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={run}
          disabled={pending}
        >
          {pending ? t("analyzing") : t("verify")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results && results.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t("contradictionsFound", { count: results.length })}
          </p>
          {results.map((c, i) => (
            <div
              key={i}
              className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/10 p-2"
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/editor/${c.candidateId}`}
                  className="text-sm font-medium hover:underline"
                >
                  {c.candidateTitle}
                </Link>
                <Badge variant="outline" className="text-[10px]">
                  {t("similarPercent", { percent: Math.round(c.similarity * 100) })}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{c.reason}</p>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && !error && !pending && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          {t("noContradictions")}
        </p>
      )}
    </div>
  );
};

const AlertIcon = () => (
  <svg
    className="h-4 w-4 text-amber-600"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);
