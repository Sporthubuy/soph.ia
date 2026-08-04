"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FeaturedCollectionsManager } from "@/components/admin/featured-collections-manager";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  position: number;
  agent_ids: string[];
}

interface Agent {
  id: string;
  name: string;
}

export default function FeaturedCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = await createClient();

      // Fetch collections
      const { data: collectionsData } = await supabase
        .from("featured_collections")
        .select("*")
        .order("position", { ascending: true });

      // Fetch public agents
      const { data: agentsData } = await supabase
        .from("agents")
        .select("id, name")
        .eq("visibility", "public")
        .eq("status", "deployed")
        .order("name", { ascending: true });

      setCollections((collectionsData || []) as Collection[]);
      setAgents((agentsData || []) as Agent[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--star-1)]">
          Featured Collections
        </h1>
        <p className="body-sm text-[var(--star-3)]">
          Curate and manage featured agent collections in the marketplace
        </p>
      </header>

      {loading ? (
        <p className="text-[var(--star-4)]">Loading...</p>
      ) : (
        <FeaturedCollectionsManager
          initialCollections={collections}
          availableAgents={agents}
        />
      )}
    </div>
  );
}
