"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";

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
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
          <Icon name="search" size={18} />
        </span>
        <Input
          placeholder={t("semanticSearchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") run();
          }}
          className="pl-10 border-[#1e293b] bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:ring-[#3b82f6]"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 p-3">
          <p className="body-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => {
            const similarity = Math.round(r.similarity * 100);
            return (
              <Link
                key={r.id}
                href={`/knowledge/${r.id}`}
                className="panel block p-3 border border-[#1e293b] hover:bg-[#07090e] hover:border-[#3b82f6] transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="body-sm font-medium text-[var(--star-1)] group-hover:text-[#3b82f6] transition-colors flex-1 line-clamp-1">
                    {r.title}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#3b82f6]">
                        {similarity}%
                      </span>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                </div>

                <p className="body-xs text-[#64748b] line-clamp-2 mb-2">
                  {r.content.slice(0, 160) || t("noContent")}
                </p>

                {/* Similarity bar */}
                <div className="w-full h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
                    style={{ width: `${similarity}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* No Results State */}
      {!pending && results.length === 0 && query.trim() && !error && (
        <div className="rounded-lg border border-[#1e293b] bg-[#07090e] p-6 text-center">
          <Icon name="search" size={24} className="mx-auto text-[#64748b] mb-2" />
          <p className="body-sm text-[#64748b]">
            {t("semanticNoResults")}
          </p>
        </div>
      )}

      {/* Loading State */}
      {pending && (
        <div className="rounded-lg border border-[#1e293b] bg-[#07090e] p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
            <p className="body-sm text-[#64748b]">{t("searching")}</p>
          </div>
        </div>
      )}
    </div>
  );
};
