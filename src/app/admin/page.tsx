"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StatsData {
  users: { total: number };
  knowledgeUnits: {
    total: number;
    approved: number;
    proposed: number;
    draft: number;
  };
  agents: { total: number; active: number };
  projects: { total: number };
  timestamp: string;
}

interface RecentUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  status: "active" | "inactive";
}

interface RecentActivity {
  id: number;
  action: string;
  details: string;
  time: string;
  type: "user" | "knowledge" | "agent" | "project";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats?.users.total || 0,
      icon: "👥",
      color: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      label: "Knowledge Units",
      value: stats?.knowledgeUnits.total || 0,
      subtext: `${stats?.knowledgeUnits.approved || 0} approved`,
      icon: "📚",
      color: "bg-green-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
    },
    {
      label: "Active Agents",
      value: stats?.agents.active || 0,
      subtext: `of ${stats?.agents.total || 0} total`,
      icon: "🤖",
      color: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
    },
    {
      label: "Projects",
      value: stats?.projects.total || 0,
      icon: "📁",
      color: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-400",
    },
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: 1,
      action: "New user registered",
      details: "john.doe@example.com",
      time: "2 hours ago",
      type: "user",
    },
    {
      id: 2,
      action: "KU approved",
      details: "Sales Strategy Q4",
      time: "5 hours ago",
      type: "knowledge",
    },
    {
      id: 3,
      action: "Agent deployed",
      details: "Support Bot v2.1",
      time: "1 day ago",
      type: "agent",
    },
    {
      id: 4,
      action: "Project created",
      details: "Marketing Automation",
      time: "2 days ago",
      type: "project",
    },
    {
      id: 5,
      action: "Configuration updated",
      details: "API rate limits",
      time: "3 days ago",
      type: "project",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[var(--star-1)]">Dashboard</h1>
          <p className="text-[#64748b] mt-1">Welcome back, Admin</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#64748b]">Last updated</p>
          <p className="text-xs text-[#475569]">{lastUpdated || "Loading..."}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border ${stat.borderColor} ${stat.color} bg-[#0f1117] p-6 space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor} mt-1`}>
                  {loading ? "..." : stat.value.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
            <div className="pt-2 border-t border-[#1e293b]">
              <p className="text-xs text-[#64748b]">
                {(stat as any).subtext || (
                  <>
                    {stat.label === "Total Users" && "Active members"}
                    {stat.label === "Knowledge Units" && "Across all domains"}
                    {stat.label === "Active Agents" && "Currently running"}
                    {stat.label === "Projects" && "In progress"}
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--star-1)]">
              Recent Activity
            </h2>
            <Link
              href="/admin/analytics"
              className="text-sm text-[#3b82f6] hover:text-[#2563eb] transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1e293b] transition-colors border border-transparent hover:border-[#1e293b]"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center text-lg flex-shrink-0">
                    {activity.type === "user" && "👤"}
                    {activity.type === "knowledge" && "📚"}
                    {activity.type === "agent" && "🤖"}
                    {activity.type === "project" && "📁"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#94a3b8]">
                      {activity.action}
                    </p>
                    <p className="text-xs text-[#64748b] truncate">
                      {activity.details}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#64748b] whitespace-nowrap ml-2">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-3">
            <h3 className="text-lg font-bold text-[var(--star-1)]">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="block w-full px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors text-center text-sm"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/agents"
                className="block w-full px-4 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-center text-sm"
              >
                Configure Agents
              </Link>
              <Link
                href="/admin/knowledge"
                className="block w-full px-4 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-center text-sm"
              >
                Knowledge Units
              </Link>
              <Link
                href="/admin/settings"
                className="block w-full px-4 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-center text-sm"
              >
                System Settings
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--star-1)]">
              System Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1117] border border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-[#94a3b8]">Database</span>
                </div>
                <span className="text-xs font-medium text-green-400">Online</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1117] border border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-[#94a3b8]">APIs</span>
                </div>
                <span className="text-xs font-medium text-green-400">
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1117] border border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-[#94a3b8]">Storage</span>
                </div>
                <span className="text-xs font-medium text-green-400">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1117] border border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-[#94a3b8]">Auth</span>
                </div>
                <span className="text-xs font-medium text-green-400">Active</span>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
            <p className="text-xs text-[#64748b]">SOPH.IA Admin</p>
            <p className="text-sm font-medium text-[#94a3b8] mt-1">v1.0.0</p>
            <p className="text-xs text-[#475569] mt-2">
              The Knowledge Operating System for AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
