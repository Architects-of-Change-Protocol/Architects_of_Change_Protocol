# W008 — Unified AOC Design Language & Capability Minerals

Status: complete. Every AOC surface (Protocol, Enterprise, Governed Access,
Assurance) now shares one canonical visual system. AOC Protocol's previously
separate dark/cyan visual language is retired; it is rebuilt onto the same
foundation W005 established for Enterprise. A semantic accent layer —
**Capability Minerals** — is introduced so each capability family still reads
as its own domain within that one shared system.

## Why

W005 made AOC Enterprise the interactive extension of the canonical SK005
pitch deck: light-primary body, two dark (`#0B1220`) bookend sections (Hero,
closing CTA), and a shared component library
(`frontend/app/src/landing/enterprise/primitives.tsx` — `Card`, `IconCircle`,
`Chip`, `PipelineRail`, `SectionHeader`, `StatusPill`, …). W006 and W007
extended that same system, unchanged, to Governed Access and Assurance. AOC
Protocol was the one surface W005 explicitly left alone, keeping its
original, unrelated dark/cyan visual language (`frontend/app/src/landing/AocLandingPage.tsx`
and `landing/protocol/*`, with its own `primitives.tsx`).

That left AOC with four commercial-facing surfaces telling one story but
looking like two different products. This change makes the Enterprise
visual system — layout, typography, spacing, nav/footer shell, and component
library — the canonical foundation for **all** of them, and gives each
capability family a distinct accent so "one platform" doesn't collapse into
"one page with no domain identity."

## Capability Minerals

A **mineral** is a semantic accent token — never a layout, never a
different component, never a different page shell. It's the one thing
allowed to vary per surface, and it only ever shows up in accents: badges,
diagrams, icons, chips, highlights, and section identifiers.

| Mineral | Tailwind family | Capability family | Where it appears |
|---|---|---|---|
| **Amethyst** | `violet` | AOC Protocol · Sovereignty | Protocol's hero, section eyebrows, capability cards, step-flow diagrams, footer |
| **Sapphire** | `indigo` | AOC Enterprise · Governance | Enterprise's hero, nav/footer chrome (unchanged from W005 — this *is* the original deck accent, just named) |
| **Turquoise** | `teal` | Governed Access | Governed Access's hero, lifecycle rail, capability icons, provider grid, closing CTA |
| **Emerald** | `emerald` | Assurance | Assurance's hero, maturity rail, methodology stages, capability-output icons, closing CTA |
| **Amber** | `amber` | AI Governance (reserved) | Not yet applied anywhere — defined for a future capability family so the token exists before the surface does |

The full token set lives in
`frontend/app/src/landing/enterprise/minerals.ts` — a pure data/type module
(`Mineral`, `MineralTokens`, `MINERALS`), kept separate from
`primitives.tsx` so that file stays component-only (mixing a value export
like `MINERALS` into a component file breaks Vite Fast Refresh, which is
also why `eslint`'s `react-refresh/only-export-components` rule polices this
split — see "Verification performed" below). Every mineral entry is a
complete, literal Tailwind class string (e.g. `bg-violet-600`, never an
interpolated `bg-${color}-600`), so Tailwind's content scanner picks up
every color regardless of which mineral a given page renders at runtime.

## What stayed universally shared

Nothing about layout, typography, spacing, navigation structure or the
component library differs by mineral:

- **Layout rhythm**: light-primary body, two dark `#0B1220` bookend
  sections (Hero, closing CTA) — now true of Protocol as much as Enterprise,
  Governed Access and Assurance.
- **Component library**: `Card`, `IconCircle`, `Chip`, `PipelineRail`,
  `StatRow`, `SectionHeader`, `Eyebrow`, `StatusPill`, `NodeGlyph`,
  `MineralBadge`, and the newly-added `StepFlow` (a light-themed vertical
  numbered flow, promoted from Protocol's old bespoke component into the
  shared library since Protocol needed it and it's generically useful) all
  now accept an optional `mineral` prop (default `'sapphire'`, so every
  existing Enterprise/Governed-Access/Assurance call site's appearance is
  unchanged unless it explicitly opts into a different mineral).
- **Navigation and footer**: `ProtocolFooter` renders identically on every
  surface — same layout, same copy structure — with only its `accent` prop
  (now typed as `Mineral`) changing. The persistent top nav bar's primary
  CTA ("Request Technical Assessment") stays Sapphire across Enterprise,
  Governed Access and Assurance deliberately — that's the shared, persistent
  chrome that says "you're on one platform," while each page's own body
  content carries that page's mineral. Protocol's new `ProtocolNav`
  (`landing/protocol/Nav.tsx`) mirrors `EnterpriseNav`'s exact structure and
  styling (same sticky dark bar, same sizing/spacing/interaction) with its
  own items and an Amethyst "Launch App" CTA — a sibling built to the same
  visual and interaction spec, not a fork of it.

## Per-surface mineral wiring

- **AOC Protocol** (`landing/AocLandingPage.tsx` + `landing/protocol/*`) —
  fully rebuilt onto the shared system. `protocol/primitives.tsx` (the old,
  separate dark/cyan component set) is deleted; every section now imports
  from `enterprise/primitives.tsx` with `mineral="amethyst"`. A new
  `protocol/CtaSection.tsx` gives Protocol its own dark-bookend closing CTA
  matching the same rhythm as `enterprise/CtaSection.tsx`,
  `governed-access/Assessment.tsx` and `assurance/Cta.tsx`.
  `protocol/ProtocolToEnterprise.tsx` deliberately shows **two** minerals
  side by side (Amethyst "AOC Protocol defines" / Sapphire "AOC Enterprise
  operationalizes") — the one section where two capability families
  literally hand off to each other.
- **AOC Enterprise** — no visual change. Sapphire *is* the indigo accent
  W005 already established; this change only names it and makes the
  default explicit.
- **Governed Access** — every `indigo-*` accent in
  `landing/enterprise/governed-access/*.tsx` (hero badge/CTA, lifecycle
  rail, capability/audience icons, provider "live" highlight, closing CTA)
  is now Turquoise (`teal-*`), and shared-primitive calls
  (`IconCircle`, `PipelineRail`, `Chip tone="accent"`) pass
  `mineral="turquoise"` explicitly. `ProtocolFooter` on this page now reads
  `accent="turquoise"`.
- **Assurance** — the same treatment with Emerald (`emerald-*`) across
  `landing/enterprise/assurance/*.tsx` (hero, maturity levels, methodology
  stages, engagement rail, Intelligence-Risk-module cross-link, closing
  CTA). `CapabilityDomains.tsx` — the section that literally lists
  Protocol's 8 capability families next to Enterprise's 20 — now carries an
  explicit `MineralBadge` next to each domain heading (Amethyst for Domain
  A · Protocol Sovereignty, Sapphire for Domain B · Enterprise Governance),
  the clearest single place in the product where the mineral system's job —
  naming which capability family something belongs to — is visible at a
  glance. `ProtocolFooter` reads `accent="emerald"`.
  One deliberate exception: `assurance/ContinuousAssurance.tsx`'s
  `CLASSIFICATION_TONE` map (`available` / `current-service` /
  `reference-model` / `in-development` / `future-direction`) is a maturity
  *status* vocabulary, not a capability-domain identity — it already uses
  `emerald` for "available" (a standard green-means-live convention) and
  keeping `current-service` on Sapphire/indigo avoids two different
  classifications reading as the same color on an Emerald-accented page.
  Not every indigo in the codebase is a domain accent; this one wasn't, so
  it was left alone.

## Verification performed

- `npx tsc -b --pretty false` — no new errors; only the pre-existing,
  unrelated monorepo workspace-resolution failure in
  `enterprise/src/assurance/*` documented since W005.
- `npx eslint src/landing/` — same 6 pre-existing errors documented in W003
  (`ContactPage.tsx`, `ConstitutionalBenchmarkExplorer.tsx`), zero new ones.
  Extracting `MINERALS`/`Mineral`/`MineralTokens` into
  `enterprise/minerals.ts` (rather than defining them inline in
  `primitives.tsx`) was required to keep that result clean —
  `react-refresh/only-export-components` flags any component file that also
  exports a plain value.
- `npx vite build` — succeeds.
- Manual visual QA via a local dev server + Chromium screenshots at
  1440px across all four surfaces (Protocol, Enterprise, Governed Access,
  Assurance), confirming: Protocol's new light-primary body and Amethyst
  accents render correctly top-to-bottom; Governed Access and Assurance
  correctly show Turquoise/Emerald in body content while their nav bar CTA
  stays Sapphire; the `MineralBadge` renders correctly in
  `CapabilityDomains.tsx`.
