"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: Project[];
  count: number;
  limit: number;
  offset: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        limit: "50",
        offset: "0",
      });
      const response = await fetch(`/api/admin/projects?${params}`);
      const result: ApiResponse = await response.json();
      setProjects(result.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "in-progress").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[var(--star-1)]">Projects</h1>
        <p className="text-[var(--star-4)] mt-1">Track and manage organization projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/5 p-4">
          <p className="text-sm text-[#3b82f6] mb-1">Total Projects</p>
          <p className="text-2xl font-bold text-[#3b82f6]">{totalProjects}</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">{inProgressProjects}</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-400">{completedProjects}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400 mb-1">Planning</p>
          <p className="text-2xl font-bold text-yellow-400">
            {projects.filter((p) => p.status === "planning").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
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

      {/* Projects Table */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--edge)] bg-[var(--sky-1)]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-[var(--star-4)]">
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-[var(--star-4)]">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-[var(--edge)] hover:bg-[var(--sky-3)]/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--star-3)]">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--star-4)] max-w-xs truncate">
                      {project.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--star-4)]">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--star-4)]">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
