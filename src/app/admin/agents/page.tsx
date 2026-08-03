"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Agent {
  id: string;
  name: string;
  description?: string;
  model: string;
  system_prompt?: string;
  status: "draft" | "deployed" | "paused" | "archived";
  temperature?: number;
  created_at: string;
  updated_at: string;
  selected_ku_ids?: string[];
}

interface ApiResponse {
  data: Agent[];
  count: number;
  limit: number;
  offset: number;
}

interface KnowledgeUnit {
  id: string;
  title: string;
  status: string;
}

const MODEL_OPTIONS = [
  "Claude 3.5 Sonnet",
  "Claude 3 Opus",
  "Claude 3 Sonnet",
  "Claude 3 Haiku",
  "GPT-4",
  "GPT-3.5-turbo",
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [knowledgeUnits, setKnowledgeUnits] = useState<KnowledgeUnit[]>([]);
  const [selectedKUs, setSelectedKUs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "Claude 3.5 Sonnet",
    system_prompt: "",
    temperature: 0.4,
  });

  useEffect(() => {
    fetchAgents();
    fetchKnowledgeUnits();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/agents?limit=10&offset=0");
      const result: ApiResponse = await response.json();
      setAgents(result.data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeUnits = async () => {
    try {
      const response = await fetch("/api/admin/knowledge?limit=100&offset=0");
      const result = await response.json();
      setKnowledgeUnits(result.data || []);
    } catch (error) {
      console.error("Error fetching knowledge units:", error);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          knowledge_unit_ids: selectedKUs,
        }),
      });

      if (response.ok) {
        setFormData({
          name: "",
          description: "",
          model: "Claude 3.5 Sonnet",
          system_prompt: "",
          temperature: 0.4,
        });
        setSelectedKUs([]);
        setShowForm(false);
        fetchAgents();
      }
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      await fetch(`/api/admin/agents/${agentId}`, { method: "DELETE" });
      fetchAgents();
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  // Mock data for charts
  const agentActivity = [
    { name: "Support Bot", responses: 3200, users: 1247 },
    { name: "Sales Assistant", responses: 2100, users: 856 },
    { name: "Knowledge Nav", responses: 2800, users: 1432 },
    { name: "Custom Bot", responses: 1900, users: 654 },
  ];

  const deployedCount = agents.filter((a) => a.status === "deployed").length;
  const pausedCount = agents.filter((a) => a.status === "paused").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[var(--star-1)]">Agents</h1>
          <p className="text-[#64748b] mt-1">Monitor and manage AI agents</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
        >
          {showForm ? "Cancel" : "Create Agent"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Deployed</p>
          <p className="text-2xl font-bold text-green-400">{deployedCount}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400 mb-1">Paused</p>
          <p className="text-2xl font-bold text-yellow-400">{pausedCount}</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400 mb-1">Total Agents</p>
          <p className="text-2xl font-bold text-blue-400">{agents.length}</p>
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
          <p className="text-sm text-purple-400 mb-1">Total Interactions</p>
          <p className="text-2xl font-bold text-purple-400">
            {agents.reduce((sum, a) => sum + (a.invocations || 0), 0)}
          </p>
        </div>
      </div>

      {/* Create Agent Form */}
      {showForm && (
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4">
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                  placeholder="e.g., Support Bot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Model *
                </label>
                <select
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                >
                  {MODEL_OPTIONS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                placeholder="What does this agent do?"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                System Prompt *
              </label>
              <textarea
                required
                value={formData.system_prompt}
                onChange={(e) =>
                  setFormData({ ...formData, system_prompt: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                placeholder="System prompt to guide the agent's behavior..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Temperature (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Knowledge Units (Optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-[#1e293b] rounded-lg p-3 bg-[#07090e]">
                {knowledgeUnits.length === 0 ? (
                  <p className="text-sm text-[#64748b]">No knowledge units available</p>
                ) : (
                  knowledgeUnits.map((ku) => (
                    <label
                      key={ku.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[#1e293b]/50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedKUs.includes(ku.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKUs([...selectedKUs, ku.id]);
                          } else {
                            setSelectedKUs(
                              selectedKUs.filter((id) => id !== ku.id)
                            );
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-[#94a3b8]">{ku.title}</span>
                      <span className="text-xs text-[#64748b] ml-auto">
                        {ku.status}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {selectedKUs.length > 0 && (
                <p className="text-xs text-[#64748b] mt-2">
                  {selectedKUs.length} knowledge unit(s) selected
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
            >
              Create Agent
            </button>
          </form>
        </div>
      )}

      {/* Agent Activity Chart */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
        <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
          Agent Activity
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentActivity}>
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
            <Bar dataKey="responses" fill="#10b981" />
            <Bar dataKey="users" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Agents Table */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#07090e]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Prompt
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-[#64748b]">
                    Loading agents...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-[#64748b]">
                    No agents found. Create one to get started!
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr
                    key={agent.id}
                    className="border-b border-[#1e293b] hover:bg-[#0f1117] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#94a3b8]">
                      {agent.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">
                      {agent.model}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === "deployed"
                            ? "bg-green-500/20 text-green-400"
                            : agent.status === "paused"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : agent.status === "draft"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {agent.status.charAt(0).toUpperCase() +
                          agent.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b] max-w-xs truncate">
                      {agent.system_prompt || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
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
