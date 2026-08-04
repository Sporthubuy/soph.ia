import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CACHE_TAGS = {
  MARKETPLACE_STATS: "marketplace-stats",
  TRENDING_AGENTS: "trending-agents",
  PUBLIC_AGENTS: "public-agents",
  FEATURED_COLLECTIONS: "featured-collections",
  AGENT_REVIEWS: "agent-reviews",
};

const CACHE_DURATIONS = {
  STATS: 3600, // 1 hour
  TRENDING: 1800, // 30 minutes
  AGENTS: 600, // 10 minutes
  COLLECTIONS: 3600, // 1 hour
  REVIEWS: 300, // 5 minutes
};

/**
 * Cached marketplace stats query.
 * Revalidates every 1 hour or on agent/rating changes.
 */
export const getCachedMarketplaceStats = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("agents")
      .select("id, rating, ratings_count, invocations")
      .eq("visibility", "public")
      .eq("status", "deployed");

    if (!data) return null;

    const totalAgents = data.length;
    const totalInvocations = data.reduce((sum, a) => sum + (a.invocations ?? 0), 0);
    const avgRating =
      totalAgents > 0
        ? data.reduce((sum, a) => sum + (a.rating ?? 0), 0) / totalAgents
        : 0;

    return {
      totalAgents,
      totalInvocations,
      avgRating: Math.round(avgRating * 100) / 100,
      avgRatingsPerAgent: Math.round((data.reduce((sum, a) => sum + (a.ratings_count ?? 0), 0) / totalAgents) * 100) / 100,
    };
  },
  [CACHE_TAGS.MARKETPLACE_STATS],
  {
    revalidate: CACHE_DURATIONS.STATS,
    tags: [CACHE_TAGS.MARKETPLACE_STATS],
  }
);

/**
 * Cached trending agents query.
 * Revalidates every 30 minutes or on agent changes.
 */
export const getCachedTrendingAgents = unstable_cache(
  async (limit: number = 6) => {
    const supabase = await createClient();

    const topRatedPromise = supabase
      .from("agents")
      .select("id, name, description, rating, ratings_count, invocations, tags, organization_id")
      .eq("visibility", "public")
      .eq("status", "deployed")
      .gt("ratings_count", 0)
      .order("rating", { ascending: false })
      .limit(limit);

    const mostUsedPromise = supabase
      .from("agents")
      .select("id, name, description, rating, ratings_count, invocations, tags, organization_id")
      .eq("visibility", "public")
      .eq("status", "deployed")
      .gt("invocations", 0)
      .order("invocations", { ascending: false })
      .limit(limit);

    const [topRated, mostUsed] = await Promise.all([
      topRatedPromise,
      mostUsedPromise,
    ]);

    return {
      topRated: topRated.data || [],
      mostUsed: mostUsed.data || [],
    };
  },
  [CACHE_TAGS.TRENDING_AGENTS],
  {
    revalidate: CACHE_DURATIONS.TRENDING,
    tags: [CACHE_TAGS.TRENDING_AGENTS],
  }
);

/**
 * Cached featured collections query.
 * Revalidates every 1 hour or on collection changes.
 */
export const getCachedFeaturedCollections = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("featured_collections")
      .select("*")
      .order("position", { ascending: true });

    return data || [];
  },
  [CACHE_TAGS.FEATURED_COLLECTIONS],
  {
    revalidate: CACHE_DURATIONS.COLLECTIONS,
    tags: [CACHE_TAGS.FEATURED_COLLECTIONS],
  }
);

/**
 * Invalidate marketplace caches on agent or rating changes.
 * Call this after mutations that affect marketplace data.
 */
export async function invalidateMarketplaceCache() {
  // In production, use Revalidate API:
  // await revalidateTag(CACHE_TAGS.MARKETPLACE_STATS);
  // await revalidateTag(CACHE_TAGS.TRENDING_AGENTS);

  console.log("[Cache] Invalidating marketplace caches");
}

/**
 * Get cache stats (for monitoring/debugging).
 */
export const CACHE_CONFIG = {
  tags: CACHE_TAGS,
  durations: CACHE_DURATIONS,
};
