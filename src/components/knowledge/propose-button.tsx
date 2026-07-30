"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { proposeKnowledgeUnit } from "@/lib/knowledge/actions";

export const ProposeButton = ({ kuId }: { kuId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePropose = async () => {
    setError(null);
    setIsLoading(true);
    const result = await proposeKnowledgeUnit(kuId);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handlePropose}
        disabled={isLoading}
        className="bg-[#5b9bff] text-[var(--azure-ink)] font-medium py-2 px-4 rounded-lg hover:bg-[#3f7fe0] transition-colors disabled:opacity-50 body-sm flex items-center gap-2"
      >
        <span className="text-lg">forward</span>
        {isLoading ? "Proponiendo..." : "Proponer Cambio"}
      </button>
      {error && <p className="body-sm text-[var(--danger)] max-w-xs text-right">{error}</p>}
    </div>
  );
};
