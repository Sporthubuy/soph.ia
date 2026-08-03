import { Icon } from "@/components/shared/icon";
import { Link } from "next/link";

export default async function AdminDashboardPage() {
  // TODO: Fetch real statistics from database
  const stats = [
    { label: "Total Users", value: "1,284", icon: "people", color: "bg-blue-500/20", textColor: "text-blue-400" },
    { label: "Knowledge Units", value: "856", icon: "knowledge", color: "bg-green-500/20", textColor: "text-green-400" },
    { label: "Active Agents", value: "42", icon: "agents", color: "bg-purple-500/20", textColor: "text-purple-400" },
    { label: "Projects", value: "28", icon: "folder", color: "bg-orange-500/20", textColor: "text-orange-400" },
  ];

  const recentActivity = [
    { id: 1, action: "New user registered", details: "john.doe@example.com", time: "2 hours ago", type: "user" },
    { id: 2, action: "KU approved", details: "Sales Strategy Q4", time: "5 hours ago", type: "knowledge" },
    { id: 3, action: "Agent deployed", details: "Support Bot v2.1", time: "1 day ago", type: "agent" },
    { id: 4, action: "Project created", details: "Marketing Automation", time: "2 days ago", type: "project" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[var(--star-1)]">Welcome back</h2>
        <p className="text-[#64748b] mt-1">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#64748b]">{stat.label}</p>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <Icon
                  name={stat.icon as any}
                  size={20}
                  className={stat.textColor}
                />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--star-1)]">
              {stat.value}
            </p>
            <p className="text-xs text-[#64748b]">+12% from last month</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--star-1)]">
              Recent Activity
            </h3>
            <Link
              href="/admin/analytics"
              className="text-sm text-[#3b82f6] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1e293b] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center">
                    <Icon name={activity.type as any} size={18} className="text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#94a3b8]">
                      {activity.action}
                    </p>
                    <p className="text-xs text-[#64748b]">
                      {activity.details}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#64748b]">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4">
          <h3 className="text-lg font-bold text-[var(--star-1)]">
            Quick Actions
          </h3>

          <div className="space-y-2">
            <Link
              href="/admin/users/new"
              className="block w-full px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors text-center"
            >
              Add User
            </Link>
            <Link
              href="/admin/agents"
              className="block w-full px-4 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-center"
            >
              Configure Agent
            </Link>
            <Link
              href="/admin/settings"
              className="block w-full px-4 py-2.5 rounded-lg border border-[#1e293b] text-[#94a3b8] font-medium hover:bg-[#1e293b] transition-colors text-center"
            >
              System Settings
            </Link>
          </div>

          {/* System Status */}
          <div className="pt-4 border-t border-[#1e293b] space-y-2">
            <p className="text-sm font-medium text-[#94a3b8]">System Status</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[#64748b]">Database</span>
                <span className="ml-auto text-green-400">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[#64748b]">APIs</span>
                <span className="ml-auto text-green-400">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-[#64748b]">Storage</span>
                <span className="ml-auto text-green-400">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
