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
  approved: "border-emerald-500/60 bg-emerald-500/10 ring-emerald-500/30",
  proposed: "border-amber-500/60 bg-amber-500/10 ring-amber-500/30",
  draft: "border-zinc-400/50 bg-zinc-100/40 dark:bg-zinc-800/40 ring-zinc-400/30",
  archived: "border-red-500/60 bg-red-500/10 ring-red-500/30",
};

const statusDot: Record<KUNodeData["status"], string> = {
  approved: "bg-emerald-500",
  proposed: "bg-amber-500",
  draft: "bg-zinc-400",
  archived: "bg-red-500",
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
        className="!h-2 !w-2 !bg-zinc-400"
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
        className="!h-2 !w-2 !bg-zinc-400"
      />
    </div>
  );
}

export const KUNode = memo(KUNodeBase);
