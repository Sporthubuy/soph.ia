"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";

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
          <p className="body-md text-[#94a3b8] mt-1">
            Cada proyecto reune un objetivo, su equipo, su conocimiento y sus
            agentes.
          </p>
        </div>
        <button
          onClick={() => router.push("/projects/new")}
          className="flex items-center gap-2 px-4 py-3 bg-[#3b82f6] text-[var(--azure-ink)] rounded-lg hover:bg-[#2563eb] transition-colors font-medium body-md"
        >
          <Icon name="plus" size={17} strokeWidth={2.2} />
          Nuevo proyecto
        </button>
      </div>

      {projects.length > 0 && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]"><Icon name="search" size={18} /></span>
          <input
            type="search"
            aria-label="Buscar proyectos"
            placeholder="Buscar por nombre o descripcion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#1e293b] rounded-lg bg-[var(--sky-2)] text-[#94a3b8] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
          />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="panel p-10 text-center space-y-3">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)]"><Icon name="projects" size={26} /></span>
          <p className="body-md text-[var(--star-1)] font-medium">Todavia no hay proyectos</p>
          <p className="body-sm text-[#64748b] max-w-md mx-auto">
            Un proyecto es donde defis que queres lograr, quien participa, que
            conocimiento se necesita y que agentes lo van a usar.
          </p>
          <button
            onClick={() => router.push("/projects/new")}
            className="mt-2 bg-[#3b82f6] text-[var(--azure-ink)] font-medium py-2.5 px-4 rounded-lg hover:bg-[#2563eb] transition-colors inline-flex items-center gap-2 body-md"
          >
            <Icon name="plus" size={17} strokeWidth={2.2} />
            Crear el primero
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="body-md text-[#64748b]">
            Ningun proyecto coincide con la busqueda.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((project) => {
            const updated = formatUpdatedAt(project.updated_at);
            const color = project.color || "#3b82f6";
            return (
              <li key={project.id}>
                <button
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group w-full rounded-xl px-3 py-4 text-center transition-colors hover:bg-[var(--sky-2)] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <div className="relative mx-auto mb-3 flex h-20 w-24 items-center justify-center">
                    <Icon
                      name="folder"
                      size={64}
                      strokeWidth={1.5}
                      fill={color}
                      className="text-[color:var(--star-4)] transition-transform duration-200 group-hover:scale-[1.04]"
                    />
                    <Icon
                      name="folder-open"
                      size={64}
                      strokeWidth={1.5}
                      fill={color}
                      className="absolute inset-0 mx-auto my-auto hidden text-[color:var(--star-4)] group-hover:block"
                    />
                    {project.status === "active" && (
                      <div className="absolute right-1 top-1">
                        <StatusBadge variant="success" size="sm" label="" className="px-1" />
                      </div>
                    )}
                  </div>

                  <h3 className="truncate body-md font-semibold text-[var(--star-1)] group-hover:underline">
                    {project.name}
                  </h3>
                  <p className="body-sm text-[#64748b]">
                    {project.kuCount} KU · {project.agentCount} agentes
                  </p>
                  {updated && (
                    <p className="body-sm text-[#64748b]">
                      {updated}
                    </p>
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
