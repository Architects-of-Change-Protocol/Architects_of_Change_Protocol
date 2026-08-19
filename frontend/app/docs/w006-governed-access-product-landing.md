# W006 — Governed Access product landing

Status: complete. Governed Access now has a dedicated product page instead
of the navigation-skeleton stub W005 left in place (see "What W005
intentionally did not touch" in `w005-enterprise-pitch-deck-design-system.md`).

## Why

Soberanía Enterprise's homepage (W005) introduces Governed Access as a concept
across three of its own sections (`Problem`, `MissingLayer`,
`ArchitectureStack`) on the way to explaining Soberanía Enterprise as a whole.
Governed Access is also Soberanía Enterprise's first commercial Solution — it
needs a page that sells the capability on its own terms, in under two
minutes, without re-explaining the platform around it. That page did not
exist; `GovernedAccessPage.tsx` was a placeholder noting the real page was
"in preparation." This PR builds it.

Positioning guardrail carried through every section: Governed Access is
**operational governance for access to digital assets** — not identity,
authentication, authorization, storage, IAM, OAuth, or Zero Trust. Sections
are written to explain what the product *does*, not to re-litigate what
Soberanía Enterprise *is*.

## Design system — reused, not reinvented

This page is built entirely on the W005 commercial design system —
`frontend/app/src/landing/enterprise/primitives.tsx` (`Card`, `IconCircle`,
`Chip`, `PipelineRail`, `SectionHeader`, `Eyebrow`) and the same tokens
documented in `w005-enterprise-pitch-deck-design-system.md` (light-primary
body, `#0B1220` dark bookends for Hero and the closing CTA, `indigo-600`
accent). No new visual language, no new primitive components were
introduced — every section composes the existing library.

New, page-scoped components live under
`frontend/app/src/landing/enterprise/governed-access/`, mirroring how
`landing/protocol/` and `landing/enterprise/` already separate content
families:

| File | Role |
|---|---|
| `content.ts` | All copy/data for the page — mechanisms, gaps, the 8-stage lifecycle, providers, capabilities, audiences, example scenarios, assessment steps. |
| `Hero.tsx` | Section 1 — dark bookend. Single CTA: Request Technical Assessment. |
| `Problem.tsx` | Section 2 — the access mechanisms teams already use, and what they can't answer. |
| `Lifecycle.tsx` | Section 3 — the 8-stage chain stated as a single declaration (`Chip` row). |
| `ProviderNeutral.tsx` | Section 4 — provider grid (Pinata live, others roadmap) + "Future Providers" tile. |
| `Architecture.tsx` | Section 5 — the same 3-band Protocol/Enterprise/Provider diagram as `../ArchitectureStack.tsx`, reused verbatim as a visual pattern. |
| `OperationalLifecycle.tsx` | Section 6 — the same chain as `Lifecycle.tsx`, now interactive (hover-to-reveal), reusing `../Pipeline.tsx`'s exact interaction. |
| `Capabilities.tsx` | Section 7 — 8 capability cards, same grid as `../Benefits.tsx`. |
| `WhoBenefits.tsx` | Section 8 — 8 audiences, same layout as `../CustomerSegments.tsx`. |
| `Examples.tsx` | Section 9 — 7 illustrative scenarios, explicitly labeled "Example Scenario," no customer claims. |
| `Assessment.tsx` | Section 10 — Assessment → Architecture Review → Pilot → Implementation (`PipelineRail`), then the closing CTA (dark bookend). |

`GovernedAccessPage.tsx` assembles these in brief order, with `EnterpriseNav`,
`Breadcrumbs` (Protocol → Enterprise → Solutions → Governed Access), and
`ProtocolFooter accent="indigo"` — the same shell `EnterprisePage.tsx` uses.

## Why the lifecycle has 8 stages, not the homepage's 8

The Enterprise homepage's `Pipeline.tsx` also has 8 stages, but names them
Request, Decision, Obligations, Grant, Translation, Execution, Usage,
Evidence — Policy and Revocation aren't named stages there. This page names
both explicitly (`Request → Decision → Policy → Grant → Provider
Translation → Usage → Evidence → Revocation`), matching the fuller list
`ArchitectureStack.tsx` already summarizes in its Enterprise band
("Decision · Obligation · Grant · Revocation · Usage · Evidence") and the
brief's required flow. This page is the canonical, spelled-out version;
the homepage's shorter pipeline is intentionally left as its own summary
and untouched by this change.

## Honesty bar — claims match `PlatformStatus.tsx`

Every maturity claim on this page is consistent with what
`../PlatformStatus.tsx` already states about the platform: Pinata is the
only conformance-tested provider adapter; S3, Azure Blob, Cloudflare R2,
Google Drive, and SharePoint are roadmap, not shipped. The provider grid
and "Future Providers" tile make that distinction visible rather than
implying broader coverage than exists today. Section 9's examples are
explicitly labeled "Example Scenario" — illustrative only, never framed as
deployments or customer claims, matching the brief's "no customer claims"
requirement.

## CTA

Exactly one commercial call to action appears anywhere on this page:
**Request Technical Assessment** — in the nav (inherited from
`EnterpriseNav`), the Hero, and the closing CTA. Unlike
`../CtaSection.tsx` (the Enterprise homepage's closing CTA, which also
carries secondary "Request a Live Demo" / "Request an Architecture Review"
links), `Assessment.tsx`'s closing CTA deliberately omits secondary links —
this page holds to a single CTA throughout, per brief.

## Routing

No routing changes were required. `App.tsx` already dispatches
`?view=governed-access` to `GovernedAccessPage`, and
`SolutionsAndServices.tsx` / `enterprise/content.ts`'s nav already link to
it — both were wired ahead of this page's existence, in W005.

## Verification performed

- `npx tsc -b --pretty false` — no new errors; the only errors present are
  the pre-existing, unrelated monorepo workspace-resolution failure in
  `enterprise/src/assurance/*` documented in the W005 doc.
- `npx eslint src/landing/enterprise/governed-access src/landing/enterprise/GovernedAccessPage.tsx` — zero errors.
- `npx vite build` — succeeds.
- Manual visual QA via a local dev server + Chromium screenshots at 1440px
  and 390px (mobile) viewports, full page top to bottom, plus a targeted
  screenshot of the interactive Operational Lifecycle hover state.
