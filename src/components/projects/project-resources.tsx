"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import {
  addKnowledgeUnitToProject,
  removeKnowledgeUnitFromProject,
  addAgentToProject,
  removeAgentFromProject,
} from "@/lib/projects/actions";

interface LinkedKU {
  linkId: string;
  id: string;
  title: string;
  status: string;
  trust_score: number | null;
  version: number | null;
  domain: string;
}

interface LinkedAgent {
  linkId: string;
  id: string;
  name: string;
  description: string | null;
  status: string;
  model: string;
}

interface KUCandidate {
  id: string;
  title: string;
  status: string;
  domain: string;
}

interface AgentCandidate {
  id: string;
  name: string;
  status: string;
}

const KU_STATUS_STYLES: Record<string, string> = {
  approved: "bg-[rgb(16_185_129_/_0.12)] text-[var(--verified)] border-[rgb(16_185_129_/_0.28)]",
  proposed: "bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)] border-[rgb(59_130_246_/_0.28)]",
  draft: "bg-[rgb(245_158_11_/_0.12)] text-[var(--pending)] border-[rgb(245_158_11_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

const AGENT_STATUS_STYLES: Record<string, string> = {
  deployed: "bg-[rgb(16_185_129_/_0.12)] text-[var(--verified)] border-[rgb(16_185_129_/_0.28)]",
  draft: "bg-[rgb(245_158_11_/_0.12)] text-[var(--pending)] border-[rgb(245_158_11_/_0.28)]",
  paused: "bg-[rgb(245_158_11_/_0.12)] text-[var(--pending)] border-[rgb(245_158_11_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

const AGENT_STATUS_LABELS: Record<string, string> = {
  deployed: "Desplegado",
  draft: "Borrador",
  paused: "En pausa",
  archived: "Archivado",
};

/** Knowledge Units que sostienen el proyecto, agrupadas por dominio. */
export const ProjectKnowledge = ({
  projectId,
  knowledgeUnits,
  candidates,
  canManage,
}: {
  projectId: string;
  knowledgeUnits: LinkedKU[];
  candidates: KUCandidate[];
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; success?: true }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  // Agrupar por dominio responde a "que KU va a tener sobre que temas".
  const byDomain = knowledgeUnits.reduce<Record<string, LinkedKU[]>>((acc, ku) => {
    (acc[ku.domain] ??= []).push(ku);
    return acc;
  }, {});
  const domains = Object.keys(byDomain).sort();

  return (
    <section className="panel p-6 space-y-4">
      <h2 className="section-heading">
        CONOCIMIENTO ({knowledgeUnits.length} KNOWLEDGE UNIT
        {knowledgeUnits.length === 1 ? "" : "S"}
        {domains.length > 0 && ` · ${domains.length} TEMA${domains.length === 1 ? "" : "S"}`})
      </h2>

      {knowledgeUnits.length === 0 ? (
        <p className="body-md text-[#64748b]">
          Este proyecto todavia no tiene conocimiento asociado.
        </p>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div key={domain} className="space-y-2">
              <p className="label-sm text-[#64748b]">{domain.toUpperCase()}</p>
              <ul className="space-y-2">
                {byDomain[domain].map((ku) => (
                  <li
                    key={ku.linkId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#1e293b] flex-wrap"
                  >
                    <Icon name="knowledge" size={18} className="text-[#3b82f6]" />
                    <Link
                      href={`/knowledge/${ku.id}`}
                      className="body-md text-[var(--star-1)] flex-1 min-w-0 truncate hover:underline"
                    >
                      {ku.title}
                    </Link>
                    <span
                      className={`label-sm px-2 py-1 rounded border ${
                        KU_STATUS_STYLES[ku.status] ?? KU_STATUS_STYLES.archived
                      }`}
                    >
                      {ku.status.charAt(0).toUpperCase() + ku.status.slice(1)}
                    </span>
                    <span className="body-sm text-[#64748b]">
                      Trust {ku.trust_score ?? 0}%
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          run(() =>
                            removeKnowledgeUnitFromProject(projectId, ku.linkId)
                          )
                        }
                        aria-label={`Quitar ${ku.title} del proyecto`}
                        className="label-sm px-2 py-1.5 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] transition-colors disabled:opacity-50"
                      >
                        Quitar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {canManage && <KnowledgeUnitAdder projectId={projectId} candidates={candidates} isPending={isPending} run={run} />}

      {error && (
        <p role="alert" className="body-sm text-[var(--danger)]">
          {error}
        </p>
      )}
    </section>
  );
};

/** Agentes que consumen el conocimiento del proyecto. */
export const ProjectAgents = ({
  projectId,
  agents,
  candidates,
  canManage,
}: {
  projectId: string;
  agents: LinkedAgent[];
  candidates: AgentCandidate[];
  canManage: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; success?: true }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <section className="panel p-6 space-y-4">
      <h2 className="section-heading">
        AGENTES ({agents.length})
      </h2>

      {agents.length === 0 ? (
        <p className="body-md text-[#64748b]">
          Este proyecto todavia no integra ningun agente.
        </p>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li
              key={agent.linkId}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#1e293b] flex-wrap"
            >
              <Icon name="agents" size={18} className="text-[#3b82f6]" />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/agents/${agent.id}`}
                  className="body-md text-[var(--star-1)] hover:underline"
                >
                  {agent.name}
                </Link>
                <p className="body-sm text-[#64748b] truncate">{agent.model}</p>
              </div>
              <span
                className={`label-sm px-2 py-1 rounded border ${
                  AGENT_STATUS_STYLES[agent.status] ?? AGENT_STATUS_STYLES.archived
                }`}
              >
                {AGENT_STATUS_LABELS[agent.status] ?? agent.status}
              </span>
              {canManage && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    run(() => removeAgentFromProject(projectId, agent.linkId))
                  }
                  aria-label={`Quitar ${agent.name} del proyecto`}
                  className="label-sm px-2 py-1.5 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] transition-colors disabled:opacity-50"
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && <AgentAdder projectId={projectId} candidates={candidates} isPending={isPending} run={run} />}

      {error && (
        <p role="alert" className="body-sm text-[var(--danger)]">
          {error}
        </p>
      )}
    </section>
  );
};

interface KnowledgeUnitAdderProps {
  projectId: string;
  candidates: KUCandidate[];
  isPending: boolean;
  run: (fn: () => Promise<{ error?: string; success?: true }>) => void;
}

const KnowledgeUnitAdder = ({ projectId, candidates, isPending, run }: KnowledgeUnitAdderProps) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (ku) =>
        ku.title.toLowerCase().includes(q) ||
        ku.domain.toLowerCase().includes(q)
    );
  }, [search, candidates]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    run(async () => {
      for (const id of ids) {
        const result = await addKnowledgeUnitToProject(projectId, id);
        if (result?.error) return result;
      }
      return { success: true };
    });
  };

  if (candidates.length === 0) {
    return (
      <div className="space-y-2 pt-1">
        <label className="label-sm text-[#64748b]">AGREGAR KNOWLEDGE UNIT</label>
        <p className="body-sm text-[#64748b]">
          No quedan Knowledge Units disponibles para agregar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-1">
      <label className="label-sm text-[#64748b]">AGREGAR KNOWLEDGE UNIT</label>
      <input
        type="text"
        placeholder="Buscar Knowledge Unit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full body-sm border border-[#1e293b] rounded-lg px-3 py-2.5 bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
      />
      <div className="space-y-2 max-h-64 overflow-y-auto border border-[#1e293b] rounded-lg p-3 bg-[#07090e]">
        {filtered.slice(0, 5).map((ku) => (
          <label key={ku.id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--sky-2)] p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={selectedIds.has(ku.id)}
              onChange={() => handleToggle(ku.id)}
              disabled={isPending}
              className="w-4 h-4 rounded border-[#1e293b] text-[#3b82f6] focus:ring-[#3b82f6]"
            />
            <span className="flex-1 min-w-0">
              <p className="body-sm text-[var(--star-1)] truncate">{ku.title}</p>
              <p className="label-xs text-[#64748b]">{ku.domain}</p>
            </span>
          </label>
        ))}
        {filtered.length > 5 && (
          <p className="label-xs text-[#64748b] text-center py-2">
            Mostrando 5 de {filtered.length} resultados
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending || selectedIds.size === 0}
        onClick={handleAddSelected}
        className="w-full body-sm px-3 py-2.5 rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Agregar seleccionadas ({selectedIds.size})
      </button>
    </div>
  );
};

interface AgentAdderProps {
  projectId: string;
  candidates: AgentCandidate[];
  isPending: boolean;
  run: (fn: () => Promise<{ error?: string; success?: true }>) => void;
}

const AgentAdder = ({ projectId, candidates, isPending, run }: AgentAdderProps) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((a) => a.name.toLowerCase().includes(q));
  }, [search, candidates]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    run(async () => {
      for (const id of ids) {
        const result = await addAgentToProject(projectId, id);
        if (result?.error) return result;
      }
      return { success: true };
    });
  };

  if (candidates.length === 0) {
    return (
      <div className="space-y-2 pt-1">
        <label className="label-sm text-[#64748b]">INTEGRAR AGENTE</label>
        <p className="body-sm text-[#64748b]">
          No quedan agentes disponibles para integrar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-1">
      <label className="label-sm text-[#64748b]">INTEGRAR AGENTE</label>
      <input
        type="text"
        placeholder="Buscar agente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full body-sm border border-[#1e293b] rounded-lg px-3 py-2.5 bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
      />
      <div className="space-y-2 max-h-64 overflow-y-auto border border-[#1e293b] rounded-lg p-3 bg-[#07090e]">
        {filtered.slice(0, 5).map((agent) => (
          <label key={agent.id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--sky-2)] p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={selectedIds.has(agent.id)}
              onChange={() => handleToggle(agent.id)}
              disabled={isPending}
              className="w-4 h-4 rounded border-[#1e293b] text-[#3b82f6] focus:ring-[#3b82f6]"
            />
            <span className="flex-1 min-w-0">
              <p className="body-sm text-[var(--star-1)]">{agent.name}</p>
            </span>
          </label>
        ))}
        {filtered.length > 5 && (
          <p className="label-xs text-[#64748b] text-center py-2">
            Mostrando 5 de {filtered.length} resultados
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending || selectedIds.size === 0}
        onClick={handleAddSelected}
        className="w-full body-sm px-3 py-2.5 rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] font-medium hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Agregar seleccionados ({selectedIds.size})
      </button>
    </div>
  );
};
