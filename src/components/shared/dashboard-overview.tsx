"use client";

import { useState } from "react";

export const DashboardOverview = ({ user }: { user: any }) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const recentItems = [
    {
      id: 1,
      type: "knowledge-unit",
      icon: "menu_book",
      title: "SOPH.IA Research Lead",
      description: "Knowledge Scope: Deep Learning, Neuro-symbolic AI, Ethics Labs",
      status: "RUNNING",
      metadata: "Latency: 124ms",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "document",
      icon: "description",
      title: "Q3_Strategic_Roadmap_Final.pdf",
      description: "Added 2 hours ago • 4.2 MB • 3 Linked Agents",
      status: "VERIFIED",
      metadata: "Accuracy: 99.2%",
      timestamp: "2 hours ago",
    },
    {
      id: 3,
      type: "project",
      icon: "folder_open",
      title: "Project: Aether Core Deployment",
      description: "85 Units • 3 Agents",
      status: "Active Development",
      metadata: "Progress: 65%",
      timestamp: "1 day ago",
    },
    {
      id: 4,
      type: "document",
      icon: "description",
      title: "Internal_Architecture_v4.docx",
      description: "Updated yesterday • 12.8 MB • 0 Linked Agents",
      status: "REVIEW REQUIRED",
      metadata: "Conflicts: 2 Items",
      timestamp: "Yesterday",
    },
    {
      id: 5,
      type: "agent",
      icon: "smart_toy",
      title: "Content Auditor Bot",
      description: "Knowledge Scope: Compliance, HR Policy, Legal Drafts",
      status: "IDLE",
      metadata: "Last Run: Oct 12",
      timestamp: "3 days ago",
    },
  ];

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
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
  );
}
