"use client";

import { useEffect, useState } from "react";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    const update = () => {
      const scroll = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(scroll / max, 1) : 0;
      setProgress(p);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-px bg-transparent"
      aria-hidden
    >
      <div
        className="h-full origin-left bg-[var(--azure)]"
        style={{
          transform: `scaleX(${progress})`,
          willChange: "transform",
        }}
      />
    </div>
  );
}