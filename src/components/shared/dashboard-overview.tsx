"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { Icon, type IconName } from "@/components/shared/icon";

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
  icon: IconName;
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
    return "bg-[rgb(16_185_129_/_0.12)] text-[var(--verified)] border-[rgb(16_185_129_/_0.28)]";
  }
  if (s === "proposed" || s === "pending") {
    return "bg-[rgb(245_158_11_/_0.12)] text-[var(--pending)] border-[rgb(245_158_11_/_0.28)]";
  }
  if (s === "draft" || s === "idle") {
    return "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]";
  }
  if (s === "archived" || s === "error") {
    return "bg-[rgb(239_68_68_/_0.12)] text-[var(--danger)] border-[rgb(239_68_68_/_0.28)]";
  }
  return "bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)] border-[rgb(59_130_246_/_0.28)]";
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
        icon: "projects" as const,
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
        icon: "knowledge" as const,
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
        icon: "agents" as const,
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--star-4)]"
                aria-hidden
              ><Icon name="search" size={18} /></span>
              <input
                type="search"
                aria-label="Search Knowledge Units, Agents, Projects"
                placeholder="Filter this page… (⌘K for global search)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-[var(--edge)] rounded-lg bg-[var(--sky-2)] text-[var(--star-3)] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--star-4)] hover:text-[var(--star-1)]"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={16} />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1 pointer-events-none">
                  <kbd className="px-1.5 py-0.5 bg-[var(--sky-1)] border border-[var(--edge)] rounded text-[10px] text-[var(--star-4)]">
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--edge)]">
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
                      ? "border-[var(--azure)] text-[var(--star-1)] font-medium"
                      : "border-transparent text-[var(--star-3)] hover:border-[var(--edge)] hover:bg-[var(--sky-1)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSortMode((m) => (m === "recent" ? "name" : "recent"))}
              className="flex items-center gap-2 px-3 py-2 text-[var(--star-3)] hover:bg-[var(--sky-1)] rounded self-start sm:self-auto"
            >
              <Icon name="chevron-down" size={16} />
              <span className="body-sm">
                Sort: {sortMode === "recent" ? "Recent" : "Name"}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <p className="section-heading">RECENTLY MODIFIED</p>
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <div className="panel p-6 text-center text-[var(--star-4)] body-md">
                  {search
                    ? "No results match your search."
                    : "Nothing here yet. Create a project or knowledge unit to get started."}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center gap-1 rounded bg-[#3b82f6] px-3 py-2 text-sm font-medium text-[var(--azure-ink)] hover:bg-[#2563eb]"
                    >
                      New project
                    </Link>
                    <Link
                      href="/knowledge/new"
                      className="inline-flex items-center gap-1 rounded border border-[var(--edge)] bg-[var(--sky-2)] px-3 py-2 text-sm font-medium text-[var(--star-3)] hover:bg-[var(--sky-1)]"
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
                    className="panel p-4 flex items-start gap-4 transition-colors hover:bg-[var(--sky-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                  >
                    <div
                      className={`${getIconTile(item.type)} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon name={item.icon} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="body-md font-semibold text-[var(--star-1)]">{item.title}</h3>
                        <span
                          className={`label-sm px-2 py-1 rounded border ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="body-sm text-[var(--star-4)] truncate">{item.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="label-sm text-[var(--star-4)] font-semibold">{item.metadataLabel}</p>
                      <p className="body-sm text-[var(--star-4)]">{item.metadataValue}</p>
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
                <Link href="/agents" className="label-sm text-[#3b82f6] hover:underline">
                  View all
                </Link>
              </div>
              {filteredAgents.length > 0 ? (
                <div className="space-y-2">
                  {filteredAgents.slice(0, 5).map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/agents/${agent.id}`}
                      className="panel p-4 flex items-start gap-4 hover:bg-[var(--sky-1)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                    >
                      <div className="icon-tile-agent w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="agents" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="body-md font-semibold text-[var(--star-1)]">{agent.name}</h3>
                          <span
                            className={`label-sm px-2 py-1 rounded border ${getStatusColor(agent.status || "idle")}`}
                          >
                            {agent.status || "idle"}
                          </span>
                        </div>
                        <p className="body-sm text-[var(--star-4)] truncate">{agent.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="label-sm text-[var(--star-4)]">Updated</p>
                        <p className="body-sm text-[var(--star-4)]">
                          {agent.updated_at
                            ? new Date(agent.updated_at).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="panel p-6 text-center text-[var(--star-4)] body-md">
                  {search ? "No agents match your search." : "No agents yet."}
                </div>
              )}
            </div>
          )}

          {showKusSection && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="section-heading">KNOWLEDGE UNITS</p>
                <Link href="/knowledge" className="label-sm text-[#3b82f6] hover:underline">
                  View all
                </Link>
              </div>
              {filteredKus.length > 0 ? (
                <div className="space-y-2">
                  {filteredKus.slice(0, 5).map((ku) => (
                    <Link
                      key={ku.id}
                      href={`/knowledge/${ku.id}`}
                      className="panel p-4 flex items-start gap-4 hover:bg-[var(--sky-1)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                    >
                      <div className="icon-tile-ku w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="knowledge" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="body-md font-semibold text-[var(--star-1)]">{ku.title}</h3>
                          <span
                            className={`label-sm px-2 py-1 rounded border ${getStatusColor(ku.status || "draft")}`}
                          >
                            {ku.status || "draft"}
                          </span>
                        </div>
                        <p className="body-sm text-[var(--star-4)] truncate">{ku.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="label-sm text-[var(--star-4)]">Domain</p>
                        <p className="body-sm text-[var(--star-4)]">{ku.domain || "General"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="panel p-6 text-center text-[var(--star-4)] body-md">
                  {search ? (
                    "No knowledge units match your search."
                  ) : (
                    <>
                      No knowledge units yet.{" "}
                      <Link href="/knowledge/new" className="text-[#3b82f6] hover:underline">
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
                className="panel p-4 hover:bg-[var(--sky-1)] transition-colors flex items-center gap-3"
              >
                <Icon name="plus" size={18} className="text-[#3b82f6]" />
                <span className="body-md font-medium text-[var(--star-1)]">New KU</span>
              </Link>
              <Link
                href="/projects/new"
                className="panel p-4 hover:bg-[var(--sky-1)] transition-colors flex items-center gap-3"
              >
                <Icon name="projects" size={18} className="text-[#3b82f6]" />
                <span className="body-md font-medium text-[var(--star-1)]">New project</span>
              </Link>
              <Link
                href="/graph"
                className="panel p-4 hover:bg-[var(--sky-1)] transition-colors flex items-center gap-3"
              >
                <Icon name="graph" size={18} className="text-[#3b82f6]" />
                <span className="body-md font-medium text-[var(--star-1)]">Knowledge graph</span>
              </Link>
              <Link
                href="/agents/new"
                className="panel p-4 hover:bg-[var(--sky-1)] transition-colors flex items-center gap-3"
              >
                <Icon name="agents" size={18} className="text-[#3b82f6]" />
                <span className="body-md font-medium text-[var(--star-1)]">New agent</span>
              </Link>
              <Link
                href="/review"
                className="panel p-4 hover:bg-[var(--sky-1)] transition-colors flex items-center gap-3"
              >
                <Icon name="review" size={18} className="text-[#3b82f6]" />
                <span className="body-md font-medium text-[var(--star-1)]">Review queue</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="panel p-6 space-y-4 lg:sticky lg:top-8">
            <h3 className="font-semibold text-[var(--star-1)] body-md">Collaborator Activity</h3>

            <div className="space-y-4">
              {activityItems.length === 0 ? (
                <p className="body-sm text-[var(--star-4)]">
                  Start creating projects or knowledge units to see activity here.
                </p>
              ) : (
                visibleActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="pb-4 border-b border-[var(--edge)] last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full bg-[var(--azure-deep)] text-[#3b82f6] flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        aria-hidden
                      >
                        {activity.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="body-sm">
                          <span className="font-semibold text-[var(--star-1)]">{activity.author}</span>{" "}
                          <span className="text-[var(--star-4)]">{activity.action}</span>
                        </p>
                        {activity.time && (
                          <p className="label-sm text-[var(--star-4)] mt-1">{activity.time}</p>
                        )}
                        {activity.href && (
                          <Link
                            href={activity.href}
                            className="label-sm text-[#3b82f6] hover:underline mt-1 inline-block"
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
                className="w-full py-2 text-center text-[#3b82f6] hover:bg-[var(--sky-1)] rounded body-sm font-medium transition-colors"
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
