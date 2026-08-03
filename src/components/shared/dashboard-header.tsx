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
    <header className="sticky top-0 z-20 border-b" style={{
      backgroundColor: "var(--sky-1)",
      borderColor: "var(--edge)",
      backdropFilter: "blur(12px)"
    }}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo + Org Name */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 1376 768" fill="none" className="h-6 w-6">
              <use href="/logo.svg#root" />
              {/* Fallback: inline logo */}
              <circle cx="12" cy="12" r="3" fill="var(--azure)" opacity="0.3" />
              <circle cx="12" cy="12" r="8" fill="none" stroke="var(--azure)" strokeWidth="1" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "var(--star-1)" }}>
              SOPH.IA
            </span>
          </Link>
          <div className="h-6 w-px" style={{ backgroundColor: "var(--edge)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--star-1)" }}>{orgName}</span>
          <span style={{ color: "var(--edge)" }}>/</span>
          <span className="text-sm" style={{ color: "var(--star-3)" }}>{title}</span>
          {desc && (
            <span className="hidden text-xs sm:inline" style={{ color: "var(--star-4)" }}>
              · {desc}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg p-1.5 transition-colors" style={{
            color: "var(--star-3)",
            backgroundColor: "transparent"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--sky-3)";
            e.currentTarget.style.color = "var(--star-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--star-3)";
          }}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </button>
          <LanguageSwitcher />
          <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{
            backgroundColor: "var(--azure)",
            color: "white"
          }}>
            v0.1
          </Link>
        </div>
      </div>
    </header>
  );
}
