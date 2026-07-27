"use client";

import { useState } from "react";
import { CreateProjectModal, type ProjectFormData } from "./create-project-modal";

export const ProjectsOverview = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      icon: "folder_open",
      color: "#e1e0ff",
      textColor: "#4648d4",
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
      icon: "folder",
      color: "#dae2fd",
      textColor: "#000000",
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
      icon: "folder_open",
      color: "#fff8e1",
      textColor: "#f59e0b",
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
      icon: "folder",
      color: "#e0e3e5",
      textColor: "#45464d",
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
      icon: "folder_open",
      color: "#e1e0ff",
      textColor: "#4648d4",
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
      icon: "folder",
      color: "#e0e3e5",
      textColor: "#45464d",
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

  const handleCreateProject = (formData: ProjectFormData) => {
    // This will be replaced with actual API call
    console.log("Creating new project:", formData);
    // Show success toast (to be implemented)
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="headline-lg text-black">Projects</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#4648d4] text-white rounded-lg hover:bg-[#3a3ab0] transition-colors font-medium body-md"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Project
        </button>
      </div>

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

      {/* Projects Grid - Folder Style */}
      <div className="space-y-4">
        <p className="section-heading">PROJECTS</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="panel p-5 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Folder Icon Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: project.textColor }}
                  >
                    {project.icon}
                  </span>
                </div>
                <span
                  className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              {/* Project Name and Description */}
              <h3 className="body-md font-semibold text-black mb-1 truncate group-hover:text-[#4648d4] transition-colors">
                {project.name}
              </h3>
              <p className="body-sm text-[#7c839b] mb-4 line-clamp-2 h-10">
                {project.description}
              </p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-sm text-[#7c839b]">Progress</span>
                  <span className="label-sm text-[#45464d] font-semibold">
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

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-[#e2e8f0]">
                <div>
                  <p className="label-sm text-[#7c839b]">Knowledge Units</p>
                  <p className="body-md font-semibold text-black">{project.kuCount}</p>
                </div>
                <div>
                  <p className="label-sm text-[#7c839b]">Agents</p>
                  <p className="body-md font-semibold text-black">{project.agentCount}</p>
                </div>
              </div>

              {/* Footer - Owner and Updated */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-sm text-[#7c839b]">Owner</p>
                  <p className="body-sm font-medium text-black">{project.owner}</p>
                </div>
                <div className="text-right">
                  <p className="label-sm text-[#7c839b]">Updated</p>
                  <p className="body-sm text-[#7c839b]">{project.updatedAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
