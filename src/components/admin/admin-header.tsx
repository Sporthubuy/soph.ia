"use client";

import { Icon } from "@/components/shared/icon";

export const AdminHeader = () => {
  return (
    <header className="px-6 py-4" style={{
      borderBottom: "1px solid var(--edge)",
      backgroundColor: "var(--sky-1)"
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--star-1)" }}>
            Administration
          </h1>
          <p className="text-sm" style={{ color: "var(--star-3)" }}>
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
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--star-3)" }}
            />
            <input
              type="search"
              placeholder="Search..."
              style={{
                paddingLeft: "2.5rem",
                paddingRight: "1rem",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--edge)",
                backgroundColor: "var(--sky-3)",
                color: "var(--star-1)",
                transitionDuration: "0.15s"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--azure)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91, 155, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--edge)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg transition-colors" style={{
            color: "var(--star-3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--sky-3)";
            e.currentTarget.style.color = "var(--star-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--star-3)";
          }}>
            <Icon name="bell" size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--azure)" }} />
          </button>

          {/* Help */}
          <button className="p-2 rounded-lg transition-colors" style={{
            color: "var(--star-3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--sky-3)";
            e.currentTarget.style.color = "var(--star-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--star-3)";
          }}>
            <Icon name="help" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
