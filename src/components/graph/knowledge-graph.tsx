"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { KUNode, type KUNodeData } from "@/components/graph/ku-node";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const nodeTypes: NodeTypes = { ku: KUNode };

type GraphKU = {
  id: string;
  title: string;
  status: "draft" | "proposed" | "approved" | "archived";
  trust_score: number;
  version: number;
  domain_id: string;
  domainName: string;
};

type GraphDependency = {
  source_ku_id: string;
  target_ku_id: string;
};

type GraphDomain = {
  id: string;
  name: string;
};

const statusColor: Record<string, string> = {
  approved: "#10b981",
  proposed: "#f59e0b",
  draft: "#a1a1aa",
  archived: "#ef4444",
};

function buildLayout(
  kus: GraphKU[],
  domains: GraphDomain[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const columnWidth = 280;
  const rowHeight = 90;
  const topPadding = 80;

  domains.forEach((domain, dIdx) => {
    const domainKus = kus.filter((k) => k.domain_id === domain.id);
    const x = dIdx * columnWidth;
    domainKus.forEach((ku, kIdx) => {
      positions[ku.id] = { x, y: topPadding + kIdx * rowHeight };
    });
  });

  // KUs whose domain isn't in the list go to an extra column
  const orphans = kus.filter((k) => !domains.some((d) => d.id === k.domain_id));
  const x = domains.length * columnWidth;
  orphans.forEach((ku, kIdx) => {
    positions[ku.id] = { x, y: topPadding + kIdx * rowHeight };
  });

  return positions;
}

function KnowledgeGraphInner({
  kus,
  dependencies,
  domains,
}: {
  kus: GraphKU[];
  dependencies: GraphDependency[];
  domains: GraphDomain[];
}) {
  const t = useTranslations("graph");
  const ts = useTranslations("status");
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [initialized, setInitialized] = useState(false);

  const layout = useMemo(
    () => buildLayout(kus, domains),
    [kus, domains]
  );

  const filteredKus = useMemo(() => {
    return kus.filter((k) => {
      if (domainFilter !== "all" && k.domain_id !== domainFilter) return false;
      if (statusFilter !== "all" && k.status !== statusFilter) return false;
      if (search && !k.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [kus, search, domainFilter, statusFilter]);

  const filteredIds = useMemo(
    () => new Set(filteredKus.map((k) => k.id)),
    [filteredKus]
  );

  const initialNodes: Node<KUNodeData>[] = useMemo(
    () =>
      kus.map((ku) => ({
        id: ku.id,
        type: "ku",
        position: layout[ku.id] ?? { x: 0, y: 0 },
        data: {
          title: ku.title,
          status: ku.status,
          domain: ku.domainName,
          trustScore: ku.trust_score,
          version: ku.version,
          kuId: ku.id,
        },
      })),
    [kus, layout]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      dependencies.map((d, i) => ({
        id: `e-${d.source_ku_id}-${d.target_ku_id}-${i}`,
        source: d.source_ku_id,
        target: d.target_ku_id,
        animated: true,
        style: { stroke: "var(--muted-foreground)" },
      })),
    [dependencies]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    if (!initialized) setInitialized(true);
  }, [initialNodes, initialEdges, setNodes, setEdges, initialized]);

  const visibleNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        hidden: !filteredIds.has(n.id),
      })),
    [nodes, filteredIds]
  );

  const visibleEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        hidden: !filteredIds.has(e.source) || !filteredIds.has(e.target),
      })),
    [edges, filteredIds]
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={domainFilter}
          onValueChange={(v) => setDomainFilter(v ?? "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("allDomains")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allDomains")}</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="draft">{ts("draft")}</SelectItem>
            <SelectItem value="proposed">{ts("pending")}</SelectItem>
            <SelectItem value="approved">{ts("verified")}</SelectItem>
            <SelectItem value="archived">{ts("archived")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          {(["approved", "proposed", "draft", "archived"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: statusColor[s] }}
              />
              {ts(s === "proposed" ? "pending" : s === "approved" ? "verified" : s)}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[min(70vh,640px)] min-h-[360px] w-full overflow-hidden rounded-lg border bg-card">
        {filteredKus.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("noMatch")}
          </div>
        ) : (
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} />
            <Controls />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) =>
                statusColor[(n.data as KUNodeData).status] ?? "#94a3b8"
              }
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

export function KnowledgeGraph({
  kus,
  dependencies,
  domains,
}: {
  kus: GraphKU[];
  dependencies: GraphDependency[];
  domains: GraphDomain[];
}) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner
        kus={kus}
        dependencies={dependencies}
        domains={domains}
      />
    </ReactFlowProvider>
  );
}
