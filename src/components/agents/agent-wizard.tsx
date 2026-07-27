"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";

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

type ChatMessage = { role: "user" | "assistant"; content: string };

type WizardStep = "select" | "configure" | "test" | "deploy";

export const AgentWizard = ({
  organizationId,
  units,
  domains,
}: {
  organizationId: string;
  units: ApprovedKU[];
  domains: Domain[];
}) => {
  const t = useTranslations("agents");
  const tc = useTranslations("common");
  const [step, setStep] = useState<WizardStep>("select");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [domainFilter, setDomainFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [provider, setProvider] = useState("google");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [temperature, setTemperature] = useState(0.4);
  const [tags, setTags] = useState("");
  const [makePublic, setMakePublic] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployedId, setDeployedId] = useState<string | null>(null);

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (domainFilter !== "all" && u.domain_id !== domainFilter) return false;
      if (search && !u.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [units, domainFilter, search]);

  const grouped = useMemo(() => {
    const m = new Map<string, ApprovedKU[]>();
    for (const u of filteredUnits) {
      const a = m.get(u.domain_id) ?? [];
      a.push(u);
      m.set(u.domain_id, a);
    }
    return m;
  }, [filteredUnits]);

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const send = async () => {
    if (!draft.trim()) return;
    const msg: ChatMessage = { role: "user", content: draft.trim() };
    setMessages((p) => [...p, msg]);
    setDraft("");
    setChatError(null);
    setChatLoading(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: msg.content,
          organizationId,
          selectedKuIds: Array.from(selected),
          history: messages,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setChatError(json.error ?? "Error"); return; }
      setMessages((p) => [...p, { role: "assistant", content: json.content ?? "" }]);
    } finally {
      setChatLoading(false);
    }
  };

  const deploy = async () => {
    if (!name.trim() || selected.size === 0) {
      setDeployError(t("nameKURequired"));
      return;
    }
    setDeployError(null);
    setDeployLoading(true);
    const fd = new FormData();
    fd.set("organizationId", organizationId);
    fd.set("name", name.trim());
    fd.set("description", description);
    fd.set("systemPrompt", systemPrompt);
    fd.set("provider", provider);
    fd.set("model", model);
    fd.set("temperature", String(temperature));
    fd.set("selectedKuIds", JSON.stringify(Array.from(selected)));
    const res = await fetch("/api/agents/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        name: name.trim(),
        description,
        systemPrompt,
        provider,
        model,
        temperature,
        selectedKuIds: Array.from(selected),
        visibility: makePublic ? "public" : "private",
        tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      }),
    });
    const json = await res.json();
    setDeployLoading(false);
    if (!res.ok) {
      setDeployError(json.error ?? t("deployError"));
      toast.add({ type: "error", title: t("deployError"), description: json.error ?? t("deployErrorDesc") });
      return;
    }
    setDeployedId(json.id ?? null);
    toast.add({ type: "success", title: t("deployedToast"), description: t("deployedToastDesc", { name }) });
  };

  const steps: { key: WizardStep; label: string; num: number }[] = [
    { key: "select", label: t("wizardStep1"), num: 1 },
    { key: "configure", label: t("wizardStep2"), num: 2 },
    { key: "test", label: t("wizardStep3"), num: 3 },
    { key: "deploy", label: t("wizardStep4"), num: 4 },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* ── Steps indicator ───────────────────── */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.key)}
              disabled={i > currentIdx + 1}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                i === currentIdx
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : i < currentIdx
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                i < currentIdx ? "bg-primary text-primary-foreground" : i === currentIdx ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
              }`}>
                {i < currentIdx ? "✓" : s.num}
              </span>
              {s.label}
            </button>
            {i < steps.length - 1 && <span className="text-muted-foreground/40">→</span>}
          </div>
        ))}
      </div>

      <Separator />

      {/* ── Step 1: Select KUs ────────────────── */}
      {step === "select" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input placeholder={t("searchKUs")} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs input-figma" />
              <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="h-9 rounded-lg border bg-white px-3 text-sm">
                <option value="all">{t("allDomains")}</option>
                {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Button variant="outline" size="sm" className="ml-auto rounded-lg" onClick={() => setSelected(new Set(filteredUnits.map((u) => u.id)))}>
                {t("selectVisible")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{t("selectedCount", { selected: selected.size, total: filteredUnits.length })}</p>

            <div className="max-h-[50vh] space-y-4 overflow-auto pr-2">
              {Array.from(grouped.entries()).map(([did, kus]) => {
                const d = domains.find((x) => x.id === did);
                return (
                  <div key={did} className="space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d?.name ?? t("noDomain")}</h3>
                    {kus.map((ku) => {
                      const checked = selected.has(ku.id);
                      return (
                        <label key={ku.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                          checked ? "border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20" : "border-transparent bg-white hover:bg-muted/50"
                        }`}>
                          <input type="checkbox" checked={checked} onChange={() => toggle(ku.id)} className="mt-1" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-medium">{ku.title}</span>
                              <Badge variant="outline" className="text-[10px]">Trust {ku.trust_score}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">v{ku.version} · {ku.domainName}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-figma p-4">
              <h3 className="mb-2 text-sm font-semibold">{t("selectionSummary")}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t("kusLabel")}</span><span className="font-medium">{selected.size}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("domainsLabel")}</span><span className="font-medium">{new Set(units.filter((u) => selected.has(u.id)).map((u) => u.domain_id)).size}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t("avgTrust")}</span><span className="font-medium">
                  {selected.size > 0 ? Math.round(units.filter((u) => selected.has(u.id)).reduce((a, u) => a + u.trust_score, 0) / selected.size) : "—"}
                </span></div>
              </div>
            </div>
            <Button className="w-full rounded-xl" size="lg" disabled={selected.size === 0} onClick={() => setStep("configure")}>
              {t("continueConfig")}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Configure ──────────────────── */}
      {step === "configure" && (
        <div className="mx-auto w-full max-w-xl space-y-6">
          <div className="card-figma p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("agentName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("agentNamePlaceholder")} className="input-figma" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("agentDesc")}</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("agentDescPlaceholder")} className="input-figma" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("provider")}</Label>
                <select value={provider} onChange={(e) => {
                  const p = e.target.value;
                  setProvider(p);
                  if (p === "anthropic") setModel("claude-3-5-sonnet-latest");
                  else if (p === "openai") setModel("gpt-4o-mini");
                  else if (p === "google") setModel("gemini-2.0-flash");
                }} className="h-9 w-full rounded-lg border bg-white px-3 text-sm">
                  <option value="google">{t("providerGoogle")}</option>
                  <option value="anthropic">{t("providerAnthropic")}</option>
                  <option value="openai">{t("providerOpenAI")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("model")}</Label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="h-9 w-full rounded-lg border bg-white px-3 text-sm">
                  {provider === "anthropic" ? (
                    <>
                      <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                      <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku</option>
                      <option value="claude-3-opus-latest">Claude 3 Opus</option>
                    </>
                  ) : provider === "google" ? (
                    <>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("temperature")}: {temperature}</Label>
              <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("systemPrompt")}</Label>
              <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={3} placeholder={t("systemPromptPlaceholder")} className="input-figma" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("tags")}</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t("tagsPlaceholder")} className="input-figma" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => setStep("select")}>{tc("backTo")}</Button>
            <Button className="flex-1 rounded-xl" disabled={!name.trim()} onClick={() => setStep("test")}>{t("continueTest")}</Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Test ───────────────────────── */}
      {step === "test" && (
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="card-figma p-6">
            <h3 className="mb-4 text-sm font-semibold">{t("testChat")}</h3>
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary">{selected.size} KUs</Badge>
              <Badge variant="outline">{provider} · {model}</Badge>
            </div>
            <div className="mb-3 h-80 overflow-auto rounded-lg border bg-muted/30 p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground pt-24">{t("testChatEmpty")}</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-white border"
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                ))
              )}
            </div>
            {chatError && <p className="mb-3 text-sm text-destructive">{chatError}</p>}
            <div className="flex items-end gap-2">
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={t("testChatPlaceholder")} rows={2} disabled={chatLoading} className="input-figma" />
              <Button onClick={send} disabled={!draft.trim() || chatLoading} className="rounded-xl">{chatLoading ? tc("sending") : tc("send")}</Button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl" onClick={() => setStep("configure")}>{tc("backTo")}</Button>
            <Button className="flex-1 rounded-xl" onClick={() => setStep("deploy")}>{t("continueDeploy")}</Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Deploy ─────────────────────── */}
      {step === "deploy" && (
        <div className="mx-auto w-full max-w-lg space-y-6">
          {deployedId ? (
            <div className="card-figma p-8 text-center animate-scale-in">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{t("deployed")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("deployedDesc", { name })}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button render={<Link href={`/agents/${deployedId}`} />} className="rounded-xl">{t("viewAgent")}</Button>
                <Button variant="outline" render={<Link href="/agents" />} className="rounded-xl">{t("goToAgents")}</Button>
              </div>
            </div>
          ) : (
            <div className="card-figma p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold">{t("finalSummary")}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{tc("name")}</span><span className="font-medium">{name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("provider")}</span><span className="font-medium">{provider} / {model}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("kusLabel")}</span><span className="font-medium">{selected.size}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("temperature")}</span><span className="font-medium">{temperature}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("tags")}</span><span className="font-medium">{tags || "—"}</span></div>
                </div>
              </div>
              <Separator />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)} className="rounded" />
                <div>
                  <span className="text-sm font-medium">{t("publishMarketplace")}</span>
                  <p className="text-xs text-muted-foreground">{t("publishDesc")}</p>
                </div>
              </label>
              {deployError && <p className="text-sm text-destructive">{deployError}</p>}
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => setStep("test")}>{tc("backTo")}</Button>
                <Button className="flex-1 rounded-xl" onClick={deploy} disabled={deployLoading}>
                  {deployLoading ? t("deploying") : t("deployAgent")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};