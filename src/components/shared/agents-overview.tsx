"use client";

import { useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";

/** Refleja las columnas reales de public.agents. */
interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  model: string;
  provider?: string | null;
  selected_ku_ids?: string[] | null;
  invocations?: number | null;
  last_invoked_at?: string | null;
  updated_at?: string | null;
}

interface AgentsOverviewProps {
  agents: Agent[];
}

/**
 * Estados validos segun el check constraint de public.agents:
 * ('draft','deployed','paused','archived').
 */
const STATUS_STYLES: Record<string, string> = {
  deployed: "bg-[rgb(52_211_153_/_0.12)] text-[var(--verified)] border-[rgb(52_211_153_/_0.28)]",
  draft: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  paused: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

const STATUS_LABELS: Record<string, string> = {
  deployed: "Desplegado",
  draft: "Borrador",
  paused: "En pausa",
  archived: "Archivado",
};

const getStatusColor = (status: string) =>
  STATUS_STYLES[status] ?? "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]";

const formatStatus = (status: string) =>
  STATUS_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "hace instantes";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;

  return date.toLocaleDateString();
};

export const AgentsOverview = ({ agents }: AgentsOverviewProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Todos" },
    { id: "deployed", label: "Desplegados" },
    { id: "draft", label: "Borradores" },
    { id: "paused", label: "En pausa" },
  ];

  const visibleAgents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return agents.filter((agent) => {
      if (activeTab !== "all" && agent.status !== activeTab) return false;
      if (!term) return true;

      return (
        agent.name.toLowerCase().includes(term) ||
        agent.description.toLowerCase().includes(term) ||
        agent.model.toLowerCase().includes(term)
      );
    });
  }, [agents, search, activeTab]);

  const countFor = (tabId: string) =>
    tabId === "all"
      ? agents.length
      : agents.filter((a) => a.status === tabId).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="headline-xl text-[var(--star-1)] font-bold">Agents</h1>
        <Link
          href="/agents/new"
          className="bg-[#5b9bff] text-[var(--azure-ink)] font-medium py-2.5 px-4 rounded-lg hover:bg-[#3f7fe0] flex items-center gap-2 body-md transition-colors"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Nuevo agente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b95ab]"><Icon name="search" size={18} /></span>
        <input
          type="search"
          aria-label="Buscar agentes"
          placeholder="Buscar agentes por nombre, modelo o descripcion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-[#212a3e] rounded-lg bg-[var(--sky-2)] text-[#b8c1d4] placeholder-[#8b95ab] focus:outline-none focus:ring-2 focus:ring-[#5b9bff] focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#212a3e] flex-wrap gap-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`px-4 py-3 border-b-2 rounded-t body-md transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--azure)] text-[var(--star-1)] font-medium"
                  : "border-transparent text-[#b8c1d4] hover:border-[#212a3e] hover:bg-[#0a0e17]"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[#8b95ab]">{countFor(tab.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        <p className="section-heading">AI AGENTS</p>

        {agents.length === 0 ? (
          <div className="panel p-10 text-center space-y-3">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(91_155_255_/_0.12)] text-[var(--azure)]" aria-hidden><Icon name="agents" size={26} /></span>
            <p className="body-md text-[var(--star-1)] font-medium">
              Todavia no hay agentes
            </p>
            <p className="body-sm text-[#8b95ab] max-w-md mx-auto">
              Un agente compila tus Knowledge Units aprobadas en contexto listo
              para usar con el Model Router.
            </p>
            <Link
              href="/agents/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#5b9bff] px-4 py-2.5 text-sm font-medium text-[var(--azure-ink)] hover:bg-[#3f7fe0]"
            >
              <Icon name="plus" size={16} strokeWidth={2.2} />
              Crear primer agente
            </Link>
          </div>
        ) : visibleAgents.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="body-md text-[#8b95ab]">
              Ningun agente coincide con el filtro.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visibleAgents.map((agent) => {
              const kuCount = agent.selected_ku_ids?.length ?? 0;
              const invocations = agent.invocations ?? 0;
              const lastInvoked = formatUpdatedAt(agent.last_invoked_at);
              const updated = formatUpdatedAt(agent.updated_at);

              return (
                <li key={agent.id}>
                  <button
                    onClick={() => router.push(`/agents/${agent.id}`)}
                    className="panel w-full text-left p-4 flex items-start gap-4 hover:bg-[#0a0e17] focus:outline-none focus:ring-2 focus:ring-[#5b9bff] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#16233d] flex items-center justify-center flex-shrink-0">
                      <Icon name="agents" size={18} className="text-[#5b9bff]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="body-md font-semibold text-[var(--star-1)]">
                          {agent.name}
                        </h3>
                        <span
                          className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {formatStatus(agent.status)}
                        </span>
                        <span className="label-sm bg-[#16233d] text-[var(--star-1)] px-2 py-1 rounded">
                          {agent.model}
                        </span>
                      </div>

                      <p className="body-sm text-[#8b95ab] mb-2 line-clamp-2">
                        {agent.description || "Sin descripcion"}
                      </p>

                      <div className="flex items-center gap-4 body-sm text-[#8b95ab] flex-wrap">
                        <span>
                          <span className="font-semibold text-[#b8c1d4]">
                            {kuCount}
                          </span>{" "}
                          {kuCount === 1 ? "Knowledge Unit" : "Knowledge Units"}
                        </span>
                        <span>
                          <span className="font-semibold text-[#b8c1d4]">
                            {invocations.toLocaleString("es")}
                          </span>{" "}
                          {invocations === 1 ? "invocacion" : "invocaciones"}
                        </span>
                        {lastInvoked && <span>Ultimo uso {lastInvoked}</span>}
                        {!lastInvoked && updated && (
                          <span>Actualizado {updated}</span>
                        )}
                      </div>
                    </div>

                    <Icon name="chevron-right" size={16} className="text-[#8b95ab] flex-shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
