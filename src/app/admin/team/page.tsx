"use client";

import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  joinedDate: string;
  avatar: string;
}

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const team: TeamMember[] = [
    {
      id: "1",
      name: "Rodrigo García",
      email: "rg.aviaga@gmail.com",
      role: "Admin",
      department: "Leadership",
      status: "active",
      joinedDate: "2024-01-01",
      avatar: "👨‍💼",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Lead Engineer",
      department: "Engineering",
      status: "active",
      joinedDate: "2024-01-10",
      avatar: "👩‍💻",
    },
    {
      id: "3",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Product Manager",
      department: "Product",
      status: "active",
      joinedDate: "2024-02-01",
      avatar: "👨‍💼",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      role: "Designer",
      department: "Design",
      status: "active",
      joinedDate: "2024-02-15",
      avatar: "👩‍🎨",
    },
    {
      id: "5",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "DevOps Engineer",
      department: "Engineering",
      status: "active",
      joinedDate: "2024-01-20",
      avatar: "👨‍💻",
    },
    {
      id: "6",
      name: "Emily Brown",
      email: "emily.brown@example.com",
      role: "Support Manager",
      department: "Support",
      status: "inactive",
      joinedDate: "2023-12-01",
      avatar: "👩‍💼",
    },
  ];

  const filteredTeam = team.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      departmentFilter === "all" || member.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = ["all", "Leadership", "Engineering", "Product", "Design", "Support"];

  const getRoleColor = (role: string) => {
    if (role.includes("Admin")) return "bg-red-500/20 text-red-400";
    if (role.includes("Lead") || role.includes("Manager"))
      return "bg-purple-500/20 text-purple-400";
    if (role.includes("Engineer")) return "bg-blue-500/20 text-blue-400";
    return "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">Team</h1>
          <p className="text-[var(--star-4)] mt-1">Manage team members and roles</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">
          Invite Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <p className="text-sm text-[var(--star-4)] mb-1">Total Members</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">6</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">5</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400 mb-1">Departments</p>
          <p className="text-2xl font-bold text-blue-400">5</p>
        </div>
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <p className="text-sm text-[var(--star-4)] mb-1">Avg Tenure</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">1.5m</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member) => (
          <div
            key={member.id}
            className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6 space-y-4 hover:border-[#3b82f6]/50 transition-colors"
          >
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--sky-3)] flex items-center justify-center text-2xl">
                {member.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--star-1)]">
                  {member.name}
                </h3>
                <p className="text-xs text-[var(--star-4)]">{member.email}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>

            {/* Role and Department */}
            <div className="space-y-2 border-t border-[var(--edge)] pt-4">
              <div>
                <p className="text-xs text-[var(--star-4)]">Role</p>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--star-4)]">Department</p>
                <p className="text-sm font-medium text-[var(--star-3)]">
                  {member.department}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--star-4)]">Joined</p>
                <p className="text-sm font-medium text-[var(--star-3)]">
                  {member.joinedDate}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-[var(--edge)]">
              <button className="flex-1 px-3 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] font-medium hover:bg-[var(--sky-3)] transition-colors text-sm">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] font-medium hover:bg-[var(--sky-3)] transition-colors text-sm">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roles Overview */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-6">
        <h2 className="text-lg font-bold text-[var(--star-1)] mb-4">
          Roles & Permissions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--edge)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--star-3)]">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--star-3)]">
                  Members
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--star-3)]">
                  Permissions
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--star-3)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { role: "Admin", members: 1, perms: "All" },
                { role: "Lead", members: 1, perms: "Manage, View" },
                { role: "Member", members: 4, perms: "View, Edit" },
              ].map((row) => (
                <tr
                  key={row.role}
                  className="border-b border-[var(--edge)] hover:bg-[var(--sky-2)] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[var(--star-3)]">
                    {row.role}
                  </td>
                  <td className="px-4 py-3 text-[var(--star-4)]">{row.members}</td>
                  <td className="px-4 py-3 text-[var(--star-4)]">{row.perms}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#3b82f6] hover:text-[#2563eb] text-sm">
                      Edit
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
