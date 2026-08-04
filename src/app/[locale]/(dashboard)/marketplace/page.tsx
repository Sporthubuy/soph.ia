import { setRequestLocale } from "next-intl/server";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";
import { MarketplaceStatsDisplay } from "@/components/marketplace/marketplace-stats";
import { TrendingSection } from "@/components/marketplace/trending-section";
import { FeaturedCollections } from "@/components/marketplace/featured-collections";
import {
  getPublicAgents,
  getMarketplaceStats,
  getTrendingAgents,
  getFeaturedCollections,
} from "@/lib/agents/actions";
import { getCurrentOrganizationId } from "@/lib/organization/get-org";

export default async function MarketplacePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    tag?: string;
    sort?: string;
  }>;
}) {
  const { locale } = await params;
  const { search = "", tag = "", sort = "newest" } = await searchParams;
  setRequestLocale(locale);

  // Fetch data in parallel
  const [agents, stats, trending, collections, organizationId] = await Promise.all([
    getPublicAgents({
      search,
      tag: tag === "all" ? "" : tag,
      sort,
    }),
    getMarketplaceStats(),
    getTrendingAgents(),
    getFeaturedCollections(),
    getCurrentOrganizationId(),
  ]);

  // Extract unique tags from results for filter dropdown
  const tagsSet = new Set<string>();
  agents.forEach((a) => {
    a.tags?.forEach((t) => tagsSet.add(t));
  });
  const tags = Array.from(tagsSet).sort();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="headline-xl text-[var(--star-1)] font-bold">Marketplace</h1>
        <p className="body-md text-[var(--star-3)]">
          Discover agents built by the community and clone them into your workspace.
        </p>
      </header>

      {/* Stats */}
      <MarketplaceStatsDisplay stats={stats} />

      {/* Featured collections section (only show if no filters) */}
      {!search && !tag && sort === "newest" && collections.length > 0 && (
        <FeaturedCollections
          collections={collections}
          organizationId={organizationId || ""}
        />
      )}

      {/* Trending section (only show if there's search/filter activity or empty query) */}
      {!search && !tag && sort === "newest" && (
        <TrendingSection
          topRated={trending.topRated}
          mostUsed={trending.mostUsed}
          organizationId={organizationId || ""}
        />
      )}

      {/* Main grid */}
      <MarketplaceGrid
        agents={agents}
        tags={tags}
        organizationId={organizationId || ""}
        initialSearch={search}
        initialTag={tag}
        initialSort={sort}
      />
    </div>
  );
}
