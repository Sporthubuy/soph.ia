"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type Item = { label: string; href: string };

/**
 * Nav list with scroll-spy: highlights the section currently in view and
 * exposes it to screen readers via aria-current="location".
 */
export function ScrollSpyNav({
  items,
  className,
  linkClassName,
  activeClassName,
}: {
  items: Item[];
  className?: string;
  linkClassName?: string;
  activeClassName?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (prefersReduced) return;
    const ids = items
      .map((i) => i.href.replace("#", ""))
      .filter((id) => document.getElementById(id));
    if (ids.length === 0) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        let current: string | null = null;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <nav className={className} aria-label="Principal">
      {items.map((item) => {
        const isActive = active === item.href.replace("#", "");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "location" : undefined}
            className={cn(linkClassName, isActive && activeClassName)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}