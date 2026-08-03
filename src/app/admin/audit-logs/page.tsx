"use client";

import { useState } from "react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  status: "success" | "failure" | "pending";
  ipAddress: string;
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  // Mock data - Replace with API call
  const logs: AuditLog[] = [
    {
      id: "log_001",
      timestamp: "2024-02-28 14:32:15",
      user: "rg.aviaga@gmail.com",
      action: "create",
      resource: "User",
      details: "Created new user john.doe@example.com",
      status: "success",
      ipAddress: "192.168.1.100",
    },
    {
      id: "log_002",
      timestamp: "2024-02-28 14:25:42",
      user: "jane.smith@example.com",
      action: "update",
      resource: "KnowledgeUnit",
      details: "Updated Sales Strategy Q4",
      status: "success",
      ipAddress: "192.168.1.101",
    },
    {
      id: "log_003",
      timestamp: "2024-02-28 14:18:30",
      user: "rg.aviaga@gmail.com",
      action: "delete",
      resource: "Agent",
      details: "Deleted agent: Custom Bot",
      status: "success",
      ipAddress: "192.168.1.100",
    },
    {
      id: "log_004",
      timestamp: "2024-02-28 13:45:22",
      user: "john.doe@example.com",
      action: "login",
      resource: "Auth",
      details: "User logged in successfully",
      status: "success",
      ipAddress: "192.168.1.102",
    },
    {
      id: "log_005",
      timestamp: "2024-02-28 13:40:15",
      user: "unknown.user@example.com",
      action: "login",
      resource: "Auth",
      details: "Failed login attempt",
      status: "failure",
      ipAddress: "203.45.67.89",
    },
    {
      id: "log_006",
      timestamp: "2024-02-28 13:35:44",
      user: "jane.smith@example.com",
      action: "export",
      resource: "KnowledgeUnit",
      details: "Exported all KUs to CSV",
      status: "success",
      ipAddress: "192.168.1.101",
    },
    {
      id: "log_007",
      timestamp: "2024-02-28 13:20:10",
      user: "rg.aviaga@gmail.com",
      action: "update",
      resource: "Settings",
      details: "Updated system configuration",
      status: "success",
      ipAddress: "192.168.1.100",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesStatus =
      statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-500/20 text-green-400";
      case "update":
        return "bg-blue-500/20 text-blue-400";
      case "delete":
        return "bg-red-500/20 text-red-400";
      case "login":
        return "bg-purple-500/20 text-purple-400";
      case "export":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400";
      case "failure":
        return "bg-red-500/20 text-red-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "User":
        return "👤";
      case "KnowledgeUnit":
        return "📚";
      case "Agent":
        return "🤖";
      case "Auth":
        return "🔐";
      case "Settings":
        return "⚙️";
      default:
        return "📋";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--star-1)]">
          Audit Logs
        </h1>
        <p className="text-[#64748b] mt-1">
          Track all system activities and user actions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
          <p className="text-sm text-[#64748b] mb-1">Total Events</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">2,847</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Successful</p>
          <p className="text-2xl font-bold text-green-400">2,823</p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-400 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-400">24</p>
        </div>
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
          <p className="text-sm text-[#64748b] mb-1">Today</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">145</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by user, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="export">Export</option>
            </select>
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
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
        <div className="space-y-4">
          {filteredLogs.map((log, index) => (
            <div
              key={log.id}
              className="flex gap-4 pb-4 border-b border-[#1e293b] last:border-b-0"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6] mt-1.5"></div>
                {index < filteredLogs.length - 1 && (
                  <div className="w-0.5 h-12 bg-[#1e293b] my-2"></div>
                )}
              </div>

              {/* Log content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getResourceIcon(log.resource)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                      >
                        {log.status.charAt(0).toUpperCase() +
                          log.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-[#94a3b8]">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-[#64748b]">
                      <span>User: {log.user}</span>
                      <span>Resource: {log.resource}</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-medium text-[#94a3b8]">
                      {log.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#64748b]">
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
        <div className="space-x-2">
          <button className="px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm">
            Previous
          </button>
          <button className="px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
