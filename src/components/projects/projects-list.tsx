"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Icon } from "@/components/shared/icon";
import { deleteProject } from "@/lib/projects/actions";

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

function RowActions({
  projectId,
  alignTo,
}: {
  projectId: string;
  alignTo: HTMLElement | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteProject(projectId);
    router.refresh();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-full z-50 mt-1 w-44 rounded-[10px] border border-[var(--edge)] bg-[var(--sky-2)] shadow-lg"
    >
      {!showConfirm ? (
        <>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--star-2)] hover:bg-[var(--sky-3)] transition-colors"
          >
            <Icon name="folder-open" size={16} />
            Ver proyecto
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--sky-3)] transition-colors"
          >
            <Icon name="trash" size={16} />
            Eliminar
          </button>
        </>
      ) : (
        <div className="px-3 py-2.5">
          <p className="text-xs text-[var(--star-3)] mb-2">Eliminar este proyecto?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-2 py-1 text-xs rounded-md bg-[var(--danger)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {deleting ? "..." : "Si, eliminar"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-2 py-1 text-xs rounded-md border border-[var(--edge)] text-[var(--star-3)] hover:bg-[var(--sky-3)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ProjectsList = ({ projects }: { projects: ProjectItem[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const term = search.trim().toLowerCase();
  const visible = term
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description ?? "").toLowerCase().includes(term)
      )
    : projects;

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
          <h1 className="headline-xl text-[var(--star-1)] font-bold">Proyectos</h1>
          <p className="body-md text-[var(--star-3)] mt-1">
            Cada proyecto reune un objetivo, su equipo, su conocimiento y sus agentes.
          </p>
        </div>
        <button
          onClick={() => router.push("/projects/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--azure)] text-[var(--azure-ink)] rounded-[10px] hover:bg-[var(--azure-bright)] transition-colors font-medium body-md shadow-sm"
        >
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Nuevo proyecto
        </button>
      </div>

      {/* Search/Filter Bar */}
      {projects.length > 0 && (
        <div className="flex gap-4 items-center border-b border-[var(--edge)] pb-4">
          <div className="relative flex-1 max-w-md">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--star-4)]"
            />
            <input
              type="search"
              aria-label="Filtrar proyectos"
              placeholder="Filtrar proyectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border border-transparent rounded-[10px] py-2 pl-10 pr-3 body-md text-[var(--star-1)] placeholder:text-[var(--star-4)] focus:outline-none focus:border-[var(--azure)] transition-colors"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] p-16 text-center space-y-4">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--azure)]/12 text-[var(--azure)]">
            <Icon name="folder-plus" size={28} />
          </span>
          <div>
            <p className="body-md text-[var(--star-1)] font-semibold">
              Todavia no hay proyectos
            </p>
            <p className="body-sm text-[var(--star-3)] max-w-md mx-auto mt-1">
              Un proyecto es donde definis que queres lograr, quien participa, que
              conocimiento se necesita y que agentes lo van a usar.
            </p>
          </div>
          <button
            onClick={() => router.push("/projects/new")}
            className="inline-flex items-center gap-2 bg-[var(--azure)] text-[var(--azure-ink)] font-medium py-2.5 px-5 rounded-[10px] hover:bg-[var(--azure-bright)] transition-colors body-md"
          >
            <Icon name="plus" size={17} strokeWidth={2.2} />
            Crear el primero
          </button>
        </div>
      ) : visible.length === 0 ? (
        /* No results state */
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] p-12 text-center">
          <p className="body-md text-[var(--star-3)]">
            Ningun proyecto coincide con tu busqueda.
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm text-[var(--azure)] hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        /* Projects Table */
        <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-2)] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--edge)] bg-[var(--sky-3)]">
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  KU
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Agentes
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Personas
                </th>
                <th className="px-6 py-3 label-sm text-[var(--star-4)] font-semibold uppercase tracking-wider">
                  Ultima modificacion
                </th>
                <th className="px-6 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--edge)]">
              {visible.map((project) => {
                const updated = formatUpdatedAt(project.updated_at);
                const color = project.color || "var(--azure)";
                return (
                  <tr
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="hover:bg-[var(--sky-3)] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Icon
                          name="folder"
                          size={22}
                          fill={color}
                          strokeWidth={1.8}
                          className="text-[var(--star-4)] shrink-0"
                        />
                        <span className="body-md text-[var(--star-1)] font-semibold truncate">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 body-md text-[var(--star-3)]">
                      {project.kuCount} KU
                    </td>
                    <td className="px-6 py-4 body-md text-[var(--star-3)]">
                      {project.agentCount} {project.agentCount === 1 ? "agente" : "agentes"}
                    </td>
                    <td className="px-6 py-4 body-md text-[var(--star-3)]">
                      {project.memberCount} {project.memberCount === 1 ? "persona" : "personas"}
                    </td>
                    <td className="px-6 py-4 body-md text-[var(--star-3)]">
                      {updated}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block" ref={menuRef}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                          }}
                          className={`text-[var(--star-4)] hover:text-[var(--star-2)] transition-all p-2 rounded-lg hover:bg-[var(--sky-3)] ${
                            openMenuId === project.id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <Icon name="grid" size={18} />
                        </button>
                        {openMenuId === project.id && (
                          <RowActions projectId={project.id} alignTo={null} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* "Create new project" row */}
              <tr
                onClick={() => router.push("/projects/new")}
                className="hover:bg-[var(--azure)]/8 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4" colSpan={6}>
                  <div className="flex items-center gap-3 text-[var(--azure)]">
                    <Icon name="plus" size={20} strokeWidth={2.2} />
                    <span className="label-md font-semibold">
                      Crear nuevo proyecto...
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
