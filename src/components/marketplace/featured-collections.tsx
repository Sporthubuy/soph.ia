"use client";

import { FeaturedCollection } from "@/lib/agents/actions";
import { AgentCard } from "./agent-card";
import { Icon, type IconName } from "@/components/shared/icon";

export function FeaturedCollections({
  collections,
  organizationId,
}: {
  collections: FeaturedCollection[];
  organizationId: string;
}) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 mb-8">
      {collections.map((collection) => (
        <div key={collection.id}>
          <div className="flex items-center gap-2 mb-4">
            <Icon
              name={collection.icon as IconName}
              size={20}
              className="text-[var(--azure)]"
            />
            <div>
              <h2 className="section-heading">{collection.name}</h2>
              {collection.description && (
                <p className="body-xs text-[var(--star-4)] mt-1">
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          {collection.agents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collection.agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isOwn={agent.organization_id === organizationId}
                />
              ))}
            </div>
          ) : (
            <p className="text-[var(--star-4)]">No agents in this collection yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
