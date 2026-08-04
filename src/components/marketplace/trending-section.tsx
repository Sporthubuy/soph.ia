"use client";

import { TrendingAgent, PublicAgent } from "@/lib/agents/actions";
import { AgentCard } from "./agent-card";
import { Icon } from "@/components/shared/icon";

export function TrendingSection({
  topRated,
  mostUsed,
  organizationId,
}: {
  topRated: TrendingAgent[];
  mostUsed: TrendingAgent[];
  organizationId: string;
}) {
  return (
    <div className="space-y-8 mb-8">
      {/* Top Rated */}
      {topRated.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="chart" size={20} className="text-[var(--pending)]" />
            <h2 className="section-heading">TOP RATED</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent as PublicAgent}
                isOwn={agent.organization_id === organizationId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Most Used */}
      {mostUsed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="sparkle" size={20} className="text-[var(--verified)]" />
            <h2 className="section-heading">MOST USED</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mostUsed.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent as PublicAgent}
                isOwn={agent.organization_id === organizationId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
