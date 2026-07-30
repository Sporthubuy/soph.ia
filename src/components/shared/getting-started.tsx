"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

export type GettingStartedProgress = {
  hasDomains: boolean;
  hasKus: boolean;
  hasProposed: boolean;
  hasApproved: boolean;
  hasAgent: boolean;
  domainCount: number;
  kuCount: number;
  agentCount: number;
};

const steps = [
  { id: "domains", check: "hasDomains", href: "/settings", titleKey: "step1Title", descKey: "step1Desc" },
  { id: "first_ku", check: "hasKus", href: "/knowledge/new", titleKey: "step2Title", descKey: "step2Desc" },
  { id: "propose", check: "hasProposed", href: "/knowledge", titleKey: "step3Title", descKey: "step3Desc" },
  { id: "review", check: "hasApproved", href: "/review", titleKey: "step4Title", descKey: "step4Desc" },
  { id: "agent", check: "hasAgent", href: "/agents/new", titleKey: "step5Title", descKey: "step5Desc" },
  { id: "graph", check: "optional", href: "/graph", titleKey: "step6Title", descKey: "step6Desc" },
] as const;

const checkMap = (
  progress: GettingStartedProgress
): Record<string, boolean> => ({
  hasDomains: progress.hasDomains,
  hasKus: progress.hasKus,
  hasProposed: progress.hasProposed,
  hasApproved: progress.hasApproved,
  hasAgent: progress.hasAgent,
  optional: false,
});

export const GettingStartedChecklist = ({
  progress,
  welcome,
}: {
  progress: GettingStartedProgress;
  welcome?: boolean;
}) => {
  const t = useTranslations("dashboard");
  const tg = useTranslations("gettingStarted");
  const tc = useTranslations("common");
  const checks = checkMap(progress);
  const required = steps.filter((s) => s.check !== "optional");
  const done = required.filter((s) => checks[s.check]).length;
  const total = required.length;
  const pct = Math.round((done / total) * 100);
  const complete = done >= total;

  if (complete && !welcome) return null;

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-[#212a3e] bg-gradient-to-r from-[#16233d]/60 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#5b9bff]">
              {t("gettingStartedGuide")}
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-[var(--star-1)]">
              {welcome
                ? t("gettingStartedWelcome")
                : t("gettingStartedTitle")}
            </h2>
            <p className="mt-1 text-xs text-[#8b95ab]">
              {complete
                ? t("gettingStartedComplete")
                : t("gettingStartedProgress", { done, total })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#5b9bff]">{pct}%</p>
            <p className="text-[10px] text-[#8b95ab]">{t("progress")}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#212a3e]">
          <div
            className="h-full rounded-full bg-[#5b9bff] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-[#212a3e]">
        {steps.map((step, i) => {
          const isDone =
            step.check === "optional" ? false : !!checks[step.check];
          const isOptional = step.check === "optional";
          return (
            <div
              key={step.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#0a0e17]"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-[rgb(52_211_153_/_0.16)] text-[var(--verified)]"
                    : "bg-[#151b2b] text-[#8b95ab]"
                }`}
              >
                {isDone ? <Icon name="check" size={14} strokeWidth={2.6} /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--star-1)]">
                  {tg(step.titleKey)}
                  {isOptional && (
                    <span className="ml-2 text-[10px] font-normal text-[#8b95ab]">
                      {tc("optional")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#8b95ab]">{tg(step.descKey)}</p>
              </div>
              {!isDone && (
                <Button
                  render={<Link href={step.href} />}
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-lg text-xs"
                >
                  {tc("go")}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
