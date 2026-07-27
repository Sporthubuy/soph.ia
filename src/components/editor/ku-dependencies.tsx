"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { addKUDependency, removeKUDependency } from "@/lib/knowledge/actions";

type CandidateKU = {
  id: string;
  title: string;
  status: string;
  version: number;
};

export type DependencyEdge = {
  source_ku_id: string;
  target_ku_id: string;
};

export const KUDependencies = ({
  kuId,
  dependencies,
  candidates,
}: {
  kuId: string;
  dependencies: DependencyEdge[];
  candidates: CandidateKU[];
}) => {
  const t = useTranslations("editor");
  const [pendingAdd, setPendingAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [edges, setEdges] = useState(dependencies);

  const candidatesById = new Map(candidates.map((c) => [c.id, c]));

  const outgoing = edges
    .filter((e) => e.source_ku_id === kuId)
    .map((e) => ({
      edge: e,
      other: candidatesById.get(e.target_ku_id) ?? {
        id: e.target_ku_id,
        title: e.target_ku_id.slice(0, 8),
        status: "draft",
        version: 0,
      },
    }));

  const incoming = edges
    .filter((e) => e.target_ku_id === kuId)
    .map((e) => ({
      edge: e,
      other: candidatesById.get(e.source_ku_id) ?? {
        id: e.source_ku_id,
        title: e.source_ku_id.slice(0, 8),
        status: "draft",
        version: 0,
      },
    }));

  const availableTargets = candidates.filter(
    (c) =>
      c.id !== kuId &&
      !edges.some(
        (e) => e.source_ku_id === kuId && e.target_ku_id === c.id
      )
  );

  const handleAdd = (targetId: string) => {
    setError(null);
    setPendingAdd(true);
    startTransition(async () => {
      const res = await addKUDependency(kuId, targetId);
      setPendingAdd(false);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setEdges((prev) => [
          ...prev,
          { source_ku_id: kuId, target_ku_id: targetId },
        ]);
      }
    });
  };

  const handleRemove = (sourceId: string, targetId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await removeKUDependency(sourceId, targetId);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setEdges((prev) =>
          prev.filter(
            (e) =>
              !(e.source_ku_id === sourceId && e.target_ku_id === targetId)
          )
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold">{t("dependsOn")}</h3>
        {outgoing.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noDependencies")}
          </p>
        ) : (
          <div className="space-y-1.5">
            {outgoing.map(({ edge, other }) => (
              <div
                key={`${edge.source_ku_id}-${edge.target_ku_id}`}
                className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
              >
                <Link
                  href={`/editor/${other.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
                  title={other.title}
                >
                  <span className="truncate text-sm">{other.title}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    v{other.version}
                  </Badge>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 shrink-0 px-2 text-xs"
                  disabled={isPending}
                  onClick={() => handleRemove(edge.source_ku_id, edge.target_ku_id)}
                >
                  {t("remove")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 font-semibold">{t("referencedBy")}</h3>
        {incoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noReferences")}
          </p>
        ) : (
          <div className="space-y-1.5">
            {incoming.map(({ edge, other }) => (
              <Link
                key={`${edge.source_ku_id}-${edge.target_ku_id}`}
                href={`/editor/${other.id}`}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5 hover:bg-accent"
                title={other.title}
              >
                <span className="truncate text-sm">{other.title}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  v{other.version}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 font-semibold">{t("addDependency")}</h3>
        {availableTargets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noDependencyOptions")}
          </p>
        ) : (
          <Select
            value=""
            onValueChange={(v) => {
              if (v) handleAdd(v);
            }}
          >
            <SelectTrigger className="w-full" disabled={pendingAdd || isPending}>
              <SelectValue placeholder={t("selectKU")} />
            </SelectTrigger>
            <SelectContent>
              {availableTargets.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title} · v{c.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
};
