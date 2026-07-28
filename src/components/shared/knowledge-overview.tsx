"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { CreateKUModal, type KUFormData } from "./create-ku-modal";
import { createKnowledgeUnit } from "@/lib/knowledge/actions";

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
  locale: string;
}

export const KnowledgeOverview = ({ knowledgeUnits: initialKUs, locale }: KnowledgeOverviewProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // La lista viene del servidor; tras crear se refresca con router.refresh().
  const knowledgeUnits = initialKUs;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-100";
      case "proposed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "draft":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "archived":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      Research: "#e1e0ff",
      Operations: "#dae2fd",
      Legal: "#fff8e1",
      Product: "#e0f2fe",
      Engineering: "#dbeafe",
      Marketing: "#fce7f3",
    };
    return colors[domain] || "#e0e3e5";
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700";
    if (score >= 70) return "text-blue-700";
    if (score >= 50) return "text-yellow-700";
    return "text-orange-700";
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

  const handleCreateKU = async (formData: KUFormData) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      // knowledge_units no tiene columna description: la descripcion se guarda
      // como parrafo introductorio del Markdown, que es lo que la lista resume.
      const content = formData.description.trim()
        ? `${formData.description.trim()}\n\n${formData.content}`
        : formData.content;

      await createKnowledgeUnit(
        { title: formData.title, content, domain: formData.domain },
        locale
      );

      setIsCreateModalOpen(false);
      // Recarga desde el servidor: evita insertar en el estado una fila con
      // un shape distinto al que devuelve getKnowledgeUnits.
      router.refresh();
    } catch (error) {
      console.error("Error creating Knowledge Unit:", error);
      setCreateError(
        error instanceof Error ? error.message : "No se pudo crear la Knowledge Unit."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="headline-lg text-black">Knowledge Units</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#4648d4] text-white rounded-lg hover:bg-[#3a3ab0] transition-colors font-medium body-md"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          New Knowledge Unit
        </button>
      </div>

      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7c839b]">
            search
          </span>
          <input
            type="text"
            aria-label="Buscar Knowledge Units"
            placeholder="Buscar por titulo, dominio o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-16 py-3 border border-[#e2e8f0] rounded-lg bg-white text-[#45464d] placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <kbd className="px-2 py-1 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-xs text-[#7c839b]">
              Cmd
            </kbd>
            <kbd className="px-2 py-1 bg-[#f7f9fb] border border-[#e2e8f0] rounded text-xs text-[#7c839b]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-[#45464d] hover:bg-[#f7f9fb] rounded">
            <span className="material-symbols-outlined text-lg">sort</span>
            <span className="body-sm">Sort: Recent</span>
          </button>
        </div>
      </div>

      {createError && (
        <div
          role="alert"
          className="panel border-red-200 bg-red-50 p-4 flex items-start gap-3"
        >
          <span className="material-symbols-outlined text-red-700">error</span>
          <div className="flex-1">
            <p className="body-md font-medium text-red-900">
              No se pudo crear la Knowledge Unit
            </p>
            <p className="body-sm text-red-800">{createError}</p>
          </div>
          <button
            onClick={() => setCreateError(null)}
            aria-label="Cerrar aviso"
            className="text-red-700 hover:text-red-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Knowledge Units List */}
      <div className="space-y-4">
        <p className="section-heading">KNOWLEDGE UNITS</p>

        {knowledgeUnits.length === 0 ? (
          <div className="panel p-10 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#7c839b]">
              menu_book
            </span>
            <p className="body-md text-black font-medium">
              Todavia no hay Knowledge Units
            </p>
            <p className="body-sm text-[#7c839b] max-w-md mx-auto">
              Una Knowledge Unit encapsula una idea, politica o regla, versionada
              y con responsable. Crea la primera para empezar.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 bg-[#4648d4] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#3a3ab0] transition-colors inline-flex items-center gap-2 body-md"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Crear Knowledge Unit
            </button>
          </div>
        ) : visibleKUs.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="body-md text-[#7c839b]">
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
                    className="panel w-full text-left p-4 flex items-start gap-4 hover:bg-[#f7f9fb] focus:outline-none focus:ring-2 focus:ring-[#4648d4] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: getDomainColor(ku.domain ?? "") }}
                    >
                      <span className="material-symbols-outlined text-lg">
                        menu_book
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="body-md font-semibold text-black">
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

                      <p className="body-sm text-[#7c839b] mb-2 line-clamp-2">
                        {excerpt(ku.content)}
                      </p>

                      <div className="flex items-center gap-4 body-sm text-[#7c839b] flex-wrap">
                        <span>
                          Dominio{" "}
                          <span className="font-semibold text-[#45464d]">
                            {ku.domain || "General"}
                          </span>
                        </span>
                        <span>
                          v
                          <span className="font-semibold text-[#45464d]">
                            {ku.version ?? 1}
                          </span>
                        </span>
                        {updated && <span>Actualizada {updated}</span>}
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-[#7c839b] flex-shrink-0">
                      chevron_right
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create KU Modal */}
      <CreateKUModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateKU}
      />
    </div>
  );
};
