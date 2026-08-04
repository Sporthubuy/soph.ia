import { MarketplaceStats } from "@/lib/agents/actions";
import { Icon } from "@/components/shared/icon";

export function MarketplaceStatsDisplay({ stats }: { stats: MarketplaceStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      {/* Total Public Agents */}
      <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
            Agents
          </span>
          <Icon name="agents" size={16} className="text-[var(--azure)]" />
        </div>
        <div className="label-lg font-bold text-[var(--star-1)]">
          {stats.totalPublicAgents}
        </div>
      </div>

      {/* Average Rating */}
      <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
            Avg Rating
          </span>
          <Icon name="chart" size={16} className="text-[var(--pending)]" />
        </div>
        <div className="label-lg font-bold text-[var(--star-1)]">
          {stats.averageRating.toFixed(1)}
        </div>
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
          {(stats.totalInvocations / 1000).toFixed(1)}k
        </div>
      </div>

      {/* Top Agent Invocations */}
      <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--star-3)] uppercase tracking-wide">
            Peak
          </span>
          <Icon name="sparkle" size={16} className="text-[var(--azure)]" />
        </div>
        <div className="label-lg font-bold text-[var(--star-1)]">
          {(stats.topAgentInvocations / 1000).toFixed(1)}k
        </div>
      </div>
    </div>
  );
}
