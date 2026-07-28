"use client";

import { useState } from "react";

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

interface DashboardOverviewProps {
  projects?: Project[];
  knowledgeUnits?: KnowledgeUnit[];
  agents?: Agent[];
}

export const DashboardOverview = ({
  projects = [],
  knowledgeUnits = [],
  agents = [],
}: DashboardOverviewProps) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Transform database items to UI format
  const recentItems = [
    ...projects.map((p) => ({
      id: p.id,
      type: "project",
      icon: p.icon || "folder_open",
      title: p.name,
      description: p.description,
      status: p.status || "Active",
      metadata: `Color: ${p.color || "purple"}`,
      timestamp: p.updated_at
        ? new Date(p.updated_at).toLocaleDateString()
        : "Recently",
    })),
    ...knowledgeUnits.map((ku) => ({
      id: ku.id,
      type: "knowledge-unit",
      icon: "menu_book",
      title: ku.title,
      description: ku.description,
      status: ku.status || "Draft",
      metadata: `Domain: ${ku.domain || "General"}`,
      timestamp: ku.updated_at
        ? new Date(ku.updated_at).toLocaleDateString()
        : "Recently",
    })),
    ...agents.map((a) => ({
      id: a.id,
      type: "agent",
      icon: "smart_toy",
      title: a.name,
      description: a.description,
      status: a.status || "Idle",
      metadata: `Status: ${a.status || "Idle"}`,
      timestamp: a.updated_at
        ? new Date(a.updated_at).toLocaleDateString()
        : "Recently",
    })),
  ].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-green-50 text-green-700 border-green-100";
      case "VERIFIED":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Active Development":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "REVIEW REQUIRED":
        return "bg-orange-50 text-orange-700 border-orange-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getIconTile = (type: string) => {
    switch (type) {
      case "knowledge-unit":
        return "icon-tile-ku";
      case "agent":
        return "icon-tile-agent";
      case "project":
        return "icon-tile-domain";
      default:
        return "icon-tile-review";
    }
  };

  const tabs = [
    { id: "all", label: "All Assets" },
    { id: "ku", label: "Knowledge Units" },
    { id: "agents", label: "Agents" },
    { id: "projects", label: "Projects" },
  ];

  const activityItems = [
    {
      id: 1,
      author: "Alex Rivers",
      avatar: "🧑‍💻",
      action: "pushed a new agent template",
      time: "24h ago",
      link: "View changes",
    },
    {
      id: 2,
      author: "Sarah Chen",
      avatar: "👩‍💼",
      action: "invited 2 new researchers",
      time: "1h ago",
      link: "Manage team",
    },
    {
      id: 3,
      author: "System",
      avatar: "⚙️",
      action: "completed vector re-indexing",
      time: "3h ago",
      link: "Download report",
    },
  ];

  return (
    <div className="p-8 max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c839b]">
                search
              </span>
              <input
                type="text"
                placeholder="Search Knowledge Units, Agents, Projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-16 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <kbd className="px-2 py-1 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-xs text-[#7c839b]">
                  Cmd
                </kbd>
                <kbd className="px-2 py-1 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-xs text-[#7c839b]">
                  K
                </kbd>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex items-center justify-between border-b border-[#e2e8f0]">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 border-b-2 rounded-t body-md transition-colors ${
                    activeTab === tab.id
                      ? "border-black text-black font-medium"
                      : "border-transparent text-[#45464d] hover:border-[#e2e8f0] hover:bg-[#f7f9fb]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-[#45464d] hover:bg-[#f7f9fb] rounded">
                <span className="material-symbols-outlined text-lg">sort</span>
                <span className="body-sm">Sort: Recent</span>
              </button>
            </div>
          </div>

          {/* Recently Modified Section */}
          <div className="space-y-4">
            <p className="section-heading">RECENTLY MODIFIED</p>

            <div className="space-y-2">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="panel p-4 flex items-start gap-4 hover:bg-[#f7f9fb] transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`${getIconTile(item.type)} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="body-md font-semibold text-black">
                        {item.title}
                      </h3>
                      <span
                        className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="body-sm text-[#7c839b] truncate">
                      {item.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="text-right flex-shrink-0">
                    <p className="label-sm text-[#7c839b] font-semibold">
                      {item.metadata.split(":")[0]}
                    </p>
                    <p className="body-sm text-[#7c839b]">
                      {item.metadata.split(":")[1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workspace Core Section */}
          <div className="space-y-4">
            <p className="section-heading">WORKSPACE CORE</p>
            <div className="panel p-6 text-center text-[#7c839b] body-md">
              No core workspace items yet
            </div>
          </div>
        </div>

        {/* Sidebar - Collaborator Activity */}
        <div className="lg:col-span-1">
          <div className="panel p-6 space-y-4 sticky top-8">
            <h3 className="font-semibold text-black body-md">Collaborator Activity</h3>

            <div className="space-y-4">
              {activityItems.map((activity) => (
                <div key={activity.id} className="pb-4 border-b border-[#e2e8f0] last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#e1e0ff] flex items-center justify-center text-sm flex-shrink-0">
                      {activity.avatar}
                    </div>

                    {/* Activity Text */}
                    <div className="flex-1 min-w-0">
                      <p className="body-sm">
                        <span className="font-semibold text-black">{activity.author}</span>
                        {" "}
                        <span className="text-[#7c839b]">{activity.action}</span>
                      </p>
                      <p className="label-sm text-[#7c839b] mt-1">{activity.time}</p>
                      <a href="#" className="label-sm text-[#4648d4] hover:underline mt-1 inline-block">
                        {activity.link}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2 text-center text-[#4648d4] hover:bg-[#f7f9fb] rounded body-sm font-medium transition-colors">
              See full activity log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
