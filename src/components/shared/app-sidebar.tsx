"use client";

import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  ready: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "📊", ready: true },
  { href: "/projects", label: "Proyectos", icon: "📁", ready: true },
  { href: "/knowledge", label: "Knowledge", icon: "📖", ready: true },
  { href: "/graph", label: "Graph", icon: "🔗", ready: true },
  { href: "/agents", label: "Agents", icon: "🤖", ready: true },
  { href: "/review", label: "Review", icon: "✅", ready: true },
  { href: "/people", label: "People", icon: "👥", ready: false },
  { href: "/marketplace", label: "Marketplace", icon: "🏪", ready: false },
];

const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="w-full bg-white flex flex-col h-full">
      <div className="p-6 border-b border-[#e2e8f0]">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center flex-shrink-0">
            <span className="text-lg" aria-hidden>
              💾
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-black text-sm">SOPH.IA</span>
            <span className="text-xs text-[#7c839b]">KNOWLEDGE OS</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Main">
        {navItems.map((item) => {
          if (!item.ready) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                title="Proximamente"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a8adbd] cursor-not-allowed select-none"
              >
                <span className="text-xl flex-shrink-0" aria-hidden>
                  {item.icon}
                </span>
                <span className="body-md flex-1">{item.label}</span>
                <span className="label-sm text-[#a8adbd] border border-[#e2e8f0] rounded px-1.5 py-0.5">
                  Pronto
                </span>
              </span>
            );
          }

          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? "bg-[#e1e0ff] text-[#4648d4] font-medium"
                  : "text-[#45464d] hover:bg-[#f7f9fb]"
              }`}
            >
              <span className="text-xl flex-shrink-0" aria-hidden>
                {item.icon}
              </span>
              <span className="body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#e2e8f0] space-y-2">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="label-sm text-[#7c839b]">Language</span>
          <LanguageSwitcher />
        </div>

        <Link
          href="/settings"
          onClick={onNavigate}
          aria-current={isActive("/settings") ? "page" : undefined}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive("/settings")
              ? "bg-[#e1e0ff] text-[#4648d4] font-medium"
              : "text-[#45464d] hover:bg-[#f7f9fb]"
          }`}
        >
          <span className="text-xl" aria-hidden>
            ⚙️
          </span>
          <span className="body-md">Settings</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#45464d] hover:bg-[#f7f9fb] transition-colors text-left body-md"
        >
          <span className="text-xl" aria-hidden>
            🚪
          </span>
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
};

export const AppSidebar = () => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isMobile) {
    return (
      <>
        <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#e2e8f0] bg-white px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#45464d] hover:bg-[#f7f9fb]"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined" aria-hidden>
              menu
            </span>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-base" aria-hidden>
                database
              </span>
            </div>
            <span className="font-bold text-black text-sm truncate">SOPH.IA</span>
          </Link>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            className="w-72 p-0 bg-white border-r border-[#e2e8f0] sm:max-w-[18rem]"
            showCloseButton
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-[#e2e8f0] h-screen sticky top-0">
      <SidebarNav />
    </aside>
  );
};
