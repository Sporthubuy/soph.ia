"use client";

import { useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - Replace with API call
  const users: User[] = [
    {
      id: "1",
      email: "rg.aviaga@gmail.com",
      name: "Rodrigo García",
      role: "admin",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2 hours ago",
    },
    {
      id: "2",
      email: "john.doe@example.com",
      name: "John Doe",
      role: "user",
      status: "active",
      createdAt: "2024-02-20",
      lastLogin: "1 day ago",
    },
    {
      id: "3",
      email: "jane.smith@example.com",
      name: "Jane Smith",
      role: "moderator",
      status: "active",
      createdAt: "2024-01-10",
      lastLogin: "3 hours ago",
    },
    {
      id: "4",
      email: "inactive.user@example.com",
      name: "Inactive User",
      role: "user",
      status: "inactive",
      createdAt: "2023-12-01",
      lastLogin: "30 days ago",
    },
    {
      id: "5",
      email: "suspended@example.com",
      name: "Suspended Account",
      role: "user",
      status: "suspended",
      createdAt: "2024-01-05",
      lastLogin: "60 days ago",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400";
      case "moderator":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-blue-500/20 text-blue-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "inactive":
        return "bg-gray-500/20 text-gray-400";
      case "suspended":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">Users</h1>
          <p className="text-[#64748b] mt-1">
            Manage users and their roles
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Status Filter */}
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
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
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
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#1e293b] hover:bg-[#0f1117] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#94a3b8]">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                      Edit
                    </button>
                    <button className="text-red-400 hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#64748b]">
          Showing {filteredUsers.length} of {users.length} users
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
