"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { updateKnowledgeUnit } from "@/lib/knowledge/actions";
import { renderMarkdown } from "@/lib/knowledge/markdown";
import { toast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import {
  KUDependencies,
  type DependencyEdge,
} from "@/components/editor/ku-dependencies";

interface KU {
  id: string;
  title: string;
  content: string;
  status: string;
  trust_score: number;
  version: number;
  hash: string;
  created_at: string;
  updated_at: string;
  domains: { name: string } | null;
  profiles: { full_name: string | null; email: string } | null;
}

interface VersionItem {
  id: string;
  version: number;
  hash: string;
  title: string;
  change_message: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
}

export const KUEditor = ({
  ku,
  versions,
  dependencies,
  candidates,
}: {
  ku: KU;
  versions: VersionItem[];
  dependencies: DependencyEdge[];
  candidates: { id: string; title: string; status: string; version: number }[];
}) => {
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [title, setTitle] = useState(ku.title);
  const [content, setContent] = useState(ku.content);
  const [changeMessage, setChangeMessage] = useState("");
  const [tab, setTab] = useState<"write" | "preview" | "diff">("write");
  const [loading, setLoading] = useState(false);

  const titleChanged = title !== ku.title;
  const contentChanged = content !== ku.content;
  const hasChanges = titleChanged || contentChanged;
  const charDiff = content.length - ku.content.length;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    formData.set("kuId", ku.id);
    formData.set("title", title);
    formData.set("content", content);
    formData.set("changeMessage", changeMessage);
    const result = await updateKnowledgeUnit(formData);
    if (result?.error) {
      toast.add({ type: "error", title: "Error", description: result.error });
    } else {
      toast.add({ type: "success", title: "Cambio propuesto", description: "Pendiente de aprobación" });
      setChangeMessage("");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
      {/* Main editor */}
      <div className="flex-1 space-y-6">
        <form action={handleSubmit} className="space-y-4">
          {/* Title section */}
          <div className="panel p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="title" className="section-heading">Título</Label>
              {titleChanged && <span className="label-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b]">Modificado</span>}
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="body-md border-[#1e293b]"
              required
            />
          </div>

          {/* Content editor */}
          <div className="panel p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="content" className="section-heading">Contenido</Label>
                {contentChanged && (
                  <span className="label-xs px-2 py-0.5 rounded-full bg-[#3b82f6]/20 text-[#3b82f6]">
                    {Math.abs(charDiff)} caracteres
                  </span>
                )}
              </div>
              <div className="flex rounded-lg border border-[#1e293b] p-1 gap-1 bg-[#07090e]">
                {(["write", "preview", "diff"] as const).map((t_val) => (
                  <button
                    key={t_val}
                    type="button"
                    className={`label-sm px-3 py-1.5 rounded transition-colors ${
                      tab === t_val
                        ? "bg-[#3b82f6] text-white"
                        : "text-[#64748b] hover:text-[#94a3b8]"
                    }`}
                    onClick={() => setTab(t_val)}
                  >
                    {t_val === "write" && "Editar"}
                    {t_val === "preview" && "Preview"}
                    {t_val === "diff" && "Cambios"}
                  </button>
                ))}
              </div>
            </div>

            {/* Write tab */}
            {tab === "write" && (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={24}
                className="font-mono text-sm border-[#1e293b] bg-[#07090e]"
                placeholder="Escribe el contenido en Markdown..."
              />
            )}

            {/* Preview tab */}
            {tab === "preview" && (
              <div className="min-h-[500px] overflow-auto rounded-lg border border-[#1e293b] bg-[#07090e] p-6">
                <div
                  className="ku-content body-md text-[#94a3b8] leading-relaxed max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(content) || '<p class="text-[#64748b]">Sin contenido aún</p>',
                  }}
                />
              </div>
            )}

            {/* Diff tab */}
            {tab === "diff" && (
              <div className="min-h-[500px] space-y-4">
                {!contentChanged ? (
                  <div className="flex items-center justify-center h-96 text-[#64748b]">
                    <p>Sin cambios en el contenido</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="label-sm text-[#64748b]">Original (v{ku.version})</p>
                      <div className="h-96 overflow-auto rounded-lg border border-[#1e293b] bg-[#07090e] p-3">
                        <pre className="text-xs text-[#94a3b8] whitespace-pre-wrap break-words font-mono">
                          {ku.content}
                        </pre>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="label-sm text-[#64748b]">Nuevo</p>
                      <div className="h-96 overflow-auto rounded-lg border border-[#1e293b] bg-[#07090e] p-3">
                        <pre className="text-xs text-[#94a3b8] whitespace-pre-wrap break-words font-mono">
                          {content}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Change message */}
          {hasChanges && (
            <div className="panel p-6 space-y-3 border border-[#3b82f6]/30 bg-[#3b82f6]/5">
              <div className="flex items-center gap-2">
                <Icon name="bulb" size={16} className="text-[#3b82f6]" />
                <Label htmlFor="changeMessage" className="section-heading">Describe tu cambio</Label>
              </div>
              <Input
                id="changeMessage"
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                placeholder="¿Qué cambió y por qué?"
                className="body-md border-[#1e293b]"
              />
              <p className="label-xs text-[#64748b]">
                Este cambio irá a revisión y requiere aprobación del responsable (Artículo 6).
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={!hasChanges || loading}
              className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg"
            >
              {loading ? "Proponiendo..." : "Proponer cambio"}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link href={`/knowledge/${ku.id}`} />}
              className="border-[#1e293b] text-[#94a3b8] hover:bg-[#07090e]"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-80 shrink-0">
        <div className="space-y-4">
          {/* KU Info */}
          <div className="panel p-5 space-y-3">
            <h3 className="section-heading flex items-center gap-2">
              <Icon name="bulb" size={16} className="text-[#3b82f6]" />
              Información
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Estado</span>
                <StatusBadge status={ku.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Trust Score</span>
                <TrustBadge score={ku.trust_score} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Versión</span>
                <span className="font-medium text-[#94a3b8]">v{ku.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Dominio</span>
                <span className="font-medium text-[#94a3b8]">{ku.domains?.name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Responsable</span>
                <span className="font-medium text-[#94a3b8] truncate max-w-[120px]">
                  {ku.profiles?.full_name ?? ku.profiles?.email ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="panel p-5">
            <KUDependencies
              kuId={ku.id}
              dependencies={dependencies}
              candidates={candidates}
            />
          </div>

          {/* Version history */}
          <div className="panel p-5 space-y-3">
            <h3 className="section-heading flex items-center gap-2">
              <Icon name="check" size={16} className="text-[#3b82f6]" />
              Historial ({versions.length})
            </h3>
            {versions.length === 0 ? (
              <p className="text-sm text-[#64748b]">Sin historial</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {versions.slice(0, 5).map((v) => (
                  <div key={v.id} className="text-xs p-2 rounded border border-[#1e293b] hover:bg-[#07090e]/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#94a3b8]">v{v.version}</span>
                      <code className="text-[#64748b]">{v.hash.slice(0, 6)}</code>
                    </div>
                    {v.change_message && (
                      <p className="text-[#64748b] line-clamp-1">{v.change_message}</p>
                    )}
                    <p className="text-[#64748b] text-[10px]">
                      {v.profiles?.full_name ?? v.profiles?.email} · {new Date(v.created_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

const TrustBadge = ({ score }: { score: number }) => {
  const color =
    score >= 70
      ? "text-[var(--verified)]"
      : score >= 40
        ? "text-[var(--pending)]"
        : "text-[var(--danger)]";

  return <span className={`font-medium ${color}`}>{score}%</span>;
};
