"use client";

import { useEffect, useRef, useState } from "react";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Apple-style easeInOutQuad — slow exit, gentle arrival. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  /** Target end value. */
  end: number;
  /** Duration in ms (default 1600 — Apple's spec sheet cadence). */
  duration?: number;
  /** Prefix string (e.g. "<"). */
  prefix?: string;
  /** Suffix string (e.g. "%", "s"). */
  suffix?: string;
  /** Number of decimal places to render. */
  decimals?: number;
  /** ClassName passed to the rendered <span>. */
  className?: string;
};

export function CountUp({
  end,
  duration = 1600,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (prefersReduced) {
      setValue(end);
      started.current = true;
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(elapsed / duration, 1);
              setValue(end * easeOut(t));
              if (t < 1) requestAnimationFrame(tick);
              else setValue(end);
            };
            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${end}${suffix}`}>
      <span aria-hidden>
        {prefix}
        {formatted}
        {suffix}
      </span>
    </span>
  );
}