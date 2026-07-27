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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUserData();
  }, []);

  const mainNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/editor", label: "Editor", icon: "edit_document" },
    { href: "/graph", label: "Graph", icon: "account_tree" },
  ];

  const managementNavItems = [
    { href: "/review", label: "Review", icon: "fact_check" },
    { href: "/agents", label: "Agents", icon: "smart_toy" },
    { href: "/marketplace", label: "Marketplace", icon: "store" },
  ];

  const configNavItems = [
    { href: "/settings", label: "Settings", icon: "settings" },
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
        className={`flex items-center gap-3 px-4 py-2.5 rounded transition-all group ${
          isActive
            ? "bg-[#e1e0ff] text-[#4648d4] font-medium"
            : "text-[#45464d] hover:bg-[#f7f9fb]"
        }`}
      >
        <span className={`material-symbols-outlined text-lg flex-shrink-0 ${isActive ? "font-bold" : ""}`}>
          {item.icon}
        </span>
        <span className="body-md truncate">{item.label}</span>
        {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#4648d4]" />}
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
            <span className="text-xs text-[#7c839b]">v0.1</span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="section-heading px-4 mb-4">Main</p>
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <p className="section-heading px-4 mt-6 mb-4">Management</p>
        {managementNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <p className="section-heading px-4 mt-6 mb-4">Config</p>
        {configNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#e2e8f0] space-y-3">
        {user && (
          <div className="px-4 py-3 bg-[#f7f9fb] rounded">
            <p className="label-sm text-[#7c839b] mb-1">Logged in as</p>
            <p className="body-md text-black truncate font-medium">
              {user.user_metadata?.full_name || user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-[#45464d] hover:bg-[#f7f9fb] transition-colors text-left body-md font-medium"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </div>
  );
};
