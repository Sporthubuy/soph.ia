"use client";

import { useState } from "react";

export const ProjectsOverview = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const projects = [
    {
      id: 1,
      name: "Aether Core Deployment",
      description: "Main infrastructure for knowledge compilation and agent deployment",
      owner: "Alex Rivers",
      status: "Active",
      kuCount: 85,
      agentCount: 3,
      progress: 65,
      createdAt: "2 weeks ago",
      updatedAt: "2 hours ago",
    },
    {
      id: 2,
      name: "Customer Onboarding Flow",
      description: "Streamlined customer setup and documentation pipeline",
      owner: "Sarah Chen",
      status: "In Progress",
      kuCount: 42,
      agentCount: 2,
      progress: 45,
      createdAt: "1 month ago",
      updatedAt: "1 day ago",
    },
    {
      id: 3,
      name: "Compliance & Legal Framework",
      description: "Regulations, policies, and legal documentation management",
      owner: "Jordan Martinez",
      status: "Active",
      kuCount: 156,
      agentCount: 1,
      progress: 100,
      createdAt: "3 months ago",
      updatedAt: "5 days ago",
    },
    {
      id: 4,
      name: "Product Launch Q4 2026",
      description: "Feature specs, release notes, and go-to-market strategy",
      owner: "Casey Wong",
      status: "Planned",
      kuCount: 28,
      agentCount: 0,
      progress: 20,
      createdAt: "1 week ago",
      updatedAt: "3 days ago",
    },
    {
      id: 5,
      name: "Research & Development",
      description: "Technical research, prototypes, and experimental features",
      owner: "Alex Rivers",
      status: "Active",
      kuCount: 67,
      agentCount: 1,
      progress: 55,
      createdAt: "2 months ago",
      updatedAt: "12 hours ago",
    },
    {
      id: 6,
      name: "Legacy System Migration",
      description: "Documentation and transition plan for deprecated systems",
      owner: "Jordan Martinez",
      status: "Archived",
      kuCount: 34,
      agentCount: 0,
      progress: 100,
      createdAt: "4 months ago",
      updatedAt: "2 weeks ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border-green-100";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Planned":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "Archived":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-200";
    if (progress >= 50) return "bg-blue-200";
    if (progress >= 20) return "bg-yellow-200";
    return "bg-orange-200";
  };

  const tabs = [
    { id: "all", label: "All Projects" },
    { id: "active", label: "Active" },
    { id: "inprogress", label: "In Progress" },
    { id: "archived", label: "Archived" },
  ];

  const activityItems = [
    {
      id: 1,
      author: "Casey Wong",
      avatar: "🧑‍💼",
      action: "created new project",
      time: "2h ago",
      link: "View project",
    },
    {
      id: 2,
      author: "Alex Rivers",
      avatar: "🧑‍💻",
      action: "added 12 Knowledge Units",
      time: "5h ago",
      link: "View changes",
    },
    {
      id: 3,
      author: "Sarah Chen",
      avatar: "👩‍💼",
      action: "completed project milestone",
      time: "1 day ago",
      link: "View details",
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
                placeholder="Search projects by name, owner, status..."
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

          {/* Projects List */}
          <div className="space-y-4">
            <p className="section-heading">PROJECTS</p>

            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="panel p-4 hover:bg-[#f7f9fb] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Project info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="body-md font-semibold text-black">
                          {project.name}
                        </h3>
                        <span
                          className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <p className="body-sm text-[#7c839b] mb-3">
                        {project.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="label-sm text-[#7c839b]">Progress</span>
                          <span className="label-sm text-[#45464d] font-medium">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(project.progress)}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#7c839b]">
                          <span className="font-semibold">{project.kuCount}</span> Knowledge Units
                        </span>
                        <span className="text-[#7c839b]">
                          <span className="font-semibold">{project.agentCount}</span> Agents
                        </span>
                        <span className="text-[#7c839b]">
                          Owner: <span className="font-semibold">{project.owner}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right side - Metadata */}
                    <div className="text-right flex-shrink-0 min-w-fit">
                      <p className="label-sm text-[#7c839b] font-semibold">
                        Updated
                      </p>
                      <p className="body-sm text-[#7c839b]">
                        {project.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Project Activity */}
        <div className="lg:col-span-1">
          <div className="panel p-6 space-y-4 sticky top-8">
            <h3 className="font-semibold text-black body-md">Project Activity</h3>

            <div className="space-y-4">
              {activityItems.map((activity) => (
                <div key={activity.id} className="pb-4 border-b border-[#e2e8f0] last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e1e0ff] flex items-center justify-center text-sm flex-shrink-0">
                      {activity.avatar}
                    </div>

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
};
