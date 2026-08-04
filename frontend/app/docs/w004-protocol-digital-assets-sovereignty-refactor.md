# W004 — AOC Protocol digital-assets & sovereignty refactor

Status: Protocol's landing page (`src/landing/AocLandingPage.tsx`) is rebuilt
around its own thesis. This is the "Protocol Step 2" rewrite that W003 called
out as a follow-up.

## New Protocol thesis

AOC Protocol defines the language and capabilities of sovereign digital
assets: identity, integrity, provenance, capabilities, and the
sovereignty-related properties that let an asset's meaning survive outside
the platform that created it. AOC Enterprise operationalizes governance on
top of those capabilities — access decisions, obligations, grants,
revocation, evidence, and Assurance. Protocol describes; Enterprise decides,
executes, observes, and audits.

## Protocol ownership

The rebuilt page owns, and only owns:

- what a digital asset is (broad, non-crypto definition);
- the capability families an asset can declare (identity, integrity,
  provenance, portability, interoperability, verifiability, licensing &
  terms, governance compatibility);
- digital sovereignty, defined practically (not absolute);
- the conceptual creation flow for an AOC-compatible asset;
- provider neutrality — separating asset identity from storage location;
- the Protocol → Enterprise boundary itself, as a bridge, not an explanation
  of how Enterprise governs.

## Enterprise boundary (unchanged, verified)

Nothing governance-heavy was moved back into Protocol. Access enforcement,
consent workflows, permission evaluation, audit operations, and the
Governed Access / Assurance commercial offerings remain exclusively on AOC
Enterprise (`enterprise/GovernanceGap.tsx`, `enterprise/GovernanceEmerges.tsx`,
`enterprise/SolutionsAndServices.tsx`, `GovernedAccessPage.tsx`,
`AssurancePage.tsx` — none of these were touched by this change). Protocol's
new "Protocol to Enterprise" section only names what Enterprise owns; it
does not explain how.

## Digital asset definition

The page defines a digital asset broadly and explicitly rejects a
crypto/NFT/token framing: a photograph, document, dataset, video, audio
file, model file, credential, contract, prompt, workflow, configuration,
software package, or design all qualify. The framing used throughout: *a
file contains content; a digital asset also carries identity, integrity,
provenance, capabilities, and references that systems can interpret.* Not
every raw file is automatically an AOC-compatible asset — an application or
tool that speaks the protocol has to create or register that context (see
`protocol/AssetCreationFlow.tsx`).

## Capability model & manifest concept — what's real vs. conceptual

Every capability family on the page (`protocol/content.ts`,
`CAPABILITY_FAMILIES`) carries a status label — `Reference Model` or `Future
Direction` — no capability is labeled `Available`/`Implemented`, because
`@aoc/protocol` is not yet published to a registry (see
`packages/protocol/README.md`).

Grounded in real, repository-verified contract shapes in
`packages/protocol/src/claims/`:

- **Identity** — `CanonicalId`, `CanonicalCredentialRef`
- **Integrity** — `CanonicalHashProof` (`claims/proofs/hash-proof.ts`) — a
  declared digest (algorithm + hash) for a subject
- **Provenance** — issuer/`issuedAt` fields on `CanonicalCredentialManifest`
  (`claims/credentials/credential-manifest.ts`)
- **Portability** — `CanonicalRegistryRef` / `CanonicalRegistryManifest`
  (`claims/registries/`)
- **Interoperability** — adapter interfaces in `packages/protocol/src/adapters`
  (verification, revocation, registry lookup)
- **Verifiability** — proof references + verification-key resolution
- **Governance Compatibility** — capability/consent contract shapes that
  Enterprise operationalizes

Labeled `Future Direction` (no canonical contract found in the repository):

- **Licensing & Terms** — references to policies, licenses, or economic
  arrangements. Not yet a defined contract.
- Cross-provider storage adapters (Pinata, S3, Azure) — illustrative only;
  no adapter ships today. Pinata specifically does not appear anywhere in
  the codebase outside this page's own illustrative list.

The "digital asset manifest" concept (Section: From File to Digital Asset /
How an AOC-Compatible Asset Is Created) is presented as a conceptual model —
labeled "Protocol Direction — Conceptual Model" on the page — not a claim
that a unified manifest schema or creation SDK ships today. No production
schema was invented; the page instead points at the real canonical contract
shapes above as the current foundation.

## Sovereignty positioning

Sovereignty is defined practically: the degree to which an asset (and its
legitimate participants) retains control over identity, integrity,
provenance, and resolution, rather than an absolute or legal claim. The page
explicitly disclaims guaranteeing ownership, legal title, custody, or
universal enforcement, and uses only the approved vocabulary
(sovereignty-aware, sovereignty-enabling, portable, provider-neutral,
independently verifiable).

## SEO changes

- `index.html`: title, meta description, keywords, `og:*`, and `twitter:*`
  tags at the root URL were rewritten from an AOC Assurance framing
  ("AI Governance and Sovereignty Assessment") to the Protocol thesis. The
  JSON-LD `WebPage` node for `https://www.aocprotocol.org/` (name,
  description, keywords) was updated to match — it previously described
  Assurance despite being the entity for the Protocol root page. The
  `Organization`, `WebSite`, `Product`, `Service`, and `FAQPage` JSON-LD
  nodes were left untouched (out of scope — they describe Assurance's own
  offering, not the Protocol page).
- Added `protocol/usePageMeta.ts`, a live document-head updater (same
  pattern already used by `GovVsSovPage.tsx` / `WhatIsAiSovereigntyPage.tsx`)
  so the browser tab title and live meta tags match Protocol whenever this
  page is the active client-side view, restoring the previous values on
  unmount.

## Component strategy

New components live under `landing/protocol/` (mirroring the existing
`landing/enterprise/` pattern): `content.ts` (narrative data),
`primitives.tsx` (Eyebrow/SectionHeader/StatusPill/StepFlow), and one file
per section (`Hero`, `FileToAsset`, `CapabilityFamilies`, `Sovereignty`,
`AssetCreationFlow`, `PhotographExample`, `ProviderNeutral`,
`ProtocolToEnterprise`, `Developers`). `AocLandingPage.tsx` composes them.
`ProtocolFooter.tsx` (shared across Protocol and Enterprise pages) had its
"AOC Protocol" tagline and inert `Protocol` link-column labels updated to
drop leftover governance framing ("Consent Engine", "Audit Layer",
"Ship access systems with explicit control semantics") — everything else in
that shared component, and every Enterprise-owned component, is untouched.

## Future implications (not committed in this PR)

- A formal Digital Asset Manifest specification, if the canonical contracts
  above are consolidated into one schema.
- A creation/verification SDK for compatible applications.
- Real storage-provider adapters (the page lists Pinata/S3/Azure only as
  illustrative, labeled `Future Direction`).
- Enterprise's own final commercial refactor (tracked separately from W004).
- Governed Access and Assurance dedicated landing-page refactors (both still
  navigation-skeleton / unchanged pages per W003).
