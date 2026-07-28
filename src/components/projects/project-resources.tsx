"use client";

import { useState, useTransition } from "react";
import { useRouter, Link } from "@/i18n/routing";
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
  approved: "bg-green-50 text-green-700 border-green-100",
  proposed: "bg-blue-50 text-blue-700 border-blue-100",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-100",
  archived: "bg-gray-50 text-gray-700 border-gray-100",
};

const AGENT_STATUS_STYLES: Record<string, string> = {
  deployed: "bg-green-50 text-green-700 border-green-100",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-100",
  paused: "bg-orange-50 text-orange-700 border-orange-100",
  archived: "bg-gray-50 text-gray-700 border-gray-100",
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
        <p className="body-md text-[#7c839b]">
          Este proyecto todavia no tiene conocimiento asociado.
        </p>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div key={domain} className="space-y-2">
              <p className="label-sm text-[#7c839b]">{domain.toUpperCase()}</p>
              <ul className="space-y-2">
                {byDomain[domain].map((ku) => (
                  <li
                    key={ku.linkId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] flex-wrap"
                  >
                    <span className="material-symbols-outlined text-[#4648d4]">
                      menu_book
                    </span>
                    <Link
                      href={`/knowledge/${ku.id}`}
                      className="body-md text-black flex-1 min-w-0 truncate hover:underline"
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
                    <span className="body-sm text-[#7c839b]">
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
                        className="label-sm px-2 py-1.5 rounded-lg border border-[#e2e8f0] text-[#45464d] hover:bg-[#f7f9fb] transition-colors disabled:opacity-50"
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

      {canManage && (
        <div className="space-y-2 pt-1">
          <label htmlFor="add-ku" className="label-sm text-[#7c839b]">
            AGREGAR KNOWLEDGE UNIT
          </label>
          {candidates.length === 0 ? (
            <p className="body-sm text-[#7c839b]">
              No quedan Knowledge Units disponibles para agregar.
            </p>
          ) : (
            <select
              id="add-ku"
              value=""
              disabled={isPending}
              onChange={(e) => {
                if (e.target.value) {
                  run(() => addKnowledgeUnitToProject(projectId, e.target.value));
                }
              }}
              className="w-full body-sm border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-white text-[#45464d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            >
              <option value="">Selecciona una Knowledge Unit...</option>
              {candidates.map((ku) => (
                <option key={ku.id} value={ku.id}>
                  {ku.title} · {ku.domain}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="body-sm text-red-700">
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
        <p className="body-md text-[#7c839b]">
          Este proyecto todavia no integra ningun agente.
        </p>
      ) : (
        <ul className="space-y-2">
          {agents.map((agent) => (
            <li
              key={agent.linkId}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] flex-wrap"
            >
              <span className="material-symbols-outlined text-[#4648d4]">
                smart_toy
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/agents/${agent.id}`}
                  className="body-md text-black hover:underline"
                >
                  {agent.name}
                </Link>
                <p className="body-sm text-[#7c839b] truncate">{agent.model}</p>
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
                  className="label-sm px-2 py-1.5 rounded-lg border border-[#e2e8f0] text-[#45464d] hover:bg-[#f7f9fb] transition-colors disabled:opacity-50"
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="space-y-2 pt-1">
          <label htmlFor="add-agent" className="label-sm text-[#7c839b]">
            INTEGRAR AGENTE
          </label>
          {candidates.length === 0 ? (
            <p className="body-sm text-[#7c839b]">
              No quedan agentes disponibles para integrar.
            </p>
          ) : (
            <select
              id="add-agent"
              value=""
              disabled={isPending}
              onChange={(e) => {
                if (e.target.value) {
                  run(() => addAgentToProject(projectId, e.target.value));
                }
              }}
              className="w-full body-sm border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-white text-[#45464d] focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
            >
              <option value="">Selecciona un agente...</option>
              {candidates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="body-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
};
