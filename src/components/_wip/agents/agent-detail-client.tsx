"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  updateAgentStatus,
  updateAgentConfig,
  publishAgent,
  unpublishAgent,
  rateAgent,
} from "@/lib/knowledge/actions";

type AgentFull = {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  provider: string;
  model: string;
  temperature: number;
  selected_ku_ids: string[];
  status: string;
  visibility: string;
  invocations: number;
  last_invoked_at: string | null;
  rating: number;
  ratings_count: number;
  cloned_from: string | null;
  tags: string[];
  organization_id: string;
  created_at: string;
  updated_at: string;
  organizations: { name: string } | null;
  profiles: { full_name: string | null; email: string } | null;
};

type ApprovedKU = {
  id: string;
  title: string;
  content: string;
  version: number;
  trust_score: number;
  domain_id: string;
  domainName: string;
};

type Domain = { id: string; name: string };

type Tab = "overview" | "config" | "chat" | "monitor";

const StarRating = ({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={readonly}
        onClick={() => onChange?.(n)}
        className={`text-lg ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform ${
          n <= value ? "text-amber-500" : "text-gray-200"
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

export const AgentDetailClient = ({
  agent,
  organizationId,
  kus,
}: {
  agent: AgentFull;
  organizationId: string;
  kus: ApprovedKU[];
  domains?: Domain[];
}) => {
  const router = useRouter();
  const t = useTranslations("agents");
  const tc = useTranslations("common");
  const [tab, setTab] = useState<Tab>("overview");
  const [pending, startTransition] = useTransition();

  const [editName, setEditName] = useState(agent.name);
  const [editDesc, setEditDesc] = useState(agent.description ?? "");
  const [editSys, setEditSys] = useState(agent.system_prompt ?? "");
  const [editProvider, setEditProvider] = useState(agent.provider);
  const [editModel, setEditModel] = useState(agent.model);
  const [editTemp, setEditTemp] = useState(agent.temperature);
  const [editTags, setEditTags] = useState((agent.tags ?? []).join(", "));
  const [configError, setConfigError] = useState<string | null>(null);
  const [configOk, setConfigOk] = useState(false);

  const [rating, setRating] = useState(Math.round(agent.rating));
  const [review, setReview] = useState("");

  const myKus = kus.filter((k) => agent.selected_ku_ids?.includes(k.id));

  const saveConfig = () => {
    setConfigError(null);
    setConfigOk(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("agentId", agent.id);
      fd.set("name", editName);
      fd.set("description", editDesc);
      fd.set("systemPrompt", editSys);
      fd.set("provider", editProvider);
      fd.set("model", editModel);
      fd.set("temperature", String(editTemp));
      fd.set("tags", editTags);
      const r = await updateAgentConfig(fd);
      if (r?.error) setConfigError(r.error);
      else { setConfigOk(true); router.refresh(); }

    });
  };

  const setStatus = (s: string) => startTransition(async () => { await updateAgentStatus(agent.id, s); router.refresh(); });
  const togglePublish = () => startTransition(async () => {
    if (agent.visibility === "public") await unpublishAgent(agent.id);
    else await publishAgent(agent.id);
    router.refresh();
  });

  const rate = () => startTransition(async () => { await rateAgent(agent.id, rating, review || undefined); router.refresh(); });

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("detailOverview") },
    { key: "config", label: t("detailConfig") },
    { key: "chat", label: t("detailTestChat") },
    { key: "monitor", label: t("detailMonitor") },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="card-figma p-6">
              <h3 className="text-sm font-semibold">{tc("description")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{agent.description || t("detailNoDesc")}</p>
            </div>
            <div className="card-figma p-6">
              <h3 className="mb-3 text-sm font-semibold">Knowledge Units ({myKus.length})</h3>
              {myKus.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("detailNoKUs")}</p>
              ) : (
                <div className="space-y-1.5">
                  {myKus.map((k) => (
                    <div key={k.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="text-sm">{k.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{k.domainName}</Badge>
                        <span className="text-xs text-muted-foreground">Trust {k.trust_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-figma p-5 space-y-3">
              <h3 className="text-sm font-semibold">{t("detailInfo")}</h3>
              <div className="space-y-2 text-sm">
                <Row label={t("provider")} value={`${agent.provider} / ${agent.model}`} />
                <Row label={t("temperature")} value={String(agent.temperature)} />
                <Row label={t("detailOrg")} value={agent.organizations?.name ?? "—"} />
                <Row label={t("detailCreatedBy")} value={agent.profiles?.full_name ?? agent.profiles?.email ?? "—"} />
                <Row label={tc("createdAt")} value={new Date(agent.created_at).toLocaleDateString("es")} />
              </div>
            </div>

            <div className="card-figma p-5 space-y-3">
              <h3 className="text-sm font-semibold">{t("detailStatus")}</h3>
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {agent.status === "deployed" ? (
                    <>
                      <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => setStatus("paused")} disabled={pending}>{t("detailPause")}</Button>
                      <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => setStatus("archived")} disabled={pending}>{t("detailArchive")}</Button>
                    </>
                  ) : agent.status === "paused" ? (
                    <Button size="sm" className="rounded-lg text-xs" onClick={() => setStatus("deployed")} disabled={pending}>{t("detailActivate")}</Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="card-figma p-5 space-y-3">
              <h3 className="text-sm font-semibold">{t("detailMarketplace")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("detailVisibility")}</span>
                  <Button size="sm" variant={agent.visibility === "public" ? "default" : "outline"} className="rounded-lg text-xs" onClick={togglePublish} disabled={pending}>
                    {agent.visibility === "public" ? t("detailPublic") : t("detailPrivate")}
                  </Button>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{t("detailRating")}</span>
                    <span className="text-sm font-medium">{agent.rating.toFixed(1)} ({agent.ratings_count})</span>
                  </div>
                  <StarRating value={rating} onChange={setRating} />
                  <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder={t("detailReviewPlaceholder")} className="mt-2 input-figma text-xs" rows={2} />
                  <Button size="sm" className="mt-2 rounded-lg w-full" onClick={rate} disabled={pending}>{t("detailRate")}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config */}
      {tab === "config" && (
        <div className="card-figma mx-auto w-full max-w-xl p-6 space-y-5">
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{tc("name")}</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-figma" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{tc("description")}</Label><Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input-figma" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{t("systemPrompt")}</Label><Textarea value={editSys} onChange={(e) => setEditSys(e.target.value)} rows={4} className="input-figma" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{t("provider")}</Label>
              <select value={editProvider} onChange={(e) => setEditProvider(e.target.value)} className="h-9 w-full rounded-lg border bg-white px-3 text-sm">
                <option value="google">Google (Gemini)</option><option value="anthropic">Anthropic</option><option value="openai">OpenAI</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{t("model")}</Label>
              <select value={editModel} onChange={(e) => setEditModel(e.target.value)} className="h-9 w-full rounded-lg border bg-white px-3 text-sm">
                {editProvider === "anthropic" ? (
                  <><option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option><option value="claude-3-5-haiku-latest">Claude 3.5 Haiku</option><option value="claude-3-opus-latest">Claude 3 Opus</option></>
                ) : editProvider === "google" ? (
                  <><option value="gemini-2.0-flash">Gemini 2.0 Flash</option><option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option><option value="gemini-1.5-flash">Gemini 1.5 Flash</option></>
                ) : (
                  <><option value="gpt-4o-mini">GPT-4o Mini</option><option value="gpt-4o">GPT-4o</option><option value="gpt-4-turbo">GPT-4 Turbo</option></>
                )}
              </select>
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{t("temperature")}: {editTemp}</Label><input type="range" min="0" max="1" step="0.1" value={editTemp} onChange={(e) => setEditTemp(Number(e.target.value))} className="w-full" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{t("tags")}</Label><Input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="input-figma" /></div>
          {configError && <p className="text-sm text-destructive">{configError}</p>}
          {configOk && <p className="text-sm text-emerald-600">{t("detailConfigSaved")}</p>}
          <Button className="w-full rounded-xl" onClick={saveConfig} disabled={pending}>{t("detailSaveChanges")}</Button>
        </div>
      )}

      {/* Chat */}
      {tab === "chat" && (
        <AgentChatTab agent={agent} organizationId={organizationId} />
      )}

      {/* Monitor */}
      {tab === "monitor" && (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="card-figma p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("detailInvocations")}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{agent.invocations}</p>
          </div>
          <div className="card-figma p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("detailRating")}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{agent.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{agent.ratings_count} {t("detailVotes")}</p>
          </div>
          <div className="card-figma p-5 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("detailLastInvocation")}</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {agent.last_invoked_at ? new Date(agent.last_invoked_at).toLocaleString("es") : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>
);

/* ── Inline chat tab ───────────────────────────────────────────────── */

const AgentChatTab = ({ agent, organizationId }: { agent: AgentFull; organizationId: string }) => {
  const t = useTranslations("agents");
  const tc = useTranslations("common");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!draft.trim()) return;
    const msg = { role: "user" as const, content: draft.trim() };
    setMessages((p) => [...p, msg]);
    setDraft("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg.content,
          organizationId,
          selectedKuIds: agent.selected_ku_ids,
          history: messages,
          agentId: agent.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error"); return; }
      setMessages((p) => [...p, { role: "assistant", content: json.content ?? "" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="card-figma p-6 space-y-4">
      <div className="h-96 overflow-auto rounded-lg border bg-muted/30 p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground pt-32">{t("detailTestEmpty")}</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-white border"}`}>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </div>
          ))
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-end gap-2">
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={t("detailTestPlaceholder")} rows={2} disabled={loading} className="input-figma" />
        <Button onClick={send} disabled={!draft.trim() || loading} className="rounded-xl">{loading ? tc("sending") : tc("send")}</Button>
      </div>
    </div>
  );
};