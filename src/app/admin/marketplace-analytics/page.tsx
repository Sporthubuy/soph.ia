import { MarketplaceAnalytics } from "@/components/marketplace/marketplace-analytics";
import { getMarketplaceAnalytics } from "@/lib/agents/actions";

export default async function AdminMarketplaceAnalyticsPage() {
  const analytics = await getMarketplaceAnalytics();

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--star-1)]">
          Marketplace Analytics
        </h1>
        <p className="body-sm text-[var(--star-3)]">
          Monitor marketplace performance, agent adoption, and community engagement
        </p>
      </header>

      <MarketplaceAnalytics data={analytics} />
    </div>
  );
}
