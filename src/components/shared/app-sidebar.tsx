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

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "dashboard" },
    { href: "/projects", label: "Projects", icon: "folder_open" },
    { href: "/knowledge", label: "Knowledge", icon: "menu_book" },
    { href: "/agents", label: "Agents", icon: "smart_toy" },
    { href: "/review", label: "Review", icon: "fact_check" },
    { href: "/people", label: "People", icon: "people" },
    { href: "/marketplace", label: "Marketplace", icon: "store" },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const NavLink = ({ item }: { item: { href: string; label: string; icon: string } }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive
            ? "bg-[#e1e0ff] text-[#4648d4] font-medium"
            : "text-[#45464d] hover:bg-[#f7f9fb]"
        }`}
      >
        <span className={`material-symbols-outlined text-xl flex-shrink-0`}>
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
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#45464d] hover:bg-[#f7f9fb] transition-all"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
          <span className="body-md">Settings</span>
        </Link>

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
