"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";

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

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "hace instantes";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return date.toLocaleDateString();
};

const providerLabel = (p?: string | null) => {
  if (!p) return "—";
  return p.charAt(0).toUpperCase() + p.slice(1);
};

export const AgentsOverview = ({ agents }: { agents: Agent[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const term = search.trim().toLowerCase();
  const visible = term
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.model.toLowerCase().includes(term) ||
          (a.provider ?? "").toLowerCase().includes(term)
      )
    : agents;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="headline-xl text-[var(--star-1)] font-bold">Agents</h1>
          <p className="body-md text-[var(--star-3)] mt-1">
            Agentes que compilan Knowledge Units en contexto para usar con el Model Router.
          </p>
        </div>
        <Link
          href="/agents/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--azure)] text-[var(--azure-ink)] rounded-[10px] hover:bg-[var(--azure-bright)] transition-colors font-medium body-md shadow-sm"
        >
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Nuevo agente
        </Link>
      </div>

      {/* Search Bar */}
      {agents.length > 0 && (
        <div className="flex gap-4 items-center border-b border-[var(--edge)] pb-4">
          <div className="relative flex-1 max-w-md">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--star-4)]"
            />
            <input
              type="search"
              aria-label="Filtrar agentes"
              placeholder="Filtrar agentes por nombre, modelo o descripcion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-transparent rounded-[10px] py-2 pl-10 pr-3 body-md text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:outline-none focus:border-[var(--azure)] transition-colors"
            />
          </div>
          <span className="ml-auto text-xs text-[var(--star-4)]">
            {visible.length} de {agents.length}
          </span>
        </div>
      )}

      {/* Empty State */}
      {agents.length === 0 ? (
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] p-16 text-center space-y-4">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--azure)]/12 text-[var(--azure)]">
            <Icon name="agents" size={28} />
          </span>
          <div>
            <p className="body-md text-[var(--star-1)] font-semibold">
              Todavia no hay agentes
            </p>
            <p className="body-sm text-[var(--star-3)] max-w-md mx-auto mt-1">
              Un agente compila tus Knowledge Units aprobadas en contexto listo
              para usar con el Model Router.
            </p>
          </div>
          <Link
            href="/agents/new"
            className="inline-flex items-center gap-2 bg-[var(--azure)] text-[var(--azure-ink)] font-medium py-2.5 px-5 rounded-[10px] hover:bg-[var(--azure-bright)] transition-colors body-md"
          >
            <Icon name="plus" size={17} strokeWidth={2.2} />
            Crear el primero
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] p-12 text-center">
          <p className="body-md text-[var(--star-3)]">
            Ningun agente coincide con tu busqueda.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm text-[var(--azure)] hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* Agents Table */
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--edge)] bg-[var(--sky-3)]">
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Agente
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Modelo
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  KUs
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Invocaciones
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Ultimo uso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--edge)]">
              {visible.map((agent) => {
                const kuCount = agent.selected_ku_ids?.length ?? 0;
                const invocations = agent.invocations ?? 0;
                const lastInvoked = formatUpdatedAt(agent.last_invoked_at);
                const updated = formatUpdatedAt(agent.updated_at);

                return (
                  <tr
                    key={agent.id}
                    onClick={() => router.push(`/agents/${agent.id}`)}
                    className="hover:bg-[var(--sky-3)] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--azure-deep)] flex items-center justify-center shrink-0">
                          <Icon name="agents" size={15} className="text-[var(--azure)]" />
                        </div>
                        <span className="body-md text-[var(--star-1)] font-semibold truncate max-w-[280px]">
                          {agent.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="body-sm text-[var(--star-2)] font-medium">
                          {agent.model}
                        </span>
                        <span className="block label-xs text-[var(--star-4)]">
                          {providerLabel(agent.provider)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={agent.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 body-sm text-[var(--star-3)]">
                      {kuCount} {kuCount === 1 ? "KU" : "KUs"}
                    </td>
                    <td className="px-6 py-4 body-sm text-[var(--star-3)]">
                      {invocations.toLocaleString("es")}
                    </td>
                    <td className="px-6 py-4 body-sm text-[var(--star-3)]">
                      {agent.last_invoked_at ? lastInvoked : updated}
                    </td>
                  </tr>
                );
              })}

              <tr
                onClick={() => router.push("/agents/new")}
                className="hover:bg-[var(--azure)]/8 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4" colSpan={6}>
                  <div className="flex items-center gap-3 text-[var(--azure)]">
                    <Icon name="plus" size={20} strokeWidth={2.2} />
                    <span className="label-md font-semibold">
                      Crear nuevo agente...
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
