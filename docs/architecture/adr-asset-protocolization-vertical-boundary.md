# ADR — Asset Protocolization Vertical Boundary

| Field | Value |
|---|---|
| Status | Accepted — **frozen** (GATE A0) |
| Work package | APV-01 (Workstream A, Asset Protocolization Vertical) |
| Decision owner | Founder / Soberanía Architecture Authority |
| Scope | Soberanía Protocol, the Asset Protocolization Vertical, Soberanía Enterprise, external tokenizers |
| Supersedes | Nothing |
| Depends on | `docs/asset-protocolization/APV_00_RECONNAISSANCE.md`, `docs/architecture/sovereign-asset-core.md`, `docs/protocol/SOVEREIGNTY_CAPABILITIES.md`, `docs/constitution/ARCHITECTURAL-LAWS.md`, `docs/architecture/aoc-layering.md` |
| Baseline commit | `5ed0670` |

## Context

Soberanía is about to grow a commercial vertical that turns an asset — a file, a recording, a
painting, a plot of land — into a verifiable Soberanía record backed by evidence, automated
checks and, where the asset class requires it, a professional or notarial attestation.

There is a well-known failure mode for work of this kind: the vertical's requirements leak
downward into the substrate. A land-registry field appears on a core manifest, a notary
role appears in a core enum, and the "generic protocol" quietly becomes a real-estate
system that a second vertical can no longer reuse.

The reconnaissance in APV-00 established that this risk is real but that the substrate is
in unusually good shape to resist it. `@aoc/protocol` already owns subject identity
independent of bytes and location, optional never-fabricated integrity, a signed canonical
record, the full Evidence → Claim → Attestation → Verification → Standing vocabulary,
external-registry *references*, professional-credential references, a generic capability
invocation spine with payload-free evidence, and adapter ports. Approximately 23 of the
30 representational needs the vertical has are already satisfied by existing primitives.

What does **not** exist — and what the vertical genuinely owns — is everything that
requires knowing what kind of thing is being protocolized and what a human professional
must do about it.

This ADR freezes that split before any vertical code is written, and states the mechanical
rules by which a violation becomes a build failure rather than a review opinion.

## Decision

### 1. Asset Protocolization is a vertical built on Soberanía Protocol. It is not Soberanía Protocol.

This is the load-bearing sentence of this ADR. Three corollaries, each of which is
independently binding:

- **Asset Protocolization ≠ Soberanía Protocol.** The vertical is a consumer of the substrate.
  It may not extend, alter, or be imported by `packages/protocol/src/**`.
- **Asset Protocolization ≠ Soberanía Enterprise.** The vertical does not resolve authority,
  evaluate policy, issue grants, enforce, or revoke. It produces a record; Enterprise
  governs actions on it.
- **Soberanía Enterprise ≠ tokenizer.** Enterprise governs the authority to act. It does not
  issue tokens, hold custody, or settle.

### 2. Ownership

Names below are the repository's **actual** symbols, not invented ones.

#### 2.1 Soberanía Protocol owns

| Domain | Canonical symbols |
|---|---|
| Subject identity | `SovereignAssetId`, `mintSovereignAssetId`, `SovereignExternalReference`, `SovereignSubjectRef` |
| Integrity | `ContentIdentity`, `computeContentIdentity`, `verifyContentIdentity` |
| Canonical signed record | `SovereignManifestV1`, `SignedSovereignManifest`, `SovereignProof`, `buildSovereignManifestV1`, `signSovereignManifest`, `verifySovereignManifest`, `computeManifestDigest` |
| Resolution port | `SovereignAssetRegistry` (interface only), `resolveSovereignAsset` |
| Trust-chain vocabulary | `CanonicalEvidence`, `CanonicalAssertion`, `CanonicalClaim`, `CanonicalAttestation`, `CanonicalVerification`, `CanonicalStanding`, `CanonicalAuthority`, `CanonicalDecision`, `CanonicalCredential`, proof types, `ClaimType`/`EvidenceType`/`AttestationType`/`VerificationStatus`/`StandingStatus` |
| External reference vocabulary | `CanonicalRegistryRef`, `CanonicalRegistryEntry(Ref)`, `CanonicalRegistryLookupRequest/Result`, `CanonicalRegistryAttestation`, `RegistryAuthorityLevel` |
| Provenance & dispute | `OriginClaim`, `AuthorityClaim`, `DerivationClaim`, `traceSovereignLineage`, `contestClaim`, `StandingStatus.Contested` |
| Sovereignty capabilities | the canonical eight, `invokeSovereigntyCapability`, `SovereigntyCapabilityInvocationEvidenceV1`, the four shipped capsules |
| Canonicalization & transport | `aoc-canonical-json/1`, `canonicalizeJSON`, the portability bundle |
| Generic governance attachment | `ResourceRef`, `CapabilityToken`, `PolicyDecision`, `ScopedAccessRequest`, `AuditEventEnvelope` |
| Adapter ports | `RegistryLookup`, `TrustRegistryProvider`, `VerificationKeyResolver`, `RevocationLookup`, `CredentialStatusLookup`, `AttestationLookup`, `AuditEventSink`, `PolicyDecisionProvider`, `ExecutionAuthorizationProvider`, `AdapterLookupContext` |

Protocol's defining property, restated so it can be tested against: **Protocol never needs
to know what kind of thing the subject is.** Every symbol above is true of a WAV file, a
painting, an AI agent and a plot of land alike.

#### 2.2 The Asset Protocolization Vertical owns

- asset intake and applicant association;
- `AssetProfile` — the per-asset-class definition of identity, declaration, evidence,
  verification, attestation, professional-role, jurisdiction, freshness and readiness
  requirements — and its versioning;
- `ProtocolizationCase` — the in-flight aggregate, its lifecycle and its state machine;
- evidence **requirement** definition, intake and completeness tracking (as distinct from
  evidence **representation**, which is Protocol's);
- declaration/claim preparation — capturing *what the applicant asserts* without treating
  it as fact;
- the automated verification pipeline and its check-result vocabulary
  (`PASS`/`FAIL`/`WARNING`/`MANUAL_REVIEW`/`UNAVAILABLE`);
- the professional review packet, reviewer actions
  (`ATTEST`/`REJECT`/`REQUEST_MORE_EVIDENCE`/`ABSTAIN`) and the review workbench UI;
- the attestation **workflow** (scope, routing, packet assembly, non-retroactivity) —
  Protocol owns the attestation *record*;
- protocolization orchestration and emission of the Protocol-compatible result;
- fee events and fee assessment;
- vertical APIs, vertical adapters (including external-registry adapters), vertical
  fixtures and vertical tests.

The vertical's defining property: **it is the only layer that is allowed to know what a
house, a WAV file or a notary is — and it governs nothing.**

#### 2.3 Soberanía Enterprise owns

Authority resolution; policy; approval orchestration; decisions; obligations; grants;
enforcement; revocation; usage evidence; the enforcement adapter surface toward external
executors. Enterprise is the only layer that answers *may this actor do this thing to this
governed resource, under what conditions*.

Enterprise **does not** register assets legally, collect evidence for a legal act, or
attest anything a professional must attest.

#### 2.4 The tokenizer owns

Token issuance, smart contracts, investor infrastructure, custody, marketplace,
settlement. It executes; it decides nothing.

### 3. Placement and dependency envelope

The vertical is implemented as a workspace package at `packages/asset-protocolization`,
published under the name **`@aoc/asset-protocolization`**.

This name is chosen deliberately and with knowledge of its consequence.
`scripts/check-version-graph.mjs` `roleFor()` classifies every `@aoc/*` package other than
`@aoc/protocol` as a **facade**, and a facade may depend only on packages with role
`protocol` or `external`. The vertical is therefore mechanically forbidden from depending
on `@aoc-runtime/*`, on `@aoc/enterprise`, or on any other `@aoc/*` package.

That is the desired outcome, not a limitation to be worked around. The vertical must
consume the substrate through declared `@aoc/protocol` exports and must receive every
concrete capability (audit sink, registry lookup, key resolver, credential status,
persistence) by **injection of a Protocol-declared port**. Concrete implementations are
bound in a composition root, per LAW-006.

Rejected alternatives:

- **`@aoc-runtime/asset-protocolization-runtime`** (role `runtime`, may depend on protocol
  + facade + external). Rejected: the wider dependency envelope is exactly what would let
  the vertical reach into transitional runtime packages, and the vertical is not a runtime.
- **A name outside both prefixes** (role `other`, to which the version-graph rules apply no
  constraints at all). Rejected: an unconstrained package is an ungoverned package.
- **Placement under `enterprise/src`.** Rejected: it would make the vertical an Enterprise
  concern and would grant it the ownership authority LAW-002 reserves for Enterprise.

**Consequence to be honoured by every subsequent APV prompt:** if the vertical appears to
*need* a runtime package, the correct response is to identify the missing **port** on
`@aoc/protocol/adapters` (or to inject a vertical-owned port), never to relax the package
role.

### 4. The output contract

The vertical's sole downstream product is a Protocol-compatible result carrying:

1. a `SovereignSubjectRef` and the corresponding `SignedSovereignManifest`;
2. an Enterprise-addressable `ResourceRef { kind, id, tenantId? }` derived from (1);
3. **references** — `CanonicalEvidenceId[]`, `CanonicalClaimId[]`,
   `CanonicalAttestationId[]`, `CanonicalVerificationId[]` — never inlined domain payloads;
4. an opaque `{ profileId, profileVersion }` pair that Protocol stores and echoes but never
   branches on;
5. an effective timestamp and an audit correlation id.

The exact frozen shape is APV-02's deliverable. The rule this ADR freezes is the *shape of
the shape*: **only Protocol types plus opaque identifiers cross the boundary.**

### 5. Non-negotiable epistemic invariants

Inherited from `docs/architecture/sovereign-asset-core.md` and binding on the vertical:

```text
a claim              ≠ a fact
a signature          ≠ the truth of what was signed
an attestation       ≠ ownership
registration         ≠ legal ownership
`registrant`         ≠ `owner`
a content match      ≠ an ownership conflict
protocolization      ≠ a sovereign legal act
evidence present     ≠ evidence true
a professional's scope is the boundary of what their attestation asserts
```

The vertical produces a **verifiable record of what was declared, what evidence was
supplied, what was checked, and what a professional attested within a stated scope**. It
does not produce legal truth, and no vertical API, UI string, fee description or marketing
line may state or imply otherwise.

Corollary for APV-08 and APV-13: the review workbench must display **what is not being
attested** as prominently as what is.

### 6. Tenancy is a vertical obligation

`tenantId` is optional and advisory on `ResourceRef` and `AdapterLookupContext`, and
`TENANT_AND_ACTOR_BOUNDARIES.md` forbids inferring tenant semantics implicitly. Protocol
therefore does **not** enforce tenant isolation for the vertical.

The vertical must carry a **required** tenant on `ProtocolizationCase` and every
vertical-owned record, and must enforce isolation in its own queries, its own state
transitions and its own review routing. This is an explicit APV-19 test obligation, not an
assumption.

### 7. Change control on the substrate

If a later APV prompt appears to require a change to `@aoc/protocol`:

1. stop that part of the work;
2. record exactly what is needed and why the existing primitives do not suffice;
3. demonstrate the need is **generic** — that it would be needed by an unrelated vertical
   that knows nothing about the asset class that surfaced it;
4. propose the change as a Protocol work package with its own gate;
5. do not implement it inside this workstream.

Two candidate needs are already known and are explicitly **not** authorized by this ADR:
`AOC.VERIFIABILITY` (APV-00 U-1/F-8) and any generic external-registry enum member
(APV-00 U-2). Both must go through step 3 on their own merits.

## Consequences

**Accepted costs.**

- The vertical cannot use `@aoc/enterprise` or any `@aoc-runtime/*` package directly. Every
  concrete dependency arrives by injection. This adds wiring; it is the price of a vertical
  that a second vertical can copy.
- The vertical must define its own check-result vocabulary rather than widening
  `VerificationStatus`, and must project pipeline results into `CanonicalVerification`
  records at the boundary.
- The vertical must mint its own `CanonicalAssertionId`s until a second consumer justifies
  a shared helper.
- Naming is constrained by `scripts/check-ownership-boundaries.mjs`: a `class` ending in
  `Runtime`/`Adapter`/`Provider`/`Registry`/`CompositionRoot`/`Profile`/`Default(s)`, or a
  `const`/`let`/`var` ending in `Default(s)`/`Registry`/`CompositionRoot`/`Profile`, is a
  LAW-002 build failure inside `packages/**`. `interface AssetProfile`, `type AssetProfile`
  and `const DIGITAL_ARTIFACT_PROFILE` are all fine; `const digitalArtifactProfile` is not.
- A new test directory is invisible to CI until its path is added to `jest.config.js`
  `testMatch`. That addition is a build-configuration change, permitted and required, and
  must be explicit in the PR that introduces the suite.

**Gained.**

- Adding an asset class becomes: a new profile, optionally new vertical adapters, new
  fixtures, new tests. Nothing else.
- GATE A3 becomes mechanically answerable rather than a matter of opinion.
- Workstream B can address a protocolized asset through `ResourceRef` without Enterprise
  learning anything about real estate.

## Enforcement

| Rule frozen here | How a violation surfaces |
|---|---|
| Protocol may not import the vertical | `__tests__/architecture/protocol-purity.test.ts` — build failure |
| The vertical may depend only on `@aoc/protocol` + external | `scripts/check-version-graph.mjs` — build failure |
| The vertical may not declare implementation owners | `scripts/check-ownership-boundaries.mjs` (LAW-002) — build failure |
| The vertical may not construct runtimes/adapters or call `registry.resolve()` outside a composition root | `scripts/check-composition-boundaries.mjs` (LAW-006/007) — build failure |
| Cross-package imports must use declared export subpaths | `scripts/check-public-export-governance.mjs` (LAW-004) — build failure |
| No domain field or enum member is added to a core type | Review + **GATE A3** |
| No tokenization concept appears in Workstream A | Review |

An APV-03 follow-on may add a vertical-specific architecture test asserting that
`packages/asset-protocolization/src/**` imports nothing outside `@aoc/protocol/*` and
Node built-ins. That test belongs to the vertical, mirrors `protocol-purity.test.ts`, and
does not modify Protocol.

## What would invalidate this ADR

This ADR is wrong, and must be revisited rather than worked around, if any of the following
turns out to be true:

- a genuinely generic need cannot be expressed without a core change **and** step 3 of §7
  demonstrates the need is asset-class-independent;
- the facade dependency envelope forces the vertical to duplicate a runtime capability
  rather than inject a port — duplication is a worse outcome than a re-examined role;
- Protocol/Enterprise convergence work (the legacy `ScopeEntry`-based access-governance
  stack, `sovereign-asset-core.md` §15.10) changes which resource shape Enterprise governs.

## Answer to the GATE A0 question

```text
Protocol                  != Asset Protocolization      (§1, §2.1 vs §2.2, §3)
Asset Protocolization     != Enterprise Governance      (§1, §2.2 vs §2.3)
Enterprise Governance     != Tokenizer                  (§1, §2.3 vs §2.4)
```

Frozen. APV-02 defines the contract across the first of these boundaries; no vertical
implementation may begin before it is frozen too.
