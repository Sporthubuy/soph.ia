import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Reveal } from "@/components/shared/reveal";
import { CountUp } from "@/components/shared/count-up";
import { ScrollProgress } from "@/components/shared/scroll-progress";
import { MobileMenu } from "@/components/shared/mobile-menu";
import { ScrollSpyNav } from "@/components/shared/scroll-spy-nav";
import {
  ArrowRight,
  Check,
  Database,
  GitBranch,
  GitCommitHorizontal,
  Bot,
  ShieldCheck,
  Waypoints,
  Lock,
  FileText,
  CircleCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "soph.ia — The Knowledge Operating System for AI",
  description:
    "Donde el conocimiento humano se convierte en inteligencia con fuentes. Versiona, gobierna y compila agentes que citan cada respuesta.",
};

/* ──────────────────────────────────────────────────────────────────────
   Navigation — real anchors, keyboard accessible
   ────────────────────────────────────────────────────────────────────── */

const NAV: { label: string; href: string }[] = [
  { label: "Producto", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Especificaciones", href: "#specs" },
];

const FOOTER_COLUMNS: { h: string; items: { label: string; href: string }[] }[] = [
  {
    h: "Producto",
    items: [
      { label: "Platform", href: "#product" },
      { label: "Knowledge Graph", href: "#features" },
      { label: "Agent Compiler", href: "#compiler" },
      { label: "Pricing", href: "#cta" },
    ],
  },
  {
    h: "Recursos",
    items: [
      { label: "Docs", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Security", href: "/security" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    h: "Compañía",
    items: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    h: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "DPA", href: "/security" },
      { label: "Security", href: "/security" },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────
   Knowledge Graph mockup
   Monochrome on light — cyan reserved as the single accent for the core
   ────────────────────────────────────────────────────────────────────── */

const NODES = [
  { x: 50, y: 28, label: "Knowledge Core", icon: Database, tone: "core" },
  { x: 16, y: 12, label: "Policy KU", icon: FileText, tone: "default" },
  { x: 84, y: 13, label: "Dataset", icon: Database, tone: "default" },
  { x: 12, y: 45, label: "Agent", icon: Bot, tone: "default" },
  { x: 88, y: 44, label: "Review", icon: ShieldCheck, tone: "default" },
  { x: 50, y: 4, label: "Version", icon: GitCommitHorizontal, tone: "default" },
  { x: 50, y: 52, label: "Compile", icon: CircleCheck, tone: "default" },
] as const;

const GraphMockup = () => (
  <div className="relative mx-auto aspect-[100/56] w-full max-w-3xl">
    <svg
      viewBox="0 0 100 56"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {NODES.slice(1).map((n, i) => (
        <line
          key={i}
          x1={50}
          y1={28}
          x2={n.x}
          y2={n.y}
          stroke="var(--star-3)"
          strokeWidth={0.25}
          className="anim-edge"
          style={{ animationDelay: `${i * 0.18}s`, opacity: 0.4 }}
        />
      ))}
    </svg>
    {NODES.map((n, i) => {
      const IconEl = n.icon;
      const isCore = n.tone === "core";
      return (
        <div
          key={i}
          className={`anim-node absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border backdrop-blur-md ${
            isCore
              ? "border-[rgb(91_155_255_/_0.45)] bg-[var(--sky-2)] px-3 py-1.5 shadow-[0_0_24px_rgb(91_155_255_/_0.25)]"
              : "border-[var(--edge)] bg-[var(--sky-2)] px-2 py-1"
          }`}
          style={{ left: `${n.x}%`, top: `${(n.y / 56) * 100}%`, animationDelay: `${i * 0.3}s` }}
        >
          <span
            className="flex items-center justify-center text-[var(--star-2)]"
            style={isCore ? { color: "var(--azure)" } : undefined}
          >
            <IconEl size={isCore ? 16 : 12} strokeWidth={1.8} aria-hidden />
          </span>
          <span
            className={`hidden whitespace-nowrap font-medium sm:inline ${
              isCore ? "text-xs text-[var(--star-1)]" : "text-[11px] text-[var(--star-3)]"
            }`}
          >
            {n.label}
          </span>
        </div>
      );
    })}
  </div>
);

/* ──────────────────────────────────────────────────────────────────────
   Full-bleed vertical feature sections (one per concept — Apple style)
   ────────────────────────────────────────────────────────────────────── */

const VERTICAL_FEATURES = [
  {
    eyebrow: "Gobierno",
    title: "La IA propone. Las personas aprueban.",
    desc:
      "Cada cambio al conocimiento colectivo cruza una puerta de revisión con diff, owner y audit trail. Nada llega a un agente sin firma humana.",
    icon: ShieldCheck,
    badge: "01",
  },
  {
    eyebrow: "Versionado",
    title: "Cada idea, versionada como código.",
    desc:
      "Diff v1.2 → v1.3. Rollback instantáneo a cualquier estado histórico. Nunca se sobrescribe, nunca se pierde el contexto anterior.",
    icon: GitBranch,
    badge: "02",
  },
  {
    eyebrow: "Contexto",
    title: "Nodos conectados, no fragmentos sueltos.",
    desc:
      "Las dependencias son explícitas. Los agentes compilan desde el grafo completo de conocimiento aprobado, no desde snippets dispersos.",
    icon: Waypoints,
    badge: "03",
  },
  {
    eyebrow: "Seguridad",
    title: "Tu conocimiento es tuyo. Soberano.",
    desc:
      "Row-level security y claves de modelo por usuario. Tu data alimenta tus agentes y los de nadie más. Cero fuga entre organizaciones.",
    icon: Lock,
    badge: "04",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Estructura el conocimiento",
    desc: "Captura políticas, reglas y datos en Knowledge Units con owner, dominio y dependencias explícitas.",
  },
  {
    n: "02",
    title: "Gobierno y versionado",
    desc: "Cada propuesta pasa por review con diff y audit trail. Aprueba, rechaza o regresa a cualquier versión.",
  },
  {
    n: "03",
    title: "Compila agentes confiables",
    desc: "Selecciona dominios y nodos; soph.ia compila el contexto y despliega un agente que cita cada fuente.",
  },
] as const;

const SPECS = [
  { end: 100, prefix: "", suffix: "%", label: "Trazable a un owner y versión" },
  { end: 1, prefix: "<", suffix: "s", label: "Rollback a cualquier estado histórico" },
  { end: 0, prefix: "", suffix: "", label: "Fuga de datos entre organizaciones" },
] as const;

export default function LandingPage() {
  return (
    <div className="light-scope min-h-screen bg-[var(--sky-1)] text-[var(--star-1)]">
      <ScrollProgress />
      <div className="grain-overlay" aria-hidden />
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only rounded-md bg-[var(--azure)] px-3 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50"
      >
        Saltar al contenido
      </a>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--edge)] bg-[var(--sky-1)]/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="soph.ia — Knowledge OS">
            <Logo markSize={28} subtitle={false} />
          </Link>

          <ScrollSpyNav
            items={NAV}
            className="hidden items-center gap-7 lg:flex"
            linkClassName="text-sm font-medium text-[var(--star-2)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--star-1)]"
            activeClassName="text-[var(--star-1)]"
          />

          <div className="hidden items-center gap-1 sm:flex">
            <Button render={<Link href="/login" />} variant="ghost" size="lg">
              Entrar
            </Button>
            <Button render={<Link href="/register" />} size="lg">
              Empezar gratis
              <ArrowRight size={15} strokeWidth={2.2} />
            </Button>
          </div>

          {/* Mobile menu — Client component with backdrop + click-outside */}
          <MobileMenu />
        </div>
      </header>

      <main id="main">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-5 pb-32 pt-20 sm:px-6 sm:pt-28">
          <div
            className="anim-glow pointer-events-none absolute left-1/2 top-[-160px] h-[460px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgb(91 155 255 / 0.14), transparent 65%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <Reveal as="p" className="section-heading inline-flex items-center gap-2 text-[var(--azure)]">
              <span className="anim-node h-1.5 w-1.5 rounded-full bg-[var(--azure)]" />
              The Knowledge Operating System
            </Reveal>

            <Reveal as="h1" delay={120} className="display-hero mt-6 text-balance text-[var(--star-1)]">
              Donde el conocimiento humano
              <br className="hidden sm:block" /> se convierte en{" "}
              <span className="text-[var(--azure)]">inteligencia con fuentes</span>
            </Reveal>

            <Reveal as="p" delay={240} className="body-lead mx-auto mt-8 max-w-2xl text-pretty text-[var(--star-2)]">
              Equipos de datos y producto versionan su conocimiento como código y
              compilan agentes que citan cada respuesta. No es un chatbot: es la
              infraestructura que lo hace confiable.
            </Reveal>

            <Reveal delay={360} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button render={<Link href="/register" />} size="lg" className="px-6">
                Empezar gratis
                <ArrowRight size={16} strokeWidth={2.2} />
              </Button>
              <Link
                href="#product"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--star-2)] underline-offset-4 transition duration-[var(--dur-hover)] hover:text-[var(--star-1)] hover:underline"
              >
                Ver producto
                <ArrowRight size={14} strokeWidth={2.2} />
              </Link>
            </Reveal>

            <Reveal delay={480} as="p" className="mt-5 text-xs text-[var(--star-4)]">
              Sin tarjeta · 14 días de prueba · Datos soberanos
            </Reveal>
          </div>

          {/* Real product shot framed as a device — Apple style */}
          <Reveal
            delay={600}
            id="product"
            className="relative mx-auto mt-24 max-w-5xl scroll-mt-24 overflow-hidden rounded-3xl border border-[var(--edge)] bg-[var(--sky-2)] p-2 shadow-[0_30px_80px_-40px_rgb(0_0_0_/_0.4)] sm:p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG asset, no remote optimization needed */}
            <img
              src="/product-graph.svg"
              alt="Captura del Knowledge Graph de soph.ia: nodos de Knowledge Core, Policy, Dataset, Agent y Review conectados por dependencias, con estados de verificación y leyenda."
              width={1200}
              height={760}
              className="h-auto w-full rounded-2xl"
              loading="lazy"
            />
          </Reveal>
        </section>

        {/* ── Vertical feature sections (Apple-style one-per-concept) ── */}
        <section
          id="features"
          className="scroll-mt-24 border-t border-[var(--edge)]"
        >
          {/* 01 — Governance */}
          {VERTICAL_FEATURES[0] && (
            <article className="border-b border-[var(--edge)] px-5 py-32 sm:px-6">
              <div className="mx-auto grid max-w-5xl items-center gap-16 lg:grid-cols-2">
                <Reveal>
                  <p className="section-heading text-[var(--azure)]">01 / {VERTICAL_FEATURES[0].eyebrow}</p>
                  <h2 className="display-1 mt-4 text-balance text-[var(--star-1)]">
                    {VERTICAL_FEATURES[0].title}
                  </h2>
                  <p className="body-lead mt-6 max-w-md text-[var(--star-2)]">
                    {VERTICAL_FEATURES[0].desc}
                  </p>
                </Reveal>
                <Reveal delay={120} className="panel p-8">
                  <div className="space-y-2">
                    {[
                      { s: "Pricing policy v3", t: " approved", a: "by María G." },
                      { s: "Refund rules v2", t: " pending review", a: "by Carlos M." },
                      { s: "Brand voice v5", t: " approved", a: "by Ana L." },
                    ].map((r) => (
                      <div
                        key={r.s}
                        className="flex min-h-[3rem] items-center gap-3 rounded-xl border border-[var(--edge)] bg-[var(--sky-1)] px-4"
                      >
                        <FileText size={16} className="text-[var(--azure)]" aria-hidden />
                        <span className="font-mono text-xs text-[var(--star-2)]">{r.s} · {r.t}</span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-[var(--star-3)]">
                          <CircleCheck size={12} className="text-[var(--verified)]" aria-hidden />
                          {r.a}
                        </span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </article>
          )}

          {/* 02 — Versioning */}
          {VERTICAL_FEATURES[1] && (
            <article className="border-b border-[var(--edge)] bg-[var(--sky-2)] px-5 py-32 sm:px-6">
              <div className="mx-auto grid max-w-5xl items-center gap-16 lg:grid-cols-2">
                <Reveal delay={120} className="order-2 panel p-8 lg:order-1">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[var(--edge)] bg-[var(--sky-1)] p-4">
                      <p className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--star-3)]">
                        <GitCommitHorizontal size={12} /> Refund rules · diff v1.2 → v1.3
                      </p>
                      <div className="space-y-1 font-mono text-[13px] leading-relaxed">
                        <p className="text-[var(--star-4)] line-through">- Reembolsos dentro de 14 días.</p>
                        <p className="text-[var(--verified)]">+ Reembolsos dentro de 30 días post-compra.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--star-4)]">
                      <span>v1.2 · 2 semanas</span>
                      <span className="inline-flex items-center gap-1 text-[var(--verified)]">
                        <CircleCheck size={11} /> rolled back to v1.3
                      </span>
                    </div>
                  </div>
                </Reveal>
                <Reveal className="order-1 lg:order-2">
                  <p className="section-heading text-[var(--azure)]">02 / {VERTICAL_FEATURES[1].eyebrow}</p>
                  <h2 className="display-1 mt-4 text-balance text-[var(--star-1)]">
                    {VERTICAL_FEATURES[1].title}
                  </h2>
                  <p className="body-lead mt-6 max-w-md text-[var(--star-2)]">
                    {VERTICAL_FEATURES[1].desc}
                  </p>
                </Reveal>
              </div>
            </article>
          )}

          {/* 03 — Context graph */}
          {VERTICAL_FEATURES[2] && (
            <article className="border-b border-[var(--edge)] px-5 py-32 sm:px-6">
              <div className="mx-auto grid max-w-5xl items-center gap-16 lg:grid-cols-2">
                <Reveal>
                  <p className="section-heading text-[var(--azure)]">03 / {VERTICAL_FEATURES[2].eyebrow}</p>
                  <h2 className="display-1 mt-4 text-balance text-[var(--star-1)]">
                    {VERTICAL_FEATURES[2].title}
                  </h2>
                  <p className="body-lead mt-6 max-w-md text-[var(--star-2)]">
                    {VERTICAL_FEATURES[2].desc}
                  </p>
                </Reveal>
                <Reveal delay={120} className="relative aspect-[100/56] overflow-hidden rounded-3xl border border-[var(--edge)] bg-[var(--sky-2)] p-8 shadow-[0_20px_60px_-30px_rgb(0_0_0_/_0.35)]">
                  <div className="dot-pattern pointer-events-none absolute inset-0 opacity-25" aria-hidden />
                  <div className="relative">
                    <GraphMockup />
                  </div>
                </Reveal>
              </div>
            </article>
          )}

          {/* 04 — Security */}
          {VERTICAL_FEATURES[3] && (
            <article className="border-b border-[var(--edge)] bg-[var(--sky-2)] px-5 py-32 sm:px-6">
              <div className="mx-auto grid max-w-5xl items-center gap-16 lg:grid-cols-2">
                <Reveal delay={120} className="order-2 panel p-8 lg:order-1">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Row-level security",
                      "Claves por usuario",
                      "Audit trail completo",
                      "SOC 2 Type II",
                      "GDPR ready",
                      "Cero fuga inter-org",
                    ].map((s) => (
                      <div
                        key={s}
                        className="flex min-h-[3rem] items-center gap-2 rounded-xl border border-[var(--edge)] bg-[var(--sky-1)] px-3 text-sm text-[var(--star-2)]"
                      >
                        <Check size={14} className="text-[var(--verified)]" aria-hidden />
                        {s}
                      </div>
                    ))}
                  </div>
                </Reveal>
                <Reveal className="order-1 lg:order-2">
                  <p className="section-heading text-[var(--azure)]">04 / {VERTICAL_FEATURES[3].eyebrow}</p>
                  <h2 className="display-1 mt-4 text-balance text-[var(--star-1)]">
                    {VERTICAL_FEATURES[3].title}
                  </h2>
                  <p className="body-lead mt-6 max-w-md text-[var(--star-2)]">
                    {VERTICAL_FEATURES[3].desc}
                  </p>
                </Reveal>
              </div>
            </article>
          )}
        </section>

        {/* ── Agent Compiler — split feature ────────────────────────── */}
        <section
          id="compiler"
          className="scroll-mt-24 px-5 py-32 sm:px-6"
        >
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="section-heading text-[var(--azure)]">Agent Compiler</p>
              <h2 className="display-1 mt-4 text-balance text-[var(--star-1)]">
                Respuestas con fuentes, no alucinaciones.
              </h2>
              <p className="body-lead mt-6 max-w-md text-[var(--star-2)]">
                Cada agente compila sólo desde Knowledge Units aprobadas. Cada
                respuesta cita la fuente exacta, trazable a un owner y una versión.
              </p>
            </Reveal>

            <Reveal delay={120} className="panel p-6">
              <div className="mb-4 flex h-9 items-center gap-2 border-b border-[var(--edge)] pb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--sky-3)] text-[var(--azure)]">
                  <Bot size={15} aria-hidden />
                </span>
                <span className="text-sm font-medium text-[var(--star-1)]">
                  Support Agent
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--edge)] bg-[var(--sky-3)] px-2 py-0.5 text-[11px] font-medium text-[var(--verified)]">
                  <CircleCheck size={11} aria-hidden /> Desplegado
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-[var(--sky-3)] px-3.5 py-2 text-[var(--star-1)]">
                  ¿Cuál es nuestra ventana de reembolso?
                </p>
                <div className="max-w-[90%] space-y-2 rounded-2xl rounded-bl-sm border border-[var(--edge)] bg-[var(--sky-1)] px-3.5 py-3 text-[var(--star-2)]">
                  <p>
                    Reembolsos aceptados hasta{" "}
                    <span className="font-semibold text-[var(--star-1)]">30 días</span>{" "}
                    post-compra para items sin uso.
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--azure)]">
                    <CircleCheck size={12} aria-hidden /> fuente: Refund rules · v2
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Specs — dramatic Apple-style metrics ─────────────────── */}
        <section
          id="specs"
          className="scroll-mt-24 border-y border-[var(--edge)] bg-[var(--sky-2)] px-5 py-32 sm:px-6"
        >
          <div className="mx-auto max-w-5xl">
            <Reveal as="p" className="section-heading text-center text-[var(--azure)]">
              Especificaciones
            </Reveal>
            <Reveal as="h2" delay={120} className="display-2 mx-auto mt-4 max-w-2xl text-balance text-center text-[var(--star-1)]">
              Diseñado para confiar. Construido para escalar.
            </Reveal>
            <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-8">
              {SPECS.map((m, i) => (
                <Reveal key={m.label} delay={i * 180} className="text-center">
                  <p className="display-metric text-[var(--star-1)]">
                    <CountUp
                      end={m.end}
                      prefix={m.prefix}
                      suffix={m.suffix}
                      duration={1800}
                    />
                  </p>
                  <p className="body-md mx-auto mt-6 max-w-[14rem] text-[var(--star-3)]">
                    {m.label}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* How it works — compact linear steps */}
            <div className="mt-28 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-[var(--sky-2)] p-8">
                  <p className="font-mono text-sm text-[var(--azure)]">{s.n}</p>
                  <h3 className="font-display mt-5 text-lg font-semibold text-[var(--star-1)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--star-2)]">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA — silent, Apple style ────────────────────────────── */}
        <section
          id="cta"
          className="scroll-mt-24 px-5 py-40 sm:px-6"
        >
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <h2 className="display-1 text-balance text-[var(--star-1)]">
                Compila tu conocimiento.
                <br />
                Despliega agentes que citan fuentes.
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button render={<Link href="/register" />} size="lg" className="px-6">
                  Empezar gratis
                  <ArrowRight size={16} strokeWidth={2.2} />
                </Button>
              </div>
              <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-[var(--star-3)]">
                {["Sin tarjeta", "14 días de prueba", "SOC 2 Type II en curso"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check size={12} className="text-[var(--verified)]" aria-hidden />
                    {t}
                  </span>
                ))}
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--edge)] bg-[var(--sky-2)] px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" aria-label="soph.ia — Knowledge OS">
                <Logo markSize={26} subtitle={false} />
              </Link>
              <p className="mt-3 max-w-[16rem] text-sm text-[var(--star-3)]">
                El sistema operativo de conocimiento para IA.
              </p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.h}>
                <p className="section-heading">{col.h}</p>
                <ul className="mt-3 space-y-1">
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <Link
                        href={it.href}
                        className="inline-block min-h-[2.5rem] py-1 text-sm text-[var(--star-3)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--star-1)]"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--edge)] pt-6 sm:flex-row">
            <p className="text-xs text-[var(--star-3)]">
              © 2026 soph.ia. Todos los derechos reservados.
            </p>
            <Link
              href="/status"
              className="inline-flex items-center gap-2 text-xs text-[var(--star-3)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--star-1)]"
            >
              <span
                className="anim-node h-2 w-2 rounded-full bg-[var(--verified)]"
                aria-hidden
              />
              All systems operational
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}