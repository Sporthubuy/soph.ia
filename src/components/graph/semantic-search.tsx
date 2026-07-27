"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result = {
  id: string;
  title: string;
  content: string;
  status: string;
  domain_id: string;
  similarity: number;
};

export const SemanticSearch = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const t = useTranslations("graph");
  const tc = useTranslations("common");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, organizationId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? tc("errorUnknown"));
        setResults([]);
        return;
      }
      setResults(json.results ?? []);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder={t("semanticSearchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run();
          }}
        />
        <Button onClick={run} disabled={pending || !query.trim()}>
          {pending ? t("searching") : t("semanticSearchButton")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/editor/${r.id}`}
              className="block rounded-md border px-3 py-2 hover:bg-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{r.title}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {t("matchPercent", { percent: (r.similarity * 100).toFixed(0) })}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {r.content.slice(0, 160) || t("noContent")}
              </p>
              <Badge variant="outline" className="mt-1 text-[10px] font-normal">
                {r.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {!pending && results.length === 0 && query.trim() && !error && (
        <p className="text-sm text-muted-foreground">
          {t("semanticNoResults")}
        </p>
      )}
    </div>
  );
};
