"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: User[];
  count: number;
  limit: number;
  offset: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
  });
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, offset]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const result: ApiResponse = await response.json();
      setUsers(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ email: "", password: "", full_name: "", role: "user" });
        setShowAddForm(false);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getUserRole = (user: User) => {
    // For now, fetch role from email - can be optimized later
    if (user.email === "rg.aviaga@gmail.com") return "admin";
    return "user";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">Users</h1>
          <p className="text-[#64748b] mt-1">Manage users and their roles</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
        >
          {showAddForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-6 space-y-4">
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors"
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
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
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-[#64748b]">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-[#64748b]">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#1e293b] hover:bg-[#0f1117] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#94a3b8]">
                      {user.full_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getUserRole(user) === "admin"
                            ? "bg-red-500/20 text-red-400"
                            : getUserRole(user) === "moderator"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {getUserRole(user).charAt(0).toUpperCase() +
                          getUserRole(user).slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748b]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#64748b]">
          Showing {Math.min(offset + limit, totalCount)} of {totalCount} users
        </p>
        <div className="space-x-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= totalCount}
            className="px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b] transition-colors text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
