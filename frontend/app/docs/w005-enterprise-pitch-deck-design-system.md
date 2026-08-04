# W005 — AOC Enterprise landing reconstruction on the pitch-deck design system

Status: complete for the Enterprise homepage. Not a redesign of the wider
site (Protocol, Assurance, Contact, etc. keep their existing look — see
"What this PR intentionally did not touch" below).

## Why

AOC has canonical commercial collateral for Enterprise: the SK005 HTML
pitch deck and the AOC Enterprise One Pager. Both were originally supplied
as external source material for this task and are now imported verbatim
into this repository (see "Canonical sources" below) via SK005.1, a
dedicated documentation-only import PR — this document is where their
design tokens and narrative are transcribed for engineering use. AOC
Enterprise's homepage previously had its own, unrelated dark/cyan visual
language and a broader narrative (a multi-vertical "control plane" story)
that predates the deck. This PR makes Enterprise the interactive web
version of the deck: same visual language, same 12-slide narrative
sequence, same terminology, richer interaction than a static document can
offer.

## Canonical sources

| Artifact | Format | Role | Location |
|---|---|---|---|
| SK005 AOC Enterprise Pitch Deck | standalone HTML (12 `<section class="slide">` blocks) | Canonical visual language + primary narrative sequence | [`docs/commercial/SK005-AOC-ENTERPRISE-PITCH-DECK.html`](./commercial/SK005-AOC-ENTERPRISE-PITCH-DECK.html) |
| AOC Enterprise One Pager | standalone HTML (single A4 page) | Canonical short-form messaging (solution/service/foundation split, "why not build it yourself", audience tags, CTA copy) | [`docs/commercial/SK006-AOC-ENTERPRISE-ONE-PAGER.html`](./commercial/SK006-AOC-ENTERPRISE-ONE-PAGER.html) |

These are imported byte-for-byte from the original source files (see
`docs/commercial/README.md` for the import's integrity validation) — not
recreated, rewritten, or redesigned. Everything below is this repo's
engineering interpretation of them, expressed as React components and
Tailwind tokens; the HTML files above remain the source of truth if the
two ever disagree.

## Design tokens — transcribed, not invented

The deck's `:root` CSS custom properties map onto Tailwind's default
palette almost exactly. Every mapping below is an exact hex match, not an
approximation:

| Deck token | Hex | Tailwind utility used |
|---|---|---|
| `--ink` | `#0F172A` | `slate-900` |
| `--ink-muted` | `#64748B` | `slate-500` |
| `--accent` | `#4F46E5` | `indigo-600` |
| `--accent-deep` | `#3730A3` | `indigo-800` |
| `--accent-soft` | `#EEF2FF` | `indigo-50` |
| `--accent-light-text` | `#A5B4FC` | `indigo-300` |
| `--card` | `#F8FAFC` | `slate-50` |
| `--card-border` | `#E2E8F0` | `slate-200` |
| `--chip-muted` | `#F1F5F9` | `slate-100` |
| `--chip-muted-text` / `--on-dark-muted` | `#94A3B8` | `slate-400` |
| `--bg-dark` | `#0B1220` | arbitrary value `bg-[#0B1220]` (no exact Tailwind stop) |
| shadow | `0 8px 24px rgba(15,23,42,0.08)` | arbitrary `shadow-[...]`, used verbatim |
| radius | `14px` | `rounded-2xl` (16px — 2px deviation accepted for Tailwind idiom consistency with the rest of the codebase) |

**Rhythm:** the deck is light-primary (white `.slide` background) with
exactly two dark "bookend" slides — the hero (slide 1) and the closing CTA
(slide 12), both `#0B1220`. This is a deliberate, real design decision in
the deck, not an oversight, and Enterprise now follows it exactly: every
homepage section between Hero and the closing CTA is white/light, and the
sticky nav stays on the dark token (`#0B1220`) throughout, consistent with
how Vercel/Linear keep a persistent dark nav bar over an otherwise light
page.

These tokens live in `frontend/app/src/landing/enterprise/primitives.tsx`,
which is the shared component library for the section — `Card`,
`IconCircle`, `Chip`, `PipelineRail`, `StatRow`, `SectionHeader`, `Eyebrow`
are all deck primitives, reused by every section component below rather
than re-implemented per section.

## Narrative sequence — the deck's own 12 slides, in order

`EnterprisePage.tsx` renders sections in exactly the deck's slide order:

| # | Deck slide | Component | Notes |
|---|---|---|---|
| 1 | Hero | `Hero.tsx` | Dark bookend. Copy verbatim from the deck. |
| 2 | Problem | `Problem.tsx` | "Storage solved access. Not governance." |
| 3 | Missing layer | `MissingLayer.tsx` | "Governed Access" statement + Request→Governed Access→Access chain. |
| — | *(website-only)* | `SolutionsAndServices.tsx` | One Pager's Solution/Service/Foundation pill row, with links — depth the static deck can't offer. |
| 4 | Pipeline | `Pipeline.tsx` | 8-stage pipeline, hover-to-reveal detail per stage + the M&A data-room reference scenario. |
| 5 | Architecture stack | `ArchitectureStack.tsx` | Protocol / Enterprise / Provider Adapter bands + provider chips. |
| 6 | Outcomes | `Outcomes.tsx` | Business / Engineering / Commercial cards. |
| 7 | Assurance | `AssuranceSection.tsx` | 5-step engagement pipeline + control-domain stat row; links to the full `AssurancePage`. |
| 8 | Benefits | `Benefits.tsx` | "Build vs. buy", 6 cards — doubles as the One Pager's "Why Not Build It Yourself" callout. |
| 9 | Customer segments | `CustomerSegments.tsx` | 6 verticals — reinforced by the One Pager's audience tags. |
| 10 | Engagement flow | `EngagementFlow.tsx` | Technical Assessment → Design Partner → Implementation → Enterprise Platform → Continuous Assurance. |
| 11 | Platform status | `PlatformStatus.tsx` | Available today / Design Partner stage / Roadmap — also the homepage's "Developers" transparency beat; capability catalog folded in as a link strip. |
| — | *(website-only)* | `BusinessNeeds.tsx` + `ArchitectureExperience.tsx` | See "Go deeper" appendix below. |
| 12 | CTA | `CtaSection.tsx` | Dark bookend. "Request a Technical Assessment" — the sole commercial entry point, never "Contact Sales" / "Book Demo". |

## Reuse strategy — section-by-section classification

| Former section | Classification | Disposition |
|---|---|---|
| `Hero.tsx` | REBUILD | Deck's hero copy/visual is a different claim than the old "every organization composes a different architecture" framing. Logo + nav shell reused. |
| `GovernanceGap.tsx` | REBUILD → `Problem.tsx` | The deck's problem statement ("you have storage/auth/URLs/permissions, none of it proves governance") is narrower and sharper than the old 4-illustration "your data is copied/resold" narrative. The underlying claim (the current model doesn't prove anything) carries forward in copy, not in the old illustrations. |
| `GovernanceEmerges.tsx` | REBUILD → `ArchitectureStack.tsx` + `Pipeline.tsx` | **The homepage's strongest concept — "governance is the result of composition, not the starting point" — is explicitly preserved.** It is now the eyebrow/description of `ArchitectureStack.tsx`, illustrated by the deck's own 3-band composition diagram (Protocol → Enterprise → Provider Adapter) instead of the old 4-animation grid + generic-vertical infrastructure diagram, which described verticals (HR, Finance, Health) the SK005 deck's narrower governed-document-access story doesn't cover. |
| `SolutionsAndServices.tsx` | KEEP, restyled | Same component and links, content rewritten to the One Pager's exact Solution/Service/Foundation pill language, restyled light/indigo. |
| `ExploreCapabilities.tsx` | MERGE | Folded into `PlatformStatus.tsx` as a compact link strip instead of a full section, to avoid reintroducing a feature-dump grid right before the closing CTA. |
| `BusinessNeeds.tsx` + `ArchitectureExperience.tsx` (+ `ArchitectureBuilder`, `CapabilityComposer`) | KEEP, relocated + restyled | Not part of the SK005 deck's narrative (the deck tells one narrow governed-access-to-documents story; this composer answers a broader "which architecture pattern is your org sovereign around" question). Real interactive work, not deleted — relocated to a "Go deeper" appendix after the deck-driven narrative, restyled from dark/cyan to light/indigo via the same `primitives.tsx` tokens. |
| 4 illustrated "governance gap" animations (`DataPipelineAnimation`, `ImplicitConsentAnimation`, `InvisibleAccessAnimation`, `BlindTrustAnimation`/`BlindTrustIllustration`) + `ProblemCard.tsx` | REMOVE | Exclusive to the old `GovernanceGap.tsx` (confirmed via repo-wide grep — no other consumer). Once that section was rebuilt to the deck's plain check-list/gap-card layout, these became fully dead code; deleted rather than left orphaned. |
| 4 "governance emerges" animations (`ExplicitConsentAnimation`, `ModularPermissionsAnimation`, `VerifiableInteractionsAnimation`, `FullControlAnimation`) | REMOVE | Same situation — exclusive to the old `GovernanceEmerges.tsx`, dead once that section was rebuilt. |
| `AocInfrastructureAnimated.tsx` | KEEP, untouched | Simply no longer used by Enterprise. Still rendered by the Protocol homepage (`AocLandingPage.tsx`), which is out of W005's scope and keeps its own dark/cyan visual language unchanged. |

## Logo consistency

The official AOC logo (`components/logo/LogoRotating.tsx`) is unchanged —
not redesigned, recolored, or replaced — and now appears consistently
across the Enterprise experience: the sticky nav (as before), the Hero
(new), matching how it already anchors the Protocol homepage nav.

The pitch deck and one-pager are imported verbatim as source-of-truth
commercial collateral (see `docs/commercial/README.md` — "must not be
silently rewritten"), so editing them to add the logo is out of scope for
this PR. **Follow-up, tracked as a distinct future change to
`docs/commercial/`:** both currently ship without the official mark (the
one-pager draws its own generic CSS "mark" square, the deck has none at
all) — recommend adding `LogoRotating`'s mark (or a static export of it)
to both, matching the site's placement/sizing, so the mark is the one
constant across Website / Pitch Deck / One Pager / any future Executive
Brief.

## What this PR intentionally did not touch

- **`AssurancePage.tsx`** (1,150+ lines — constitutional index, benchmarking,
  Stripe checkout links) keeps its own dedicated-refactor scope, per the
  W003 migration notes. The new `AssuranceSection.tsx` on the homepage is
  the deck's own, much shorter Assurance slide, linking to the full page.
- **`GovernedAccessPage.tsx`** is still the navigation-skeleton page noted
  in W003 as needing its own future refactor.
- **The Protocol homepage** (`AocLandingPage.tsx`) and its dark/cyan visual
  language, including `AocInfrastructureAnimated.tsx`.
- **`ProtocolFooter.tsx`** gained a minimal `accent?: 'cyan' | 'indigo'`
  prop (default `'cyan'`, so Protocol's usage is unaffected) so Enterprise
  can pass `accent="indigo"` and avoid an accent-color seam between the
  dark closing CTA and the footer immediately beneath it. No other visual
  change to the footer.

## CTA

The homepage now ends on exactly one commercial entry point everywhere it
appears (nav, hero, closing CTA): **Request a Technical Assessment** —
never "Contact Sales" or "Book Demo" — matching both the deck's closing
slide and the One Pager's CTA block. Secondary asks ("Request a Live Demo",
"Request an Architecture Review") are preserved as lighter secondary links
in the closing CTA, matching the deck.

## Verification performed

- `npx tsc -b --pretty false` — clean, aside from a pre-existing,
  unrelated monorepo workspace-resolution failure in
  `enterprise/src/assurance/*` (confirmed present on `main` before this PR,
  via `git stash`).
- `npx vite build` — succeeds.
- `npx eslint src/landing/` — zero new errors; the 6 pre-existing errors
  (`ContactPage.tsx`, `ConstitutionalBenchmarkExplorer.tsx`) are unchanged
  by this PR and already documented in the W003 migration notes.
- Manual visual QA via a local dev server + Chromium screenshots at
  1440px and 390px (mobile) viewports, full page top to bottom.
