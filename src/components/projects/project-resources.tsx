"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  addKnowledgeUnitToProject,
  removeKnowledgeUnitFromProject,
  addAgentToProject,
  removeAgentFromProject,
  createProjectFolder,
  renameProjectFolder,
  deleteProjectFolder,
  setKnowledgeUnitFolder,
  type ProjectFolder,
} from "@/lib/projects/actions";

interface LinkedKU {
  linkId: string;
  id: string;
  title: string;
  status: string;
  trust_score: number | null;
  version: number | null;
  domain: string;
  folderId: string | null;
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


/** Knowledge Units que sostienen el proyecto, organizadas en carpetas (Trello). */
export const ProjectKnowledge = ({
  projectId,
  knowledgeUnits,
  candidates,
  canManage,
  folders,
}: {
  projectId: string;
  knowledgeUnits: LinkedKU[];
  candidates: KUCandidate[];
  canManage: boolean;
  folders: ProjectFolder[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [adderOpen, setAdderOpen] = useState(false);
  const [folderAdderOpen, setFolderAdderOpen] = useState(false);
  const [preselectFolderId, setPreselectFolderId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ linkId: string; from: string | null } | null>(null);

  const run = (fn: () => Promise<{ error?: string; success?: true }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  const handleFolderCreated = (folderId: string) => {
    setFolderAdderOpen(false);
    setAdderOpen(true);
    setPreselectFolderId(folderId);
  };

  const handleQuickAdd = (folderId: string | null) => {
    setPreselectFolderId(folderId);
    setAdderOpen(true);
  };

  const handleDrop = (folderId: string | null) => {
    if (!dragging) return;
    const { linkId, from } = dragging;
    setDragging(null);
    if (from === folderId) return;
    run(() => setKnowledgeUnitFolder(projectId, linkId, folderId));
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return knowledgeUnits;
    return knowledgeUnits.filter(
      (ku) =>
        ku.title.toLowerCase().includes(q) ||
        ku.domain.toLowerCase().includes(q) ||
        (ku.folderId
          ? (folders.find((f) => f.id === ku.folderId)?.name ?? "").toLowerCase().includes(q)
          : "sin carpeta".includes(q))
    );
  }, [search, knowledgeUnits, folders]);

  const kuInFolder = (folderId: string | null) =>
    visible.filter((ku) => ku.folderId === folderId);

  const folderNames = useMemo(() => new Map(folders.map((f) => [f.id, f.name])), [folders]);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[var(--sky-0)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--edge)] bg-[var(--sky-1)] px-6 py-3 flex-wrap">
        <h2 className="section-heading">
          CONOCIMIENTO ({knowledgeUnits.length} KNOWLEDGE UNIT
          {knowledgeUnits.length === 1 ? "" : "S"})
        </h2>
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setFolderAdderOpen((v) => !v)}
              className="flex items-center gap-1.5 label-sm px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] hover:text-[var(--star-1)] transition-colors"
            >
              <Icon name="folder-plus" size={14} />
              Nueva carpeta
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => {
                setPreselectFolderId(null);
                setAdderOpen((v) => !v);
              }}
              className="flex items-center gap-1.5 label-sm px-3 py-2 rounded-lg border border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e] hover:text-[var(--star-1)] transition-colors"
            >
              <Icon name="plus" size={14} strokeWidth={2.2} />
              Agregar KU
            </button>
          )}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
              <Icon name="search" size={15} />
            </span>
            <input
              type="search"
              aria-label="Buscar en las Knowledge Units del proyecto"
              placeholder="Buscar en este proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 body-sm border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
        </div>
      </div>

      {folderAdderOpen && canManage && (
        <div className="shrink-0 border-b border-[var(--edge)] bg-[var(--sky-1)] px-6 py-3">
          <FolderAdder
            projectId={projectId}
            isPending={isPending}
            run={run}
            onCreated={handleFolderCreated}
          />
        </div>
      )}

      {adderOpen && canManage && (
        <div className="shrink-0 border-b border-[var(--edge)] bg-[var(--sky-1)] px-6 py-3">
          <KnowledgeUnitAdder
            projectId={projectId}
            candidates={candidates}
            folders={folders}
            preselectFolderId={preselectFolderId}
            isPending={isPending}
            run={run}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="body-sm text-[var(--danger)] shrink-0 px-6 pt-3">
          {error}
        </p>
      )}

      {knowledgeUnits.length === 0 && folders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="body-md text-[#64748b]">
            Este proyecto todavia no tiene conocimiento asociado. Crea carpetas para empezar.
          </p>
        </div>
      ) : (
        <>
          {visible.length === 0 && knowledgeUnits.length > 0 && (
            <p className="body-sm text-[#64748b] shrink-0 px-6 pt-3">
              Ninguna Knowledge Unit coincide con la busqueda.
            </p>
          )}
          <div className="min-h-0 flex-1 overflow-x-auto px-6 py-4">
            <div className="flex h-full min-w-min items-start gap-3">
              {folders.map((folder) => (
                <FolderColumn
                  key={folder.id}
                  projectId={projectId}
                  folder={folder}
                  kus={kuInFolder(folder.id)}
                  folders={folders}
                  canManage={canManage}
                  isPending={isPending}
                  draggingLinkId={dragging?.linkId ?? null}
                  onDragStart={(linkId) => setDragging({ linkId, from: folder.id })}
                  onDragEnd={() => setDragging(null)}
                  onDrop={() => handleDrop(folder.id)}
                  onQuickAdd={() => handleQuickAdd(folder.id)}
                  run={run}
                />
              ))}
            <div
              className={`flex min-h-full min-w-[260px] w-[260px] shrink-0 flex-col rounded-xl border border-dashed p-3 space-y-2 transition-colors ${
                dragging
                  ? "border-[#3b82f6] bg-[rgb(59_130_246_/_0.06)]"
                  : "border-[#1e293b] bg-[#07090e]/50"
              }`}
              onDragOver={(e) => {
                if (!dragging) return;
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(null);
              }}
            >
              <p className="label-sm text-[#64748b] flex items-center gap-1.5 shrink-0">
                <Icon name="folder" size={14} />
                SIN CARPETA
                <span className="ml-auto">({kuInFolder(null).length})</span>
              </p>
              {kuInFolder(null).length === 0 ? (
                <p className="body-sm text-[#64748b]">Vacia. Mové Knowledge Units aca.</p>
              ) : (
                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                  {kuInFolder(null).map((ku) => (
                    <KUCard
                      key={ku.linkId}
                      ku={ku}
                      folderNames={folderNames}
                      canManage={canManage}
                      isPending={isPending}
                      draggable={canManage}
                      isDragging={dragging?.linkId === ku.linkId}
                      onDragStart={() => setDragging({ linkId: ku.linkId, from: null })}
                      onDragEnd={() => setDragging(null)}
                      onMove={(folderId) =>
                        run(() => setKnowledgeUnitFolder(projectId, ku.linkId, folderId))
                      }
                      onRemove={() =>
                        run(() => removeKnowledgeUnitFromProject(projectId, ku.linkId))
                      }
                    />
                  ))}
                </ul>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleQuickAdd(null)}
                  className="flex items-center gap-1.5 shrink-0 body-sm text-[#64748b] hover:text-[#94a3b8] px-2 py-1.5 rounded-md hover:bg-[var(--sky-2)] transition-colors"
                >
                  <Icon name="plus" size={14} strokeWidth={2.2} />
                  Agregar KU
                </button>
              )}
            </div>
          </div>
          </div>
        </>
      )}
    </section>
  );
};

const FolderColumn = ({
  projectId,
  folder,
  kus,
  folders,
  canManage,
  isPending,
  draggingLinkId,
  onDragStart,
  onDragEnd,
  onDrop,
  onQuickAdd,
  run,
}: {
  projectId: string;
  folder: ProjectFolder;
  kus: LinkedKU[];
  folders: ProjectFolder[];
  canManage: boolean;
  isPending: boolean;
  draggingLinkId: string | null;
  onDragStart: (linkId: string) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onQuickAdd: () => void;
  run: (fn: () => Promise<{ error?: string; success?: true }>) => void;
}) => {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder.name);
  const [over, setOver] = useState(false);
  const folderNames = useMemo(() => new Map(folders.map((f) => [f.id, f.name])), [folders]);
  const dragging = draggingLinkId !== null;

  const saveRename = () => {
    run(() => renameProjectFolder(folder.id, name));
    setRenaming(false);
  };

  return (
    <div
      className={`flex min-h-full w-[260px] shrink-0 flex-col rounded-xl border p-3 space-y-2 transition-colors ${
        over
          ? "border-[#3b82f6] bg-[rgb(59_130_246_/_0.08)]"
          : "border-[#1e293b] bg-[var(--sky-2)]/60"
      }`}
      onDragOver={(e) => {
        if (!dragging) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop();
      }}
    >
      <div className="flex shrink-0 items-center gap-2">
        <Icon name="folder" size={15} className="text-[var(--azure)]" />
        {renaming ? (
          <>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="flex-1 min-w-0 body-sm border border-[#1e293b] rounded-md px-2 py-1 bg-[var(--sky-3)] text-[var(--star-1)] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            />
            <button type="button" onClick={saveRename} className="text-[var(--verified)] hover:text-[#34d399]">
              <Icon name="check" size={14} />
            </button>
          </>
        ) : (
          <>
            <p className="body-sm font-semibold text-[var(--star-1)] flex-1 min-w-0 truncate">
              {folder.name}
            </p>
            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setName(folder.name);
                    setRenaming(true);
                  }}
                  aria-label={`Renombrar carpeta ${folder.name}`}
                  className="text-[#64748b] hover:text-[#94a3b8]"
                >
                  <Icon name="edit" size={13} />
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (window.confirm(`Eliminar la carpeta "${folder.name}"? Sus Knowledge Units pasan a "Sin carpeta".`))
                      run(() => deleteProjectFolder(folder.id));
                  }}
                  aria-label={`Eliminar carpeta ${folder.name}`}
                  className="text-[#64748b] hover:text-[var(--danger)]"
                >
                  <Icon name="trash" size={13} />
                </button>
              </>
            )}
          </>
        )}
        <span className="label-xs text-[#64748b]">{kus.length}</span>
      </div>

      {kus.length === 0 ? (
        <p className="body-sm text-[#64748b]">Vacia. Mové Knowledge Units aca.</p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
          {kus.map((ku) => (
            <KUCard
              key={ku.linkId}
              ku={ku}
              folderNames={folderNames}
              canManage={canManage}
              isPending={isPending}
              draggable={canManage}
              isDragging={draggingLinkId === ku.linkId}
              onDragStart={() => onDragStart(ku.linkId)}
              onDragEnd={onDragEnd}
              onMove={(folderId) =>
                run(() => setKnowledgeUnitFolder(projectId, ku.linkId, folderId))
              }
              onRemove={() =>
                run(() => removeKnowledgeUnitFromProject(projectId, ku.linkId))
              }
            />
          ))}
        </ul>
      )}
      {canManage && (
        <button
          type="button"
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 shrink-0 body-sm text-[#64748b] hover:text-[#94a3b8] px-2 py-1.5 rounded-md hover:bg-[var(--sky-2)] transition-colors"
        >
          <Icon name="plus" size={14} strokeWidth={2.2} />
          Agregar KU
        </button>
      )}
    </div>
  );
};

const KUCard = ({
  ku,
  folderNames,
  canManage,
  isPending,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
  onMove,
  onRemove,
}: {
  ku: LinkedKU;
  folderNames: Map<string, string>;
  canManage: boolean;
  isPending: boolean;
  draggable: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (folderId: string | null) => void;
  onRemove: () => void;
}) => (
  <li
    draggable={draggable}
    onDragStart={(e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ku.linkId);
      onDragStart();
    }}
    onDragEnd={onDragEnd}
    className={`rounded-lg border border-[#1e293b] bg-[var(--sky-3)]/60 p-2.5 space-y-2 transition-all ${
      isDragging ? "opacity-40" : "hover:border-[#334155]"
    } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
  >
    <div className="flex items-start gap-2">
      <StatusBadge status={ku.status} label={ku.status} size="sm" className="shrink-0 mt-0.5" />
      <Link
        href={`/knowledge/${ku.id}`}
        className="body-sm text-[var(--star-1)] flex-1 min-w-0 hover:underline"
      >
        {ku.title}
      </Link>
      {canManage && (
        <button
          type="button"
          disabled={isPending}
          onClick={onRemove}
          aria-label={`Quitar ${ku.title} del proyecto`}
          className="text-[#64748b] hover:text-[var(--danger)] shrink-0"
        >
          <Icon name="close" size={13} />
        </button>
      )}
    </div>
    <div className="flex items-center justify-between gap-2">
      <span className="label-xs text-[#64748b]">
        Trust {ku.trust_score ?? 0}%
      </span>
      {canManage && (
        <select
          value={ku.folderId ?? ""}
          disabled={isPending}
          onChange={(e) => onMove(e.target.value || null)}
          aria-label={`Mover ${ku.title} de carpeta`}
          className="body-sm max-w-[140px] border border-[#1e293b] rounded-md px-1.5 py-1 bg-[var(--sky-2)] text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
        >
          <option value="">Sin carpeta</option>
          {Array.from(folderNames.entries()).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      )}
    </div>
  </li>
);

const FolderAdder = ({
  projectId,
  isPending,
  run,
  onCreated,
}: {
  projectId: string;
  isPending: boolean;
  run: (fn: () => Promise<{ error?: string; success?: true }>) => void;
  onCreated: (folderId: string) => void;
}) => {
  const [name, setName] = useState("");

  const create = () => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    setName("");
    run(async () => {
      const result = await createProjectFolder(projectId, cleanName);
      if (result?.error) return result;
      if (result?.folderId) onCreated(result.folderId);
      return { success: true };
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="label-sm text-[#64748b]">NUEVA CARPETA</span>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") create();
          if (e.key === "Escape") setName("");
        }}
        placeholder="Nombre de la carpeta..."
        className="w-64 body-sm border border-[#1e293b] rounded-lg px-3 py-2 bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
      />
      <button
        type="button"
        disabled={isPending || !name.trim()}
        onClick={create}
        className="body-sm px-3 py-2 rounded-lg bg-[#3b82f6] text-[var(--azure-ink)] font-medium hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
      >
        {isPending ? "Creando..." : "Crear carpeta"}
      </button>
    </div>
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
              <StatusBadge status={agent.status} size="sm" />
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
  folders: ProjectFolder[];
  preselectFolderId?: string | null;
  isPending: boolean;
  run: (fn: () => Promise<{ error?: string; success?: true }>) => void;
}

const KnowledgeUnitAdder = ({
  projectId,
  candidates,
  folders,
  preselectFolderId,
  isPending,
  run,
}: KnowledgeUnitAdderProps) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [folderId, setFolderId] = useState<string>(preselectFolderId ?? "");

  useEffect(() => {
    if (preselectFolderId) setFolderId(preselectFolderId);
  }, [preselectFolderId]);

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
    const targetFolderId = folderId || null;
    run(async () => {
      for (const id of ids) {
        const result = await addKnowledgeUnitToProject(projectId, id, targetFolderId);
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
      <div className="flex items-center gap-2">
        <label htmlFor="ku-target-folder" className="label-xs text-[#64748b] shrink-0">
          A CARPETA
        </label>
        <select
          id="ku-target-folder"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          className="flex-1 body-sm border border-[#1e293b] rounded-lg px-2.5 py-2 bg-[var(--sky-2)] text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
        >
          <option value="">Sin carpeta</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
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
