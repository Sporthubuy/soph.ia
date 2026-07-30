"use client";

import { useTranslations } from "next-intl";
import { computeDiff, type DiffLine } from "@/lib/knowledge/diff";
import { Badge } from "@/components/ui/badge";

const lineClass: Record<DiffLine["type"], string> = {
  added:
    "bg-[rgb(52_211_153_/_0.12)] text-[var(--verified)] dark:text-[var(--verified)] border-l-2 border-[rgb(52_211_153_/_0.5)]",
  removed:
    "bg-[rgb(251_106_104_/_0.12)] text-[var(--danger)] dark:text-[var(--danger)] border-l-2 border-[rgb(251_106_104_/_0.5)]",
  unchanged: "border-l-2 border-transparent",
};

const marker: Record<DiffLine["type"], string> = {
  added: "+",
  removed: "-",
  unchanged: " ",
};

export const KUDiffView = ({
  oldText,
  newText,
}: {
  oldText: string;
  newText: string;
}) => {
  const t = useTranslations("review");
  const diff = computeDiff(oldText, newText);
  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="outline" className="text-[var(--verified)]">
          {t("linesAdded", { count: added })}
        </Badge>
        <Badge variant="outline" className="text-[var(--danger)]">
          {t("linesRemoved", { count: removed })}
        </Badge>
      </div>
      <div className="max-h-80 overflow-auto rounded-md border bg-muted/30 font-mono text-xs">
        {diff.map((line, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 px-2 py-0.5 ${lineClass[line.type]}`}
          >
            <span className="w-4 shrink-0 select-none text-right text-muted-foreground/60">
              {marker[line.type]}
            </span>
            <span className="w-8 shrink-0 select-none text-right text-muted-foreground/60">
              {line.oldNum ?? ""}
            </span>
            <span className="w-8 shrink-0 select-none text-right text-muted-foreground/60">
              {line.newNum ?? ""}
            </span>
            <span className="whitespace-pre-wrap break-words pr-2">
              {line.text || " "}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
