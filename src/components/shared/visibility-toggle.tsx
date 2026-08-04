"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/shared/icon";

interface VisibilityToggleProps {
  itemId: string;
  itemType: "knowledge_unit" | "project" | "agent";
  currentVisibility: "private" | "public" | "unlisted";
  organizationId: string;
  onlyOwner?: boolean;
}

const VISIBILITY_LABELS: Record<
  "private" | "public" | "unlisted",
  { label: string; icon: IconName; description: string }
> = {
  private: { label: "Private", icon: "lock", description: "Only organization members" },
  public: { label: "Public", icon: "globe", description: "Visible to everyone, in marketplace" },
  unlisted: {
    label: "Unlisted",
    icon: "link",
    description: "Visible to everyone but not in marketplace",
  },
};

export function VisibilityToggle({
  itemId,
  itemType,
  currentVisibility,
  organizationId,
  onlyOwner = false,
}: VisibilityToggleProps) {
  const t = useTranslations();
  const [visibility, setVisibility] = useState<"private" | "public" | "unlisted">(
    currentVisibility
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVisibilityChange = async (newVisibility: "private" | "public" | "unlisted") => {
    if (onlyOwner) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemType,
          visibility: newVisibility,
          organizationId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update visibility");
      }

      setVisibility(newVisibility);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const current = VISIBILITY_LABELS[visibility];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)]">
          <Icon name={current.icon} size={18} />
        </span>
        <div>
          <p className="label-md text-[var(--star-3)]">Visibility</p>
          <p className="body-sm text-[var(--star-4)]">{current.description}</p>
        </div>
      </div>

      {error && (
        <div className="bg-[rgb(239_68_68_/_0.12)] border border-[rgb(239_68_68_/_0.35)] rounded-lg p-3 text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {(
          Object.entries(VISIBILITY_LABELS) as Array<
            [keyof typeof VISIBILITY_LABELS, (typeof VISIBILITY_LABELS)[keyof typeof VISIBILITY_LABELS]]
          >
        ).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => handleVisibilityChange(key)}
            disabled={isLoading || onlyOwner}
            className={`p-3 rounded-[10px] border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
              visibility === key
                ? "border-[rgb(59_130_246_/_0.5)] bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)]"
                : "border-[var(--edge)] text-[var(--star-3)] hover:border-[#334155]"
            } ${isLoading || onlyOwner ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Icon name={icon} size={22} />
            <span className="label-xs text-center text-[var(--star-3)]">{label}</span>
          </button>
        ))}
      </div>

      {onlyOwner && (
        <p className="text-xs text-[var(--star-4)]">Only the owner can change visibility</p>
      )}
    </div>
  );
}
