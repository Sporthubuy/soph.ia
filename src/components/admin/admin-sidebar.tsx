"use client";

export const AdminSidebar = () => {
  return (
    <aside className="w-64 border-r border-[#1e293b] bg-[#0f1117] flex flex-col">
      <div className="p-6 border-b border-[#1e293b]">
        <div className="font-bold text-[var(--star-1)]">SOPH.IA Admin</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <a href="/admin" className="block px-4 py-2 rounded text-[#94a3b8] hover:bg-[#1e293b]">Dashboard</a>
        <a href="/admin/users" className="block px-4 py-2 rounded text-[#94a3b8] hover:bg-[#1e293b]">Users</a>
        <a href="/admin/knowledge" className="block px-4 py-2 rounded text-[#94a3b8] hover:bg-[#1e293b]">Knowledge</a>
        <a href="/admin/agents" className="block px-4 py-2 rounded text-[#94a3b8] hover:bg-[#1e293b]">Agents</a>
      </nav>
    </aside>
  );
};
