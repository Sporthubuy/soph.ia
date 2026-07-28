"use client";

import { useRef, useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { createKnowledgeUnit } from "@/lib/knowledge/actions";
import { extractTextFromFile } from "@/lib/knowledge/file-extract";
import { renderMarkdown } from "@/lib/knowledge/markdown";

interface DomainItem {
  id: string;
  name: string;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv"];
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");

export const KUCreateForm = ({
  locale,
  domains,
}: {
  locale: string;
  domains: DomainItem[];
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(domains[0]?.name ?? "");
  const [content, setContent] = useState("");
  const [view, setView] = useState<"write" | "preview">("write");

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const appendExtractedText = (filename: string, text: string) => {
    if (!text) {
      setUploadError(`"${filename}" no tiene texto que se pueda extraer.`);
      return;
    }
    setContent((prev) => {
      const heading = `## ${filename}\n\n${text}`;
      return prev.trim() ? `${prev.trim()}\n\n${heading}` : heading;
    });
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await extractTextFromFile(formData);
      if (result.success) {
        appendExtractedText(result.data.filename, result.data.text);
      } else {
        setUploadError(result.error);
      }
    } catch {
      setUploadError("No se pudo procesar el archivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!title.trim()) {
      setSaveError("El titulo es obligatorio.");
      return;
    }
    if (!content.trim()) {
      setSaveError("El contenido no puede estar vacio.");
      return;
    }

    setIsSaving(true);
    try {
      await createKnowledgeUnit(
        { title: title.trim(), content, domain: domain.trim() || "General" },
        locale
      );
      router.push("/knowledge");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "No se pudo crear la Knowledge Unit."
      );
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <nav aria-label="Migas de pan" className="body-sm text-[#7c839b]">
        <Link href="/knowledge" className="hover:text-black transition-colors">
          Knowledge Units
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#45464d]">Nueva Knowledge Unit</span>
      </nav>

      <h1 className="headline-xl text-black font-bold">
        Nueva Knowledge Unit
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Informacion basica */}
          <div className="lg:col-span-4 panel p-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="title" className="label-sm text-[#7c839b]">
                TITULO
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Politica de reembolsos 2026"
                autoFocus
                className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg bg-white text-black placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="label-sm text-[#7c839b]">DOMINIO</label>

              {domains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {domains.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDomain(d.name)}
                      className={`label-sm px-3 py-1.5 rounded-full border transition-colors ${
                        domain === d.name
                          ? "bg-[#4648d4] text-white border-[#4648d4]"
                          : "bg-white text-[#45464d] border-[#e2e8f0] hover:bg-[#f7f9fb]"
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}

              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="O escribe un dominio nuevo..."
                className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg bg-white text-black placeholder-[#7c839b] focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent body-sm"
              />
              <p className="body-sm text-[#7c839b]">
                Si el dominio no existe, se crea automaticamente.
              </p>
            </div>

            {/* Subida de archivos */}
            <div className="space-y-2 pt-1">
              <label className="label-sm text-[#7c839b]">ARCHIVO</label>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
                  isDragging
                    ? "border-[#4648d4] bg-[#f5f5ff]"
                    : "border-[#e2e8f0]"
                }`}
              >
                <span className="material-symbols-outlined text-2xl text-[#7c839b]">
                  upload_file
                </span>
                <p className="body-sm text-[#45464d] mt-1">
                  Arrastra un archivo aca, o{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[#4648d4] font-medium hover:underline disabled:opacity-50"
                  >
                    elegi uno
                  </button>
                </p>
                <p className="body-sm text-[#7c839b] mt-1">
                  PDF, DOCX, TXT, Markdown o CSV.
                </p>
                {isUploading && (
                  <p className="body-sm text-[#4648d4] mt-2">Extrayendo texto...</p>
                )}
                {uploadError && (
                  <p className="body-sm text-red-700 mt-2">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="lg:col-span-8 panel p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <label className="label-sm text-[#7c839b]">
                CONTENIDO (MARKDOWN)
              </label>
              <div className="flex gap-1 border border-[#e2e8f0] rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setView("write")}
                  className={`label-sm px-3 py-1.5 rounded ${
                    view === "write"
                      ? "bg-[#4648d4] text-white"
                      : "text-[#45464d] hover:bg-[#f7f9fb]"
                  }`}
                >
                  Escribir
                </button>
                <button
                  type="button"
                  onClick={() => setView("preview")}
                  className={`label-sm px-3 py-1.5 rounded ${
                    view === "preview"
                      ? "bg-[#4648d4] text-white"
                      : "text-[#45464d] hover:bg-[#f7f9fb]"
                  }`}
                >
                  Vista previa
                </button>
              </div>
            </div>

            {view === "write" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"Escribe en Markdown, o sube un archivo a la izquierda...\n\n## Un titulo\n\n- Un punto\n- Otro punto"}
                rows={24}
                className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg bg-white text-black placeholder-[#7c839b] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#4648d4] focus:border-transparent"
              />
            ) : (
              <div className="border border-[#e2e8f0] rounded-lg p-4 min-h-[38rem]">
                {content.trim() ? (
                  <div
                    className="ku-content body-md text-[#45464d]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                ) : (
                  <p className="body-md text-[#7c839b]">Nada que previsualizar todavia.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {saveError && (
          <div
            role="alert"
            className="panel border-red-200 bg-red-50 p-4 flex items-start gap-3"
          >
            <span className="material-symbols-outlined text-red-700">error</span>
            <div className="flex-1">
              <p className="body-md font-medium text-red-900">
                No se pudo crear la Knowledge Unit
              </p>
              <p className="body-sm text-red-800">{saveError}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#4648d4] text-white font-medium py-2.5 px-5 rounded-lg hover:bg-[#3a3ab0] transition-colors disabled:opacity-50 body-md"
          >
            {isSaving ? "Creando..." : "Crear Knowledge Unit"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/knowledge")}
            className="py-2.5 px-5 rounded-lg border border-[#e2e8f0] text-[#45464d] hover:bg-[#f7f9fb] transition-colors body-md"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
