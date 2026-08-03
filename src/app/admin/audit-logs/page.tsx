"use client";

import { useEffect, useState } from "react";

interface ActivityLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

interface ApiResponse {
  data: ActivityLog[];
  count: number;
  limit: number;
  offset: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/audit-logs?limit=100&offset=0");
      const result: ApiResponse = await response.json();
      setLogs(result.data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-500/20 text-green-400";
    if (action.includes("update")) return "bg-blue-500/20 text-blue-400";
    if (action.includes("delete")) return "bg-red-500/20 text-red-400";
    if (action.includes("approve")) return "bg-purple-500/20 text-purple-400";
    return "bg-gray-500/20 text-gray-400";
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "project":
        return "📁";
      case "knowledge_unit":
        return "📚";
      case "agent":
        return "🤖";
      case "user":
        return "👤";
      default:
        return "📌";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[var(--star-1)]">Audit Logs</h1>
        <p className="text-[#64748b] mt-1">Track all system activities and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm text-green-400 mb-1">Total Activities</p>
          <p className="text-2xl font-bold text-green-400">{logs.length}</p>
        </div>
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <p className="text-sm text-blue-400 mb-1">Creates</p>
          <p className="text-2xl font-bold text-blue-400">
            {logs.filter((l) => l.action_type.includes("create")).length}
          </p>
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
          <p className="text-sm text-purple-400 mb-1">Updates</p>
          <p className="text-2xl font-bold text-purple-400">
            {logs.filter((l) => l.action_type.includes("update")).length}
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-lg border border-[#1e293b] bg-[#0f1117] overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-[var(--star-1)] mb-6">Activity Timeline</h2>

          {loading ? (
            <p className="text-center text-[#64748b]">Loading activity logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-[#64748b]">No activity logs found</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 pb-4 border-b border-[#1e293b] last:border-b-0"
                >
                  {/* Timeline dot */}
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b] text-lg">
                      {getEntityIcon(log.entity_type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#94a3b8]">
                          {log.entity_title}
                        </p>
                        <p className="text-xs text-[#64748b] mt-1">
                          {log.description || `${log.action_type} on ${log.entity_type}`}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getActionColor(log.action_type)}`}
                      >
                        {log.action_type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] mt-2">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
