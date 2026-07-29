"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

type HeaderKey = "dashboard" | "graph" | "editor" | "review" | "agents" | "marketplace" | "settings";

const pathToKey: Record<string, HeaderKey> = {
  "/dashboard": "dashboard",
  "/projects": "dashboard",
  "/knowledge": "editor",
  "/graph": "graph",
  "/editor": "editor",
  "/review": "review",
  "/agents": "agents",
  "/marketplace": "marketplace",
  "/settings": "settings",
};

export function DashboardHeader({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const t = useTranslations("header");
  const base = "/" + pathname.split("/")[1];
  const key = pathToKey[base];
  const title = key ? t(key) : t("fallback");
  const desc = key ? t(`${key}Desc`) : "";

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-lg">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">{orgName}</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm text-muted-foreground">{title}</span>
          {desc && (
            <span className="hidden text-xs text-muted-foreground/60 sm:inline">
              · {desc}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </button>
          <LanguageSwitcher />
          <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            v0.1
          </Link>
        </div>
      </div>
    </header>
  );
}
