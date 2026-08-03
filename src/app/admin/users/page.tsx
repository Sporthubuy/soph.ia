import { Icon } from "@/components/shared/icon";
import { Link } from "next/link";

export default async function AdminUsersPage() {
  // TODO: Fetch real users from database
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "active", joinDate: "2025-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor", status: "active", joinDate: "2025-02-20" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Viewer", status: "inactive", joinDate: "2025-03-10" },
    { id: 4, name: "Alice Williams", email: "alice@example.com", role: "Editor", status: "active", joinDate: "2025-03-25" },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com", role: "Viewer", status: "active", joinDate: "2025-04-05" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--star-1)]">Users</h2>
          <p className="text-[#64748b] mt-1">
            Manage platform users and permissions
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
        >
          <Icon name="plus" size={18} />
          Add User
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon
            name="search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
          />
          <input
            type="search"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
        </div>
        <select className="px-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#07090e]">
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Join Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#94a3b8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#1e293b] hover:bg-[#07090e] transition-colors">
                  <td className="px-6 py-3 text-sm text-[#94a3b8]">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-[#64748b]">{user.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3b82f6]/20 text-[#3b82f6]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-[#94a3b8] capitalize">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#64748b]">{user.joinDate}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-[#64748b] hover:text-[#3b82f6] hover:bg-[#1e293b] rounded transition-colors">
                        <Icon name="edit" size={16} />
                      </button>
                      <button className="p-1 text-[#64748b] hover:text-red-400 hover:bg-[#1e293b] rounded transition-colors">
                        <Icon name="delete" size={16} />
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
            Showing 5 of 1,284 users
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
    </div>
  );
}
