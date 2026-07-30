"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { createProject } from "@/lib/projects/actions";

const ICONS = [
  "folder_open",
  "rocket_launch",
  "hub",
  "lightbulb",
  "flag",
  "handshake",
];

const COLORS = [
  { value: "#16233d", label: "Violeta" },
  { value: "#16233d", label: "Azul" },
  { value: "#2a2410", label: "Ambar" },
  { value: "#dcfce7", label: "Verde" },
  { value: "#241320", label: "Rosa" },
  { value: "#151b2b", label: "Gris" },
];

export const ProjectCreateForm = ({ locale }: { locale: string }) => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0].value);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre del proyecto es obligatorio.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createProject(
        { name: name.trim(), description: description.trim(), icon, color },
        locale
      );
      router.push(`/projects/${result.data.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el proyecto."
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#8b95ab]">
        <Link href="/projects" className="hover:text-[var(--star-1)] transition-colors">
          Proyectos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#b8c1d4]">Nuevo proyecto</span>
      </nav>

      <header className="space-y-1">
        <h1 className="headline-xl text-[var(--star-1)] font-bold">Nuevo proyecto</h1>
        <p className="body-md text-[#b8c1d4]">
          Un proyecto agrupa el conocimiento, la gente y los agentes que
          trabajan sobre un mismo objetivo.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="panel p-6 space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="label-sm text-[#8b95ab]">
              NOMBRE
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lanzamiento de la app 2026"
              autoFocus
              className="w-full px-4 py-3 border border-[#212a3e] rounded-lg bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[#8b95ab] focus:outline-none focus:ring-2 focus:ring-[#5b9bff] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="label-sm text-[#8b95ab]">
              QUE QUEREMOS LOGRAR
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describi el objetivo del proyecto, su alcance y por que existe."
              rows={5}
              className="w-full px-4 py-3 border border-[#212a3e] rounded-lg bg-[var(--sky-2)] text-[var(--star-1)] placeholder-[#8b95ab] focus:outline-none focus:ring-2 focus:ring-[#5b9bff] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="label-sm text-[#8b95ab]">ICONO</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  aria-pressed={icon === i}
                  aria-label={i}
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${
                    icon === i
                      ? "border-[#5b9bff] ring-2 ring-[#5b9bff]/30"
                      : "border-[#212a3e] hover:bg-[#0a0e17]"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  <span className="text-xl">{i}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-sm text-[#8b95ab]">COLOR</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-pressed={color === c.value}
                  aria-label={c.label}
                  title={c.label}
                  className={`w-11 h-11 rounded-lg border transition-colors ${
                    color === c.value
                      ? "border-[#5b9bff] ring-2 ring-[#5b9bff]/30"
                      : "border-[#212a3e]"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="panel border-[rgb(251_106_104_/_0.35)] bg-[rgb(251_106_104_/_0.12)] p-4 flex items-start gap-3"
          >
            <span className="text-[var(--danger)]">error</span>
            <div className="flex-1">
              <p className="body-md font-medium text-[var(--danger)]">
                No se pudo crear el proyecto
              </p>
              <p className="body-sm text-[var(--danger)]">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#5b9bff] text-[var(--azure-ink)] font-medium py-2.5 px-5 rounded-lg hover:bg-[#3f7fe0] transition-colors disabled:opacity-50 body-md"
          >
            {isSaving ? "Creando..." : "Crear proyecto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="py-2.5 px-5 rounded-lg border border-[#212a3e] text-[#b8c1d4] hover:bg-[#0a0e17] transition-colors body-md"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
