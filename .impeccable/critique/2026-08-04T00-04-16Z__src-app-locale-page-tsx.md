---
target: Landing page
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-04T00-04-16Z
slug: src-app-locale-page-tsx
---
# SOPH.IA Landing Page — UX Critique (Persuade surface)

## Design Specificity Verdict

Genuinely specific — but only in the middle third. The graph constellation (`page.tsx:40-92`), the source-cited Agent Compiler chat mockup (`:238-297`), and version/citation microcopy ("Pricing policy · v3 · verified", `:252`) are bespoke and teach the value proposition through artifact. The frame (sticky glass nav + hero pill + glow orb + 2 CTAs + 4-card bento + email CTA + 4-column footer) is interchangeable SaaS template chrome; sections 1, 2, and 6 would not change if the logo said "Nebula Analytics".

System contradiction: DESIGN.md:54-57 mandates Inter for display, globals.css:15,87 sets Outfit. Spec says headline 48/36/28 at Light weight; page runs 36→60px Extrabold (`:168`).

## Nielsen Heuristics — 21/32 (66%, Acceptable band)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of status | 3 | Email input is not a form; submit gives zero feedback |
| 2 | Match system↔real world | 3 | Hero headline is abstraction, not a job-to-be-done |
| 3 | User control & freedom | 2 | All 17 nav/footer items are dead spans with cursor-default |
| 4 | Consistency & standards | 2 | CTA labels split ("Launch App" vs "Get Started Free"); DESIGN.md drifts from live tokens |
| 5 | Error prevention | 2 | Email input accepts garbage, discards value on click |
| 6 | Recognition, not recall | 3 | Familiar SaaS layout; graph + chat mockups teach instantly |
| 7 | Flexibility/Efficiency | n/a | One-shot marketing page |
| 8 | Aesthetic & minimalist | 4 | Cohesive dark-first electric-blue system, disciplined tokens, strong type pairing |
| 9 | Error recovery | 2 | No error states on email path; dead links offer no recovery |
| 10 | Help & Docs | n/a | Static page; but "Docs" is a dead span |

## Cognitive Load — 5/8 checklist failures (moderate-high)

- Visual clutter: 7 animated chips + 6 flowing edges + drifting glow + pulse dots simultaneously; chips pulsing to 55% opacity every 2.4s reads as "loading" (`globals.css:132-141`).
- Inputs labeled: email input has no label, only placeholder (`:320-322`).
- Clear decision points: 9 simultaneous choices on first viewport (5 nav + Sign In + Launch App + Get Started Free + Explore Interactive Graph).
- Convention consistency: three conversion affordances, three labels.
- Distracting motion: edges flow + nodes pulse + glow drifts + dot pulses at once; prefers-reduced-motion handled but default is noisy.

## Emotional Journey

Peak = hero constellation reveal (`:195-197`). Valley = bento (4 claims, zero proof, `:201-235`). Second peak = cited-source chat proof (`:238-297`), the only evidence on the page. End = CTA banner with no credibility deposit before the ask; no logos, numbers, SOC2/ISO, testimonials anywhere.

## Strengths

1. Product shown, not described — graph constellation + cited chat proof are differentiated persuasion for a technical buyer.
2. Typography system — Outfit display + Inter body + JetBrains Mono citations, tight tracking, strong ramp.
3. Token discipline + motion hygiene — single source of truth, prefers-reduced-motion respected, focus-visible rings present.

## Priority Issues

### P0 — Primary CTA text fails contrast (white on --azure = 2.77:1)
`button.tsx:12` uses `bg-[var(--azure)] text-white`; hover --azure-bright = 2.12:1. Every conversion button fails WCAG AA (and 3:1 normal text). Fix: darken fill — white on #2563EB = 5.17:1 or #2F6FD6 = 4.81:1; or use existing compliant btn-gradient `#2563eb→#0891b2` (`globals.css:244-253`).

### P0 — Dead navigation & footer = trust sabotage for enterprise buyer
All 17 nav/footer entries are cursor-default spans (`:130-136`, `:351-359`). "Pricing", "Docs", "Security", "DPA", "Status" don't link. Compliance buyer clicks "Security"/"DPA" → nothing. Fix: wire real links; minimum Pricing, Docs, Security, DPA, Status.

### P1 — Email capture is a lie
CTA input (`:319-322`) is not in a form, stores nothing, button just navigates to /register discarding the typed email. Fix: real capture (POST + thank-you state + prefilled register) or remove input and use single "Get Started Free" button.

### P1 — Zero trust layer in a trust-led category
"Zero Leakage & Enterprise Security" (`:116`) and "All Systems Operational" (`:369`) claim security with no artifact — no SOC2/ISO/GDPR, no logos, no numbers, no testimonial. Fix: add logo strip + 2-3 hard numbers ("1,240 KUs · 38 domains · 100% audit trail") or one governance testimonial between bento and split.

### P2 — "Explore Interactive Graph" dead-ends into auth wall
Links to /graph (`:184`), a protected dashboard route; first-timer gets bounced to /login. Fix: public demo/screenshot page, or relabel "See the live demo".

### P2 — Small-text contrast failures
Footer copyright star-4 on sky-2 = 3.10:1 (`:365-367`); email placeholder star-4 = 3.10:1 (`:322`). Fix: placeholder → --star-3 (6.12:1); copyright → star-3/star-2.

### P2 — Buttons undersized for conversion surface
size="lg" is h-9 = 36px (`button.tsx:28`), under 44px WCAG 2.5.5 and far from spec's 12×28px padding. Fix: h-11 (44px) hero-size variant for landing CTAs.

## Persona Red Flags

- Jordan (first-timer): headline names no problem it kills; 9 simultaneous choices; "Explore Interactive Graph" → auth redirect; "Launch App" vs "Get Started Free" ambiguity.
- Casey (mobile): 36px buttons under 44px target; hero pill wraps/unbalances ≤375px; graph chips at x=85–88% clipped by overflow-hidden (`:151`); no sticky conversion; three conversion paths.
- Riley (stress tester / target buyer): "Security" dead, "DPA" dead; no SOC2/ISO/GDPR found; email silently discarded; versioned/zero-leakage claims unverifiable.

## Minor Observations

- Gradient text #60a5fa→#22d3ee passes (7.59:1/10.68:1); verified #34D399 passes (9.57:1).
- NODES tone map (`:32-38`) collapses core+accent both to azure; "Version" node loses semantic distinction.
- Graph mockup capped max-w-3xl (`:41`) inside max-w-4xl wrapper — centerpiece ~50px narrower than stage.
- Bento cards fixed p-6 regardless of span; 2-col cards feel emptier.
- Chat mockup shows one citation (`:290-292`) but copy claims "every response cites" (`:246-248`).
- Footer has no secondary CTA; page dies at copyright bar.
- section-heading used only twice; bento section lacks eyebrow, breaking section-label rhythm.
- "Deployed" badge + green dot (`:277`, `:262`) = redundant status signaling in same panel.

## Questions to Consider

1. If you stripped glow, pulse, and gradient, would the hero still say "governed, versioned, enterprise-grade"? Motion is carrying the credibility signal.
2. Three conversion paths, two labels, one silently discards the visitor's email — which promise breaks first?
3. The best artifact (cited-source chat proof) is buried mid-page behind abstract claim cards — why not promote it into the hero?
4. DESIGN.md says Inter/light; page ships Outfit extrabold — whose system is governing whom?
