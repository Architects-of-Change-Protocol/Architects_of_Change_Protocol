# W007 — AOC Assurance canonical assessment layer

Status: complete. AOC Assurance now has a canonical landing page built on
the W005/W006 commercial design system, replacing the dark/emerald page
that previously occupied `/?view=assurance`. The prior page's content is
preserved in full and relocated to `/assurance/intelligence-risk`.

## Canonical Definition

> AOC Assurance evaluates, validates and continuously monitors every
> Sovereignty Capability defined by AOC Protocol and every Governance
> Capability operated by AOC Enterprise.

AOC Assurance is the assessment and monitoring layer for the complete AOC
ecosystem. It measures capability presence, implementation maturity,
evidence quality, operational effectiveness, architectural gaps,
remediation progress, capability drift, and continuous posture.

## Ecosystem Position

- **AOC Protocol** defines sovereignty capabilities for digital assets.
- **AOC Enterprise** operationalizes governance capabilities.
- **Governed Access** packages one specific Enterprise solution for
  governed access to digital assets.
- **AOC Assurance** evaluates and continuously monitors the complete
  capability surface across Protocol and Enterprise.

Protocol &rarr; Enterprise &rarr; Governed Access &rarr; Assurance.
Assurance is not a peer platform and not merely another Enterprise
capability — it is the layer that evaluates the rest of the ecosystem,
including Governed Access.

## Capability Sources

Both capability domains on the page render directly from their existing
canonical sources — no hand-duplicated list was introduced:

| Domain | Canonical source | Export |
|---|---|---|
| A — Protocol Sovereignty | `frontend/app/src/landing/protocol/content.ts` (W004) | `CAPABILITY_FAMILIES` (8 families), status labels via `ClaimStatus` |
| B — Enterprise Governance | `frontend/app/src/landing/enterprise/content.ts` (W005) | `CAPABILITY_CATALOG` (20 capabilities, keyed by `CapabilityId`) |

`landing/enterprise/assurance/CapabilityDomains.tsx` imports both directly
and iterates them; if either source changes, this section changes with it.
`StatusPill` (`enterprise/primitives.tsx`) gained two additional tone
entries — `'Reference Model'` and `'Future Direction'` — so Protocol's own
`ClaimStatus` labels render with the existing shared badge component
instead of a new one.

## Intelligence Risk Position

Intelligence Risk is one specialized assessment module inside AOC
Assurance — not a separate top-level Enterprise offering, not a peer of
Assurance, and not the definition of Assurance. Conceptual hierarchy:

```
AOC Enterprise
└── Assurance
    └── Intelligence Risk
```

`landing/enterprise/assurance/IntelligenceRiskModule.tsx` (Section 7 of the
canonical page) states this positioning, lists the module's focus areas
(Knowledge Loss, Key Person Dependency, Institutional Memory, undocumented
decision logic, concentration of operational knowledge, Constitutional
Index, benchmark analysis), and links out to the full module. It
deliberately does not reproduce risk detail, assessment tiers, or checkout
— per the brief, no pricing or checkout belongs on the canonical Assurance
landing.

`ENTERPRISE_NAV_ITEMS` (`enterprise/content.ts`) already nested Assurance
one level under Services with no separate Intelligence Risk entry before
this change, so no nav restructuring was required to satisfy "Intelligence
Risk is not a top-level Enterprise nav item."

### What moved, and why

The former `landing/AssurancePage.tsx` (1,150+ lines: risk cards, the
Stripe-linked assessment tiers, the Constitutional Index benchmark
explorer, FAQ, founder essay) is the *substance* of the Intelligence Risk
module. It has been renamed to `landing/IntelligenceRiskPage.tsx` and moved
to its own route, `/assurance/intelligence-risk`, with its content,
Stripe checkout URLs, and paid-product logic **untouched**. Only its shell
was updated:

- Breadcrumbs: `Protocol → Enterprise → Services → Assurance →
  Intelligence Risk` (previously stopped at `Assurance`).
- Its own nav's last item now reads "Assurance" (`/?view=assurance`)
  instead of "Enterprise", since Assurance is now its direct parent.
- A new FAQ entry states the module relationship explicitly.
- A new `useIntelligenceRiskPageMeta` hook gives the route its own
  title/description/canonical instead of inheriting root defaults.
- Its dark/emerald visual system (`assurance.css`) was deliberately **kept
  as-is** — the brief's instruction not to preserve a conflicting
  dark/emerald design system targets the *canonical Assurance landing*
  specifically; rewriting the module's visual system was not requested and
  risked destabilizing the preserved paid-checkout UI for no commercial
  benefit.

Every other page that linked into the old `/?view=assurance` experience
for Intelligence-Risk-specific content (risk cards, the Constitutional
Index, the assessment tiers) was updated to point at
`/assurance/intelligence-risk` instead, preserving anchors (`#risk`,
`#assessments`, `#index`, `#learn-more`, `#faq`) verbatim:
`GovVsSovPage.tsx`, `WhatIsAiSovereigntyPage.tsx`, `ResearchHubPage.tsx`,
`AssessmentPlaceholderPage.tsx`, `AssuranceProfilePage.tsx`,
`AssuranceSupportPages.tsx`. Links that already pointed at the Assurance
*service* itself rather than the Intelligence Risk experience —
`enterprise/SolutionsAndServices.tsx`, `AboutPage.tsx`,
`enterprise/content.ts` (`ENTERPRISE_NAV_ITEMS`),
`enterprise/AssuranceSection.tsx` — were left pointing at `/?view=assurance`
unchanged, since that now correctly resolves to the canonical page.

`frontend/app/index.html`'s static JSON-LD `Product` and `Service` blocks
(the Constitutional Assessment offers and their Stripe URLs) had their
`url` fields updated to `/assurance/intelligence-risk`, matching where
those offers now actually live, for social-scraper and pre-JS-crawler
accuracy. The Stripe checkout URLs themselves were not touched.

## Page Structure

`landing/enterprise/AssurancePage.tsx` assembles, in order:

| # | Component | Role |
|---|---|---|
| 1 | `assurance/Hero.tsx` | Dark bookend. One H1, one CTA (Request Technical Assessment), no pricing. |
| 2 | `assurance/WhyAssurance.tsx` | The gap between implementation and proof; the questions Assurance answers. |
| 3 | `assurance/CapabilityDomains.tsx` | Domain A (Protocol Sovereignty, 8 families) and Domain B (Enterprise Governance, 20 capabilities) — both rendered from canonical sources. |
| 4 | `assurance/Methodology.tsx` | 8-stage methodology (`PipelineRail` + detail cards): Capability Inventory → Evidence Collection → Capability Evaluation → Gap Analysis → Recommendations → Roadmap → Implementation Validation → Continuous Monitoring. |
| 5 | `assurance/CapabilityMaturity.tsx` | The 5-level Capability Maturity Model. |
| 6 | `assurance/AssessmentOutputs.tsx` | The 12 outputs a customer receives; references AOC SAF v1.0.0 by its existing, already-approved description. |
| 7 | `assurance/IntelligenceRiskModule.tsx` | Intelligence Risk positioned as one nested module, linking out to the full module. |
| 8 | `assurance/ContinuousAssurance.tsx` | The evolution toward continuous monitoring, each item explicitly classified (Available Today / Current Service / Reference Model / In Development / Future Direction). |
| 9 | `assurance/EngagementJourney.tsx` | The commercial journey: Technical Assessment → Findings → Prioritized Roadmap → Implementation → Validation → Continuous Assurance. |
| 10 | `assurance/Cta.tsx` | Dark bookend closing CTA. Same single CTA as the hero. |

`content.ts` holds all page-specific copy/data that isn't sourced from
Protocol or Enterprise's own canonical files. `useAssurancePageMeta.ts`
injects page-specific title/description/canonical, mirroring the pattern
already used by `landing/protocol/usePageMeta.ts`.

## Design System — reused, not reinvented

Every section composes the existing W005/W006 primitives
(`enterprise/primitives.tsx`: `Card`, `IconCircle`, `Chip`, `PipelineRail`,
`SectionHeader`, `StatusPill`), `EnterpriseNav`, `Breadcrumbs`, and
`ProtocolFooter accent="indigo"` — the same shell `EnterprisePage.tsx` and
`GovernedAccessPage.tsx` use. Light-primary body, `#0B1220` dark bookends
for Hero and the closing CTA, indigo-600 accent. The only primitive change
is additive: two new `StatusPill` tone entries for Protocol's
`ClaimStatus` labels (see Capability Sources above). The official
`LogoRotating` mark is unchanged, reused via `EnterpriseNav`.

## Maturity Model

Five levels, applied to every capability evaluated:

1. **Not Present** — no meaningful implementation or evidence exists.
2. **Partially Implemented** — some elements exist but are incomplete,
   inconsistent or provider-specific.
3. **Implemented** — the capability is technically present.
4. **Operational** — the capability is used reliably in real workflows
   with ownership and evidence.
5. **Continuously Validated** — the capability is monitored, reassessed
   and supported by current evidence.

This is a per-capability maturity model, distinct from the SAF Assessment
Maturity Model in `docs/audits/SAF-002-Assessment-Methodology-v1.0.md`
§27 (Unprepared / Aware / Managed / Integrated / Constitutional), which
describes an organization's overall readiness for SAF engagements, not the
state of an individual capability. The page does not conflate the two.
Neither model is presented as a certification.

## CTA

The Technical Assessment is the single entry point across the page (hero
and closing CTA both use it; no competing CTA, no "Contact Sales", no
"Book Demo"). It routes to the same `mailto:hello@aocprotocol.xyz` intake
already used by `EnterpriseNav` and `GovernedAccessPage.tsx`'s closing CTA
— no dedicated assessment-intake workflow exists yet, so the page uses the
same honest, already-live contact route rather than fabricating one.

## Accuracy Boundaries

The page does not claim certification, legal assurance, guaranteed
compliance, guaranteed security, SOC 2/ISO replacement, or formal
accreditation, and does not describe Assurance solely as Intelligence
Risk. Continuous Assurance items are each explicitly labeled current vs.
future (see the table in `assurance/content.ts`
`CONTINUOUS_ASSURANCE_ITEMS`) — most of continuous monitoring is
classified `reference-model` or `future-direction`, not implied as live
runtime functionality.

## Routing and Compatibility

| Route | Before W007 | After W007 |
|---|---|---|
| `/?view=assurance` | Full Intelligence Risk experience (dark/emerald) | Canonical Assurance landing (light/indigo) |
| `/assurance/intelligence-risk` | Did not exist | The former `/?view=assurance` experience, content unchanged |
| `/assurance/privacy`, `/assurance/terms`, `/assurance/methodology`, `/assurance/research`, `/assurance/about` | Unchanged | Unchanged — still resolve via `AssuranceSupportPages.tsx`, links updated to point back at the Intelligence Risk module |
| `/assurance/index/:slug` | Unchanged | Unchanged — `AssuranceProfilePage.tsx`, back-links updated to the Intelligence Risk module |

`ROUTES.enterprise.services.assurance` is unchanged
(`/?view=assurance`, now the canonical page).
`ROUTES.enterprise.services.assuranceIntelligenceRisk` was added
(`/assurance/intelligence-risk`). No previously working URL was removed;
every `/assurance/*` deep route continues to resolve.
