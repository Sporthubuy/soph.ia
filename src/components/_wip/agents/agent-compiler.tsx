"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AgentDeployForm } from "@/components/agents/agent-deploy-form";
import { AgentMonitor } from "@/components/agents/agent-monitor";

type ApprovedKU = {
  id: string;
  title: string;
  content: string;
  version: number;
  trust_score: number;
  domain_id: string;
  domainName: string;
  updated_at: string;
};

type Domain = { id: string; name: string };

type ChatMessage = { role: "user" | "assistant"; content: string };

type Agent = {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model: string;
  status: string;
  invocations: number;
  last_invoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export const AgentCompiler = ({
  organizationId,
  units,
  domains,
  agents,
}: {
  organizationId: string;
  units: ApprovedKU[];
  domains: Domain[];
  agents: Agent[];
}) => {
  const t = useTranslations("agents");
  const tc = useTranslations("common");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [preview, setPreview] = useState<{ context: string; units: string[] } | null>(null);
  const [pendingPreview, startPreview] = useTransition();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingChat, startChat] = useTransition();
  const [chatError, setChatError] = useState<string | null>(null);
  const router = useRouter();

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (domainFilter !== "all" && u.domain_id !== domainFilter) return false;
      if (search && !u.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [units, domainFilter, search]);

  const groupedByDomain = useMemo(() => {
    const map = new Map<string, ApprovedKU[]>();
    for (const u of filteredUnits) {
      const arr = map.get(u.domain_id) ?? [];
      arr.push(u);
      map.set(u.domain_id, arr);
    }
    return map;
  }, [filteredUnits]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(new Set(filteredUnits.map((u) => u.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const buildPreview = () => {
    startPreview(async () => {
      const res = await fetch("/api/agents/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          selectedKuIds: Array.from(selected),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPreview(null);
        return;
      }
      setPreview({
        context: json.context ?? "",
        units: (json.units ?? []) as string[],
      });
    });
  };

  const send = () => {
    if (!draft.trim() || selected.size === 0) return;
    const userMsg: ChatMessage = { role: "user", content: draft.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setChatError(null);
    startChat(async () => {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg.content,
          organizationId,
          selectedKuIds: Array.from(selected),
          history: messages,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setChatError(json.error ?? t("deployError"));
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.content ?? "" },
      ]);
    });
  };

  if (units.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("noVerifiedKnowledge")}</CardTitle>
          <CardDescription>
            {t("noVerifiedDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/knowledge/new" />} variant="outline">
            {t("createNew")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* Selección */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder={t("searchKUs")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">{t("allDomains")}</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAllVisible}>
              {t("selectVisible")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={selected.size === 0}
            >
              {t("clear")}
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {t("selectedKUs", { selected: selected.size, visible: filteredUnits.length })}
        </div>

        <div className="space-y-4">
          {Array.from(groupedByDomain.entries()).map(([domainId, kus]) => {
            const domain = domains.find((d) => d.id === domainId);
            return (
              <div key={domainId} className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {domain?.name ?? t("noDomain")}
                </h3>
                <div className="space-y-1.5">
                  {kus.map((ku) => {
                    const checked = selected.has(ku.id);
                    return (
                      <label
                        key={ku.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? "border-primary bg-primary/5"
                            : "hover:bg-accent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(ku.id)}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">
                              {ku.title}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              Trust {ku.trust_score}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            v{ku.version} · {ku.domainName} ·{" "}
                            {new Date(ku.updated_at).toLocaleDateString("es")}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview y chat */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{t("compiledContext")}</CardTitle>
                <CardDescription>
                  {t("compiledContextDesc")}
                </CardDescription>
              </div>
              <Button onClick={buildPreview} disabled={selected.size === 0 || pendingPreview}>
                {pendingPreview ? t("compiling") : t("compile")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!preview ? (
              <p className="text-sm text-muted-foreground">
                {t("compileEmpty")}
              </p>
            ) : preview.context === "" ? (
              <p className="text-sm text-muted-foreground">
                {t("compileNoContext")}
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">
                    {preview.units.length} KU(s)
                  </Badge>
                  <Badge variant="outline">
                    {preview.context.length} {t("characters")}
                  </Badge>
                </div>
                <div className="h-64 overflow-auto rounded-md border p-3">
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                    {preview.context}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("testChatTitle")}</CardTitle>
            <CardDescription>
              {t("testChatDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected.size === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("testChatSelectKU")}
              </p>
            ) : (
              <>
                <div className="h-72 overflow-auto rounded-md border p-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("testChatNoMessages")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m, i) => (
                        <div
                          key={i}
                          className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                            m.role === "user"
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {m.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {chatError && (
                  <p className="text-sm text-destructive">{chatError}</p>
                )}
                <Separator />
                <div className="flex items-end gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={t("testChatInputPlaceholder")}
                    rows={2}
                    disabled={pendingChat}
                    className="text-sm"
                  />
                  <Button
                    onClick={send}
                    disabled={!draft.trim() || pendingChat}
                  >
                    {pendingChat ? tc("sending") : tc("send")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("deployMonitor")}</CardTitle>
          <CardDescription>
            {t("deployMonitorDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AgentDeployForm
            organizationId={organizationId}
            selectedKuIds={Array.from(selected)}
            onDeployed={() => router.refresh()}
          />
          <Separator />
          <AgentMonitor agents={agents} />
        </CardContent>
      </Card>
    </div>
  );
};