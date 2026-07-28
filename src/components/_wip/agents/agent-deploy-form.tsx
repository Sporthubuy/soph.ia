"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deployAgent } from "@/lib/knowledge/actions";

export const AgentDeployForm = ({
  organizationId,
  selectedKuIds,
  onDeployed,
}: {
  organizationId: string;
  selectedKuIds: string[];
  onDeployed?: () => void;
}) => {
  const t = useTranslations("agents");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handle = () => {
    if (!name.trim() || selectedKuIds.length === 0) {
      setError(t("nameKURequired"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("organizationId", organizationId);
      fd.set("name", name.trim());
      fd.set("description", description);
      fd.set("systemPrompt", systemPrompt);
      fd.set("provider", "google");
      fd.set("model", "gemini-2.0-flash");
      fd.set("temperature", "0.4");
      fd.set("selectedKuIds", JSON.stringify(selectedKuIds));
      const res = await deployAgent(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setName("");
        setDescription("");
        setSystemPrompt("");
        onDeployed?.();
      }
    });
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <h3 className="text-sm font-semibold">{t("deployFormTitle")}</h3>
      <div className="space-y-1">
        <Label htmlFor="agent-name" className="text-xs">
          {t("deployFormName")}
        </Label>
        <Input
          id="agent-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("deployFormNamePlaceholder")}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="agent-desc" className="text-xs">
          {t("deployFormDesc")}
        </Label>
        <Input
          id="agent-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="agent-sys" className="text-xs">
          {t("deployFormSystemPrompt")}
        </Label>
        <Textarea
          id="agent-sys"
          rows={3}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{selectedKuIds.length} KU(s)</Badge>
        <Badge variant="outline">{t("deployFormBadge")}</Badge>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handle} disabled={pending} size="sm">
        {pending ? t("deployFormDeploying") : t("deployFormButton")}
      </Button>
    </div>
  );
};