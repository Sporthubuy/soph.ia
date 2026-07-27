"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cloneAgent } from "@/lib/knowledge/actions";

type PublicAgent = {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model: string;
  rating: number;
  ratings_count: number;
  invocations: number;
  tags: string[];
  organization_id: string;
  created_at: string;
  organizations: { name: string } | null;
};

export const MarketplaceGrid = ({
  agents,
  tags,
  organizationId,
}: {
  agents: PublicAgent[];
  tags: string[];
  organizationId: string;
}) => {
  const router = useRouter();
  const t = useTranslations("marketplace");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [cloning, setCloning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = agents.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !(a.description ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (tagFilter !== "all" && !a.tags?.includes(tagFilter)) return false;
    return true;
  });

  const handleClone = (id: string) => {
    setCloning(id);
    setError(null);
    cloneAgent(id, organizationId).then((r) => {
      if (r?.error) setError(r.error);
      setCloning(null);
    }).catch(() => setCloning(null));
  };

  const reload = (s: string, t: string = tagFilter, sortVal: string = sort) => {
    router.push(`/marketplace?search=${encodeURIComponent(s)}&tag=${encodeURIComponent(t)}&sort=${encodeURIComponent(sortVal)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder={t("searchPlaceholder")} value={search} onChange={(e) => { setSearch(e.target.value); reload(e.target.value); }} className="max-w-sm input-figma" />
        <select value={tagFilter} onChange={(e) => { setTagFilter(e.target.value); reload(search, e.target.value); }} className="h-9 rounded-lg border bg-white px-3 text-sm">
          <option value="all">{t("allTags")}</option>
          {tags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); reload(search, tagFilter, e.target.value); }} className="h-9 rounded-lg border bg-white px-3 text-sm">
          <option value="newest">{t("sortNewest")}</option>
          <option value="rating">{t("sortBestRated")}</option>
          <option value="popular">{t("sortMostUsed")}</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="mt-3 text-sm text-muted-foreground">{t("noAgents")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div key={a.id} className="card-figma card-figma-hover flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/agents/${a.id}`} className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1">{a.name}</Link>
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="text-xs text-amber-500">★</span>
                  <span className="text-xs font-medium">{a.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({a.ratings_count})</span>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 flex-1">{a.description || t("noDesc")}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">{a.provider}</Badge>
                {a.tags?.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {a.organizations?.name && <span>{a.organizations.name}</span>}
                  <span>·</span>
                  <span>{a.invocations} {t("uses")}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs"
                  disabled={cloning === a.id}
                  onClick={() => handleClone(a.id)}
                >
                  {cloning === a.id ? t("cloning") : t("clone")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};