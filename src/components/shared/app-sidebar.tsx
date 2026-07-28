"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

export const AppSidebar = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUserData();
  }, []);

  // `ready: false` = la ruta todavia no existe. Se muestra deshabilitada en vez
  // de enlazar a un 404.
  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "dashboard", ready: true },
    { href: "/knowledge", label: "Knowledge", icon: "menu_book", ready: true },
    { href: "/agents", label: "Agents", icon: "smart_toy", ready: true },
    { href: "/review", label: "Review", icon: "fact_check", ready: true },
    { href: "/people", label: "People", icon: "people", ready: false },
    { href: "/marketplace", label: "Marketplace", icon: "store", ready: false },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const NavLink = ({
    item,
  }: {
    item: { href: string; label: string; icon: string; ready: boolean };
  }) => {
    if (!item.ready) {
      return (
        <span
          aria-disabled="true"
          title="Proximamente"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a8adbd] cursor-not-allowed select-none"
        >
          <span className="material-symbols-outlined text-xl flex-shrink-0">
            {item.icon}
          </span>
          <span className="body-md flex-1">{item.label}</span>
          <span className="label-sm text-[#a8adbd] border border-[#e2e8f0] rounded px-1.5 py-0.5">
            Pronto
          </span>
        </span>
      );
    }

    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? "bg-[#e1e0ff] text-[#4648d4] font-medium"
            : "text-[#45464d] hover:bg-[#f7f9fb]"
        }`}
      >
        <span className="material-symbols-outlined text-xl flex-shrink-0">
          {item.icon}
        </span>
        <span className="body-md">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#e2e8f0]">
        <Link href="/dashboard" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-xl">database</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-black text-sm">SOPH.IA</span>
            <span className="text-xs text-[#7c839b]">KNOWLEDGE OS</span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* New Project Button */}
      <div className="p-4 border-t border-[#e2e8f0]">
        <button className="w-full bg-black text-white font-medium py-3 px-4 rounded-lg hover:bg-black/90 transition-colors flex items-center justify-center gap-2 body-md">
          <span className="material-symbols-outlined">add</span>
          New Project
        </button>
      </div>

      {/* Settings Section */}
      <div className="p-4 border-t border-[#e2e8f0]">
        {/* /settings todavia no existe: se muestra deshabilitado, no como link roto. */}
        <span
          aria-disabled="true"
          title="Proximamente"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a8adbd] cursor-not-allowed select-none"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="body-md flex-1">Settings</span>
          <span className="label-sm border border-[#e2e8f0] rounded px-1.5 py-0.5">
            Pronto
          </span>
        </span>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#45464d] hover:bg-[#f7f9fb] transition-colors text-left body-md mt-2"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
};
