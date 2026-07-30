"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MiniMap,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";

interface KnowledgeUnitNode {
  id: string;
  title: string;
  version: number;
  trust_score: number;
  domain_id: string;
  domainName: string;
  status: "draft" | "proposed" | "approved" | "archived";
}

interface Domain {
  id: string;
  name: string;
}

interface Dependency {
  source_ku_id: string;
  target_ku_id: string;
}

const STATUS: Record<
  string,
  { color: string; ring: string; label: string; mini: string }
> = {
  approved: { color: "var(--verified)", ring: "rgb(52 211 153 / 0.5)", label: "verified", mini: "#34d399" },
  proposed: { color: "var(--pending)", ring: "rgb(251 191 36 / 0.5)", label: "proposed", mini: "#fbbf24" },
  draft: { color: "var(--star-3)", ring: "var(--edge-strong)", label: "draft", mini: "#93a4c4" },
  archived: { color: "var(--star-4)", ring: "var(--edge)", label: "archived", mini: "#5b6478" },
};

const KUNode = ({
  data,
}: {
  data: {
    label: string;
    status: string;
    trustScore: number;
    domain: string;
  };
}) => {
  const s = STATUS[data.status] ?? STATUS.draft;
  return (
    <div
      className="w-52 rounded-[14px] border bg-[var(--sky-2)] px-4 py-3 shadow-[0_10px_30px_-14px_rgb(0_0_0_/_0.8)]"
      style={{ borderColor: s.ring }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "var(--azure)", width: 8, height: 8, border: "none" }}
      />

      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ background: s.color, boxShadow: `0 0 0 3px color-mix(in srgb, ${s.color} 20%, transparent)` }}
          />
          <p className="truncate text-sm font-semibold text-[var(--star-1)]">
            {data.label}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] font-medium uppercase tracking-wide"
            style={{ color: s.color }}
          >
            {s.label}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-[var(--sky-3)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--azure)]">
            <Icon name="sparkle" size={11} />
            {data.trustScore}
          </span>
        </div>
        <p className="font-mono text-[11px] text-[var(--star-3)]">{data.domain}</p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "var(--azure)", width: 8, height: 8, border: "none" }}
      />
    </div>
  );
};

export const KnowledgeGraphFlow = ({
  kus,
  dependencies,
  domains,
}: {
  kus: KnowledgeUnitNode[];
  dependencies: Dependency[];
  domains: Domain[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredKUs = useMemo(() => {
    return kus.filter((ku) => {
      const matchesSearch = ku.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDomain = filterDomain === "all" || ku.domain_id === filterDomain;
      const matchesStatus = filterStatus === "all" || ku.status === filterStatus;
      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [kus, searchTerm, filterDomain, filterStatus]);

  const filteredKUIds = useMemo(
    () => new Set(filteredKUs.map((ku) => ku.id)),
    [filteredKUs]
  );

  const nodes: Node[] = useMemo(() => {
    return filteredKUs.map((ku, idx) => ({
      id: ku.id,
      data: {
        label: ku.title,
        status: ku.status,
        trustScore: ku.trust_score,
        domain: ku.domainName,
      },
      position: {
        x: (idx % 5) * 300,
        y: Math.floor(idx / 5) * 210,
      },
      type: "custom",
    }));
  }, [filteredKUs]);

  const edges: Edge[] = useMemo(() => {
    return dependencies
      .filter(
        (dep) =>
          filteredKUIds.has(dep.source_ku_id) &&
          filteredKUIds.has(dep.target_ku_id)
      )
      .map((dep, idx) => ({
        id: `edge-${idx}`,
        source: dep.source_ku_id,
        target: dep.target_ku_id,
        animated: true,
        style: { stroke: "rgb(91 155 255 / 0.55)", strokeWidth: 1.5 },
      }));
  }, [dependencies, filteredKUIds]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const nodeTypes = useMemo(() => ({ custom: KUNode }), []);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Toolbar */}
      <div className="space-y-3 border-b border-[var(--edge)] bg-[var(--sky-2)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--star-4)]">
              <Icon name="search" size={15} />
            </span>
            <Input
              placeholder="Buscar KUs…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="h-9 rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 text-sm text-[var(--star-2)]"
          >
            <option value="all">Todos los dominios</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-[10px] border border-[var(--edge)] bg-[var(--sky-3)] px-3 text-sm text-[var(--star-2)]"
          >
            <option value="all">Todos los estados</option>
            <option value="approved">Verified</option>
            <option value="proposed">Proposed</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <Link
            href="/knowledge/new"
            className="ml-auto inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--azure)] px-4 py-2 text-sm font-medium text-[var(--azure-ink)] transition-colors hover:bg-[var(--azure-bright)]"
          >
            <Icon name="plus" size={16} strokeWidth={2.2} />
            Nuevo KU
          </Link>
        </div>

        <div className="font-mono text-xs text-[var(--star-3)]">
          {filteredKUs.length} / {kus.length} Knowledge Units
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 bg-[var(--sky-1)]">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="rgb(120 140 190 / 0.18)"
          />
          <Controls className="!border !border-[var(--edge)] !bg-[var(--sky-2)] !shadow-none [&_button]:!border-[var(--edge)] [&_button]:!bg-[var(--sky-3)] [&_button]:!fill-[var(--star-2)] [&_button:hover]:!bg-[var(--sky-4)]" />
          <MiniMap
            className="!bg-[var(--sky-2)]"
            style={{ border: "1px solid var(--edge)", borderRadius: 12 }}
            nodeColor={(node) => STATUS[node.data?.status as string]?.mini ?? "#5b6478"}
            nodeStrokeWidth={0}
            maskColor="rgb(8 11 18 / 0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
