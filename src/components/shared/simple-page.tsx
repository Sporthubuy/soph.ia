import { Link } from "@/i18n/routing";
import { Logo } from "@/components/shared/logo";
import { Reveal } from "@/components/shared/reveal";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function SimplePage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="light-scope min-h-screen bg-[var(--sky-1)] text-[var(--star-1)]">
      <div className="grain-overlay" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-[var(--edge)] bg-[var(--sky-1)]/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="soph.ia — Knowledge OS">
            <Logo markSize={28} subtitle={false} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--star-2)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--star-1)]"
          >
            Volver
            <ArrowRight size={14} strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-24 sm:px-6 sm:py-32">
        <Reveal as="p" className="section-heading text-[var(--azure)]">
          {eyebrow}
        </Reveal>
        <Reveal as="h1" delay={120} className="display-1 mt-4 text-balance text-[var(--star-1)]">
          {title}
        </Reveal>
        {updated && (
          <Reveal as="p" delay={200} className="mt-4 text-sm text-[var(--star-3)]">
            Última actualización: {updated}
          </Reveal>
        )}
        <Reveal delay={280} className="mt-12 space-y-6">
          {children}
        </Reveal>
      </main>

      <footer className="border-t border-[var(--edge)] bg-[var(--sky-2)] px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--star-3)]">
            © 2026 soph.ia. Todos los derechos reservados.
          </p>
          <span className="text-xs text-[var(--star-3)]">{eyebrow}</span>
        </div>
      </footer>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function H({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--star-1)]">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-[var(--star-2)]">{children}</p>;
}