"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { cloneAgent } from "@/lib/agents/actions";

export function CloneButton({ agentId }: { agentId: string }) {
  const t = useTranslations("marketplace");
  const router = useRouter();
  const [cloning, setCloning] = useState(false);
  const [cloned, setCloned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleClone = () => {
    setCloning(true);
    setError(null);
    startTransition(async () => {
      const res = await cloneAgent(agentId);
      if (res?.error) {
        setError(res.error);
        setCloning(false);
      } else {
        setCloned(true);
        setTimeout(() => {
          router.push("/agents");
        }, 800);
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClone}
        disabled={cloning || cloned}
        className={`w-full px-4 py-2 rounded-[10px] label-sm font-medium transition-all ${
          cloned
            ? "bg-[var(--verified)]/15 text-[var(--verified)] border border-[var(--verified)]/30"
            : "bg-[var(--azure)] text-white hover:bg-[var(--azure-bright)] border border-[var(--azure)]"
        } disabled:opacity-60`}
      >
        {cloned ? "✓ " + t("cloned") : cloning ? "…" : t("clone")}
      </button>
      {cloned && (
        <p className="text-xs text-[var(--verified)]">{t("clonedDesc")}</p>
      )}
      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
