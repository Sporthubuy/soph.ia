"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  rating: number;
  ratings_count: number;
  invocations: number;
  organizations?: { name: string };
};

export default function AdminMarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = await createClient();
      const { data: rows } = await supabase
        .from("agents")
        .select("id, name, description, rating, ratings_count, invocations, organization_id")
        .eq("visibility", "public")
        .order("rating", { ascending: false });

      if (!rows) {
        setAgents([]);
        setLoading(false);
        return;
      }

      // Fetch organization names separately
      const orgIds = [...new Set(rows.map((r) => r.organization_id).filter(Boolean))];
      let orgNames: Record<string, string> = {};
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id, name")
          .in("id", orgIds);
        if (orgs) {
          orgNames = Object.fromEntries(orgs.map((o) => [o.id, o.name]));
        }
      }

      setAgents(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          rating: r.rating ?? 0,
          ratings_count: r.ratings_count ?? 0,
          invocations: r.invocations ?? 0,
          organizations: orgNames[r.organization_id]
            ? { name: orgNames[r.organization_id] }
            : undefined,
        }))
      );
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--star-1)]">Marketplace Management</h1>
        <p className="body-sm text-[var(--star-3)]">Monitor and moderate public agents</p>
      </header>

      {loading ? (
        <p className="text-[var(--star-4)]">Loading…</p>
      ) : agents.length === 0 ? (
        <div className="rounded-2xl border border-[var(--edge)] bg-[var(--sky-2)] p-8 text-center">
          <p className="text-[var(--star-4)]">No public agents yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--edge)] bg-[var(--sky-2)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--edge)] bg-[var(--sky-3)]">
              <tr className="text-left text-xs font-medium text-[var(--star-3)] uppercase">
                <th className="px-6 py-3">Agent</th>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Invocations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--edge)]">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-[var(--sky-3)] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-[var(--star-1)]">{agent.name}</p>
                      <p className="text-xs text-[var(--star-4)] mt-0.5">
                        {agent.description?.slice(0, 50)}…
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--star-2)]">
                    {agent.organizations?.name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-[var(--pending)]">
                      ★ {agent.rating ? agent.rating.toFixed(1) : "—"}
                      {agent.ratings_count > 0 && (
                        <span className="text-xs text-[var(--star-4)]">
                          ({agent.ratings_count})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--star-2)]">
                    {agent.invocations ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
