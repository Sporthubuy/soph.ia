"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";

/** Refleja las columnas reales de public.knowledge_units (+ domain aplanado). */
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

interface KnowledgeOverviewProps {
  knowledgeUnits: KnowledgeUnit[];
}

export const KnowledgeOverview = ({ knowledgeUnits: initialKUs }: KnowledgeOverviewProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // La lista viene del servidor; tras crear se refresca con router.refresh().
  const knowledgeUnits = initialKUs;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-[rgb(16_185_129_/_0.12)] text-[var(--verified)] border-[rgb(16_185_129_/_0.28)]";
      case "proposed":
        return "bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)] border-[rgb(59_130_246_/_0.28)]";
      case "draft":
        return "bg-[rgb(245_158_11_/_0.12)] text-[var(--pending)] border-[rgb(245_158_11_/_0.28)]";
      case "archived":
        return "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]";
      default:
        return "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]";
    }
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      Research: "#172554",
      Operations: "#172554",
      Legal: "#2a2410",
      Product: "#0f2030",
      Engineering: "#172554",
      Marketing: "#241320",
    };
    return colors[domain] || "#182032";
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-[var(--verified)]";
    if (score >= 70) return "text-[var(--azure)]";
    if (score >= 50) return "text-[var(--pending)]";
    return "text-[var(--pending)]";
  };

  /** Primera linea util del Markdown, para usar como resumen en la lista. */
  const excerpt = (content?: string | null) => {
    if (!content) return "Sin contenido";
    const line = content
      .split("\n")
      .map((l) => l.replace(/^[#>\-*\s]+/, "").trim())
      .find((l) => l.length > 0);
    return line || "Sin contenido";
  };

  const formatUpdatedAt = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (minutes < 1) return "hace instantes";
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;
    return date.toLocaleDateString();
  };

  const tabs = [
    { id: "all", label: "Todas" },
    { id: "approved", label: "Aprobadas" },
    { id: "proposed", label: "Propuestas" },
    { id: "draft", label: "Borradores" },
  ];

  const visibleKUs = knowledgeUnits.filter((ku) => {
    if (activeTab !== "all" && ku.status !== activeTab) return false;

    const term = search.trim().toLowerCase();
    if (!term) return true;

    return (
      ku.title.toLowerCase().includes(term) ||
      (ku.domain ?? "").toLowerCase().includes(term) ||
      (ku.content ?? "").toLowerCase().includes(term)
    );
  });

  const countFor = (tabId: string) =>
    tabId === "all"
      ? knowledgeUnits.length
      : knowledgeUnits.filter((ku) => ku.status === tabId).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="headline-lg text-[var(--star-1)]">Knowledge Units</h1>
        <button
          onClick={() => router.push("/knowledge/new")}
          className="flex items-center gap-2 px-4 py-3 bg-[#3b82f6] text-[var(--azure-ink)] rounded-lg hover:bg-[#2563eb] transition-colors font-medium body-md"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          New Knowledge Unit
        </button>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            aria-label="Buscar Knowledge Units"
            placeholder="Buscar por titulo, dominio o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-16 py-3 border border-[#1e293b] rounded-lg bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <kbd className="px-2 py-1 bg-[#07090e] border border-[#1e293b] rounded text-xs text-[#64748b]">
              Cmd
            </kbd>
            <kbd className="px-2 py-1 bg-[#07090e] border border-[#1e293b] rounded text-xs text-[#64748b]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between border-b border-[#1e293b] flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 rounded-t body-md transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--azure)] text-[var(--star-1)] font-medium"
                  : "border-transparent text-[#94a3b8] hover:border-[#1e293b] hover:bg-[#07090e]"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-[#64748b]">{countFor(tab.id)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-[#94a3b8] hover:bg-[#07090e] rounded">
            <Icon name="chevron-down" size={16} />
            <span className="body-sm">Sort: Recent</span>
          </button>
        </div>
      </div>

      {/* Knowledge Units List */}
      <div className="space-y-4">
        <p className="section-heading">KNOWLEDGE UNITS</p>

        {knowledgeUnits.length === 0 ? (
          <div className="panel p-10 text-center space-y-3">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)]"><Icon name="knowledge" size={26} /></span>
            <p className="body-md text-[var(--star-1)] font-medium">
              Todavia no hay Knowledge Units
            </p>
            <p className="body-sm text-[#64748b] max-w-md mx-auto">
              Una Knowledge Unit encapsula una idea, politica o regla, versionada
              y con responsable. Crea la primera para empezar.
            </p>
            <button
              onClick={() => router.push("/knowledge/new")}
              className="mt-2 bg-[#3b82f6] text-[var(--azure-ink)] font-medium py-2.5 px-4 rounded-lg hover:bg-[#2563eb] transition-colors inline-flex items-center gap-2 body-md"
            >
              <Icon name="plus" size={17} strokeWidth={2.2} />
              Crear Knowledge Unit
            </button>
          </div>
        ) : visibleKUs.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="body-md text-[#64748b]">
              Ninguna Knowledge Unit coincide con el filtro.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visibleKUs.map((ku) => {
              const trust = ku.trust_score ?? 0;
              const updated = formatUpdatedAt(ku.updated_at);

              return (
                <li key={ku.id}>
                  <button
                    onClick={() => router.push(`/knowledge/${ku.id}`)}
                    className="panel w-full text-left p-4 flex items-start gap-4 hover:bg-[#07090e] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: getDomainColor(ku.domain ?? "") }}
                    >
                      <Icon name="knowledge" size={18} className="text-[var(--azure-ink)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="body-md font-semibold text-[var(--star-1)]">
                          {ku.title}
                        </h3>
                        <span
                          className={`label-sm px-2 py-1 rounded border ${getStatusColor(
                            ku.status
                          )}`}
                        >
                          {ku.status.charAt(0).toUpperCase() + ku.status.slice(1)}
                        </span>
                        <span
                          className={`label-sm font-semibold ${getTrustScoreColor(
                            trust
                          )}`}
                        >
                          Trust {trust}%
                        </span>
                      </div>

                      <p className="body-sm text-[#64748b] mb-2 line-clamp-2">
                        {excerpt(ku.content)}
                      </p>

                      <div className="flex items-center gap-4 body-sm text-[#64748b] flex-wrap">
                        <span>
                          Dominio{" "}
                          <span className="font-semibold text-[#94a3b8]">
                            {ku.domain || "General"}
                          </span>
                        </span>
                        <span>
                          v
                          <span className="font-semibold text-[#94a3b8]">
                            {ku.version ?? 1}
                          </span>
                        </span>
                        {updated && <span>Actualizada {updated}</span>}
                      </div>
                    </div>

                    <Icon name="chevron-right" size={16} className="text-[#64748b] flex-shrink-0" />
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
