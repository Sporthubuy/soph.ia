"use client";

import { useCallback, useState } from "react";
import { CommandPalette, useCommandPaletteHotkey } from "@/components/shared/command-palette";

export const DashboardChrome = () => {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  useCommandPaletteHotkey(openPalette);

  return (
    <>
      <div className="sticky top-0 z-30 hidden md:flex h-12 items-center justify-between gap-3 border-b border-[#e2e8f0] bg-white/90 px-6 backdrop-blur">
        <button
          type="button"
          onClick={openPalette}
          className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f7f9fb] px-3 py-1.5 text-left text-sm text-[#7c839b] transition-colors hover:border-[#c7cdd8] hover:bg-white"
        >
          <span className="text-lg" aria-hidden>
            search
          </span>
          <span className="flex-1 truncate">Search knowledge, projects, agents…</span>
          <kbd className="rounded border border-[#e2e8f0] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#7c839b]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Mobile floating search affordance */}
      <button
        type="button"
        onClick={openPalette}
        className="md:hidden fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#4648d4] text-white shadow-lg hover:bg-[#3b3db8]"
        aria-label="Open search"
      >
        <span className="material-symbols-outlined" aria-hidden>
          search
        </span>
      </button>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
};
