"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  position: number;
  agent_ids: string[];
}

interface PublicAgent {
  id: string;
  name: string;
}

export function FeaturedCollectionsManager({
  initialCollections,
  availableAgents,
}: {
  initialCollections: Collection[];
  availableAgents: PublicAgent[];
}) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Collection>>({});
  const [loading, setLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const supabase = createClient();

  const handleCreate = async () => {
    if (!formData.name?.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("featured_collections")
        .insert({
          name: formData.name,
          description: formData.description || null,
          icon: formData.icon || "sparkle",
          position: collections.length,
          agent_ids: selectedAgents,
        })
        .select()
        .single();

      if (error) throw error;

      setCollections([...collections, data]);
      setFormData({});
      setSelectedAgents([]);
      setEditing(null);
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("featured_collections")
        .update({
          name: formData.name,
          description: formData.description || null,
          icon: formData.icon || "sparkle",
          agent_ids: selectedAgents,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setCollections(
        collections.map((c) => (c.id === id ? data : c))
      );
      setFormData({});
      setSelectedAgents([]);
      setEditing(null);
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("featured_collections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCollections(collections.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditing(collection.id);
    setFormData(collection);
    setSelectedAgents(collection.agent_ids);
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {editing === null && (
        <div className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-6">
          <h3 className="section-heading mb-4">NEW COLLECTION</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--star-2)] mb-1">
                Name *
              </label>
              <Input
                placeholder="e.g. Customer Support Agents"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--star-2)] mb-1">
                Description
              </label>
              <textarea
                placeholder="What's this collection about?"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 py-2 text-sm text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--star-2)] mb-1">
                Icon
              </label>
              <Input
                placeholder="e.g. sparkle, chart, bulb"
                value={formData.icon || ""}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--star-2)] mb-2">
                Select Agents ({selectedAgents.length})
              </label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] p-3">
                {availableAgents.length === 0 ? (
                  <p className="text-xs text-[var(--star-4)]">
                    No public agents available
                  </p>
                ) : (
                  availableAgents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center gap-2 rounded px-2 py-1 hover:bg-[var(--sky-4)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={() => toggleAgent(agent.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-[var(--star-1)]">
                        {agent.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={loading || !formData.name?.trim()}
                className="bg-[var(--azure)] text-white hover:bg-[var(--azure-bright)]"
              >
                {loading ? "Creating..." : "Create Collection"}
              </Button>
              <Button
                onClick={() => {
                  setFormData({});
                  setSelectedAgents([]);
                }}
                variant="outline"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="space-y-3">
        <h3 className="section-heading">EXISTING COLLECTIONS ({collections.length})</h3>
        {collections.length === 0 ? (
          <p className="text-[var(--star-4)]">No collections yet.</p>
        ) : (
          collections.map((collection) => (
            <div
              key={collection.id}
              className="rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] p-4"
            >
              {editing === collection.id ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 py-2 text-sm text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none"
                    rows={2}
                  />
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] p-2">
                    {availableAgents.map((agent) => (
                      <label
                        key={agent.id}
                        className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-[var(--sky-4)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAgents.includes(agent.id)}
                          onChange={() => toggleAgent(agent.id)}
                          className="h-3 w-3"
                        />
                        {agent.name}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdate(collection.id)}
                      disabled={loading}
                      className="bg-[var(--verified)] text-white"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(null);
                        setFormData({});
                        setSelectedAgents([]);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--star-1)]">
                        {collection.name}
                      </h4>
                      {collection.description && (
                        <p className="text-xs text-[var(--star-4)] mt-1">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[var(--star-3)]">
                      {collection.agent_ids.length} agents
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEdit(collection)}
                      size="sm"
                      className="bg-[var(--sky-3)] text-[var(--star-2)] hover:bg-[var(--sky-4)]"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(collection.id)}
                      disabled={loading}
                      size="sm"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
