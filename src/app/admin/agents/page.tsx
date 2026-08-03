"use client";

import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Agent {
  id: string;
  name: string;
  type: "support" | "sales" | "knowledge" | "custom";
  status: "active" | "inactive" | "paused";
  model: string;
  users: number;
  uptime: number;
  avgResponseTime: number;
  lastUpdate: string;
}

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const agents: Agent[] = [
    {
      id: "agent_001",
      name: "Support Bot",
      type: "support",
      status: "active",
      model: "Claude 3 Sonnet",
      users: 1247,
      uptime: 99.8,
      avgResponseTime: 1.2,
      lastUpdate: "2 hours ago",
    },
    {
      id: "agent_002",
      name: "Sales Assistant",
      type: "sales",
      status: "active",
      model: "Claude 3 Opus",
      users: 856,
      uptime: 99.5,
      avgResponseTime: 2.1,
      lastUpdate: "5 hours ago",
    },
    {
      id: "agent_003",
      name: "Knowledge Navigator",
      type: "knowledge",
      status: "active",
      model: "Claude 3 Sonnet",
      users: 2341,
      uptime: 99.9,
      avgResponseTime: 0.8,
      lastUpdate: "1 hour ago",
    },
    {
      id: "agent_004",
      name: "Custom Bot",
      type: "custom",
      status: "paused",
      model: "Claude 3 Haiku",
      users: 0,
      uptime: 0,
      avgResponseTime: 0,
      lastUpdate: "2 days ago",
    },
    {
      id: "agent_005",
      name: "Legacy Agent",
      type: "support",
      status: "inactive",
      model: "GPT-4",
      users: 0,
      uptime: 0,
      avgResponseTime: 0,
      lastUpdate: "30 days ago",
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || agent.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Chart data
  const chartData = [
    { name: "Support Bot", users: 1247, responses: 3450 },
    { name: "Sales Assistant", users: 856, responses: 2100 },
    { name: "Knowledge Navigator", users: 2341, responses: 5600 },
    { name: "Custom Bot", users: 0, responses: 0 },
  ];

  const statusData = [
    { name: "Active", value: 3 },
    { name: "Paused", value: 1 },
    { name: "Inactive", value: 1 },
  ];

  const COLORS = ["#4ade80", "#fbbf24", "#ef4444"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400";
      case "inactive":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "support":
        return "bg-blue-500/20 text-blue-400";
      case "sales":
        return "bg-purple-500/20 text-purple-400";
      case "knowledge":
        return "bg-green-500/20 text-green-400";
      case "custom":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">Agents</h1>
          <p className="text-[#64748b] mt-1">
            Monitor and manage AI agents
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">
          Create Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Active Agents</p>
          <p className="text-2xl font-bold text-green-400">3</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400 mb-1">Paused</p>
          <p className="text-2xl font-bold text-yellow-400">1</p>
        </div>
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
          <p className="text-sm text-[#64748b] mb-1">Total Interactions</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">11,150</p>
        </div>
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
          <p className="text-sm text-[#64748b] mb-1">Avg Uptime</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">99.7%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
          <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
            Agent Activity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1117",
                  border: "1px solid #1e293b",
                  borderRadius: "0.375rem",
                  color: "#94a3b8",
                }}
              />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" />
              <Bar dataKey="responses" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
          <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
            Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1117",
                  border: "1px solid #1e293b",
                  borderRadius: "0.375rem",
                  color: "#94a3b8",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by agent name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="knowledge">Knowledge</option>
              <option value="custom">Custom</option>
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
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#07090e]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Users
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Uptime
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Response Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-[#1e293b] hover:bg-[#0f1117] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#94a3b8]">
                    {agent.name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}
                    >
                      {agent.type.charAt(0).toUpperCase() +
                        agent.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}
                    >
                      {agent.status.charAt(0).toUpperCase() +
                        agent.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {agent.model}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94a3b8]">
                    {agent.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94a3b8]">
                    {agent.uptime}%
                  </td>
                  <td className="px-6 py-4 text-sm text-[#94a3b8]">
                    {agent.avgResponseTime}s
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                      Edit
                    </button>
                    <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                      Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
