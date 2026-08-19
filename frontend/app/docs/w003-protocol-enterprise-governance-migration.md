# W003 — Protocol → Enterprise governance content migration

Status: structural migration complete. Not the final editorial pass for
either page (see "What remains temporary" below).

## Why

The Soberanía Protocol landing page (`src/landing/AocLandingPage.tsx`) carried a
large amount of governance and operational-control commercial messaging
(access enforcement, consent workflows, permission evaluation, audit) that
conceptually belongs to Soberanía Enterprise, the commercial umbrella that
operationalizes governance on top of the open protocol. This PR corrects
that ownership before Protocol is rewritten around digital-asset
sovereignty and Enterprise is rewritten around its final commercial
narrative (see "Intentional follow-ups").

Ownership rule used throughout: Protocol defines what a digital asset can
be (identity, sovereignty, portability, verifiability, interoperability).
Enterprise owns how organizations control, authorize, audit, and
operationalize the use of those assets.

## What moved

From `AocLandingPage.tsx` into `EnterprisePage.tsx`:

| Former Protocol section | New Enterprise home | Notes |
|---|---|---|
| `#problem` — "The current model is broken" (4 problem cards + animations) | `enterprise/GovernanceGap.tsx` (new), rendered after Hero | Copy and animations reused verbatim; wrapper restyled to Enterprise's `SectionHeader`/`FlowRail` chrome instead of Protocol's large centered headline treatment. |
| `#solution` — "What if access required permission?" (4 capability cards) | `enterprise/GovernanceEmerges.tsx` (expanded) | Card copy unchanged; card chrome restyled from `rounded-3xl bg-white/[0.03]` to Enterprise's `rounded-2xl bg-white/[0.02]` card idiom. |
| `#how` — "How it works" (3-step permission/evaluate/grant pipeline) | `enterprise/GovernanceEmerges.tsx` (expanded) | Step copy unchanged. The large `HowItWorksFlow` animated diagram was **not** carried over — it visually duplicated the flow already shown in the infrastructure diagram below, so it was dropped rather than migrated to avoid two near-identical diagrams on one page ("no duplicated visual message", Phase 10). The now-unused `HowItWorksFlow.tsx` component was deleted. |
| `AocInfrastructureAnimated` (control-plane / decision-flow diagram) | `enterprise/GovernanceEmerges.tsx` (expanded) | Reused as-is except its closing brand card, which read "SOBERANÍA PROTOCOL" / "governed data access" — corrected to "SOBERANÍA ENTERPRISE" / "governed access to digital assets" now that it lives on the Enterprise page (see digital-asset terminology below). |

New, small composition-only addition: `enterprise/SolutionsAndServices.tsx`,
giving Governed Access (Solution) and Assurance (Service) a body-level
presence on the Enterprise homepage instead of only a nav entry, per Phase
6/7 of the migration brief. It links out to the existing
`GovernedAccessPage.tsx` and `AssurancePage.tsx`, neither of which was
rewritten.

## What Protocol kept / gained

- The hero ("You don't own your data...") is unchanged.
- A new, short, neutral "Foundation" bridge section (`#foundation`)
  replaces the removed sections: a concise statement that Protocol defines
  what a digital asset can be, that Enterprise operationalizes governance
  on top of it, and a CTA into Enterprise. This is explicitly **not** the
  final sovereignty-focused Protocol narrative — see follow-ups.
- The footer and closing "Access should be earned" CTA are unchanged.
- Nav: the desktop nav's `#problem` / `#solution` / `#how` anchor links
  were replaced with a single `#foundation` link (the sections they
  pointed to no longer exist on this page). The Hero's "Enter the new
  model →" CTA now points to `#foundation` instead of the removed
  `#solution` anchor.

## Digital-asset terminology

Applied narrowly, not as a global replace:

- `AocInfrastructureAnimated`: "Programmable control layer for governed
  data access" → "Programmable control layer for governed access to
  digital assets" — the diagram's own verticals (HR records, financial risk
  signals, patient health data, event credentials, AI agent scoped access)
  are genuinely broader than "data."
- New Enterprise copy (`GovernanceGap` description, Protocol's
  `#foundation` bridge) uses "digital assets" where the claim spans
  multiple resource types.
- Left unchanged: card-level copy that is genuinely, narrowly about data
  (e.g. "Your data is copied. Stored. Resold." — a specific claim about
  personal data resale), and `content.ts`'s "Data" architecture pattern,
  which is deliberately scoped narrowly to contrast with the separate
  "Asset" pattern.

## Backward compatibility

No routes changed. `/` (Protocol), `/?view=enterprise` (Enterprise),
`/?view=governed-access`, `/?view=assurance`, and `/?view=docs` all resolve
exactly as before. The only anchor-link changes are internal to the
Protocol page's own nav (`#problem`/`#solution`/`#how` → `#foundation`);
no other page linked to those anchors.

## What remains temporary

- **Protocol still needs its sovereignty-focused refactor** (W003 Step 2):
  the current hero and `#foundation` bridge are intentionally minimal
  placeholders, not final copy.
- **Enterprise still needs its final commercial refactor** (W003 Step 3):
  the migrated sections were restyled to fit Enterprise's design system but
  not rewritten into final commercial voice.
- **Governed Access** (`enterprise/GovernedAccessPage.tsx`) is still a
  navigation-skeleton page and needs its own dedicated landing-page
  refactor.
- **Assurance** (`AssurancePage.tsx`) is unchanged by this PR and still
  needs its own dedicated service-page refactor.
- **Pre-existing, unrelated to this migration** (verified present on the
  base branch before this change): duplicate SVG `<filter id="...">`
  values (`redGlow`, `cyanGlow`, `softGlow`) across several animation
  components when multiple render on the same page; 11 pre-existing
  `eslint` errors in `useGrants.ts`, `ContactPage.tsx`, and
  `ConstitutionalBenchmarkExplorer.tsx`; and a monorepo-wide `tsc -b`
  failure caused by `src/pages/EnterpriseConsolePage.tsx` importing
  unbuilt `enterprise/` package modules. None of these are touched or
  worsened by this PR.

## What must not regress

Future work must not move governance-heavy commercial content (access
control, consent enforcement, policy evaluation, audit, operational
enforcement) back into the Protocol page. Protocol owns the definition of
digital-asset capabilities; Enterprise owns their governed operationalization.
