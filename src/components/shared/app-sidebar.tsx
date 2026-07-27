"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

export const AppSidebar = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/editor", label: "Editor", icon: "edit_document" },
    { href: "/graph", label: "Graph", icon: "account_tree" },
    { href: "/review", label: "Review", icon: "fact_check" },
    { href: "/agents", label: "Agents", icon: "smart_toy" },
    { href: "/marketplace", label: "Marketplace", icon: "store" },
    { href: "/settings", label: "Settings", icon: "settings" },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#e2e8f0]">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">database</span>
          </div>
          <span className="font-bold text-black">SOPH.IA</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                isActive
                  ? "bg-[#f7f9fb] text-[#4648d4] font-medium"
                  : "text-[#45464d] hover:bg-[#f7f9fb]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[#e2e8f0] space-y-3">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded text-[#45464d] hover:bg-[#f7f9fb] transition-colors text-left body-md"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
};
