"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface VisibilityToggleProps {
  itemId: string;
  itemType: "knowledge_unit" | "project" | "agent";
  currentVisibility: "private" | "public" | "unlisted";
  onlyOwner?: boolean;
}

const VISIBILITY_LABELS = {
  private: { label: "Private", icon: "lock", description: "Only organization members" },
  public: { label: "Public", icon: "public", description: "Visible to everyone, in marketplace" },
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
      const response = await fetch("/api/update-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          itemType,
          visibility: newVisibility,
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
        <span className="material-symbols-outlined text-lg text-[#7c839b]">{current.icon}</span>
        <div>
          <p className="label-md text-[#45464d]">Visibility</p>
          <p className="body-sm text-[#7c839b]">{current.description}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(VISIBILITY_LABELS) as Array<[keyof typeof VISIBILITY_LABELS, any]>).map(
          ([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => handleVisibilityChange(key as any)}
              disabled={isLoading || onlyOwner}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                visibility === key
                  ? "border-blue-500 bg-blue-50"
                  : "border-[#e2e8f0] hover:border-[#cbd5e1]"
              } ${isLoading || onlyOwner ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="material-symbols-outlined text-2xl">{icon}</span>
              <span className="label-xs text-center text-[#45464d]">{label}</span>
            </button>
          )
        )}
      </div>

      {onlyOwner && (
        <p className="text-xs text-[#7c839b]">Only the owner can change visibility</p>
      )}
    </div>
  );
}
