"use client";

import { useState } from "react";

interface KnowledgeUnit {
  id: string;
  title: string;
  domain: string;
  owner: string;
  status: "draft" | "proposed" | "approved" | "archived";
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");

  const knowledge: KnowledgeUnit[] = [
    {
      id: "ku_001",
      title: "Sales Strategy Q4 2024",
      domain: "Sales",
      owner: "john.doe@example.com",
      status: "approved",
      trustScore: 95,
      createdAt: "2024-01-15",
      updatedAt: "2024-02-20",
    },
    {
      id: "ku_002",
      title: "Customer Support Protocols",
      domain: "Support",
      owner: "jane.smith@example.com",
      status: "approved",
      trustScore: 88,
      createdAt: "2024-01-10",
      updatedAt: "2024-02-18",
    },
    {
      id: "ku_003",
      title: "Product Roadmap",
      domain: "Product",
      owner: "john.doe@example.com",
      status: "proposed",
      trustScore: 72,
      createdAt: "2024-02-25",
      updatedAt: "2024-02-28",
    },
    {
      id: "ku_004",
      title: "Internal Process Documentation",
      domain: "Operations",
      owner: "jane.smith@example.com",
      status: "draft",
      trustScore: 45,
      createdAt: "2024-02-28",
      updatedAt: "2024-02-28",
    },
    {
      id: "ku_005",
      title: "Legacy API Specification",
      domain: "Engineering",
      owner: "john.doe@example.com",
      status: "archived",
      trustScore: 60,
      createdAt: "2023-06-01",
      updatedAt: "2024-01-15",
    },
  ];

  const filteredKU = knowledge.filter((ku) => {
    const matchesSearch =
      ku.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ku.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ku.status === statusFilter;
    const matchesDomain =
      domainFilter === "all" || ku.domain === domainFilter;
    return matchesSearch && matchesStatus && matchesDomain;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "proposed":
        return "bg-yellow-500/20 text-yellow-400";
      case "draft":
        return "bg-gray-500/20 text-gray-400";
      case "archived":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">
            Knowledge Units
          </h1>
          <p className="text-[#64748b] mt-1">
            Manage and review knowledge across domains
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">
          Create KU
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] p-4">
          <p className="text-sm text-[#64748b] mb-1">Total KUs</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">3,891</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">2,456</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400 mb-1">Proposed</p>
          <p className="text-2xl font-bold text-yellow-400">312</p>
        </div>
        <div className="rounded-lg border border-gray-500/30 bg-gray-500/5 p-4">
          <p className="text-sm text-gray-400 mb-1">Draft</p>
          <p className="text-2xl font-bold text-gray-400">145</p>
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
              placeholder="Search by title or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
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
              <option value="approved">Approved</option>
              <option value="proposed">Proposed</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
              Domain
            </label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Domains</option>
              <option value="Sales">Sales</option>
              <option value="Support">Support</option>
              <option value="Product">Product</option>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
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
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Domain
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Trust Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Updated
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#94a3b8]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredKU.map((ku) => (
                <tr
                  key={ku.id}
                  className="border-b border-[#1e293b] hover:bg-[#0f1117] transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[#94a3b8]">
                    {ku.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {ku.domain}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {ku.owner}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ku.status)}`}
                    >
                      {ku.status.charAt(0).toUpperCase() + ku.status.slice(1)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold ${getTrustScoreColor(ku.trustScore)}`}>
                    {ku.trustScore}%
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">
                    {ku.updatedAt}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                      View
                    </button>
                    <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                      Edit
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
          Showing {filteredKU.length} of {knowledge.length} knowledge units
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
