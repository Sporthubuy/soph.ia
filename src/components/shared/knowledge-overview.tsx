"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";

interface KnowledgeUnit {
  id: string;
  title: string;
  content?: string | null;
  domain?: string | null;
  status: string;
  trust_score?: number | null;
  version?: number | null;
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return "status-verified";
    case "proposed":
      return "status-review";
    case "draft":
      return "status-idle";
    case "archived":
      return "status-idle";
    default:
      return "status-idle";
  }
};

const getTrustColor = (score: number) => {
  if (score >= 90) return "text-[var(--verified)]";
  if (score >= 70) return "text-[var(--azure)]";
  if (score >= 50) return "text-[var(--pending)]";
  return "text-[var(--star-3)]";
};

const getDomainColor = (domain: string) => {
  const hash = domain.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = ["var(--azure)", "var(--indigo)", "var(--cyan)", "var(--verified)", "var(--pending)"];
  return colors[hash % colors.length];
};

export const KnowledgeOverview = ({ knowledgeUnits: initialKUs }: { knowledgeUnits: KnowledgeUnit[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const term = search.trim().toLowerCase();
  const visible = term
    ? initialKUs.filter(
        (ku) =>
          ku.title.toLowerCase().includes(term) ||
          (ku.domain ?? "").toLowerCase().includes(term) ||
          (ku.content ?? "").toLowerCase().includes(term)
      )
    : initialKUs;

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
          <h1 className="headline-xl text-[var(--star-1)] font-bold">Knowledge Units</h1>
          <p className="body-md text-[var(--star-3)] mt-1">
            Cada KU encapsula una idea, politica o regla, versionada y con responsable.
          </p>
        </div>
        <button
          onClick={() => router.push("/knowledge/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--azure)] text-[var(--azure-ink)] rounded-[10px] hover:bg-[var(--azure-bright)] transition-colors font-medium body-md shadow-sm"
        >
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Nueva KU
        </button>
      </div>

      {/* Search Bar */}
      {initialKUs.length > 0 && (
        <div className="flex gap-4 items-center border-b border-[var(--edge)] pb-4">
          <div className="relative flex-1 max-w-md">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--star-4)]"
            />
            <input
              type="search"
              aria-label="Filtrar Knowledge Units"
              placeholder="Filtrar por titulo, dominio o contenido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-transparent rounded-[10px] py-2 pl-10 pr-3 body-md text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:outline-none focus:border-[var(--azure)] transition-colors"
            />
          </div>
          <span className="ml-auto text-xs text-[var(--star-4)]">
            {visible.length} de {initialKUs.length}
          </span>
        </div>
      )}

      {/* Empty State */}
      {initialKUs.length === 0 ? (
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] p-16 text-center space-y-4">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--azure)]/12 text-[var(--azure)]">
            <Icon name="knowledge" size={28} />
          </span>
          <div>
            <p className="body-md text-[var(--star-1)] font-semibold">
              Todavia no hay Knowledge Units
            </p>
            <p className="body-sm text-[var(--star-3)] max-w-md mx-auto mt-1">
              Una Knowledge Unit encapsula una idea, politica o regla, versionada
              y con responsable.
            </p>
          </div>
          <button
            onClick={() => router.push("/knowledge/new")}
            className="inline-flex items-center gap-2 bg-[var(--azure)] text-[var(--azure-ink)] font-medium py-2.5 px-5 rounded-[10px] hover:bg-[var(--azure-bright)] transition-colors body-md"
          >
            <Icon name="plus" size={17} strokeWidth={2.2} />
            Crear la primera
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] p-12 text-center">
          <p className="body-md text-[var(--star-3)]">
            Ninguna KU coincide con tu busqueda.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm text-[var(--azure)] hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* KUs Table */
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--edge)] bg-[var(--sky-3)]">
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Titulo
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Dominio
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Trust
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Actualizado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--edge)]">
              {visible.map((ku) => {
                const trust = ku.trust_score ?? 0;
                const updated = formatUpdatedAt(ku.updated_at);
                const domain = ku.domain || "General";

                return (
                  <tr
                    key={ku.id}
                    onClick={() => router.push(`/knowledge/${ku.id}`)}
                    className="hover:bg-[var(--sky-3)] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: getDomainColor(domain) }}
                        >
                          <Icon name="knowledge" size={15} className="text-[var(--azure-ink)]" />
                        </div>
                        <span className="body-md text-[var(--star-1)] font-semibold truncate max-w-[320px]">
                          {ku.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 body-sm text-[var(--star-3)]">
                      {domain}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`label-sm px-2.5 py-1 rounded-full border inline-flex items-center ${getStatusBadge(ku.status)}`}
                      >
                        {ku.status.charAt(0).toUpperCase() + ku.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`label-sm font-semibold ${getTrustColor(trust)}`}>
                        {trust}%
                      </span>
                    </td>
                    <td className="px-6 py-4 body-sm text-[var(--star-3)]">
                      v{ku.version ?? 1}
                    </td>
                    <td className="px-6 py-4 body-sm text-[var(--star-3)]">
                      {updated}
                    </td>
                  </tr>
                );
              })}

              <tr
                onClick={() => router.push("/knowledge/new")}
                className="hover:bg-[var(--azure)]/8 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4" colSpan={6}>
                  <div className="flex items-center gap-3 text-[var(--azure)]">
                    <Icon name="plus" size={20} strokeWidth={2.2} />
                    <span className="label-md font-semibold">
                      Crear nueva Knowledge Unit...
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
