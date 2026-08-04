"use client";

import { usePathname } from "next/navigation";

export const AdminSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const menuItems = [
    { href: "/admin", label: "📊 Dashboard", icon: "📊" },
    { href: "/admin/users", label: "👥 Users", icon: "👥" },
    { href: "/admin/knowledge", label: "📚 Knowledge", icon: "📚" },
    { href: "/admin/agents", label: "🤖 Agents", icon: "🤖" },
    { href: "/admin/projects", label: "📁 Projects", icon: "📁" },
    { href: "/admin/team", label: "👨‍💼 Team", icon: "👨‍💼" },
    { href: "/admin/analytics", label: "📈 Analytics", icon: "📈" },
    { href: "/admin/audit-logs", label: "🔐 Audit Logs", icon: "🔐" },
    { href: "/admin/settings", label: "⚙️ Settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 border-r border-[var(--edge)] bg-[var(--sky-2)] flex flex-col">
      <div className="p-6 border-b border-[var(--edge)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-sm font-bold text-white">
            S
          </div>
          <div>
            <div className="font-bold text-[var(--star-1)] text-sm">SOPH.IA</div>
            <div className="text-xs text-[var(--star-4)]">Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30"
                : "text-[var(--star-3)] hover:bg-[var(--sky-3)]"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--edge)] p-4">
        <div className="rounded-lg bg-[var(--sky-2)] p-3 text-xs space-y-1">
          <p className="text-[var(--star-4)]">Need help?</p>
          <button className="w-full px-3 py-1.5 rounded bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium hover:bg-[#3b82f6]/30 transition-colors">
            Documentation
          </button>
        </div>
      </div>
    </aside>
  );
};
