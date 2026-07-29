"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SearchHit = {
  id: string;
  type: "knowledge" | "project" | "agent";
  title: string;
  subtitle: string;
  href: string;
};

type NavAction = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  keywords: string;
};

const NAV_ACTIONS: NavAction[] = [
  {
    id: "nav-dashboard",
    title: "Overview",
    subtitle: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    keywords: "home overview start",
  },
  {
    id: "nav-projects",
    title: "Projects",
    subtitle: "Go to projects",
    href: "/projects",
    icon: "folder_open",
    keywords: "proyectos projects",
  },
  {
    id: "nav-knowledge",
    title: "Knowledge",
    subtitle: "Knowledge units",
    href: "/knowledge",
    icon: "menu_book",
    keywords: "ku knowledge unidades",
  },
  {
    id: "nav-graph",
    title: "Graph",
    subtitle: "Knowledge graph",
    href: "/graph",
    icon: "hub",
    keywords: "grafo graph map",
  },
  {
    id: "nav-agents",
    title: "Agents",
    subtitle: "AI agents",
    href: "/agents",
    icon: "smart_toy",
    keywords: "agentes agents",
  },
  {
    id: "nav-review",
    title: "Review",
    subtitle: "Review center",
    href: "/review",
    icon: "fact_check",
    keywords: "review aprobar",
  },
  {
    id: "nav-settings",
    title: "Settings",
    subtitle: "Organization settings",
    href: "/settings",
    icon: "settings",
    keywords: "settings config",
  },
  {
    id: "act-new-ku",
    title: "New Knowledge Unit",
    subtitle: "Create",
    href: "/knowledge/new",
    icon: "add_circle",
    keywords: "create new ku knowledge",
  },
  {
    id: "act-new-project",
    title: "New Project",
    subtitle: "Create",
    href: "/projects/new",
    icon: "create_new_folder",
    keywords: "create new project",
  },
  {
    id: "act-new-agent",
    title: "New Agent",
    subtitle: "Create",
    href: "/agents/new",
    icon: "smart_toy",
    keywords: "create new agent",
  },
];

const typeIcon: Record<SearchHit["type"], string> = {
  knowledge: "menu_book",
  project: "folder_open",
  agent: "smart_toy",
};

type Item =
  | { kind: "action"; action: NavAction }
  | { kind: "hit"; hit: SearchHit };

export const CommandPalette = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHits([]);
      setActive(0);
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 1) {
      setHits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/quick-search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const json = await res.json();
        if (res.ok) setHits(json.results ?? []);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ACTIONS;
    return NAV_ACTIONS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.keywords.includes(q)
    );
  }, [query]);

  const items: Item[] = useMemo(() => {
    const list: Item[] = filteredActions.map((action) => ({
      kind: "action",
      action,
    }));
    for (const hit of hits) list.push({ kind: "hit", hit });
    return list;
  }, [filteredActions, hits]);

  useEffect(() => {
    setActive(0);
  }, [query, hits.length, filteredActions.length]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (!item) return;
      if (item.kind === "action") go(item.action.href);
      else go(item.hit.href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl p-0 gap-0 overflow-hidden"
        showCloseButton={false}
        onKeyDown={onKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Search and navigate SOPH.IA</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-[#e2e8f0] px-4">
          <span className="text-[#7c839b]" aria-hidden>
            search
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge, projects, agents, or jump…"
            className="flex-1 bg-transparent py-3.5 text-sm text-black placeholder:text-[#7c839b] outline-none"
            aria-label="Command search"
          />
          {loading && (
            <span className="label-sm text-[#7c839b]">Searching…</span>
          )}
          <kbd className="hidden sm:inline label-sm rounded border border-[#e2e8f0] bg-[#f7f9fb] px-1.5 py-0.5 text-[#7c839b]">
            esc
          </kbd>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[#7c839b]">
              No matches
            </p>
          ) : (
            <ul className="space-y-0.5" role="listbox">
              {items.map((item, index) => {
                const selected = index === active;
                if (item.kind === "action") {
                  const a = item.action;
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(a.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          selected ? "bg-[#e1e0ff] text-[#4648d4]" : "hover:bg-[#f7f9fb]"
                        }`}
                      >
                        <span
                          className="text-xl shrink-0"
                          aria-hidden
                        >
                          {a.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-black">
                            {a.title}
                          </span>
                          <span className="block text-xs text-[#7c839b]">
                            {a.subtitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                }

                const h = item.hit;
                return (
                  <li key={`${h.type}-${h.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(h.href)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        selected ? "bg-[#e1e0ff] text-[#4648d4]" : "hover:bg-[#f7f9fb]"
                      }`}
                    >
                      <span
                        className="text-xl shrink-0"
                        aria-hidden
                      >
                        {typeIcon[h.type]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-black truncate">
                          {h.title}
                        </span>
                        <span className="block text-xs text-[#7c839b] truncate">
                          {h.subtitle}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-[#e2e8f0] px-4 py-2 text-[11px] text-[#7c839b]">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const useCommandPaletteHotkey = (onOpen: () => void) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
};
