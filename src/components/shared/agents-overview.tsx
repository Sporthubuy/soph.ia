"use client";

import { useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";

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
  deployed: "bg-green-50 text-green-700 border-green-100",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-100",
  paused: "bg-orange-50 text-orange-700 border-orange-100",
  archived: "bg-gray-50 text-gray-700 border-gray-100",
};

const STATUS_LABELS: Record<string, string> = {
  deployed: "Desplegado",
  draft: "Borrador",
  paused: "En pausa",
  archived: "Archivado",
};

const getStatusColor = (status: string) =>
  STATUS_STYLES[status] ?? "bg-gray-50 text-gray-700 border-gray-100";

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
        <h1 className="headline-xl text-black font-bold">Agents</h1>
        <Link
          href="/agents/new"
          className="bg-[#4648d4] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#3b3db8] flex items-center gap-2 body-md transition-colors"
        >
          <span className="text-xl" aria-hidden>
            add
          </span>
          Nuevo agente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c839b]">
          search
        </span>
        <input
          type="search"
          aria-label="Buscar agentes"
          placeholder="Buscar agentes por nombre, modelo o descripcion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] flex-wrap gap-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`px-4 py-3 border-b-2 rounded-t body-md transition-colors ${
                activeTab === tab.id
                  ? "border-black text-black font-medium"
                  : "border-transparent text-[#45464d] hover:border-[#e2e8f0] hover:bg-[#f7f9fb]"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[#7c839b]">{countFor(tab.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        <p className="section-heading">AI AGENTS</p>

        {agents.length === 0 ? (
          <div className="panel p-10 text-center space-y-3">
            <span className="text-4xl text-[#7c839b]" aria-hidden>
              smart_toy
            </span>
            <p className="body-md text-black font-medium">
              Todavia no hay agentes
            </p>
            <p className="body-sm text-[#7c839b] max-w-md mx-auto">
              Un agente compila tus Knowledge Units aprobadas en contexto listo
              para usar con el Model Router.
            </p>
            <Link
              href="/agents/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4648d4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3b3db8]"
            >
              <span className="text-lg" aria-hidden>
                add
              </span>
              Crear primer agente
            </Link>
          </div>
        ) : visibleAgents.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="body-md text-[#7c839b]">
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
                    className="panel w-full text-left p-4 flex items-start gap-4 hover:bg-[#f7f9fb] focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#e1e0ff] flex items-center justify-center flex-shrink-0">
                      <span className="text-lg text-[#4648d4]">
                        smart_toy
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="body-md font-semibold text-black">
                          {agent.name}
                        </h3>
                        <span
                          className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                            agent.status
                          )}`}
                        >
                          {formatStatus(agent.status)}
                        </span>
                        <span className="label-sm bg-[#dae2fd] text-black px-2 py-1 rounded">
                          {agent.model}
                        </span>
                      </div>

                      <p className="body-sm text-[#7c839b] mb-2 line-clamp-2">
                        {agent.description || "Sin descripcion"}
                      </p>

                      <div className="flex items-center gap-4 body-sm text-[#7c839b] flex-wrap">
                        <span>
                          <span className="font-semibold text-[#45464d]">
                            {kuCount}
                          </span>{" "}
                          {kuCount === 1 ? "Knowledge Unit" : "Knowledge Units"}
                        </span>
                        <span>
                          <span className="font-semibold text-[#45464d]">
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

                    <span className="text-[#7c839b] flex-shrink-0">
                      chevron_right
                    </span>
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
