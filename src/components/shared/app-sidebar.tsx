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
import { Icon, type IconName } from "@/components/shared/icon";
import { Logo, LogoMark, Wordmark } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  ready: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview", ready: true },
  { href: "/projects", label: "Proyectos", icon: "projects", ready: true },
  { href: "/knowledge", label: "Knowledge", icon: "knowledge", ready: true },
  { href: "/graph", label: "Graph", icon: "graph", ready: true },
  { href: "/agents", label: "Agents", icon: "agents", ready: true },
  { href: "/review", label: "Review", icon: "review", ready: true },
  { href: "/people", label: "People", icon: "people", ready: true },
  { href: "/marketplace", label: "Marketplace", icon: "store", ready: true },
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

  const navLink = (item: { href: string; label: string; icon: IconName }) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-all ${
          active
            ? "bg-[rgb(59_130_246_/_0.10)] text-[var(--azure)]"
            : "text-[var(--star-2)] hover:bg-[var(--sky-3)] hover:text-[var(--star-1)]"
        }`}
      >
        {/* connective edge — a small azure body on the active node */}
        <span
          aria-hidden
          className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--azure)] transition-opacity ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
        <Icon
          name={item.icon}
          size={19}
          className="flex-shrink-0"
          strokeWidth={active ? 1.9 : 1.6}
        />
        <span className="body-md">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--sky-2)]">
      <div className="border-b border-[var(--edge)] p-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="inline-flex transition-opacity hover:opacity-80"
        >
          <Logo markSize={38} />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
        {navItems.map((item) => {
          if (!item.ready) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                title="Próximamente"
                className="flex cursor-not-allowed select-none items-center gap-3 rounded-[10px] px-3 py-2.5 text-[var(--star-4)]"
              >
                <Icon name={item.icon} size={19} className="flex-shrink-0" />
                <span className="body-md flex-1">{item.label}</span>
                <span className="label-xs rounded-full border border-[var(--edge)] px-2 py-0.5 text-[var(--star-4)]">
                  Pronto
                </span>
              </span>
            );
          }
          return navLink(item);
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--edge)] p-3">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="label-sm text-[var(--star-3)]">Language</span>
          <LanguageSwitcher />
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <span className="label-sm text-[var(--star-3)]">Theme</span>
          <ThemeToggle />
        </div>

        {navLink({ href: "/settings", label: "Settings", icon: "settings" })}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left body-md text-[var(--star-2)] transition-colors hover:bg-[var(--sky-3)] hover:text-[var(--star-1)] disabled:opacity-60"
        >
          <Icon name="signout" size={19} className="flex-shrink-0" />
          <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
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
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[var(--edge)] bg-[var(--sky-2)] px-4 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--edge)] text-[var(--star-2)] hover:bg-[var(--sky-3)]"
            aria-label="Abrir menú"
          >
            <Icon name="menu" size={20} />
          </button>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <LogoMark size={30} />
            <Wordmark className="text-[15px]" />
          </Link>
        </header>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            className="w-72 border-r border-[var(--edge)] bg-[var(--sky-2)] p-0 sm:max-w-[18rem]"
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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--edge)] md:flex">
      <SidebarNav />
    </aside>
  );
};
