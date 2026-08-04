"use client";

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const dailyData = [
  { date: "Feb 21", users: 1200, interactions: 2400, revenue: 2400 },
  { date: "Feb 22", users: 1400, interactions: 2210, revenue: 2290 },
  { date: "Feb 23", users: 1600, interactions: 2290, revenue: 2000 },
  { date: "Feb 24", users: 1300, interactions: 2000, revenue: 2181 },
  { date: "Feb 25", users: 1800, interactions: 2181, revenue: 2500 },
  { date: "Feb 26", users: 2100, interactions: 2500, revenue: 2100 },
  { date: "Feb 27", users: 2200, interactions: 2100, revenue: 2600 },
  { date: "Feb 28", users: 2400, interactions: 2600, revenue: 2800 },
];

const agentPerformance = [
  { name: "Support Bot", accuracy: 95, speed: 92, satisfaction: 88 },
  { name: "Sales Assistant", accuracy: 88, speed: 85, satisfaction: 90 },
  { name: "Knowledge Nav", accuracy: 92, speed: 95, satisfaction: 94 },
  { name: "Custom Bot", accuracy: 78, speed: 81, satisfaction: 75 },
];

const topKUs = [
  { title: "Sales Strategy Q4", views: 1240, shares: 342, rating: 4.8 },
  { title: "Customer Support", views: 892, shares: 256, rating: 4.6 },
  { title: "API Documentation", views: 756, shares: 189, rating: 4.7 },
  { title: "Process Workflows", views: 643, shares: 142, rating: 4.5 },
  { title: "Compliance Guide", views: 521, shares: 98, rating: 4.4 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--star-1)]">Analytics</h1>
        <p className="text-[var(--star-4)] mt-1">Detailed insights and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-blue-400">2,847</p>
          <p className="text-xs text-blue-300 mt-1">↑ 12% from last month</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Total Interactions</p>
          <p className="text-2xl font-bold text-green-400">18,543</p>
          <p className="text-xs text-green-300 mt-1">↑ 8% from last week</p>
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
          <p className="text-sm text-purple-400 mb-1">Avg Satisfaction</p>
          <p className="text-2xl font-bold text-purple-400">4.6/5.0</p>
          <p className="text-xs text-purple-300 mt-1">↑ 0.2 from last month</p>
        </div>
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <p className="text-sm text-orange-400 mb-1">Avg Response Time</p>
          <p className="text-2xl font-bold text-orange-400">1.2s</p>
          <p className="text-xs text-orange-300 mt-1">↓ 0.3s from last week</p>
        </div>
      </div>

      {/* Daily Metrics Chart */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
        <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
          Daily Metrics Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" />
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
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="interactions"
              stroke="#10b981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
          <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
            User Growth
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1117",
                  border: "1px solid #1e293b",
                  borderRadius: "0.375rem",
                  color: "#94a3b8",
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
          <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
            Agent Performance
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentPerformance}>
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
              <Bar dataKey="accuracy" fill="#3b82f6" />
              <Bar dataKey="speed" fill="#10b981" />
              <Bar dataKey="satisfaction" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Knowledge Units */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
        <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
          Top Knowledge Units
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--edge)]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--star-3)]">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--star-3)]">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--star-3)]">
                  Shares
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--star-3)]">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--star-3)]">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {topKUs.map((ku, index) => (
                <tr
                  key={index}
                  className="border-b border-[var(--edge)] hover:bg-[var(--sky-2)] transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--star-3)]">
                    {ku.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--star-4)]">
                    {ku.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--star-4)]">
                    {ku.shares.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-yellow-400">★</span> {ku.rating}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-green-400">↑ 12%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
        <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
          Export Data
        </h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] font-medium hover:bg-[var(--sky-3)] transition-colors text-sm">
            📊 Export as CSV
          </button>
          <button className="px-4 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] font-medium hover:bg-[var(--sky-3)] transition-colors text-sm">
            📄 Export as PDF
          </button>
          <button className="px-4 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] font-medium hover:bg-[var(--sky-3)] transition-colors text-sm">
            📧 Email Report
          </button>
          <button className="px-4 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] font-medium hover:bg-[var(--sky-3)] transition-colors text-sm">
            🔄 Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
}
