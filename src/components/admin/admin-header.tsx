"use client";

import { Icon } from "@/components/shared/icon";

export const AdminHeader = () => {
  return (
    <header className="border-b border-[#1e293b] bg-[#0f1117] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--star-1)]">
            Administration
          </h1>
          <p className="text-sm text-[#64748b]">
            Manage users, KUs, agents, and system settings
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
            />
            <input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg border border-[#1e293b] bg-[#07090e] text-[#94a3b8] placeholder-[#64748b] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-[#94a3b8] hover:text-[var(--star-1)] rounded-lg hover:bg-[#1e293b] transition-colors">
            <Icon name="bell" size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#3b82f6] rounded-full" />
          </button>

          {/* Help */}
          <button className="p-2 text-[#94a3b8] hover:text-[var(--star-1)] rounded-lg hover:bg-[#1e293b] transition-colors">
            <Icon name="help" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
