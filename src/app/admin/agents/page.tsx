export default function AdminAgentsPage() {
  const agents = [
    { id: 1, name: "Support Bot", type: "Customer Support", status: "active", model: "Claude 3.5 Sonnet", users: 234, createdDate: "2025-01-10" },
    { id: 2, name: "Content Generator", type: "Content Creation", status: "active", model: "Claude 3.5 Sonnet", users: 156, createdDate: "2025-01-15" },
    { id: 3, name: "Data Analyzer", type: "Analytics", status: "paused", model: "Claude 3.5 Sonnet", users: 89, createdDate: "2025-02-01" },
    { id: 4, name: "Code Assistant", type: "Development", status: "active", model: "Claude 3.5 Sonnet", users: 412, createdDate: "2025-02-10" },
    { id: 5, name: "HR Assistant", type: "HR & Recruitment", status: "inactive", model: "Claude 3.5 Sonnet", users: 0, createdDate: "2025-02-20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--star-1)]">Agents</h2>
          <p className="text-[#64748b] mt-1">
            Manage and monitor AI agents
          </p>
        </div>
        <a
          href="/admin/agents/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
        >
          🤖 Create Agent
        </a>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">🔍</span>
          <input
            type="search"
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
        </div>
        <select className="px-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
          <option value="">All Types</option>
          <option value="support">Customer Support</option>
          <option value="content">Content Creation</option>
          <option value="analytics">Analytics</option>
          <option value="dev">Development</option>
          <option value="hr">HR & Recruitment</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Agents Table */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#07090e]">
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Agent Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Model</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Users</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-[#1e293b] hover:bg-[#07090e] transition-colors">
                  <td className="px-6 py-3 text-sm text-[#94a3b8] font-medium">{agent.name}</td>
                  <td className="px-6 py-3 text-sm text-[#64748b]">{agent.type}</td>
                  <td className="px-6 py-3 text-sm text-[#64748b]">{agent.model}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      agent.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#94a3b8]">{agent.users}</td>
                  <td className="px-6 py-3 text-sm text-[#64748b]">{agent.createdDate}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-[#64748b] hover:text-[#3b82f6] hover:bg-[#1e293b] rounded transition-colors" title="View">
                        👁️
                      </button>
                      <button className="p-1 text-[#64748b] hover:text-[#3b82f6] hover:bg-[#1e293b] rounded transition-colors" title="Edit">
                        ✏️
                      </button>
                      <button className="p-1 text-[#64748b] hover:text-red-400 hover:bg-[#1e293b] rounded transition-colors" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#1e293b] flex items-center justify-between">
          <p className="text-sm text-[#64748b]">
            Showing 5 of 47 agents
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm">
              Previous
            </button>
            <button className="px-3 py-1 rounded bg-[#3b82f6] text-white text-sm">
              1
            </button>
            <button className="px-3 py-1 rounded border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm">
              2
            </button>
            <button className="px-3 py-1 rounded border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Agent Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
          <p className="text-sm text-[#64748b] mb-2">Active Agents</p>
          <p className="text-2xl font-bold text-[var(--star-1)]">3</p>
          <p className="text-xs text-green-400 mt-1">60% of total</p>
        </div>
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
          <p className="text-sm text-[#64748b] mb-2">Total Users</p>
          <p className="text-2xl font-bold text-[var(--star-1)]">891</p>
          <p className="text-xs text-[#64748b] mt-1">Across all agents</p>
        </div>
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6">
          <p className="text-sm text-[#64748b] mb-2">Avg Response Time</p>
          <p className="text-2xl font-bold text-[var(--star-1)]">1.2s</p>
          <p className="text-xs text-green-400 mt-1">↓ 15% from last week</p>
        </div>
      </div>
    </div>
  );
}
