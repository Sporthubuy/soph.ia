# SOPH.IA — Web Design System & Technical Brand Guidelines

## 1. System Overview & Technical Stack

SOPH.IA is the "Knowledge Operating System for AI" (The GitHub for Knowledge).
When designing or coding web interfaces, components, or landing pages for SOPH.IA,
you MUST adhere strictly to this design system.

### Preferred Stack Architecture
- Framework: Next.js (App Router, React 19)
- Styling: Tailwind CSS v3/v4
- Component Library Base: shadcn/ui
- Icons: Lucide React (`lucide-react`)
- Animations: Framer Motion (`framer-motion`)
- Graph Visualizations: HTML Canvas / React Flow / Tailwind SVG overlays

---

## 2. Color Palette & Design Tokens (Dark-First Theme)

SOPH.IA is a **Dark Mode Native** application. The visual tone is high-tech,
precise, deep, and readable.

```css
:root {
  /* Backgrounds & Surfaces */
  --bg-canvas: #07090E;         /* Deep Navy Black (Main Background) */
  --bg-surface-1: #0F1420;      /* Card / Sidebar Background */
  --bg-surface-2: #182032;      /* Hover surface / Elevated Card */
  --bg-glass: rgba(15, 20, 32, 0.65); /* Glassmorphism surface */

  /* Borders & Dividers */
  --border-subtle: #1E293B;     /* Standard card border */
  --border-bright: #334155;     /* Interactive border on hover */
  --border-accent: #3B82F6;     /* Glowing border active state */

  /* Brand Accents */
  --brand-primary: #3B82F6;     /* Electric Blue (Primary Action) */
  --brand-primary-hover: #2563EB;
  --brand-cyan: #06B6D4;        /* AI Node Accent / Connection line */
  --brand-indigo: #6366F1;      /* Node Secondary Accent */

  /* Semantic Node Colors (WCAG Compliant) */
  --status-success: #10B981;    /* Verified Node (Emerald Green) */
  --status-warning: #F59E0B;    /* Review Pending (Amber) */
  --status-error: #EF4444;      /* Logic Contradiction (Red) */

  /* Typography Colors */
  --text-primary: #F8FAFC;      /* Slate 50 (Headings & Main Text) */
  --text-secondary: #94A3B8;    /* Slate 400 (Subtitles & Descriptions) */
  --text-muted: #64748B;        /* Slate 500 (Captions, Hashes, Metadata) */
}
```

The isotype/logo brand navy is `#03133A` (deep navy). On dark surfaces the
mark is rendered in white / `--text-primary`.

---

## 3. Typography Rules & Scale

- Primary Font Family: Plus Jakarta Sans or Inter (Sans-serif)
- Code / Data / Hashes: JetBrains Mono or Fira Code (Monospace)

| Element | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|
| Hero Title (H1) | 3.5rem (56px) | 800 | 1.1 | -0.02em |
| Section Title (H2) | 2.25rem (36px) | 700 | 1.2 | -0.01em |
| Card Header (H3) | 1.25rem (20px) | 600 | 1.4 | 0 |
| Body Text | 1rem (16px) | 400 | 1.6 | 0 |
| Small / Caption | 0.875rem (14px) | 500 | 1.4 | 0 |
| Code / Node Hash | 0.8125rem (13px) | 400 | 1.4 | 0 |

---

## 4. UI Kit Specifications & Component Styling

### Buttons
- Primary: gradient `from-blue-600 to-cyan-600`, white text,
  glow `shadow-[0_0_20px_rgba(59,130,246,0.4)]`, transition 200ms.
- Secondary / Outline: `bg-slate-900/50`, `border border-slate-800 hover:border-slate-600`, `text-slate-200`.
- Ghost: `text-slate-400 hover:text-slate-100 hover:bg-slate-800/50`.

### Glassmorphic Cards (Knowledge Cards)
- Background `bg-[#0F1420]/70`, `backdrop-blur-md`,
  `border border-slate-800/80 hover:border-blue-500/40`,
  `rounded-xl`, `transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5`.

### Badges / Node Status Indicators
- Verified: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` + pulsing green dot.
- Review Pending: `bg-amber-500/10 text-amber-400 border border-amber-500/20`.
- Error / Conflict: `bg-red-500/10 text-red-400 border border-red-500/20`.

---

## 5. Visualising the Knowledge Graph (Core UX Element)

Every main screen or hero section MUST include a visual representation of the
Knowledge Graph:
- Nodes: circular or rounded pill nodes with icons (Database, Brain, FileText, CheckCircle).
- Edges: fine vector SVG lines (`stroke-slate-700 stroke-1`); active transfers show glowing animated pulses (`stroke-cyan-400`).
- Geometry: triangular / network mesh layout reflecting the "S" logo structure.

---

## 6. Landing Page Layout Architecture

1. Navigation Header — logo (S isotype + "soph.ia"), nav links (Platform, Knowledge Graph, Governance, Docs, Pricing), Sign In (ghost) + Launch App (primary gradient).
2. Hero — glow pill badge, H1 "The Infrastructure Where Human Knowledge Becomes AI Intelligence.", subtitle, CTAs (Get Started Free + Explore Interactive Graph), animated Knowledge Graph mockup.
3. Value Proposition / Bento Grid — Sovereignty (governance), Git for Knowledge (versioned diff), No Orphan Nodes (sub-graph), Enterprise Security.
4. Interactive Feature — split screen: Knowledge Units list ↔ AI response with verified source citations.
5. CTA Banner — centered, glowing radial `from-blue-900/30 to-cyan-900/30`, sign-up box.
6. Footer — 4 columns (Product, Resources, Company, Legal) + "All Systems Operational" status.
