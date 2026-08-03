"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  progress: number;
  members: number;
  createdAt: string;
  dueDate: string;
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const projects: Project[] = [
    {
      id: "proj_001",
      name: "AI Agent Suite v2.0",
      description: "Next generation of AI agents with improved performance",
      owner: "john.doe@example.com",
      status: "in-progress",
      progress: 65,
      members: 8,
      createdAt: "2024-01-01",
      dueDate: "2024-03-31",
    },
    {
      id: "proj_002",
      name: "Knowledge Graph Optimization",
      description: "Improve query performance and reduce latency",
      owner: "jane.smith@example.com",
      status: "in-progress",
      progress: 42,
      members: 5,
      createdAt: "2024-02-01",
      dueDate: "2024-04-15",
    },
    {
      id: "proj_003",
      name: "User Dashboard Redesign",
      description: "Modern UI/UX refresh for the main platform",
      owner: "john.doe@example.com",
      status: "planning",
      progress: 15,
      members: 6,
      createdAt: "2024-02-20",
      dueDate: "2024-05-01",
    },
    {
      id: "proj_004",
      name: "API Rate Limiting",
      description: "Implement comprehensive rate limiting system",
      owner: "jane.smith@example.com",
      status: "completed",
      progress: 100,
      members: 3,
      createdAt: "2023-12-01",
      dueDate: "2024-02-28",
    },
    {
      id: "proj_005",
      name: "Mobile App Alpha",
      description: "iOS and Android mobile application",
      owner: "john.doe@example.com",
      status: "on-hold",
      progress: 30,
      members: 7,
      createdAt: "2024-01-15",
      dueDate: "2024-06-01",
    },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-500/20 text-blue-400";
      case "planning":
        return "bg-yellow-500/20 text-yellow-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "on-hold":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">Projects</h1>
          <p className="text-[#64748b] mt-1">
            Manage and track all projects
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
          <p className="text-sm text-[#64748b] mb-1">Total Projects</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">5</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">2</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-400">1</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400 mb-1">Team Members</p>
          <p className="text-2xl font-bold text-yellow-400">29</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4 hover:border-[#3b82f6]/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--star-1)]">
                  {project.name}
                </h3>
                <p className="text-sm text-[#64748b] mt-1">
                  {project.description}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} whitespace-nowrap ml-2`}
              >
                {project.status
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748b]">Progress</span>
                <span className="text-sm font-medium text-[#94a3b8]">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e293b]">
              <div>
                <p className="text-xs text-[#64748b]">Owner</p>
                <p className="text-sm font-medium text-[#94a3b8]">
                  {project.owner.split("@")[0]}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Members</p>
                <p className="text-sm font-medium text-[#94a3b8]">
                  {project.members}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748b]">Due Date</p>
                <p className="text-sm font-medium text-[#94a3b8]">
                  {project.dueDate}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-sm">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-sm">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
