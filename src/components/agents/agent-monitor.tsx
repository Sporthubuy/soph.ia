"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateAgentStatus, deleteAgent } from "@/lib/knowledge/actions";

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

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  deployed: "default",
  paused: "secondary",
  draft: "outline",
  archived: "destructive",
};
const statusLabel: Record<string, string> = {
  deployed: "Activo",
  paused: "Pausado",
  draft: "Borrador",
  archived: "Archivado",
};

export const AgentMonitor = ({ agents }: { agents: Agent[] }) => {
  const t = useTranslations("agents");
  const tc = useTranslations("common");

  if (agents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("noVerifiedKnowledge")}
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tc("name")}</TableHead>
            <TableHead>{t("model")}</TableHead>
            <TableHead>{tc("status")}</TableHead>
            <TableHead className="text-center">{t("detailInvocations")}</TableHead>
            <TableHead>{t("detailLastInvocation")}</TableHead>
            <TableHead className="text-right">{tc("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((a) => (
            <AgentRow key={a.id} agent={a} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const AgentRow = ({ agent }: { agent: Agent }) => {
  const t = useTranslations("agents");
  const tc = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const setStatus = (status: string) => {
    setError(null);
    startTransition(async () => {
      const res = await updateAgentStatus(agent.id, status);
      if (res?.error) setError(res.error);
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteAgent(agent.id);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{agent.name}</div>
        {agent.description && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {agent.description}
          </div>
        )}
        {error && <div className="text-xs text-destructive">{error}</div>}
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {agent.provider} / {agent.model}
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant[agent.status] ?? "outline"}>
          {statusLabel[agent.status] ?? agent.status}
        </Badge>
      </TableCell>
      <TableCell className="text-center tabular-nums">
        {agent.invocations}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {agent.last_invoked_at
          ? new Date(agent.last_invoked_at).toLocaleString("es")
          : "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {agent.status === "deployed" ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setStatus("paused")}
            >
              {t("detailPause")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setStatus("deployed")}
            >
              {t("detailActivate")}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={remove}
          >
            {tc("delete")}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};