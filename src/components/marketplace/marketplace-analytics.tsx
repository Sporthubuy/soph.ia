import { Icon } from "@/components/shared/icon";

export interface AnalyticsData {
  totalAgents: number;
  averageRating: number;
  totalInvocations: number;
  topAgentInvocations: number;
  averageRatingCount: number;
  growthPercent: number; // month-over-month
  cloneableAgents: number; // visible + deployable
}

export function MarketplaceAnalytics({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {/* Total Agents */}
        <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
              Public
            </span>
            <Icon name="agents" size={16} className="text-[var(--azure)]" />
          </div>
          <div className="label-lg font-bold text-[var(--star-1)]">
            {data.totalAgents}
          </div>
          <p className="text-xs text-[var(--star-4)] mt-1">Deployable agents</p>
        </div>

        {/* Average Rating */}
        <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
              Avg Rating
            </span>
            <span className="text-[var(--pending)]">★</span>
          </div>
          <div className="label-lg font-bold text-[var(--star-1)]">
            {data.averageRating.toFixed(1)}
          </div>
          <p className="text-xs text-[var(--star-4)] mt-1">
            {data.averageRatingCount} reviews avg
          </p>
        </div>

        {/* Total Invocations */}
        <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
              Invocations
            </span>
            <Icon name="sparkle" size={16} className="text-[var(--verified)]" />
          </div>
          <div className="label-lg font-bold text-[var(--star-1)]">
            {(data.totalInvocations / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-[var(--star-4)] mt-1">Cumulative usage</p>
        </div>

        {/* Growth */}
        <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
              Growth
            </span>
            <Icon name="chart" size={16} className="text-[var(--pending)]" />
          </div>
          <div className="label-lg font-bold text-[var(--verified)]">
            +{data.growthPercent.toFixed(0)}%
          </div>
          <p className="text-xs text-[var(--star-4)] mt-1">Month-over-month</p>
        </div>
      </div>

      {/* Distribution Insights */}
      <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-6">
        <h3 className="section-heading mb-4">MARKETPLACE INSIGHTS</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Usage Distribution */}
          <div>
            <h4 className="text-sm font-medium text-[var(--star-2)] mb-3">
              Usage per Agent
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--star-3)]">Peak agent</span>
                <span className="label-sm font-bold text-[var(--star-1)]">
                  {(data.topAgentInvocations / 1000).toFixed(1)}k calls
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--sky-3)]">
                <div
                  className="h-full rounded-full bg-[var(--azure)]"
                  style={{
                    width: `${Math.min(100, (data.topAgentInvocations / (data.totalInvocations / data.totalAgents)) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[var(--star-4)]">
                Top performer usage
              </p>
            </div>
          </div>

          {/* Quality Metrics */}
          <div>
            <h4 className="text-sm font-medium text-[var(--star-2)] mb-3">
              Quality Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--star-3)]">
                  Cloneable rate
                </span>
                <span className="label-sm font-bold text-[var(--verified)]">
                  {data.totalAgents > 0
                    ? ((data.cloneableAgents / data.totalAgents) * 100).toFixed(0)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--sky-3)]">
                <div
                  className="h-full rounded-full bg-[var(--verified)]"
                  style={{
                    width: `${(data.cloneableAgents / data.totalAgents) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[var(--star-4)]">
                Public & deployable agents
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
