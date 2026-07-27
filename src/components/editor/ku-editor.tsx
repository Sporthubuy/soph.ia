"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { updateKnowledgeUnit } from "@/lib/knowledge/actions";

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

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "secondary" },
  proposed: { label: "Propuesto", variant: "outline" },
  approved: { label: "Aprobado", variant: "default" },
  archived: { label: "Archivado", variant: "destructive" },
};

export const KUEditor = ({
  ku,
  versions,
}: {
  ku: KU;
  versions: VersionItem[];
}) => {
  const [title, setTitle] = useState(ku.title);
  const [content, setContent] = useState(ku.content);
  const [changeMessage, setChangeMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasChanges = title !== ku.title || content !== ku.content;
  const cfg = statusConfig[ku.status] ?? statusConfig.draft;

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    formData.set("kuId", ku.id);
    formData.set("title", title);
    formData.set("content", content);
    formData.set("changeMessage", changeMessage);
    const result = await updateKnowledgeUnit(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setChangeMessage("");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-1 gap-6">
      <div className="flex-1 space-y-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido (Markdown)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          {hasChanges && (
            <div className="space-y-2">
              <Label htmlFor="changeMessage">
                Mensaje del cambio (opcional)
              </Label>
              <Input
                id="changeMessage"
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                placeholder="ej. Actualiza politica de descuentos"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Cambio propuesto correctamente.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!hasChanges || loading}>
              {loading ? "Guardando..." : "Proponer cambio"}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link href="/editor" />}
            >
              Volver al listado
            </Button>
          </div>
        </form>
      </div>

      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">Metadata</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trust Score</span>
              <TrustBadge score={ku.trust_score} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>{ku.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dominio</span>
              <span>{ku.domains?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Responsable</span>
              <span className="truncate max-w-[120px]">
                {ku.profiles?.full_name ?? ku.profiles?.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Hash</span>
              <code className="text-xs text-muted-foreground">
                {ku.hash.slice(0, 8)}
              </code>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Historial de versiones</h3>
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin versiones</p>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <div key={v.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">v{v.version}</span>
                      <code className="text-xs text-muted-foreground">
                        {v.hash.slice(0, 8)}
                      </code>
                    </div>
                    {v.change_message && (
                      <p className="text-muted-foreground">
                        {v.change_message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {v.profiles?.full_name ?? v.profiles?.email ?? "—"} ·{" "}
                      {new Date(v.created_at).toLocaleDateString("es")}
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
      ? "text-green-600 dark:text-green-400"
      : score >= 40
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  return <span className={`font-medium ${color}`}>{score}/100</span>;
};
