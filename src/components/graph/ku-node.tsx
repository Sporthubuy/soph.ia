"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { Handle, Position } from "@xyflow/react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";

export type KUNodeData = {
  title: string;
  status: "draft" | "proposed" | "approved" | "archived";
  domain: string;
  trustScore: number;
  version: number;
  kuId: string;
};

const statusColor: Record<KUNodeData["status"], string> = {
  approved: "border-[rgb(52_211_153_/_0.5)] bg-[rgb(52_211_153_/_0.12)] ring-[rgb(52_211_153_/_0.3)]",
  proposed: "border-[rgb(251_191_36_/_0.5)] bg-[rgb(251_191_36_/_0.12)] ring-[rgb(251_191_36_/_0.3)]",
  draft: "border-[var(--edge-strong)] bg-[var(--sky-3)] dark:bg-[var(--sky-3)] ring-[var(--edge-strong)]",
  archived: "border-[rgb(251_106_104_/_0.5)] bg-[rgb(251_106_104_/_0.12)] ring-[rgb(251_106_104_/_0.3)]",
};

const statusDot: Record<KUNodeData["status"], string> = {
  approved: "bg-[var(--verified)]",
  proposed: "bg-[var(--pending)]",
  draft: "bg-[var(--star-4)]",
  archived: "bg-[var(--danger)]",
};

function KUNodeBase({ data }: { data: KUNodeData }) {
  const ts = useTranslations("status");

  return (
    <div
      className={`group relative w-56 rounded-md border px-3 py-2 shadow-sm ring-1 ring-inset transition-shadow hover:shadow-md ${statusColor[data.status]}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !bg-[var(--star-4)]"
      />
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${statusDot[data.status]}`}
        />
        <Badge variant="outline" className="text-[10px] font-normal">
          {ts(data.status)}
        </Badge>
      </div>
      <Link
        href={`/knowledge/${data.kuId}`}
        className="block truncate text-sm font-medium hover:underline"
        title={data.title}
      >
        {data.title}
      </Link>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{data.domain}</span>
        <span className="tabular-nums">v{data.version}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !bg-[var(--star-4)]"
      />
    </div>
  );
}

export const KUNode = memo(KUNodeBase);
