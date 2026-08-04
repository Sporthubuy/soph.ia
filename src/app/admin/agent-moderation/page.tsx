"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AgentModerationPanel } from "@/components/admin/agent-moderation-panel";

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

export default function AgentModerationPage() {
  const [agents, setAgents] = useState<PublicAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFlagged, setFilterFlagged] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      const supabase = await createClient();
      let query = supabase
        .from("agents")
        .select("*")
        .eq("visibility", "public")
        .order("invocations", { ascending: false });

      if (filterFlagged) {
        query = query.eq("flagged", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching agents:", error);
      } else {
        setAgents((data || []) as PublicAgent[]);
      }

      setLoading(false);
    };

    fetchAgents();
  }, [filterFlagged]);

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--star-1)]">
          Agent Moderation
        </h1>
        <p className="body-sm text-[var(--star-3)]">
          Monitor and moderate public marketplace agents
        </p>
      </header>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterFlagged(false)}
          className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
            !filterFlagged
              ? "bg-[var(--azure)] text-white"
              : "bg-[var(--sky-3)] text-[var(--star-2)] hover:bg-[var(--sky-4)]"
          }`}
        >
          All Agents
        </button>
        <button
          onClick={() => setFilterFlagged(true)}
          className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
            filterFlagged
              ? "bg-[#dc2626] text-white"
              : "bg-[var(--sky-3)] text-[var(--star-2)] hover:bg-[var(--sky-4)]"
          }`}
        >
          Flagged Only
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-[var(--star-4)]">Loading agents...</p>
      ) : (
        <AgentModerationPanel agents={agents} />
      )}
    </div>
  );
}
