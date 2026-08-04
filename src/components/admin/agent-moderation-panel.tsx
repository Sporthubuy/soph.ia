"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface PublicAgent {
  id: string;
  name: string;
  description: string | null;
  rating: number;
  ratings_count: number;
  invocations: number;
  visibility: string;
  status: string;
  created_at: string;
  flagged?: boolean;
  flagged_reason?: string;
}

export function AgentModerationPanel({ agents }: { agents: PublicAgent[] }) {
  const [items, setItems] = useState<PublicAgent[]>(agents);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createClient();

  const handleFlag = async (agentId: string, reason: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("agents")
        .update({
          flagged: true,
          flagged_reason: reason,
        })
        .eq("id", agentId);

      if (error) throw error;

      setItems(
        items.map((a) =>
          a.id === agentId ? { ...a, flagged: true, flagged_reason: reason } : a
        )
      );
    } catch (error) {
      console.error("Error flagging agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnflag = async (agentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("agents")
        .update({
          flagged: false,
          flagged_reason: null,
        })
        .eq("id", agentId);

      if (error) throw error;

      setItems(
        items.map((a) =>
          a.id === agentId ? { ...a, flagged: false, flagged_reason: undefined } : a
        )
      );
    } catch (error) {
      console.error("Error unflagging agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepublish = async (agentId: string) => {
    if (!confirm("Depublish this agent? Users won't see it in marketplace.")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("agents")
        .update({ visibility: "unlisted" })
        .eq("id", agentId);

      if (error) throw error;

      setItems(
        items.map((a) => (a.id === agentId ? { ...a, visibility: "unlisted" } : a))
      );
    } catch (error) {
      console.error("Error depublishing agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const flaggedAgents = items.filter((a) => a.flagged);
  const lowRatingAgents = items.filter((a) => a.rating < 2.0 && a.ratings_count > 0);
  const highUseAgents = items.filter((a) => a.invocations > 1000);

  return (
    <div className="space-y-6">
      {/* Alert Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Flagged Agents */}
        <div className="rounded-[10px] border border-[#dc2626] bg-[#7f1d1d] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#fca5a5] uppercase">Flagged</span>
            <Icon name="close" size={16} className="text-[#fca5a5]" />
          </div>
          <div className="label-lg font-bold text-[#fecaca]">{flaggedAgents.length}</div>
          <p className="text-xs text-[#fca5a5] mt-1">Need attention</p>
        </div>

        {/* Low Rating */}
        <div className="rounded-[10px] border border-[#f59e0b] bg-[#78350f] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#fcd34d] uppercase">Low Rating</span>
            <Icon name="chart" size={16} className="text-[#fcd34d]" />
          </div>
          <div className="label-lg font-bold text-[#fde047]">{lowRatingAgents.length}</div>
          <p className="text-xs text-[#fcd34d] mt-1">&lt;2.0 stars</p>
        </div>

        {/* High Usage */}
        <div className="rounded-[10px] border border-[#10b981] bg-[#064e3b] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6ee7b7] uppercase">Popular</span>
            <Icon name="sparkle" size={16} className="text-[#6ee7b7]" />
          </div>
          <div className="label-lg font-bold text-[#a7f3d0]">{highUseAgents.length}</div>
          <p className="text-xs text-[#6ee7b7] mt-1">&gt;1k invocations</p>
        </div>
      </div>

      {/* Agents List */}
      <div className="rounded-[10px] border border-[var(--edge)] overflow-hidden">
        <div className="bg-[var(--sky-3)] px-6 py-3">
          <h3 className="font-medium text-[var(--star-1)]">All Public Agents</h3>
        </div>

        <div className="divide-y divide-[var(--edge)]">
          {items.length === 0 ? (
            <div className="p-6 text-center text-[var(--star-4)]">
              No public agents
            </div>
          ) : (
            items.map((agent) => (
              <div
                key={agent.id}
                className={`p-4 transition-colors ${
                  agent.flagged ? "bg-[#7f1d1d] bg-opacity-20" : "hover:bg-[var(--sky-3)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[var(--star-1)] truncate">
                        {agent.name}
                      </h4>
                      {agent.flagged && (
                        <span className="label-xs bg-[#dc2626] text-white px-2 py-1 rounded">
                          Flagged
                        </span>
                      )}
                      {agent.rating < 2.0 && agent.ratings_count > 0 && (
                        <span className="label-xs bg-[#f59e0b] text-[#78350f] px-2 py-1 rounded">
                          Low ★
                        </span>
                      )}
                    </div>
                    {agent.description && (
                      <p className="text-xs text-[var(--star-4)] mt-1 truncate">
                        {agent.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-[var(--star-3)]">
                    <div>★ {agent.rating.toFixed(1)}</div>
                    <div>{agent.invocations} uses</div>
                  </div>
                </div>

                {/* Expandable Actions */}
                {expandedId === agent.id ? (
                  <div className="mt-4 space-y-3 pt-4 border-t border-[var(--edge)]">
                    {agent.flagged_reason && (
                      <div className="p-3 rounded bg-[var(--sky-3)] text-sm">
                        <p className="text-xs font-medium text-[var(--star-3)] mb-1">
                          Flag reason:
                        </p>
                        <p className="text-[var(--star-2)]">{agent.flagged_reason}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!agent.flagged ? (
                        <Button
                          size="sm"
                          className="bg-[#dc2626] text-white hover:bg-[#b91c1c]"
                          onClick={() => {
                            const reason = prompt(
                              "Why are you flagging this agent?"
                            );
                            if (reason) {
                              handleFlag(agent.id, reason);
                            }
                          }}
                          disabled={loading}
                        >
                          Flag
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-[#10b981] text-white hover:bg-[#059669]"
                          onClick={() => handleUnflag(agent.id)}
                          disabled={loading}
                        >
                          Unflag
                        </Button>
                      )}

                      {agent.visibility === "public" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDepublish(agent.id)}
                          disabled={loading}
                        >
                          Depublish
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => setExpandedId(agent.id)}
                      className="text-xs text-[var(--azure)] hover:underline"
                    >
                      Show actions →
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
