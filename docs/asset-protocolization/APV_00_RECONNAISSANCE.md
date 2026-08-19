# APV-00 — Asset Protocolization Vertical: Repository Reconnaissance

| Field | Value |
|---|---|
| Work package | APV-00 (Workstream A, Asset Protocolization Vertical) |
| Type | Read-only audit. No code, no migrations, no refactoring. |
| Repository | `Architects-of-Change-Protocol/Architects_of_Change_Protocol` |
| Branch | `claude/aoc-protocolization-tokenization-tbt8zu` |
| Baseline commit | `5ed0670` ("Add AOC.PORTABILITY capsule and canonical sovereign portability bundle (SM-06)") |
| Status | `VERIFIED` (audit complete; findings below are sourced to files, not to memory) |
| Consumes | Frozen artifacts listed in §1.2 |
| Feeds | APV-01 (boundary ADR), APV-02 (vertical ↔ Protocol contract) |

---

## 0. Executive answer

The five questions APV-00 is required to answer, answered up front. Every claim is
substantiated in the sections that follow.

### WHAT DOES PROTOCOL ALREADY PROVIDE?

Substantially more than the build plan assumed. `@aoc/protocol` already owns a
complete, deliberately epistemically-honest substrate:

- **subject identity** independent of bytes, storage, location and external namespaces
  (`SovereignAssetId`, `SovereignExternalReference`, `SovereignSubjectRef`);
- **integrity** as an optional, never-fabricated commitment (`ContentIdentity`);
- a **signed canonical record** of assertions about a subject (`SovereignManifestV1`,
  `SignedSovereignManifest`, `SovereignProof`, `verifySovereignManifest`);
- the **full trust chain vocabulary** — `CanonicalEvidence`, `CanonicalClaim`,
  `CanonicalAttestation`, `CanonicalVerification`, `CanonicalStanding`,
  `CanonicalAuthority`, `CanonicalDecision`, `CanonicalCredential`, proofs, and
  **external registry references** (`CanonicalRegistryRef`, `CanonicalRegistryEntry`,
  `CanonicalRegistryLookupRequest/Result`);
- a **generic capability invocation spine** with portable, payload-free evidence
  (`invokeSovereigntyCapability`, `SovereigntyCapabilityInvocationEvidenceV1`);
- **canonicalization** (`aoc-canonical-json/1`) and **portability** (a Protocol-owned
  transport bundle);
- **adapter ports** for registry lookup, revocation, key resolution, policy decisions,
  execution authorization and audit sinks — declared as interfaces only.

The single most consequential finding: **Protocol has already solved "identify a
non-byte real-world thing" and "record a disputable assertion about it" generically.**
The vertical does not need to invent any of it.

### WHAT MUST THE VERTICAL REUSE?

All of the above, without exception, plus `@aoc/enterprise`'s assurance surface for
audit/trust/verification wiring. The reuse map in §3 is intentionally exhaustive so that
a later reviewer can check "did the vertical invent a parallel X?" mechanically.

### WHAT BELONGS ONLY TO THE VERTICAL?

Everything that requires knowing **what kind of thing** is being protocolized and **what
a human professional must do about it**: asset profiles, intake, the case lifecycle,
evidence *requirements* (as opposed to evidence *representation*), declaration capture,
the automated verification pipeline, the professional review workbench, the attestation
workflow, protocolization orchestration, and fee assessment. See §4.

### WHAT OUTPUT MUST THE VERTICAL PRODUCE SO PROTOCOL CAN GOVERN IT?

Precisely two things, both of which already exist as Protocol/Enterprise types:

1. a **`SovereignSubjectRef`** (plus the `SignedSovereignManifest` registered behind a
   `SovereignAssetRegistry`) — the sovereign identity of the protocolized subject; and
2. an Enterprise-addressable **`ResourceRef { kind, id, tenantId? }`** derived from (1),
   which is the shape every Enterprise governance port already consumes.

Everything else the vertical produces (declarations, evidence, verifications,
attestations) is carried as *references* — `CanonicalEvidenceId`, `CanonicalClaimId`,
`CanonicalAttestationId` — not as vertical-specific payloads. See §5 and APV-02.

### WHAT WOULD BE AN ARCHITECTURAL VIOLATION?

Nine concrete, mechanically-detectable violations are enumerated in §6. The three that
this repository would actually catch at build time are: importing anything vertical from
`packages/protocol/src` (LAW-001/LAW-005, `__tests__/architecture/protocol-purity.test.ts`),
declaring an implementation-owner class outside an authorized ownership domain
(LAW-002, `scripts/check-ownership-boundaries.mjs`), and any dependency edge that makes a
`@aoc/*`-named vertical package depend on a runtime package
(`scripts/check-version-graph.mjs`). The rest are semantic and require review discipline.

---

## 1. Method

### 1.1 What was inspected

Read-only inspection of: the package graph and workspace roles; `@aoc/protocol` source in
full (`packages/protocol/src/**`); `@aoc/enterprise` source (`enterprise/src/**`); the
legacy access-governance stack (`protocol/consent`, `protocol/capability`,
`protocol/enforcement`, `protocol/execution`, `protocol/revocation`); the runtime
governance/monetization surfaces (`runtime/governance`, `runtime/monetization`,
`runtime/usage`, `runtime/marketplace`, `runtime/payout`); the architecture and evidence
documentation (`docs/architecture/**`, `docs/evidence/**`, `docs/protocol/**`); the
constitution (`docs/constitution/**`); and the executable boundary enforcement
(`scripts/check-*.mjs`, `scripts/constitutional-boundary-lib.mjs`,
`__tests__/architecture/**`, `jest.config.js`).

### 1.2 Frozen artifacts this audit is bound to

These are treated as **already decided** and are not reopened by this workstream:

| Artifact | What it froze |
|---|---|
| `docs/architecture/sovereign-asset-core.md` | The sovereign core: identity ≠ integrity ≠ location ≠ external id; registrant ≠ owner; signature ≠ truth; lineage as a claim (SM-05); universal subject reference (SM-02). |
| `docs/protocol/SOVEREIGNTY_CAPABILITIES.md` | The canonical eight sovereignty capabilities, closed membership, and the generic invocation + evidence contract. |
| `docs/constitution/ARCHITECTURAL-LAWS.md` | LAW-001…LAW-008, executable, "a violation is a build failure, not a review suggestion". |
| `docs/architecture/aoc-layering.md`, `ARCHITECTURE.md` | Layering and the Protocol/Enterprise/product split, and the allowed dependency direction. |
| `docs/evidence/P-EV-02/03/04` | The canonical evidence model and the ordering Evidence → Claims → Standing → Delegation → Capabilities → Authority → Decisions. |
| `docs/constitution/CLAIM-*`, `ATTESTATION-*`, `VERIFICATION-*`, `ECONOMIC*-*` | Constitutional policy for claims, attestations, verification and economics. |

### 1.3 A note on this repository's shape

The repository currently contains **three coexisting generations** of the same ideas:

1. the **canonical** generation — `packages/protocol/src/**` (`@aoc/protocol`), which is
   the one the recent SM-01…SM-06 work packages built and the one this vertical must
   target;
2. the **legacy access-governance** generation — root `protocol/consent`,
   `protocol/capability`, `protocol/enforcement`, `protocol/execution`, which models a
   resource as `ScopeEntry { type: 'field' | 'content' | 'pack', ref: <sha256> }`;
3. the **runtime/product** generation — `runtime/**`, `src/**`, `packages/*-runtime`.

`docs/architecture/sovereign-asset-core.md` §15.10 states this explicitly and defers
convergence to a later work package. **This is load-bearing for the vertical**: see
finding F-3 in §7.

---

## 2. Inventory — what Protocol (and Enterprise) already provide

### 2.1 Subject identity — `@aoc/protocol/identity`

| Symbol | Contract | Relevance to the vertical |
|---|---|---|
| `SovereignAssetId` | `aoc:sovereign-asset:<uuid>`, minted by `mintSovereignAssetId()` which takes **no input**. Never derived from content, manifest, storage, registrant or timestamp. | The canonical id of any protocolized asset, digital or physical. |
| `SovereignExternalReference` | `{ namespace, id, locator? }`, all opaque. No URL/DID/UUID/CID validation, no `ExternalReferenceKind` enum, no branch on `namespace` anywhere. Never dereferenced; Protocol performs **zero** network activity. | This is exactly how a *finca* number, a Registro Nacional folio, an ISWC, or a museum accession number attaches — with **no core change**. |
| `SovereignSubjectRef` | `{ sovereignAssetId, externalReference? }`. Carries no integrity material by design. | The universal handoff type between the vertical and everything downstream. |

`sovereign-asset-core.md` §15.7 already demonstrates a **building reference**
(`example:property-registry` / `folio-92817`, no `contentIdentity`) as a first-class
sovereign subject using only generic structures. The real-estate case is, at the identity
layer, *already solved*.

### 2.2 Integrity — `@aoc/protocol/identity`

`ContentIdentity { algorithm: 'sha256', digest }` via `computeContentIdentity(bytes)` /
`verifyContentIdentity(bytes, expected)`. Optional on a manifest; **absence is structural
omission, never a fabricated digest**. Verification honestly reports `not_performed`
rather than a silent `valid`.

Directly serves APV-11/APV-12 (`digital.artifact.v1`, tampered-file negative case) and is
correctly *absent* for a physical asset.

### 2.3 The signed canonical record — `@aoc/protocol/manifest`

```
SovereignManifestV1 extends SovereignSubjectRef {
  schemaVersion: 'aoc-sovereign-manifest/1'
  canonicalizationProfile: 'aoc-canonical-json/1'
  sovereignAssetId; externalReference?; manifestVersion; contentIdentity?
  registrant: string | CanonicalPrincipalRef
  originClaim?: OriginClaim
  authorityClaims: readonly AuthorityClaim[]
  state: 'active' | 'disputed' | 'superseded' | 'withdrawn'
  createdAt
}
SignedSovereignManifest { manifest, manifestDigest, proof: SovereignProof }
```

Plus: `buildSovereignManifestV1`, `validateSovereignManifestV1`, `signSovereignManifest`,
`computeManifestDigest`, `verifySovereignManifest`, `SovereignAssetRegistry` (port only —
`register` / `resolve` / `findByContentDigest`, with historical
`resolveVersion(id, version)` required of infrastructure), `DerivationClaim` +
`traceSovereignLineage`, and `contestClaim` / `StandingStatus.Contested`.

Four properties matter enormously to this vertical and are already guaranteed:

- `registrant` is **not** `owner`. Registration is never treated as legal ownership.
- `AuthorityClaim` / `OriginClaim` are **claims**, not facts. A valid signature proves
  the issuer asserted it, nothing more.
- A content match between two registrations is reported as a **plain fact** and never
  auto-adjudicated (`findByContentDigest` surfaces both without picking a side).
- Historical versions are never rewritten; a dispute is recorded as `Contested` standing
  without deleting or mutating the contested claim.

APV-06's required separation — *user says X* vs *Soberanía has evidence of X* vs *a professional
attests X within scope Y* — is therefore **already structurally expressible** in Protocol.

### 2.4 The trust chain — `@aoc/protocol/claims`

The canonical ordering is documented in `docs/evidence/P-EV-02` §1:

```
Evidence → Claims → Standing → Delegation → Capabilities → Authority → Decisions
```

Implemented types (all reference-based, all with `metadata?: CanonicalMetadata` escape
hatches, none of them domain-specific):

| Type | Shape (abridged) |
|---|---|
| `CanonicalEvidence` | `id, type: EvidenceType, subject, issuer, source, description, createdAt, credentialRefs?, proofRefs?, registryRefs?, semanticRefs?, metadata?` |
| `CanonicalClaim` | `id, type: ClaimType, subject, issuer, assertionRef, evidenceRefs[], attestationRefs[], credentialRefs?, proofRefs?, registryRefs?, semanticRefs?, issuedAt, expiresAt?, metadata?` |
| `CanonicalAttestation` | `id, type: AttestationType, attester, claimRef, statement, issuedAt, credentialRefs?, proofRefs?, registryRefs?, …` |
| `CanonicalVerification` | `id, claimRef, status: VerificationStatus, verifier, verifiedAt, findings[], confidence?` |
| `CanonicalStanding` | `id, claimRef, status: StandingStatus, reason?, effectiveAt, expiresAt?` + `validateCanonicalStanding` |
| `CanonicalAuthority` / `CanonicalDecision` | authority scope/status; decision status + decision maker |
| `CanonicalCredential` | `type: CredentialType` (includes **`ProfessionalCredential`**), `format`, `issuer`, `subject`, `claimRefs`, `status?`, `expiresAt?` |
| Proofs | `signature-proof`, `hash-proof`, `integrity-proof`, `attestation-proof`, `audit-proof`, `chain-proof`, `trace-proof`, `proof-envelope` |

Enum coverage relevant to this vertical:

- `EvidenceType`: `Document`, `Contract`, `Certification`, `BoardResolution`,
  `AuditRecord`, `Attestation`, `AIOutput`, `SystemRecord`, `Custom`.
- `AttestationType`: `Human`, `Organization`, `System`, `AI`, `Remote`, `Governance`.
- `VerificationStatus`: `Pending`, `Verified`, `Failed`.
- `ClaimType`: `Identity`, `Capability`, `Authorization`, `Certification`, `Role`,
  `Credential`, `Governance`, `Origin`, `Authorship`, `Derivation`, `Custom`.
- `PrincipalKind`: includes `Human`, `Organization`, `GovernanceBody`, `CredentialIssuer`.

### 2.5 External registries — `@aoc/protocol/claims/registries`

This is the finding with the largest impact on APV-16/APV-17 (Costa Rica real estate).

| Type | Purpose |
|---|---|
| `CanonicalRegistryRef` | "Identifies a registry **without connecting to, querying, or verifying it**": `{ id, type: RegistryType, namespace, authorityLevel: RegistryAuthorityLevel, source?, metadata? }` |
| `CanonicalRegistryEntry` / `CanonicalRegistryEntryRef` | A descriptor for an entry inside a registry: `{ registryRef, entryType, subject, locator, status, createdAt, updatedAt?, proofRefs? }` |
| `CanonicalRegistryLookupRequest` / `…Result` | "Portable request descriptor for registry lookup intent. **It does not implement lookup.**" Result carries `status: RegistryLookupStatus` (`Found`/`NotFound`/`Ambiguous`/`Unavailable`/`Unauthorized`/`Unknown`) and `observedAt`. |
| `CanonicalRegistryAttestation` | "Attests a registry declaration **without evaluating trust** in that declaration." |
| `RegistryAuthorityLevel` | `SelfDeclared`, `OrganizationDeclared`, `GovernanceDeclared`, `ProtocolRecognized`, `Federated`, **`External`** |
| `RegistryLookup` / `TrustRegistryProvider` (in `@aoc/protocol/adapters`) | The **ports** an external-registry adapter implements. |

An external national land registry maps onto `RegistryType.Custom` +
`authorityLevel: 'External'` + `RegistryEntryType.Custom`, with a vertical-owned adapter
implementing `RegistryLookup`. **`observedAt` on the lookup result is exactly the field
APV-16's "freshness requirement" and APV-18's "stale evidence" scenario need**, and it
already exists.

`RegistryType` and `RegistryEntryType` are closed enums oriented at AOC-internal registry
kinds (`ClaimRegistry`, `EvidenceRegistry`, …). Both include `Custom`, so an external
legal registry is representable **without a core change**. Recorded as uncertainty U-2
(§8) because "representable via `Custom`" is not the same as "well-modelled", and the
temptation to add `LandRegistry` to a core enum is precisely the GATE A3 failure mode.

### 2.6 Sovereignty capabilities — `@aoc/protocol/sovereignty-capabilities`

Eight capabilities, **closed membership, no runtime registration API**: `identity`,
`integrity`, `provenance`, `portability`, `interoperability`, `verifiability`,
`licensing_terms`, `governance_compatibility`. Four have production capsules
(`AOC.IDENTITY`, `AOC.INTEGRITY`, `AOC.PROVENANCE`, `AOC.PORTABILITY`); four do not.

The generic invocation spine is the reusable part:

```
SovereigntyCapabilityRef → SovereigntyCapabilityInvocation<TInput>
  → SovereigntyCapabilityImplementation<TInput, TOutput>
  → invokeSovereigntyCapability(...)
  → SovereigntyCapabilityResult<TOutput> + SovereigntyCapabilityInvocationEvidenceV1
  → optional AuditEventSink
```

Properties the vertical inherits for free: an `invocationId` that is never derived from
inputs; an optional `correlationId` for grouping; a **payload-free** evidence record
(never contains input, output, bytes, credentials, key material or stack traces —
capability-specific artifacts travel as `evidenceRefs`); a strict failure taxonomy that
distinguishes *rejected before execution* from *expected capability failure* from
*implementation bug* from *evidence delivery failure*; and the explicit statement that
this layer **makes no Enterprise governance decision**.

Two disambiguations recorded verbatim because they are easy to get wrong:

- A **Sovereignty Capability** is not a **capability grant**. `CapabilityToken`,
  `ProtocolCapability`, `RuntimeCapability` are grants; the eight are sovereignty
  properties with no subject, holder, expiry, scope or issuer.
- `AOC.IDENTITY` **does not sign** and **does not claim ownership**; `AOC.INTEGRITY`
  reports a digest mismatch as a *successful check with a negative result*, not a failed
  execution.

### 2.7 Portability, canonicalization, contracts, adapters

- `@aoc/protocol/canonical` — `aoc-canonical-json/1`, the single authoritative
  canonicalizer; refuses `undefined`, so absent optionals must be structurally omitted.
- `@aoc/protocol/portability` — a Protocol-owned bundle that moves a subject's sovereign
  artifacts across a trust boundary byte-exact, explicitly **not** integrity, verifiability,
  provenance, identity or ownership.
- `@aoc/protocol/contracts` — `CanonicalId`, `UtcDateTime`, **`ResourceRef { kind: string;
  id; tenantId?; attributes? }`**, `CapabilityToken`/`CapabilityGrant`, `ConsentGrant`,
  `PolicyDecision = 'allow' | 'deny' | 'conditional'`, `ScopedAccessRequest`,
  `AuditEventEnvelope { eventId, eventType, emittedAt, occurredAt?, actorId?, subject?,
  correlationId?, reasonCodes?, payload, schemaVersion? }`.
- `@aoc/protocol/adapters` — interfaces only: `VerificationKeyResolver`, `RevocationLookup`,
  `RegistryLookup`, `TrustRegistryProvider`, `CapabilityLookup`, `AttestationLookup`,
  `CredentialStatusLookup`, `AuditEventSink`, `SecurityEventSink`, `ProtocolEventSink`,
  `PolicyDecisionProvider`, `GovernanceDecisionProvider`, `ExecutionAuthorizationProvider`,
  `VerificationProvider`, `ObservabilityEventSink`, plus `AdapterLookupContext { tenantId?,
  trustDomain?, requestedAt?, correlationId?, metadata? }`.

`ResourceRef.kind` is an **open `string`**, and `PolicyDecisionRequest.action` is an open
`string`. This is the single most important structural fact for Workstream B: it means
`TOKENIZE` over a sovereign subject requires **no new core type** to be addressable.

### 2.8 Enterprise

`@aoc/enterprise` currently exposes `assurance` only: `audit` (in-memory + signed audit),
`verification` (canonical + identity), `trust` (canonical/federated trust registry,
identity trust service), `evidence`, `lineage`, `explainability`, `proofs`, `attestation`,
`observability`, plus `runtime-adapter-bootstrap.ts` / `runtime-adapter-resolver.ts` — the
**only** authorized Enterprise composition root (`AUTHORIZED_COMPOSITION_FILES`).

Governance runtime behaviour lives in `packages/governance-runtime` (`GovernanceDecision`
with `allow|deny|conditional`, `ResourceObligation`, `SignedAuthorizationDecision`,
`DelegatedResourceGrant`) and `runtime/governance` (`AutonomousExecutionGrant`,
`GovernanceObligation`, `obligation-runtime.ts`, `escalation-runtime.ts`,
`human-review.ts`). These are transitional owners, not yet extracted into
`@aoc/enterprise`. Detailed audit deferred to **TGV-00**, which is where it belongs.

### 2.9 Economic surfaces (for APV-14)

`runtime/monetization` (`pricing.ts`, `service.ts`), `runtime/usage`, `runtime/payout`,
`runtime/marketplace` (`brokerageRuntime.ts`) exist as transitional runtime owners.
Constitutionally, `docs/constitution/ECONOMIC-*` defines settlement/obligation/valuation
policy and states that Economics "is not accounting, treasury, payments, runtime billing,
or tokenization".

### 2.10 Executable enforcement (what will actually fail a build)

| Mechanism | Rule it enforces |
|---|---|
| `__tests__/architecture/protocol-purity.test.ts` | `packages/protocol/src/**` may not import runtime, enterprise, operations, pmfreak, api, sdk, observability, telemetry, persistence, storage, database, transport, http or governance specifiers. |
| `scripts/check-ownership-boundaries.mjs` (LAW-002/003) | Any declaration matching `class *Runtime|*Adapter|*Provider|*Registry|*CompositionRoot|*Profile|*Defaults` (and `const/let/var *Defaults|*Registry|*CompositionRoot|*Profile`) is a violation **outside** `enterprise/src`, `packages/protocol/src/runtime-registry`, the frozen `TRANSITIONAL_RUNTIME_OWNERS` list, and two named files. |
| `scripts/check-composition-boundaries.mjs` (LAW-006/007) | `registry.resolve(` and `new *Runtime/Adapter/Provider(` only inside `AUTHORIZED_COMPOSITION_FILES` or files named `*composition-root*`/`*bootstrap*`/`*container*`/`*wiring*`. |
| `scripts/check-version-graph.mjs` | `roleFor()`: `@aoc/protocol` → `protocol`; **any other `@aoc/*` → `facade`**; `@aoc-runtime/*` → `runtime`. A **facade may depend only on `protocol` or `external`** — not on another facade, not on a runtime package. |
| `scripts/check-public-export-governance.mjs` (LAW-004) | Cross-package imports containing `src`, `internal` or `private` are forbidden; a subpath must be declared in the target `package.json` `exports`. |
| `jest.config.js` `testMatch` | Only an explicit allow-list of directories runs in CI. A new suite is invisible until its path is added. |

The scanners walk `packages`, `enterprise/src`, `src`, `runtime`, `crypto`, `examples`,
`frontend/app/src`, `integration` (`repositorySourceFiles`). **A vertical placed under
`packages/**` is inside the scanned set.**

---

## 3. Reuse map — vertical need → existing primitive

`REUSE` = use as-is. `REUSE+PROFILE` = use as-is, with vertical-owned configuration.
`WRAP` = vertical-owned type that *references* the primitive without redefining it.
`NEW` = genuinely absent; the vertical owns it.

| # | Vertical need (APV step) | Existing primitive | Verdict |
|---|---|---|---|
| 1 | Identify the asset (APV-04) | `mintSovereignAssetId`, `SovereignSubjectRef`, `AOC.IDENTITY` capsule | REUSE |
| 2 | Refer to an external registry identifier (APV-15/17) | `SovereignExternalReference { namespace, id, locator? }` | REUSE |
| 3 | Fingerprint a digital file (APV-11/12) | `computeContentIdentity`, `AOC.INTEGRITY` capsule | REUSE |
| 4 | Detect a tampered file (APV-12 negative) | `verifyContentIdentity` → `CONTENT_DIGEST_MISMATCH` | REUSE |
| 5 | Represent one piece of evidence (APV-05) | `CanonicalEvidence` + `EvidenceType` | REUSE |
| 6 | Represent "the applicant says X" (APV-06) | `CanonicalClaim` (+ `ClaimType.Authorship` / `Origin` / `Custom`) | REUSE |
| 7 | Represent "Soberanía checked X" (APV-07) | `CanonicalVerification { status, verifier, findings, confidence? }` | REUSE |
| 8 | Represent "a notary attests X in scope Y" (APV-08) | `CanonicalAttestation { attester, claimRef, statement, issuedAt, credentialRefs, proofRefs }` | REUSE |
| 9 | Prove the attestor is a licensed professional (APV-08/17) | `CanonicalCredential` with `CredentialType.ProfessionalCredential` + `CredentialStatusLookup` | REUSE |
| 10 | Sign an attestation / manifest | `SovereignProof`, `signSovereignManifest`, `SignedClaim<T>` | REUSE |
| 11 | Verify a signature without asserting truth | `verifySovereignManifest` (`signature` vs `issuerBinding` reported separately) | REUSE |
| 12 | Record a dispute / conflicting claim (APV-19) | `StandingStatus.Contested`, `contestClaim` | REUSE |
| 13 | Reference an external registry and its authority level (APV-16/17) | `CanonicalRegistryRef`, `RegistryAuthorityLevel.External` | REUSE+PROFILE |
| 14 | Record what a registry certification said and **when it was observed** (freshness) | `CanonicalRegistryLookupResult { status, entries, observedAt }` | REUSE |
| 15 | Query an external registry | `RegistryLookup` / `TrustRegistryProvider` **ports** | REUSE (vertical implements the adapter) |
| 16 | Model multi-owner / derived assets (APV-18) | Multiple `AuthorityClaim`s; `DerivationClaim` + `traceSovereignLineage` | REUSE |
| 17 | Emit auditable events on state transitions (APV-09) | `AuditEventEnvelope` + `AuditEventSink`; `@aoc/enterprise/assurance/audit` | REUSE |
| 18 | Correlate everything in one case | `correlationId` on `AdapterLookupContext`, `AuditEventEnvelope`, capability invocations | REUSE |
| 19 | Portable, payload-free record of a protocolization act (APV-10) | `SovereigntyCapabilityInvocationEvidenceV1` | REUSE |
| 20 | Hand the result to Enterprise governance (APV-10 → TGV) | `ResourceRef { kind, id, tenantId? }` | REUSE |
| 21 | Multi-tenancy | `tenantId?` on `ResourceRef` and `AdapterLookupContext` — **optional and advisory** (`TENANT_AND_ACTOR_BOUNDARIES.md`) | REUSE + finding F-4 |
| 22 | Canonical serialization of anything the vertical signs | `canonicalizeJSON` / `aoc-canonical-json/1` | REUSE |
| 23 | Move a protocolized record between deployments | `@aoc/protocol/portability` bundle | REUSE |
| 24 | **`AssetProfile`** — what a given asset class requires (APV-03) | — | **NEW (vertical)** |
| 25 | **`ProtocolizationCase`** — in-flight workflow state (APV-04/09) | — | **NEW (vertical)** |
| 26 | **Evidence *requirement*** vs evidence *record* (APV-05) | — | **NEW (vertical)** |
| 27 | **Verification check catalogue** with `PASS/FAIL/WARNING/MANUAL_REVIEW/UNAVAILABLE` (APV-07) | `VerificationStatus` has only `Pending/Verified/Failed` | **NEW (vertical)** — see F-2 |
| 28 | **Review packet + reviewer actions** `ATTEST/REJECT/REQUEST_MORE_EVIDENCE/ABSTAIN` (APV-08) | — | **NEW (vertical)** |
| 29 | **Fee assessment ledger** per protocolization act (APV-14) | Runtime monetization exists but is product/runtime-owned | **NEW (vertical)** — see U-4 |
| 30 | **Professional review workbench UI** (APV-13) | `frontend/app` exists | **NEW (vertical)** |

**30 needs; 23 are satisfied by existing primitives.** The vertical's genuine surface is
7 concepts, and every one of them is about *what a use case requires*, not *how truth is
represented*. That is the correct shape for a vertical.

---

## 4. What belongs only to the vertical

Stated as a rule rather than a list, so it survives contact with new asset classes:

> The vertical owns everything that must know **what kind of thing** is being
> protocolized, **what a human professional must do** about it, and **whether the case is
> ready**. Protocol owns everything that is true regardless of the answer to those
> questions.

Concretely: asset intake; `AssetProfile` and its versioning; per-profile evidence,
declaration, identity, attestation and freshness *requirements*; the `ProtocolizationCase`
aggregate and its lifecycle/state machine; the automated verification pipeline and its
check results; the professional review packet, reviewer actions and workbench UI;
protocolization orchestration; fee events and fee assessment; vertical APIs; vertical
adapters to external registries and identity providers; vertical fixtures and tests.

---

## 5. What the vertical must emit so Protocol/Enterprise can govern it

The gate question from APV-02 — *could Protocol consume this result without knowing
whether the original object was a PDF, a WAV, a physical painting or a plot of land?* —
is answerable **yes** with the existing types, provided the vertical emits exactly this:

```text
ProtocolizationResult
├── subject          : SovereignSubjectRef              (@aoc/protocol/identity)
├── record           : SignedSovereignManifest          (@aoc/protocol/manifest)
├── governedResource : ResourceRef { kind, id, tenantId? }   (@aoc/protocol/contracts)
├── declarationRefs  : readonly CanonicalClaimId[]      (references only)
├── evidenceRefs     : readonly CanonicalEvidenceId[]   (references only)
├── attestationRefs  : readonly CanonicalAttestationId[](references only)
├── verificationRefs : readonly CanonicalVerificationId[]
├── profile          : { id, version }                  (opaque to Protocol)
├── effectiveAt      : UtcDateTime
└── auditRef         : correlationId (CanonicalId)
```

Everything above the `profile` line is an existing Protocol type. `profile` is an opaque
`{ id, version }` pair — Protocol stores and echoes it, never branches on it. The precise
frozen shape, including whether `governedResource` is derived rather than carried, is
APV-02's deliverable.

**What the vertical must NOT emit**: anything that requires Protocol to understand a
domain — no `propertyType`, `notaryId`, `ownershipPercentage`, `registryOffice`,
`fincaNumber`, `copyrightStatus`, or `isOwner: true`. Domain facts travel as
`metadata` on vertical-owned records and as the *content* of claims and attestations that
Protocol carries opaquely.

---

## 6. Architectural violations (no-go areas)

| # | Violation | Detected by |
|---|---|---|
| V-1 | Any import from a vertical module inside `packages/protocol/src/**`. | `protocol-purity.test.ts` (LAW-001/005) — **build failure** |
| V-2 | Adding a domain field (`fincaNumber`, `notary`, `ownershipPercentage`, `registryOffice`) to `SovereignManifestV1`, `CanonicalClaim`, `CanonicalEvidence` or any core type. | Review + GATE A3 |
| V-3 | Adding a domain member to a core enum (`RegistryType.LandRegistry`, `EvidenceType.EscrituraPublica`, `ClaimType.Ownership`). `Custom` exists precisely so this is never necessary. | Review + GATE A3 |
| V-4 | Declaring a ninth Sovereignty Capability, or adding a runtime registration API to the closed inventory. | `sovereignty-capabilities` tests; `SOVEREIGNTY_CAPABILITY_KEYS` is closed |
| V-5 | Declaring, outside an authorized ownership domain, a `class` whose name ends in `Runtime`/`Adapter`/`Provider`/`Registry`/`CompositionRoot`/`Profile`/`Default(s)`, **or a `const`/`let`/`var` whose name ends in `Default(s)`/`Registry`/`CompositionRoot`/`Profile`**. Verified against the live regex: `interface AssetProfile` and `type AssetProfile` are fine, `const DIGITAL_ARTIFACT_PROFILE` is fine, but `const digitalArtifactProfile` and `const assetProfileRegistry` are **violations**. | `check-ownership-boundaries.mjs` (LAW-002) — **build failure** |
| V-6 | Constructing `new SomethingRuntime()` / calling `registry.resolve(` inside a vertical domain service. | `check-composition-boundaries.mjs` (LAW-006/007) — **build failure** |
| V-7 | Publishing the vertical as `@aoc/asset-protocolization` and having it depend on `@aoc-runtime/*` or another `@aoc/*` package. `roleFor()` classifies it as a **facade**, and facades may depend only on `protocol` or `external`. | `check-version-graph.mjs` — **build failure** |
| V-8 | Treating a signature as truth, a claim as fact, an attestation as ownership, or `registrant` as `owner`. | Review; contradicts frozen `sovereign-asset-core.md` §5, §8, §15.5 |
| V-9 | Any tokenization concept (token, mint, fraction, issuance ceiling) appearing in Workstream A or in Protocol. | Review; `ECONOMICS-CONSTITUTION.md` explicitly excludes a tokenization runtime |

---

## 7. Findings that constrain APV-01 and later

**F-1 — Protocol is further ahead than the plan assumes.** Roughly 75% of the vertical's
representational needs already exist. APV-03…APV-10 should be re-read as *"configure and
orchestrate existing primitives"*, not *"build a claims/evidence/attestation system"*. Any
PR in this workstream that introduces a type named `Evidence`, `Claim`, `Attestation`,
`Verification` or `Proof` without referencing the canonical one should be rejected on sight.

**F-2 — The APV-07 check-result vocabulary does not exist and must not be added to core.**
`VerificationStatus` is `Pending | Verified | Failed`. APV-07 requires
`PASS | FAIL | WARNING | MANUAL_REVIEW | UNAVAILABLE`. These are different things: the
former is the status of a `CanonicalVerification` **record**, the latter is the outcome of
an individual automated **check**. The vertical owns the check-result vocabulary; a
completed pipeline run then *projects* into one `CanonicalVerification` per claim. Widening
the core enum would be a V-3 violation.

**F-3 — The legacy access-governance stack cannot govern a sovereign subject.**
`protocol/enforcement` + `protocol/capability` model a resource as
`EnforcementResource { type: 'field' | 'content' | 'pack'; ref }` / `ScopeEntry` — a closed
kind set with a hash-shaped ref. A protocolized house is none of those. The canonical
`ResourceRef { kind: string; … }` in `@aoc/protocol/contracts` **is** open, so the vertical
and Workstream B must target the canonical contract surface and the Enterprise/governance
runtime, **not** the legacy enforcement engine. `sovereign-asset-core.md` §15.10 already
flags this convergence as deferred; this workstream must not attempt it and must not
depend on it.

**F-4 — Tenancy is optional and advisory, not enforced.** `tenantId` is `readonly
tenantId?: CanonicalId` on `ResourceRef` and `AdapterLookupContext`, and
`TENANT_AND_ACTOR_BOUNDARIES.md` states there is "no forced multi-tenant rewrite" and that
tenant semantics "must not be implicitly inferred". Global rule 11 requires the vertical to
preserve tenancy. **Therefore tenancy isolation for `ProtocolizationCase` is a
vertical-owned obligation** — the vertical must carry and enforce a required tenant on its
own aggregates, and must not assume Protocol enforces it. This is a direct input to APV-19
(cross-tenant access).

**F-5 — Facade/runtime naming determines what the vertical may depend on.** Because
`roleFor()` keys purely off the package name, calling the vertical `@aoc/…` permanently
restricts it to depending on `@aoc/protocol` and external packages only. If the vertical
needs `@aoc/enterprise`, `@aoc-runtime/*`, or a second `@aoc/*` package, it must either be
named `@aoc-runtime/…` (role `runtime`, which may depend on protocol + facade + external)
or live outside `packages/`. **This must be decided in APV-01, before any code exists.**

**F-6 — A new test suite is invisible to CI unless `jest.config.js` `testMatch` is
amended.** Global rule 13 ("run the relevant tests") is unsatisfiable for a new directory
otherwise. Adding a path to `testMatch` is a build-configuration change, not a Protocol
core change, so it is permitted — but it must be explicit in the implementing PR.

**F-7 — There is no `assertionRef` producer.** `CanonicalClaim.assertionRef:
CanonicalAssertionId` is required, and `assertion.ts` defines the type but the repository
provides no minting/validation helper for it. The vertical will need to mint assertion ids;
whether a shared helper belongs in Protocol is a genuine question for APV-06 and is
recorded as U-3.

**F-8 — Four of the eight sovereignty capabilities have no implementation.**
`verifiability`, `interoperability`, `licensing_terms` and `governance_compatibility` are
declared but not implemented. `AOC.VERIFIABILITY` is the natural home for
"is this attestation's signature valid and is the signer who they claim to be?", which
APV-08 needs. Implementing it is **Protocol** work, not vertical work. The vertical must
either compose the existing lower-level primitives (`verifySovereignManifest`,
`VerificationKeyResolver`, `CredentialStatusLookup`) directly, or a Protocol work package
must land AOC.VERIFIABILITY first. Recorded as U-1 — this is the one place where the
vertical could plausibly *need* a core addition, and rule 5 requires it be raised, not
implemented.

---

## 8. Uncertainties requiring an explicit decision (gate items)

| # | Uncertainty | Why it cannot be settled unilaterally | Proposed default |
|---|---|---|---|
| U-1 | Does the vertical wait for `AOC.VERIFIABILITY`, or compose lower-level verification primitives itself? | Implementing a fifth capsule is Protocol evolution and is out of this workstream's scope (rule 4/6). | Compose existing primitives now; treat AOC.VERIFIABILITY as a **generic** Protocol need to be proposed separately with its own gate. |
| U-2 | Is `RegistryType.Custom` + `authorityLevel: 'External'` an acceptable long-term model for a national land registry, or does Protocol eventually need a generic `ExternalRegistry` member? | Adding an enum member is a core change; doing it *for real estate* is a GATE A3 failure. | Use `Custom` + `External` for `realestate.cr.v1`. Revisit only if ≥3 unrelated verticals independently need it — i.e. only when the need is demonstrably generic. |
| U-3 | Who mints `CanonicalAssertionId`? | If assertion identity is genuinely generic, it belongs in Protocol; if it is a vertical convention, it does not. | Vertical mints, in a vertical-namespaced id form, until a second consumer appears. |
| U-4 | Does the fee ledger (APV-14) reuse `runtime/monetization` or is it vertical-owned? | `runtime/monetization` is a *transitional runtime owner*; binding a new vertical to it may deepen a layer the repo is trying to retire. | Vertical-owned **assessment** ledger (a canonical, auditable record of what is owed); no payment processing, no coupling to `runtime/monetization`, per APV-14's own instruction. |
| U-5 | Package name / placement of the vertical (F-5). | Determines the dependency envelope permanently. | Decide in APV-01. |
| U-6 | Does `ProtocolizationCase` persistence get a Protocol-style port, or a vertical-owned one? | A port in Protocol would leak vertical concepts into core. | Vertical-owned port; infrastructure binds it. Protocol never learns the case exists. |

---

## 9. Recommended boundary for APV-01 (input only — not a decision)

```text
SOBERANÍA PROTOCOL      subject identity, integrity, canonical record,
                        claims/evidence/attestation/verification/standing vocabulary,
                        registry & credential references, proofs, canonicalization,
                        capability invocation + evidence, portability, adapter ports,
                        ResourceRef / AuditEventEnvelope
                        —— knows nothing about asset classes, professionals or cases

ASSET PROTOCOLIZATION   profiles, intake, case + lifecycle, requirement definitions,
VERTICAL                declaration capture, automated verification pipeline,
                        professional review packet & workbench, attestation workflow,
                        protocolization orchestration, fee assessment,
                        vertical APIs/adapters/UI
                        —— knows what a house and a WAV file are; governs nothing

SOBERANÍA ENTERPRISE    authority resolution, policy, approvals, decisions, obligations,
                        grants, enforcement, revocation, usage evidence
                        —— governs actions on governed resources; registers nothing legally

TOKENIZER               token issuance, contracts, custody, marketplace, settlement
                        —— executes; decides nothing
```

The one sentence APV-01 must make unfalsifiable:

> **Asset Protocolization is a vertical built on Soberanía Protocol. It is not Soberanía Protocol
> itself, it is not Soberanía Enterprise, and it does not tokenize.**

---

## 10. Constraints this audit did not resolve, and deliberately did not touch

- No code, schema, migration, dependency or configuration was changed by APV-00.
- The legacy access-governance convergence (F-3) was inspected and left alone.
- Costa Rican law was **not** researched here. APV-16 is the only place legal requirements
  may be established, and only from official sources with per-requirement citation. Nothing
  in this document asserts anything about Costa Rican law.
- Workstream B (`TOKENIZE`) surfaces were inventoried only to the depth needed to keep the
  Workstream A boundary honest. TGV-00 owns that audit.
