"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  updated_at?: string | null;
  memberCount: number;
  kuCount: number;
  agentCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[rgb(52_211_153_/_0.12)] text-[var(--verified)] border-[rgb(52_211_153_/_0.28)]",
  paused: "bg-[rgb(251_191_36_/_0.12)] text-[var(--pending)] border-[rgb(251_191_36_/_0.28)]",
  archived: "bg-[var(--sky-3)] text-[var(--star-2)] border-[var(--edge)]",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  paused: "En pausa",
  archived: "Archivado",
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

export const ProjectsList = ({ projects }: { projects: ProjectItem[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const visible = term
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term)
      )
    : projects;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="headline-xl text-[var(--star-1)] font-bold">Proyectos</h1>
          <p className="body-md text-[#b8c1d4] mt-1">
            Cada proyecto reune un objetivo, su equipo, su conocimiento y sus
            agentes.
          </p>
        </div>
        <button
          onClick={() => router.push("/projects/new")}
          className="flex items-center gap-2 px-4 py-3 bg-[#5b9bff] text-[var(--azure-ink)] rounded-lg hover:bg-[#3f7fe0] transition-colors font-medium body-md"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Nuevo proyecto
        </button>
      </div>

      {projects.length > 0 && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b95ab]"><Icon name="search" size={18} /></span>
          <input
            type="search"
            aria-label="Buscar proyectos"
            placeholder="Buscar por nombre o descripcion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#212a3e] rounded-lg bg-[var(--sky-2)] text-[#b8c1d4] placeholder-[#8b95ab] focus:outline-none focus:ring-2 focus:ring-[#5b9bff] focus:border-transparent"
          />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="panel p-10 text-center space-y-3">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(91_155_255_/_0.12)] text-[var(--azure)]"><Icon name="projects" size={26} /></span>
          <p className="body-md text-[var(--star-1)] font-medium">Todavia no hay proyectos</p>
          <p className="body-sm text-[#8b95ab] max-w-md mx-auto">
            Un proyecto es donde defis que queres lograr, quien participa, que
            conocimiento se necesita y que agentes lo van a usar.
          </p>
          <button
            onClick={() => router.push("/projects/new")}
            className="mt-2 bg-[#5b9bff] text-[var(--azure-ink)] font-medium py-2.5 px-4 rounded-lg hover:bg-[#3f7fe0] transition-colors inline-flex items-center gap-2 body-md"
          >
            <Icon name="plus" size={17} strokeWidth={2.2} />
            Crear el primero
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="body-md text-[#8b95ab]">
            Ningun proyecto coincide con la busqueda.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((project) => {
            const updated = formatUpdatedAt(project.updated_at);
            return (
              <li key={project.id}>
                <button
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="panel w-full h-full text-left p-5 flex flex-col gap-3 hover:bg-[#0a0e17] focus:outline-none focus:ring-2 focus:ring-[#5b9bff] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: project.color || "#16233d" }}
                    >
                      <Icon name="projects" size={20} className="text-[var(--azure-ink)]" />
                    </div>
                    <span
                      className={`label-sm px-2 py-1 rounded border ${
                        STATUS_STYLES[project.status] ?? STATUS_STYLES.archived
                      }`}
                    >
                      {STATUS_LABELS[project.status] ?? project.status}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="body-md font-semibold text-[var(--star-1)]">
                      {project.name}
                    </h3>
                    <p className="body-sm text-[#8b95ab] mt-1 line-clamp-2">
                      {project.description || "Sin descripcion"}
                    </p>
                  </div>

                  <dl className="flex items-center gap-4 body-sm text-[#8b95ab] flex-wrap">
                    <div className="flex items-center gap-1">
                      <Icon name="people" size={15} />
                      <dd className="font-semibold text-[#b8c1d4]">
                        {project.memberCount}
                      </dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="knowledge" size={15} />
                      <dd className="font-semibold text-[#b8c1d4]">
                        {project.kuCount}
                      </dd>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="agents" size={15} />
                      <dd className="font-semibold text-[#b8c1d4]">
                        {project.agentCount}
                      </dd>
                    </div>
                  </dl>

                  {updated && (
                    <p className="body-sm text-[#8b95ab]">Actualizado {updated}</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
