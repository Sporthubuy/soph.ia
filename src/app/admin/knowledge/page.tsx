"use client";

import { useEffect, useState } from "react";

interface KnowledgeUnit {
  id: string;
  title: string;
  domain: string;
  owner_id: string;
  status: "draft" | "proposed" | "approved" | "archived";
  trust_score?: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: KnowledgeUnit[];
  count: number;
  limit: number;
  offset: number;
}

export default function KnowledgePage() {
  const [data, setData] = useState<KnowledgeUnit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchKnowledge();
  }, [searchTerm, statusFilter, domainFilter, offset]);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(domainFilter !== "all" && { domain: domainFilter }),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/admin/knowledge?${params}`);
      const result: ApiResponse = await response.json();
      setData(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error("Error fetching knowledge units:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getTrustScoreColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const handleStatusChange = async (kuId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/knowledge/${kuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchKnowledge();
    } catch (error) {
      console.error("Error updating KU status:", error);
    }
  };

  const handleDelete = async (kuId: string) => {
    if (!confirm("Are you sure you want to delete this KU?")) return;
    try {
      await fetch(`/api/admin/knowledge/${kuId}`, { method: "DELETE" });
      fetchKnowledge();
    } catch (error) {
      console.error("Error deleting KU:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--star-1)]">
            Knowledge Units
          </h1>
          <p className="text-[var(--star-4)] mt-1">
            Manage and review knowledge across domains
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#2563eb] transition-colors">
          Create KU
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-4">
          <p className="text-sm text-[var(--star-4)] mb-1">Total KUs</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">
            {data.filter((k) => k.status === "approved").length}
          </p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-400 mb-1">Proposed</p>
          <p className="text-2xl font-bold text-yellow-400">
            {data.filter((k) => k.status === "proposed").length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-500/30 bg-gray-500/5 p-4">
          <p className="text-sm text-gray-400 mb-1">Draft</p>
          <p className="text-2xl font-bold text-gray-400">
            {data.filter((k) => k.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="proposed">Proposed</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--star-3)] mb-2">
              Domain
            </label>
            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] text-[var(--star-3)] focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="all">All Domains</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="product">Product</option>
              <option value="operations">Operations</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--edge)] bg-[var(--sky-1)]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Domain
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Trust Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Updated
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--star-3)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-[var(--star-4)]">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-[var(--star-4)]">
                    No knowledge units found
                  </td>
                </tr>
              ) : (
                data.map((ku) => (
                  <tr
                    key={ku.id}
                    className="border-b border-[var(--edge)] hover:bg-[var(--sky-2)] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--star-3)]">
                      {ku.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--star-4)]">
                      {ku.domain}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={ku.status}
                        onChange={(e) => handleStatusChange(ku.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 bg-transparent cursor-pointer ${getStatusColor(ku.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="proposed">Proposed</option>
                        <option value="approved">Approved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold ${getTrustScoreColor(ku.trust_score)}`}>
                      {ku.trust_score || 0}%
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--star-4)]">
                      {new Date(ku.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="text-[#3b82f6] hover:text-[#2563eb] transition-colors">
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(ku.id)}
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
        <p className="text-sm text-[var(--star-4)]">
          Showing {Math.min(offset + limit, totalCount)} of {totalCount} knowledge units
        </p>
        <div className="space-x-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-3 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] hover:bg-[var(--sky-3)] transition-colors text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= totalCount}
            className="px-3 py-2 rounded-lg border border-[var(--edge)] text-[var(--star-3)] hover:bg-[var(--sky-3)] transition-colors text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
