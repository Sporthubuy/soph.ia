"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { type PublicAgent } from "@/lib/agents/actions";
import { AgentCard } from "./agent-card";
import { MobileMarketplaceDrawer } from "./mobile-marketplace-drawer";

export function MarketplaceGrid({
  agents,
  tags,
  organizationId,
  initialSearch = "",
  initialTag = "",
  initialSort = "newest",
}: {
  agents: PublicAgent[];
  tags: string[];
  organizationId: string;
  initialSearch?: string;
  initialTag?: string;
  initialSort?: string;
}) {
  const t = useTranslations("marketplace");
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [tagFilter, setTagFilter] = useState(initialTag || "all");
  const [sort, setSort] = useState(initialSort || "newest");
  const [, startTransition] = useTransition();

  const pushFilters = (s: string, tag: string, sv: string) => {
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (tag && tag !== "all") params.set("tag", tag);
    if (sv && sv !== "newest") params.set("sort", sv);
    startTransition(() => {
      router.push(`/marketplace${params.size ? "?" + params.toString() : ""}`);
    });
  };

  // Client-side filter for instant feedback while server revalidates
  const visible = agents.filter((a) => {
    if (
      search &&
      !a.name.toLowerCase().includes(search.toLowerCase()) &&
      !(a.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (tagFilter !== "all" && !a.tags?.includes(tagFilter)) return false;
    return true;
  });

  const handleMobileFilter = (type: "tag" | "sort", value: string) => {
    if (type === "tag") {
      setTagFilter(value);
      pushFilters(search, value, sort);
    } else if (type === "sort") {
      setSort(value);
      pushFilters(search, tagFilter, value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--star-4)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              pushFilters(e.target.value, tagFilter, sort);
            }}
            className="w-full rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] pl-9 pr-3 py-2 text-sm text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none"
          />
        </div>

        {/* Tag filter */}
        {tags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              pushFilters(search, e.target.value, sort);
            }}
            className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 py-2 text-sm text-[var(--star-2)] focus:border-[var(--azure)] focus:outline-none"
          >
            <option value="all">{t("allTags")}</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            pushFilters(search, tagFilter, e.target.value);
          }}
          className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 py-2 text-sm text-[var(--star-2)] focus:border-[var(--azure)] focus:outline-none"
        >
          <option value="newest">{t("sortNewest")}</option>
          <option value="rating">{t("sortBestRated")}</option>
          <option value="popular">{t("sortMostUsed")}</option>
        </select>

        <span className="ml-auto text-xs text-[var(--star-4)]">
          {visible.length} {visible.length === 1 ? "agent" : "agents"}
        </span>
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--star-4)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              pushFilters(e.target.value, tagFilter, sort);
            }}
            className="w-full rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] pl-9 pr-3 py-2 text-sm text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none"
          />
        </div>

        {/* Count */}
        <span className="block text-xs text-[var(--star-4)]">
          {visible.length} {visible.length === 1 ? "agent" : "agents"}
        </span>
      </div>

      {/* Mobile Drawer */}
      <MobileMarketplaceDrawer
        onFilterChange={handleMobileFilter}
        tags={tags}
        currentTag={tagFilter}
        currentSort={sort}
      />

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--sky-3)] text-[var(--star-4)]">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          </div>
          <div>
            <p className="label-md text-[var(--star-2)]">{t("noPublicAgents")}</p>
            <p className="body-sm text-[var(--star-4)] mt-1 max-w-xs">{t("beFirst")}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isOwn={agent.organization_id === organizationId}
            />
          ))}
        </div>
      )}

      {/* Hint */}
      <p className="body-sm text-[var(--star-4)] border-t border-[var(--edge)] pt-4">
        {t("cloneInfo")}
      </p>
    </div>
  );
}
