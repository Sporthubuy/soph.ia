"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV: { label: string; href: string }[] = [
  { label: "Producto", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Especificaciones", href: "#specs" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--edge)] text-[var(--star-1)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--sky-3)]"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-30 bg-black/20 backdrop-blur-sm sm:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-[var(--edge)] bg-[var(--sky-2)] p-2 shadow-xl">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[2.75rem] items-center rounded-lg px-3 text-sm text-[var(--star-2)] hover:bg-[var(--sky-3)] hover:text-[var(--star-1)]"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-[var(--edge)] pt-2">
              <Button
                render={<Link href="/login" />}
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Entrar
              </Button>
              <Button
                render={<Link href="/register" />}
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Empezar gratis
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}