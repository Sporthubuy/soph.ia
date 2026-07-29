"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { getMaterialSymbolEmoji } from "@/lib/icon-helpers";

interface Project {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  status?: string;
  updated_at?: string;
}

interface KnowledgeUnit {
  id: string;
  title: string;
  description: string;
  domain?: string;
  status?: string;
  updated_at?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  status?: string;
  updated_at?: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  description: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

interface DashboardOverviewProps {
  projects?: Project[];
  knowledgeUnits?: KnowledgeUnit[];
  agents?: Agent[];
  activityLogs?: ActivityLog[];
}

type ItemType = "project" | "knowledge-unit" | "agent";
type SortMode = "recent" | "name";
type TabId = "all" | "ku" | "agents" | "projects";

interface RecentItem {
  id: string;
  type: ItemType;
  icon: string;
  title: string;
  description: string;
  status: string;
  metadataLabel: string;
  metadataValue: string;
  updatedAt: string | null;
  href: string;
}

const hrefFor = (type: ItemType, id: string) => {
  if (type === "knowledge-unit") return `/knowledge/${id}`;
  if (type === "agent") return `/agents/${id}`;
  return `/projects/${id}`;
};

const activityHref = (entityType: string, entityId: string) => {
  if (entityType === "knowledge_unit") return `/knowledge/${entityId}`;
  if (entityType === "agent") return `/agents/${entityId}`;
  if (entityType === "project") return `/projects/${entityId}`;
  return null;
};

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved" || s === "deployed" || s === "active" || s === "running") {
    return "bg-green-50 text-green-700 border-green-100";
  }
  if (s === "proposed" || s === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  if (s === "draft" || s === "idle") {
    return "bg-gray-50 text-gray-700 border-gray-100";
  }
  if (s === "archived" || s === "error") {
    return "bg-red-50 text-red-700 border-red-100";
  }
  return "bg-blue-50 text-blue-700 border-blue-100";
};

const getIconTile = (type: ItemType) => {
  if (type === "knowledge-unit") return "icon-tile-ku";
  if (type === "agent") return "icon-tile-agent";
  return "icon-tile-domain";
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case "create_project":
      return "created project";
    case "create_knowledge_unit":
      return "created knowledge unit";
    case "approve_knowledge_unit":
      return "approved knowledge unit";
    default:
      return actionType.replace(/_/g, " ");
  }
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const initials = (name: string | null | undefined, email: string | null | undefined) => {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
};

export const DashboardOverview = ({
  projects = [],
  knowledgeUnits = [],
  agents = [],
  activityLogs = [],
}: DashboardOverviewProps) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const allItems = useMemo<RecentItem[]>(() => {
    return [
      ...projects.map((p) => ({
        id: p.id,
        type: "project" as const,
        icon: getMaterialSymbolEmoji(p.icon || "folder_open"),
        title: p.name,
        description: p.description || "",
        status: p.status || "active",
        metadataLabel: "Type",
        metadataValue: "Project",
        updatedAt: p.updated_at ?? null,
        href: hrefFor("project", p.id),
      })),
      ...knowledgeUnits.map((ku) => ({
        id: ku.id,
        type: "knowledge-unit" as const,
        icon: "📖",
        title: ku.title,
        description: ku.description || "",
        status: ku.status || "draft",
        metadataLabel: "Domain",
        metadataValue: ku.domain || "General",
        updatedAt: ku.updated_at ?? null,
        href: hrefFor("knowledge-unit", ku.id),
      })),
      ...agents.map((a) => ({
        id: a.id,
        type: "agent" as const,
        icon: "🤖",
        title: a.name,
        description: a.description || "",
        status: a.status || "idle",
        metadataLabel: "Status",
        metadataValue: a.status || "idle",
        updatedAt: a.updated_at ?? null,
        href: hrefFor("agent", a.id),
      })),
    ];
  }, [projects, knowledgeUnits, agents]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = allItems;

    if (activeTab === "ku") items = items.filter((i) => i.type === "knowledge-unit");
    else if (activeTab === "agents") items = items.filter((i) => i.type === "agent");
    else if (activeTab === "projects") items = items.filter((i) => i.type === "project");

    if (q) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.metadataValue.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q)
      );
    }

    const sorted = [...items].sort((a, b) => {
      if (sortMode === "name") return a.title.localeCompare(b.title);
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    return sorted.slice(0, 8);
  }, [allItems, activeTab, search, sortMode]);

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || activeTab === "agents" || activeTab === "all") {
      return agents.filter(
        (a) =>
          !q ||
          a.name.toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q)
      );
    }
    return [];
  }, [agents, search, activeTab]);

  const filteredKus = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || activeTab === "ku" || activeTab === "all") {
      return knowledgeUnits.filter(
        (ku) =>
          !q ||
          ku.title.toLowerCase().includes(q) ||
          (ku.description || "").toLowerCase().includes(q) ||
          (ku.domain || "").toLowerCase().includes(q)
      );
    }
    return [];
  }, [knowledgeUnits, search, activeTab]);

  const showAgentsSection = activeTab === "all" || activeTab === "agents";
  const showKusSection = activeTab === "all" || activeTab === "ku";

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "All Assets" },
    { id: "ku", label: "Knowledge Units" },
    { id: "agents", label: "Agents" },
    { id: "projects", label: "Projects" },
  ];

  const activityItems = activityLogs.map((log) => {
    const name =
      log.profiles?.full_name ||
      log.profiles?.email ||
      "Someone";
    return {
      id: log.id,
      author: name,
      initials: initials(log.profiles?.full_name, log.profiles?.email),
      action: `${getActionLabel(log.action_type)} “${log.entity_title}”`,
      time: getTimeAgo(log.created_at),
      href: activityHref(log.entity_type, log.entity_id),
    };
  });

  const visibleActivity = showAllActivity ? activityItems : activityItems.slice(0, 5);

  return (
    <div className="p-4 sm:p-8 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c839b]"
                aria-hidden
              >
                🔍
              </span>
              <input
                type="search"
                aria-label="Search Knowledge Units, Agents, Projects"
                placeholder="Filter this page… (⌘K for global search)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c839b] hover:text-black"
                  aria-label="Clear search"
                >
                  <span className="text-lg" aria-hidden>
                    ❌
                  </span>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1 pointer-events-none">
                  <kbd className="px-1.5 py-0.5 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-[10px] text-[#7c839b]">
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0]">
            <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Asset filters">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 border-b-2 rounded-t body-md transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-black text-black font-medium"
                      : "border-transparent text-[#45464d] hover:border-[#e2e8f0] hover:bg-[#f7f9fb]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSortMode((m) => (m === "recent" ? "name" : "recent"))}
              className="flex items-center gap-2 px-3 py-2 text-[#45464d] hover:bg-[#f7f9fb] rounded self-start sm:self-auto"
            >
              <span className="text-lg" aria-hidden>
                📊
              </span>
              <span className="body-sm">
                Sort: {sortMode === "recent" ? "Recent" : "Name"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <p className="section-heading">RECENTLY MODIFIED</p>
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <div className="panel p-6 text-center text-[#7c839b] body-md">
                  {search
                    ? "No results match your search."
                    : "Nothing here yet. Create a project or knowledge unit to get started."}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center gap-1 rounded bg-[#4648d4] px-3 py-2 text-sm font-medium text-white hover:bg-[#3b3db8]"
                    >
                      New project
                    </Link>
                    <Link
                      href="/knowledge/new"
                      className="inline-flex items-center gap-1 rounded border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-medium text-[#45464d] hover:bg-[#f7f9fb]"
                    >
                      New knowledge unit
                    </Link>
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="panel p-4 flex items-start gap-4 transition-colors hover:bg-[#f7f9fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4648d4]"
                  >
                    <div
                      className={`${getIconTile(item.type)} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-lg" aria-hidden>
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="body-md font-semibold text-black">{item.title}</h3>
                        <span
                          className={`label-sm px-2 py-1 rounded border ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="body-sm text-[#7c839b] truncate">{item.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="label-sm text-[#7c839b] font-semibold">{item.metadataLabel}</p>
                      <p className="body-sm text-[#7c839b]">{item.metadataValue}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {showAgentsSection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="section-heading">AGENTS</p>
                <Link href="/agents" className="label-sm text-[#4648d4] hover:underline">
                  View all
                </Link>
              </div>
              {filteredAgents.length > 0 ? (
                <div className="space-y-2">
                  {filteredAgents.slice(0, 5).map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agents/${agent.id}`}
                      className="panel p-4 flex items-start gap-4 hover:bg-[#f7f9fb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4648d4]"
                    >
                      <div className="icon-tile-agent w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg" aria-hidden>
                          🤖
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="body-md font-semibold text-black">{agent.name}</h3>
                          <span
                            className={`label-sm px-2 py-1 rounded border ${getStatusColor(agent.status || "idle")}`}
                          >
                            {agent.status || "idle"}
                          </span>
                        </div>
                        <p className="body-sm text-[#7c839b] truncate">{agent.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="label-sm text-[#7c839b]">Updated</p>
                        <p className="body-sm text-[#7c839b]">
                          {agent.updated_at
                            ? new Date(agent.updated_at).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="panel p-6 text-center text-[#7c839b] body-md">
                  {search ? "No agents match your search." : "No agents yet."}
                </div>
              )}
            </div>
          )}

          {showKusSection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="section-heading">KNOWLEDGE UNITS</p>
                <Link href="/knowledge" className="label-sm text-[#4648d4] hover:underline">
                  View all
                </Link>
              </div>
              {filteredKus.length > 0 ? (
                <div className="space-y-2">
                  {filteredKus.slice(0, 5).map((ku) => (
                    <Link
                      key={ku.id}
                      href={`/knowledge/${ku.id}`}
                      className="panel p-4 flex items-start gap-4 hover:bg-[#f7f9fb] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4648d4]"
                    >
                      <div className="icon-tile-ku w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg" aria-hidden>
                          📖
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="body-md font-semibold text-black">{ku.title}</h3>
                          <span
                            className={`label-sm px-2 py-1 rounded border ${getStatusColor(ku.status || "draft")}`}
                          >
                            {ku.status || "draft"}
                          </span>
                        </div>
                        <p className="body-sm text-[#7c839b] truncate">{ku.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="label-sm text-[#7c839b]">Domain</p>
                        <p className="body-sm text-[#7c839b]">{ku.domain || "General"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="panel p-6 text-center text-[#7c839b] body-md">
                  {search ? (
                    "No knowledge units match your search."
                  ) : (
                    <>
                      No knowledge units yet.{" "}
                      <Link href="/knowledge/new" className="text-[#4648d4] hover:underline">
                        Create one
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <p className="section-heading">QUICK ACTIONS</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                href="/knowledge/new"
                className="panel p-4 hover:bg-[#f7f9fb] transition-colors flex items-center gap-3"
              >
                <span className="text-[#4648d4]" aria-hidden>
                  ➕
                </span>
                <span className="body-md font-medium text-black">New KU</span>
              </Link>
              <Link
                href="/projects/new"
                className="panel p-4 hover:bg-[#f7f9fb] transition-colors flex items-center gap-3"
              >
                <span className="text-[#4648d4]" aria-hidden>
                  📁
                </span>
                <span className="body-md font-medium text-black">New project</span>
              </Link>
              <Link
                href="/graph"
                className="panel p-4 hover:bg-[#f7f9fb] transition-colors flex items-center gap-3"
              >
                <span className="text-[#4648d4]" aria-hidden>
                  🔗
                </span>
                <span className="body-md font-medium text-black">Knowledge graph</span>
              </Link>
              <Link
                href="/agents/new"
                className="panel p-4 hover:bg-[#f7f9fb] transition-colors flex items-center gap-3"
              >
                <span className="text-[#4648d4]" aria-hidden>
                  🤖
                </span>
                <span className="body-md font-medium text-black">New agent</span>
              </Link>
              <Link
                href="/review"
                className="panel p-4 hover:bg-[#f7f9fb] transition-colors flex items-center gap-3"
              >
                <span className="text-[#4648d4]" aria-hidden>
                  ✅
                </span>
                <span className="body-md font-medium text-black">Review queue</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="panel p-6 space-y-4 lg:sticky lg:top-8">
            <h3 className="font-semibold text-black body-md">Collaborator Activity</h3>

            <div className="space-y-4">
              {activityItems.length === 0 ? (
                <p className="body-sm text-[#7c839b]">
                  Start creating projects or knowledge units to see activity here.
                </p>
              ) : (
                visibleActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="pb-4 border-b border-[#e2e8f0] last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        aria-hidden
                      >
                        {activity.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="body-sm">
                          <span className="font-semibold text-black">{activity.author}</span>{" "}
                          <span className="text-[#7c839b]">{activity.action}</span>
                        </p>
                        {activity.time && (
                          <p className="label-sm text-[#7c839b] mt-1">{activity.time}</p>
                        )}
                        {activity.href && (
                          <Link
                            href={activity.href}
                            className="label-sm text-[#4648d4] hover:underline mt-1 inline-block"
                          >
                            View details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {activityItems.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllActivity((v) => !v)}
                className="w-full py-2 text-center text-[#4648d4] hover:bg-[#f7f9fb] rounded body-sm font-medium transition-colors"
              >
                {showAllActivity ? "Show less" : "See full activity log"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
