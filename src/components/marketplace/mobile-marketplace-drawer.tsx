"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/shared/icon";

interface MobileMarketplaceDrawerProps {
  onFilterChange: (filter: "tag" | "sort", value: string) => void;
  tags: string[];
  currentTag: string;
  currentSort: string;
}

export function MobileMarketplaceDrawer({
  onFilterChange,
  tags,
  currentTag,
  currentSort,
}: MobileMarketplaceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tag" | "sort">("tag");

  const sorts = [
    { id: "newest", label: "Newest", icon: "sparkle" as IconName },
    { id: "rating", label: "Best rated", icon: "chart" as IconName },
    { id: "popular", label: "Most used", icon: "sparkle" as IconName },
  ];

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-[var(--azure)] text-white shadow-lg hover:bg-[var(--azure-bright)] transition-colors"
          aria-label="Filters"
        >
          <Icon name="search" size={20} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="rounded-t-3xl border border-[var(--edge)] bg-[var(--sky-2)] max-h-96 overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center py-2">
            <div className="h-1 w-12 rounded-full bg-[var(--edge)]" />
          </div>

          {/* Header */}
          <div className="sticky top-0 bg-[var(--sky-2)] px-4 py-3 border-b border-[var(--edge)]">
            <h3 className="font-medium text-[var(--star-1)]">Filters</h3>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--edge)]">
            {(["tag", "sort"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium uppercase transition-colors ${
                  activeTab === tab
                    ? "bg-[var(--sky-1)] text-[var(--azure)] border-b-2 border-[var(--azure)]"
                    : "text-[var(--star-3)] hover:text-[var(--star-2)]"
                }`}
              >
                {tab === "tag" ? "Tags" : "Sort"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {activeTab === "tag" ? (
              <>
                <button
                  onClick={() => {
                    onFilterChange("tag", "all");
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentTag === ""
                      ? "bg-[var(--azure)] text-white"
                      : "bg-[var(--sky-3)] text-[var(--star-2)] hover:bg-[var(--sky-4)]"
                  }`}
                >
                  All Tags
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      onFilterChange("tag", tag);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentTag === tag
                        ? "bg-[var(--azure)] text-white"
                        : "bg-[var(--sky-3)] text-[var(--star-2)] hover:bg-[var(--sky-4)]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </>
            ) : (
              sorts.map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => {
                    onFilterChange("sort", sort.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                    currentSort === sort.id
                      ? "bg-[var(--azure)] text-white"
                      : "bg-[var(--sky-3)] text-[var(--star-2)] hover:bg-[var(--sky-4)]"
                  }`}
                >
                  <Icon
                    name={sort.icon}
                    size={16}
                    className={currentSort === sort.id ? "text-white" : ""}
                  />
                  {sort.label}
                </button>
              ))
            )}
          </div>

          {/* Close button */}
          <div className="p-4 border-t border-[var(--edge)]">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-lg bg-[var(--sky-3)] text-[var(--star-2)] font-medium hover:bg-[var(--sky-4)] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
