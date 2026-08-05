# W007 — AOC Assurance Canonical Refactor

| Field | Value |
|---|---|
| Document ID | W007 |
| Status | Complete |
| Supersedes | `docs/audits/w007a-assurance-commercial-audit.md`'s Path B resolution (Intelligence Risk as a co-equal top-level offering) |
| Scope | `frontend/app/src/landing/enterprise/AssurancePage.tsx` and its `enterprise/assurance/*` sections (refactor, not rebuild); `enterprise/content.ts` nav; `enterprise/AssuranceSection.tsx`, `IntelligenceRiskPage.tsx`, `routes.ts` (positioning corrections only) |

## Canonical definition

> AOC Assurance is the capability that evaluates and continuously monitors
> every Sovereignty Capability defined by AOC Protocol and every Governance
> Capability operated by AOC Enterprise.

Assurance is **not** a compliance audit, a certification, an IAM product, an
intelligence-risk product, a consulting page, or a dashboard. It is not
reducible to any single assessment domain — Intelligence Risk included.

## Correction from W007A

W007A correctly identified that the Enterprise homepage's Assurance promise
(`AssuranceSection.tsx`, deck slide 7 — "prove your governance posture,
continuously") and the page actually living at `/?view=assurance`
(Institutional Intelligence Risk / Knowledge Loss / the Constitutional
Index) described two unrelated products. Its fix — Path B — split them into
two co-equal top-level Enterprise offerings: **Assurance** and **AOC
Intelligence Risk**, each with its own nav entry and route.

That resolution was itself incomplete. Intelligence Risk is not a peer of
Assurance; it is **one specialized assessment domain within Assurance** —
institutional knowledge is a sovereignty capability like any other, and
Assurance is defined precisely as the layer that evaluates *all* such
capabilities, not a subset of them alongside Intelligence Risk. Treating
them as co-equal understated what Assurance actually is.

W007 corrects this without re-litigating W007A's underlying diagnosis or
undoing its real work:

- `AssurancePage.tsx` is refactored (not rebuilt) into the canonical
  9-section landing described below.
- `IntelligenceRiskPage.tsx` and its full cluster (profile pages, support
  pages, research hub, comparison pages, the Constitutional Index, the
  benchmark explorer, Stripe checkout links, disclaimers) are **preserved
  exactly as W007A left them** — no content, pricing, or commercial logic
  was touched. Only its position in the hierarchy changed: it is reached
  from within the Assurance page (Section 7) rather than from top-level
  Enterprise nav, and its breadcrumb now reads Protocol → Enterprise →
  Assurance → Intelligence Risk.
- The "Intelligence Risk" top-level nav entry W007A added to
  `ENTERPRISE_NAV_ITEMS` is removed. Assurance keeps its original Services
  nav slot.

## Position in the ecosystem

```
Protocol            defines capabilities
   ↓
Enterprise           operationalizes them
   ↓
Governed Access       demonstrates one Enterprise capability
   ↓
Assurance             evaluates and continuously monitors them all
```

Governed Access is a Solution — it implements a subset of Enterprise's
governance capabilities. Assurance evaluates the whole capability surface,
both Protocol's and Enterprise's, not just what one Solution puts in place.
`CapabilityDomains.tsx` (Section 3) makes this explicit with a direct bridge
from the Enterprise Governance domain to Governed Access.

## Page structure (`enterprise/AssurancePage.tsx`)

| # | Section | Component | Source of content |
|---|---|---|---|
| 1 | Hero | `assurance/Hero.tsx` | Canonical headline/subheadline, single CTA |
| 2 | Why Assurance Exists | `assurance/WhyAssurance.tsx` | Problem framing + the "not a compliance audit / certification / security audit" boundary (carried forward from the prior page) |
| 3 | What Assurance Evaluates | `assurance/CapabilityDomains.tsx` | **Generated, not hardcoded** — Domain A (Protocol Sovereignty) from `protocol/content.ts` `CAPABILITY_FAMILIES` (8 families); Domain B (Enterprise Governance) from `enterprise/content.ts` `CAPABILITY_CATALOG` (all 20 entries) |
| 4 | Assessment Methodology | `assurance/Methodology.tsx` | 8-stage pipeline (Capability Inventory → Evidence Collection → Capability Evaluation → Gap Analysis → Recommendations → Roadmap → Implementation Validation → Continuous Monitoring), reusing `PipelineRail` |
| 5 | Capability Maturity | `assurance/CapabilityMaturity.tsx` | 5-level maturity scale (Not Present → Partially Implemented → Implemented → Operational → Continuously Validated), visualized as a progression |
| 6 | Assessment Outputs | `assurance/AssessmentOutputs.tsx` | 10 deliverable types, plus the control-catalog stat row (4 domains / 10 controls / 3 tiers, SAF v1.0.0) folded in as the evidence engine underneath them |
| 7 | Intelligence Risk | `assurance/IntelligenceRiskModule.tsx` | Repositions the existing product as one specialized module; links out to the full, unchanged `IntelligenceRiskPage.tsx` |
| 8 | Continuous Assurance | `assurance/ContinuousAssurance.tsx` | Forward-looking roadmap, explicitly labeled as not-yet-available (matches the honesty bar `PlatformStatus.tsx` sets elsewhere) |
| 9 | Closing CTA | `assurance/Cta.tsx` | Assessment → Findings → Roadmap → Implementation → Validation → Continuous Monitoring flow, single "Request Technical Assessment" CTA |

## Why capability lists are generated, not hardcoded

The brief required generating Section 3's capability lists "from the
canonical capability definitions wherever possible" rather than hand-writing
a third list. Two such sources already exist and are each other's single
source of truth elsewhere on the site:

- `protocol/content.ts` → `CAPABILITY_FAMILIES` — the 8 capability families
  Protocol's own landing page (`AocLandingPage.tsx`) already renders,
  each carrying a real status (`Reference Model` / `Future Direction`).
- `enterprise/content.ts` → `CAPABILITY_CATALOG` — the 20-entry capability
  catalog Enterprise's architecture composer (`ArchitectureExperience.tsx`)
  already draws from.

`CapabilityDomains.tsx` imports both directly and renders every entry via
the existing `CapabilityCheckItem` primitive (previously used only inside
the architecture composer) — checked/unchecked reflects each Protocol
family's real status; all 20 Enterprise entries render as evaluated,
matching the acceptance criterion that Assurance evaluates *all* Enterprise
governance capabilities, not a curated subset. If either catalog changes,
this section updates automatically — there is no capability list to keep in
sync by hand.

## Design system

No new visual language. Every section reuses `enterprise/primitives.tsx`
(`SectionHeader`, `Card`, `Chip`, `PipelineRail`, `StatRow`,
`CapabilityCheckItem`), the shared `EnterpriseNav` and `ProtocolFooter`, and
the same light-primary/dark-bookend/indigo-accent rhythm `GovernedAccessPage.tsx`
established. `CapabilityMaturity.tsx`'s five-level progression is the only
new visual pattern, built from the existing indigo shade scale (no new
colors) rather than a new primitive, since it's used in exactly one place.

## Technical accuracy

- Section 2 explicitly disclaims compliance-audit, certification, and
  security-audit framing.
- Section 8's roadmap items are labeled as not-yet-available.
- Section 6's SAF caveat ("Not a certification authority") is preserved
  verbatim from the prior page and from `AssuranceSection.tsx`.
- No claim of SOC 2/ISO replacement, guaranteed compliance, or vendor
  lock-in appears anywhere on the page.

## CTA

Every CTA on the page is "Request Technical Assessment" (nav, hero,
closing). No pricing, no Stripe checkout links, no "Contact Sales" / "Book
Demo" — those remain on `IntelligenceRiskPage.tsx`'s own commercial flow,
which is a later, more specific stage of the customer journey than the
canonical Assurance landing.

## Verification performed

- `npx tsc -b --pretty false` — clean.
- `npx eslint src/landing/` — only the 6 pre-existing errors already
  documented in W005/W007A (`ContactPage.tsx`, `ConstitutionalBenchmarkExplorer.tsx`);
  none in any file this change touched.
- `npx vite build` — succeeds.

## Final verdict

**W007 COMPLETE — ASSURANCE NOW REPRESENTS THE CANONICAL ASSESSMENT LAYER**
