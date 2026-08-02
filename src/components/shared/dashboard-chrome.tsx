"use client";

import { useCallback, useState } from "react";
import { CommandPalette, useCommandPaletteHotkey } from "@/components/shared/command-palette";
import { Icon } from "@/components/shared/icon";

export const DashboardChrome = () => {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  useCommandPaletteHotkey(openPalette);

  return (
    <>
      <div className="sticky top-0 z-30 hidden h-12 items-center justify-between gap-3 border-b border-[var(--edge)] bg-[rgb(15_20_32_/_0.8)] px-6 backdrop-blur md:flex">
        <button
          type="button"
          onClick={openPalette}
          className="flex max-w-md flex-1 items-center gap-2.5 rounded-[10px] border border-[var(--edge)] bg-[var(--sky-1)] px-3 py-1.5 text-left text-sm text-[var(--star-3)] transition-colors hover:border-[var(--edge-strong)] hover:text-[var(--star-2)]"
        >
          <Icon name="search" size={16} className="flex-shrink-0" />
          <span className="flex-1 truncate">Buscar knowledge, proyectos, agents…</span>
          <kbd className="rounded-md border border-[var(--edge)] bg-[var(--sky-3)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--star-3)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Mobile floating search affordance */}
      <button
        type="button"
        onClick={openPalette}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--azure)] text-[var(--azure-ink)] shadow-[0_8px_24px_-6px_rgb(59_130_246_/_0.6)] hover:bg-[var(--azure-bright)] md:hidden"
        aria-label="Abrir búsqueda"
      >
        <Icon name="search" size={20} strokeWidth={2} />
      </button>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
};
