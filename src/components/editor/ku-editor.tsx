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
import { KUStatusBadge } from "@/components/shared/ku-status-badge";
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
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [loading, setLoading] = useState(false);

  const hasChanges = title !== ku.title || content !== ku.content;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    formData.set("kuId", ku.id);
    formData.set("title", title);
    formData.set("content", content);
    formData.set("changeMessage", changeMessage);
    const result = await updateKnowledgeUnit(formData);
    if (result?.error) {
      toast.add({ type: "error", title: t("saveError"), description: result.error });
    } else {
      toast.add({ type: "success", title: t("changeProposed"), description: t("changeProposedDesc") });
      setChangeMessage("");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-1 gap-6">
      <div className="flex-1 space-y-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">{t("contentLabel")}</Label>
              <div className="flex rounded-md border p-0.5 text-xs">
                <button
                  type="button"
                  className={`rounded px-2 py-1 ${
                    tab === "write"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setTab("write")}
                >
                  {t("write")}
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1 ${
                    tab === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setTab("preview")}
                >
                  {t("preview")}
                </button>
              </div>
            </div>
            {tab === "write" ? (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none overflow-auto rounded-md border p-4 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mt-2 [&_h2]:mt-2 [&_h3]:mt-2 [&_pre]:bg-muted [&_pre]:p-3"
                dangerouslySetInnerHTML={{
                  __html:
                    renderMarkdown(content) ||
                    `<p class="text-muted-foreground">${t("previewEmpty")}</p>`,
                }}
              />
            )}
          </div>

          {hasChanges && (
            <div className="space-y-2">
              <Label htmlFor="changeMessage">
                {t("changeMessage")}
              </Label>
              <Input
                id="changeMessage"
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                placeholder={t("changeMessagePlaceholder")}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!hasChanges || loading}>
              {loading ? t("saving") : t("proposeChange")}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link href="/knowledge" />}
            >
              {t("backToList")}
            </Button>
          </div>
        </form>
      </div>

      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">{t("details")}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tc("status")}</span>
              <KUStatusBadge status={ku.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("trustScore")}</span>
              <TrustBadge score={ku.trust_score} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tc("version")}</span>
              <span>{ku.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("domain")}</span>
              <span>{ku.domains?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("owner")}</span>
              <span className="truncate max-w-[120px]">
                {ku.profiles?.full_name ?? ku.profiles?.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("hash")}</span>
              <code className="text-xs text-muted-foreground">
                {ku.hash.slice(0, 8)}
              </code>
            </div>
          </div>

          <Separator />

          <KUDependencies
            kuId={ku.id}
            dependencies={dependencies}
            candidates={candidates}
          />

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">{t("versionHistory")}</h3>
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noVersions")}</p>
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
                      {new Date(v.created_at).toLocaleDateString(locale)}
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
      ? "text-[var(--verified)] dark:text-[var(--verified)]"
      : score >= 40
        ? "text-[var(--pending)] dark:text-[var(--pending)]"
        : "text-[var(--danger)] dark:text-[var(--danger)]";

  return <span className={`font-medium ${color}`}>{score}/100</span>;
};
