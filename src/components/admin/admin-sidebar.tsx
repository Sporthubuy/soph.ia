"use client";

import { Link } from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/icon";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/users", label: "Users", icon: "people" },
  { href: "/admin/knowledge", label: "Knowledge Units", icon: "knowledge" },
  { href: "/admin/agents", label: "Agents", icon: "agents" },
  { href: "/admin/people", label: "Team Members", icon: "users" },
  { href: "/admin/projects", label: "Projects", icon: "folder" },
  { href: "/admin/marketplace", label: "Marketplace", icon: "store" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#1e293b] bg-[#0f1117] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#1e293b]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-[#3b82f6] flex items-center justify-center">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <div>
            <p className="font-bold text-[var(--star-1)]">SOPH.IA</p>
            <p className="text-xs text-[#64748b]">Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#3b82f6] text-white"
                  : "text-[#94a3b8] hover:bg-[#1e293b]"
              }`}
            >
              <Icon
                name={item.icon as any}
                size={18}
                className={isActive ? "text-white" : "text-[#64748b]"}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[#1e293b] space-y-3">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
            <Icon name="user" size={16} className="text-[#3b82f6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#94a3b8] truncate">
              Admin
            </p>
            <p className="text-xs text-[#64748b] truncate">
              Administrator
            </p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            const supabase = await (await import("@/lib/supabase/server")).createClient();
            await supabase.auth.signOut();
            (await import("next/navigation")).redirect("/admin/login");
          }}
        >
          <button
            type="submit"
            className="w-full text-left px-4 py-2 text-sm text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
};
