import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import {
  ShieldCheck,
  GitBranch,
  Waypoints,
  Lock,
  Play,
  ArrowRight,
  FileText,
  Bot,
  CircleCheck,
  Database,
  GitCommitHorizontal,
} from "lucide-react";

const NAV = ["Platform", "Knowledge Graph", "Governance", "Docs", "Pricing"];

/* Positions in a 0-100 (x) × 0-56 (y) space shared by edges + node chips. */
const NODES = [
  { x: 50, y: 28, label: "Knowledge Core", icon: Database, tone: "core" },
  { x: 15, y: 11, label: "Policy KU", icon: FileText, tone: "verified" },
  { x: 85, y: 12, label: "Dataset", icon: Database, tone: "pending" },
  { x: 11, y: 45, label: "Agent", icon: Bot, tone: "accent" },
  { x: 88, y: 45, label: "Review", icon: ShieldCheck, tone: "verified" },
  { x: 50, y: 4, label: "Version", icon: GitCommitHorizontal, tone: "accent" },
  { x: 50, y: 52, label: "Compile", icon: CircleCheck, tone: "cyan" },
] as const;

const toneColor: Record<string, string> = {
  core: "var(--azure)",
  accent: "var(--azure)",
  cyan: "var(--cyan)",
  verified: "var(--verified)",
  pending: "var(--pending)",
};

const GraphMockup = () => (
  <div className="relative mx-auto aspect-[100/56] w-full max-w-3xl">
    {/* edges */}
    <svg
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
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
          stroke="var(--cyan)"
          strokeWidth={0.3}
          className="anim-edge"
          style={{ animationDelay: `${i * 0.18}s`, opacity: 0.7 }}
        />
      ))}
    </svg>
    {/* node chips */}
    {NODES.map((n, i) => {
      const IconEl = n.icon;
      const isCore = n.tone === "core";
      return (
        <div
          key={i}
          className={`anim-node absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border backdrop-blur-md ${
            isCore
              ? "border-[rgb(59_130_246_/_0.5)] bg-[rgb(15_20_32_/_0.9)] px-3.5 py-2 shadow-[0_0_28px_rgb(59_130_246_/_0.4)]"
              : "border-[rgb(30_41_59_/_0.9)] bg-[rgb(15_20_32_/_0.75)] px-2.5 py-1.5"
          }`}
          style={{ left: `${n.x}%`, top: `${(n.y / 56) * 100}%`, animationDelay: `${i * 0.3}s` }}
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{ color: toneColor[n.tone] }}
          >
            <IconEl size={isCore ? 18 : 14} strokeWidth={1.9} />
          </span>
          <span
            className={`whitespace-nowrap font-medium ${isCore ? "text-sm text-[var(--star-1)]" : "text-xs text-[var(--star-2)]"}`}
          >
            {n.label}
          </span>
        </div>
      );
    })}
  </div>
);

const BENTO = [
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop Governance",
    desc: "The AI proposes, people approve. Every change to collective knowledge passes a review gate with owners and audit trail.",
    span: "md:col-span-2",
  },
  {
    icon: GitBranch,
    title: "Versioned & Traceable",
    desc: "Every Knowledge Unit is versioned like code. Diff v1.2 → v1.3, roll back instantly, never overwrite.",
    span: "",
  },
  {
    icon: Waypoints,
    title: "Complete Context Graphs",
    desc: "No orphan nodes. Dependencies are explicit, so agents compile from full, connected context — not scattered snippets.",
    span: "",
  },
  {
    icon: Lock,
    title: "Zero Leakage & Enterprise Security",
    desc: "Sovereign knowledge with row-level security and per-user model keys. Your data powers your agents, and no one else's.",
    span: "md:col-span-2",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--sky-1)]">
      {/* ── 1. Nav ─────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--edge)] bg-[rgb(7_9_14_/_0.72)] backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo markSize={30} subtitle={false} />
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <span
                key={n}
                className="cursor-default text-sm font-medium text-[var(--star-2)] transition-colors hover:text-[var(--star-1)]"
              >
                {n}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button render={<Link href="/login" />} variant="ghost" size="lg">
              Sign In
            </Button>
            <Button render={<Link href="/register" />} size="lg" className="rounded-lg">
              Launch App
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── 2. Hero ──────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-24 pb-16">
          <div
            className="anim-glow pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgb(59 130 246 / 0.22), rgb(6 182 212 / 0.10) 45%, transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(59_130_246_/_0.3)] bg-[rgb(59_130_246_/_0.08)] px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--azure)]" />
              <span className="text-xs font-medium text-[var(--star-2)]">
                Introducing soph.ia 1.0 — The Knowledge Operating System
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--star-1)] md:text-6xl">
              The Infrastructure Where Human Knowledge Becomes{" "}
              <span className="brand-gradient-text">AI Intelligence</span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-[var(--star-2)] md:text-lg">
              Stop building ephemeral AI agents. soph.ia is the collective,
              versioned, and sovereign knowledge graph for enterprise governance.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button render={<Link href="/register" />} size="lg" className="rounded-lg px-5">
                Get Started Free
                <ArrowRight size={16} strokeWidth={2.2} />
              </Button>
              <Button
                render={<Link href="/graph" />}
                variant="outline"
                size="lg"
                className="rounded-lg px-5"
              >
                <Play size={15} strokeWidth={2.2} />
                Explore Interactive Graph
              </Button>
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <GraphMockup />
          </div>
        </section>

        {/* ── 3. Bento grid ────────────────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--star-1)] md:text-4xl">
                Not a chatbot. The system beneath your agents.
              </h2>
              <p className="mt-3 text-base text-[var(--star-2)]">
                Everything you need for knowledge to become actionable, governed
                intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {BENTO.map((c) => {
                const IconEl = c.icon;
                return (
                  <div
                    key={c.title}
                    className={`panel panel-hover group p-6 ${c.span}`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(59_130_246_/_0.25)] bg-[rgb(59_130_246_/_0.1)] text-[var(--azure)]">
                      <IconEl size={20} strokeWidth={1.9} />
                    </span>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--star-1)]">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--star-2)]">
                      {c.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. Interactive feature (split) ───── */}
        <section className="border-y border-[var(--edge)] bg-[var(--sky-2)] px-6 py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="section-heading text-[var(--azure)]">Agent Compiler</p>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--star-1)] md:text-3xl">
                Answers with verified sources, not hallucinations.
              </h2>
              <p className="text-base leading-relaxed text-[var(--star-2)]">
                Agents compile only from approved Knowledge Units. Every response
                cites the exact source it drew from — traceable back to an owner
                and a version.
              </p>
              <div className="space-y-2 pt-2">
                {[
                  "Pricing policy · v3 · verified",
                  "Refund rules · v2 · verified",
                  "Brand voice · v5 · verified",
                ].map((k) => (
                  <div
                    key={k}
                    className="flex items-center gap-3 rounded-lg border border-[var(--edge)] bg-[var(--sky-1)] px-3 py-2.5"
                  >
                    <FileText size={16} className="text-[var(--azure)]" />
                    <span className="font-mono text-xs text-[var(--star-2)]">{k}</span>
                    <span className="ml-auto h-2 w-2 rounded-full bg-[var(--verified)]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-[var(--edge)] pb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgb(59_130_246_/_0.12)] text-[var(--azure)]">
                  <Bot size={16} />
                </span>
                <span className="text-sm font-medium text-[var(--star-1)]">
                  Support Agent
                </span>
                <span className="ml-auto flex items-center gap-1.5 rounded-full bg-[rgb(16_185_129_/_0.12)] px-2 py-0.5 text-[11px] font-medium text-[var(--verified)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--verified)]" />
                  deployed
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-[rgb(59_130_246_/_0.14)] px-3.5 py-2 text-[var(--star-1)]">
                  What's our refund window?
                </p>
                <div className="max-w-[90%] space-y-2 rounded-2xl rounded-bl-sm bg-[var(--sky-3)] px-3.5 py-3 text-[var(--star-2)]">
                  <p>
                    Refunds are accepted within{" "}
                    <span className="text-[var(--star-1)]">30 days</span> of
                    purchase for unused items.
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--azure)]">
                    <CircleCheck size={12} /> source: Refund rules · v2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. CTA banner ────────────────────── */}
        <section className="relative overflow-hidden px-6 py-24">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 300px at 50% 40%, rgb(37 99 235 / 0.18), rgb(6 182 212 / 0.08) 50%, transparent 75%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-xl space-y-6 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--star-1)] md:text-4xl">
              Ready to compile knowledge into{" "}
              <span className="brand-gradient-text">intelligence</span>?
            </h2>
            <p className="text-base text-[var(--star-2)]">
              No prompts. No generic chatbots. Real, governed knowledge that
              powers agents you can trust.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 rounded-lg border border-[var(--edge)] bg-[var(--sky-2)] px-4 py-2.5 text-sm text-[var(--star-1)] placeholder-[var(--star-4)] focus:border-[var(--azure)] focus:outline-none focus:ring-2 focus:ring-[rgb(59_130_246_/_0.18)]"
              />
              <Button render={<Link href="/register" />} size="lg" className="rounded-lg px-5">
                Get Started Free
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ── 6. Footer ────────────────────────── */}
      <footer className="border-t border-[var(--edge)] bg-[var(--sky-2)] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <Logo markSize={28} subtitle={false} />
              <p className="mt-3 max-w-[16rem] text-sm text-[var(--star-3)]">
                The Knowledge Operating System for AI.
              </p>
            </div>
            {[
              { h: "Product", items: ["Platform", "Knowledge Graph", "Agents", "Pricing"] },
              { h: "Resources", items: ["Docs", "Governance", "Changelog", "Status"] },
              { h: "Company", items: ["About", "Blog", "Careers", "Contact"] },
              { h: "Legal", items: ["Privacy", "Terms", "Security", "DPA"] },
            ].map((col) => (
              <div key={col.h}>
                <p className="section-heading">{col.h}</p>
                <ul className="mt-3 space-y-2">
                  {col.items.map((it) => (
                    <li
                      key={it}
                      className="cursor-default text-sm text-[var(--star-3)] transition-colors hover:text-[var(--star-1)]"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--edge)] pt-6 sm:flex-row">
            <p className="text-xs text-[var(--star-4)]">
              © 2026 soph.ia. All rights reserved.
            </p>
            <span className="flex items-center gap-2 text-xs text-[var(--star-3)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--verified)]" />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
