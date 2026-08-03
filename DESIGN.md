# SOPH.IA — Design System ("Constellation")

Graph-native, dark, Operate register. The organization's knowledge is a
navigable night sky: **nodes are bodies with state, edges are the lines
between them, azure is the connective light.** This world is user-pinned;
it refuses both the AI-default light dashboard and the neon-on-black cliché.

Source of truth for tokens: [`src/app/globals.css`](src/app/globals.css).

## Color — cool midnight ink

| Role | Token | Value |
|------|-------|-------|
| Void (deepest) | `--sky-0` | `#080b12` |
| App canvas | `--sky-1` | `#0a0e17` |
| Surface (panels, cards, chrome) | `--sky-2` | `#0f1420` |
| Raised (inputs, hover, tiles) | `--sky-3` | `#151b2b` |
| Higher (popovers, active tiles) | `--sky-4` | `#1b2233` |
| Hairline edge | `--edge` | `#212a3e` |
| Edge strong | `--edge-strong` | `#2e3950` |
| Text primary | `--star-1` | `#e8edf7` |
| Text body | `--star-2` | `#b8c1d4` |
| Text muted | `--star-3` | `#8b95ab` |
| Text faint / disabled | `--star-4` | `#5b6478` |

**Connective accent (the signature light):** `--azure #5b9bff`, hover
`--azure-bright #82b4ff`, deep `--azure-deep #3f7fe0`. Filled azure controls
carry dark ink text `--azure-ink #08101f` (white on azure fails contrast).

**Status = the color of a body's glow:** verified `--verified #34d399`,
pending `--pending #fbbf24`, draft `--draft #93a4c4`, archived
`--archived #5b6478`, danger `--danger #fb6a68`. Rendered as a node-dot with a
soft same-hue ring, plus a same-hue text label — never gray on a tinted chip.

Color strategy: **Restrained** (dark neutrals + one azure accent). Dark chosen
from the use scene: an infrastructure tool for prolonged, focused operator work.

## Type

Typographic pairing (3 levels), following the brand manual:

- **Display / headings:** Outfit (`--font-display`) — geometric tech-modern font,
  matches the SOPH.IA logo style. Used for H1–H3: `headline-xl/lg/md`, landing
  hero/section headings, and headings inside rendered KUs. Display tracking
  `-0.02 … -0.025em`.
- **Body / editor:** Inter (`--font-sans`) — the workhorse grotesque for all UI
  and reading text (Markdown, forms, tables).
- **Coordinates:** JetBrains Mono (`--font-mono`) — used **only** for the
  product's measurement data: KU ids, hashes, versions, trust scores, counts.
  Never as decorative "technical" costume.
- Scale utilities in `globals.css`: `headline-xl/lg/md`, `body-lg/md/sm`,
  `label-sm/xs`, `section-heading` (uppercase, tracked), `mono-code`.

## Shape & elevation

- Radii: card **14px** (`--radius-lg`), inputs/tiles 10px, pills `full` for
  small controls. Cards sit at 12–16px, never sharp.
- Elevation declared **once**: panels use a hairline border on `--sky-2`
  (no border+shadow ghosting). Real shadows carry offset + blur; the one
  meaningful glow is `node-active` on the selected graph body.

## Icons & logo — drawn, never emoji

- [`src/components/shared/icon.tsx`](src/components/shared/icon.tsx): one line
  set, `currentColor`, stroke ~1.6, drawn in the node+edge grammar where the
  concept allows (the `graph` glyph is three connected bodies).
- [`src/components/shared/logo.tsx`](src/components/shared/logo.tsx): the
  constellation mark — satellite bodies wired to a luminous azure core; the
  wordmark's "." is a small azure node. Pure geometry, the brand in one glyph.

## The dot substrate

The faint dot field is the graph canvas's own ground. It lives **only where a
real canvas exists** — the React Flow `Background` on `/graph`, and the auth /
landing hero as atmosphere — never as generic page decoration. (The mechanical
detector flags any tiled dot field as advisory "slop"; this usage is the
deliberate, world-justified exception for a knowledge-graph product.)

## Notes / follow-ups

- All content emoji have been replaced with the drawn `Icon` set (or clean text
  in native `<select>` options, which can't hold SVG). Project tiles render the
  `projects` glyph on the user's chosen color; the per-project material-symbol
  icon is no longer surfaced (uniform iconography > custom emoji).
- Theme is dark-only today; a light variant would reuse the same token names.
- Pre-existing (not design) type errors live in `graph/page.tsx` (KU/dependency
  prop shape), `agent-wizard.tsx` (undefined `model`/`temperature`/`tags`), and
  `api/visibility/route.ts` — unrelated to this rebrand.
