import { PublicAgent } from "@/lib/agents/actions";
import { AgentCard } from "./agent-card";
import { Icon } from "@/components/shared/icon";

export function AgentRecommendations({
  agent,
  similarAgents,
  organizationId,
}: {
  agent: PublicAgent;
  similarAgents: PublicAgent[];
  organizationId: string;
}) {
  if (similarAgents.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon name="sparkle" size={20} className="text-[var(--pending)]" />
        <h2 className="section-heading">SIMILAR AGENTS</h2>
      </div>

      <p className="body-sm text-[var(--star-4)]">
        Agents with similar tags and purpose
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {similarAgents.map((recommendedAgent) => (
          <AgentCard
            key={recommendedAgent.id}
            agent={recommendedAgent}
            isOwn={recommendedAgent.organization_id === organizationId}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Find similar agents based on tag overlap and rating similarity.
 * Returns up to `limit` agents with highest similarity score.
 */
export function findSimilarAgents(
  currentAgent: PublicAgent,
  allAgents: PublicAgent[],
  limit = 6
): PublicAgent[] {
  // Filter out current agent
  const candidates = allAgents.filter((a) => a.id !== currentAgent.id);

  // Score each candidate
  const scored = candidates.map((agent) => {
    let score = 0;

    // Tag overlap: shared tags increase score
    const currentTags = new Set(currentAgent.tags || []);
    const agentTags = new Set(agent.tags || []);
    const sharedTags = [...currentTags].filter((t) => agentTags.has(t)).length;
    score += sharedTags * 20;

    // Rating similarity: closer ratings are more similar
    const ratingDiff = Math.abs(currentAgent.rating - agent.rating);
    score += Math.max(0, 20 - ratingDiff * 2);

    // High ratings boost score
    if (agent.rating >= 4) score += 10;

    // Usage frequency
    if (agent.invocations > 100) score += 5;

    return { agent, score };
  });

  // Sort by score and return top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.agent);
}
