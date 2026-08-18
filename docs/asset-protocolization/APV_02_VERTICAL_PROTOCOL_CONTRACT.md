# APV-02 — Vertical ↔ Protocol Contract (frozen)

| Field | Value |
|---|---|
| Work package | APV-02 (Workstream A, Asset Protocolization Vertical) |
| Status | `IMPLEMENTED_NOT_VERIFIED` — contract frozen as specification; no code written (GATE A0 forbids vertical implementation) |
| Depends on | `docs/asset-protocolization/APV_00_RECONNAISSANCE.md`, `docs/architecture/adr-asset-protocolization-vertical-boundary.md` |
| Baseline commit | `5ed0670` |
| Freezes | The complete set of types that may cross the vertical → substrate boundary |
| Feeds | GATE A0, then APV-03…APV-10 |

---

## 1. One correction before the contract

The build plan asks for "the result Protocol can consume so Protocol can govern it".
Two words there are imprecise against this repository's actual architecture, and getting
them right changes the contract:

- **Protocol does not govern.** `docs/architecture/sovereign-asset-core.md` §13 is
  explicit: `resolveSovereignAsset()` and `SovereignAssetRegistry.resolve()` "never
  authorize access, issue grants, evaluate Enterprise policy, or call Enterprise." Protocol
  provides the substrate; **Enterprise** governs actions. The golden rule of the build plan
  says the same thing.
- **Protocol does not consume a `ProtocolizationResult`.** If Protocol had a type that
  knew about protocolization cases, profiles and professional review, the vertical would
  have been absorbed into the core — the exact failure this workstream exists to prevent.

So the contract is not "one object Protocol swallows". It is:

```text
                 ┌─────────────────────────────────────────────────┐
                 │  ProtocolizationResultV1   (VERTICAL-OWNED)     │
                 │  the envelope a consumer reads                  │
                 └───────────────┬─────────────────────────────────┘
                                 │  is made only of
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
 PROTOCOL TYPES          OPAQUE IDENTIFIERS        PROTOCOL TYPES
 SovereignSubjectRef     profileId/profileVersion  ResourceRef
 SignedSovereignManifest correlationId             UtcDateTime
 Canonical*Id[]                                    (nothing else)
        │                                                  │
        ▼                                                  ▼
  PROTOCOL consumes these constituents          ENTERPRISE governs this
  (registry, verification, portability)         (policy, authority, grants)
```

Protocol consumes the **constituents**, each of which is already a Protocol type.
Enterprise governs the **`ResourceRef`**. Nobody consumes the envelope as a Protocol
concept. That is what makes the boundary hold.

---

## 2. The frozen contract

### 2.1 `ProtocolizationResultV1`

Owned by `@aoc/asset-protocolization`. Every field is either a Protocol type or an opaque
scalar. There is no field whose *meaning* requires knowing the asset class.

```ts
import type {
  CanonicalId,
  ResourceRef,
  UtcDateTime,
} from '@aoc/protocol/contracts';
import type {
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalEvidenceId,
  CanonicalVerificationId,
} from '@aoc/protocol/claims';
import type { SovereignSubjectRef } from '@aoc/protocol/identity';
import type { SignedSovereignManifest } from '@aoc/protocol/manifest';

export const PROTOCOLIZATION_RESULT_SCHEMA_VERSION = 'aoc-protocolization-result/1';

/** Opaque to every consumer. Never parsed, never branched on, never resolved. */
export interface ProtocolizationProfileRef {
  readonly profileId: string;        // e.g. 'digital.artifact.v1' — opaque
  readonly profileVersion: string;   // exactly /^\d+\.\d+\.\d+$/
}

export interface ProtocolizationResultV1 {
  readonly schemaVersion: typeof PROTOCOLIZATION_RESULT_SCHEMA_VERSION;
  readonly canonicalizationProfile: 'aoc-canonical-json/1';

  /** WHICH SUBJECT. The sovereign identity of the protocolized thing. */
  readonly subject: SovereignSubjectRef;

  /** THE CANONICAL RECORD. Signed, verifiable independently of this envelope. */
  readonly record: SignedSovereignManifest;

  /** THE GOVERNANCE HANDLE. What Enterprise addresses. See §2.2. */
  readonly governedResource: ResourceRef;

  /** WHAT WAS ASSERTED / SUPPLIED / CHECKED / ATTESTED — references only. */
  readonly declarationRefs: readonly CanonicalClaimId[];
  readonly evidenceRefs: readonly CanonicalEvidenceId[];
  readonly verificationRefs: readonly CanonicalVerificationId[];
  readonly attestationRefs: readonly CanonicalAttestationId[];

  /** UNDER WHICH RULES. Opaque. */
  readonly profile: ProtocolizationProfileRef;

  /** WHEN. Asserted effective instant of the protocolization act. */
  readonly effectiveAt: UtcDateTime;

  /** AUDIT LINKAGE. Correlates every audit event and capability invocation of this act. */
  readonly correlationId: CanonicalId;
}
```

### 2.2 `governedResource` — the derivation rule

```ts
export const PROTOCOLIZED_RESOURCE_KIND = 'aoc:sovereign-asset';

// governedResource is DERIVED, never independently supplied:
//   kind     === PROTOCOLIZED_RESOURCE_KIND
//   id       === subject.sovereignAssetId
//   tenantId === the case's required tenant (see §4)
//   attributes — omitted in v1 (see below)
```

Three deliberate decisions:

- **`kind` is a constant, not a per-asset-class value.** `kind: 'real-estate'` or
  `kind: 'audio'` would push the asset taxonomy into the layer Enterprise reads, which is
  the leak this ADR exists to prevent. Enterprise governs *a sovereign asset*; which kind
  of asset it is, is the vertical's business. `ResourceRef.kind` is an open `string` in
  `@aoc/protocol/contracts`, and existing usages (`'document'`, `'dataset'`, `'record'`)
  set no conflicting convention, so this constant is vertical-owned. If a second producer
  of sovereign-asset resources ever appears, promoting the constant to Protocol becomes a
  genuinely generic proposal — that is a later, separate gate.
- **`id` is the `SovereignAssetId`, never the manifest digest, content digest, external
  reference id or locator.** Those are all things that legitimately change while the
  subject stays the same (`sovereign-asset-core.md` §15.8); an Enterprise grant keyed to
  any of them would silently expire when the asset moved provider or was re-encoded.
- **`attributes` is omitted in v1.** `ResourceRef.attributes?: Record<string, string>` is a
  tempting place to smuggle `{ propertyType: 'finca' }` into the governance layer. It is
  therefore closed by contract in v1 and reopened only by an explicit amendment to this
  document.

### 2.3 What the contract deliberately excludes

| Excluded | Why |
|---|---|
| `owner`, `legalOwner`, `titleHolder`, `ownershipPercentage` | Registration ≠ legal ownership; a claim ≠ a fact (frozen invariants). The manifest field is `registrant`. |
| `attestedBy`, `notaryId`, `professionalRole` as first-class fields | Attestation identity travels inside `CanonicalAttestation` (`attester` + `credentialRefs`), referenced by id. Hoisting it implies the envelope certifies the attestor. |
| Any legal-status field (`valid`, `registered`, `enforceable`, `titleClear`) | The vertical produces a verifiable record of declarations, evidence and attestations. It never produces a legal conclusion. |
| Inlined evidence payloads, documents, bytes, PII | Mirrors the deliberate exclusion in `SovereigntyCapabilityInvocationEvidenceV1`: a record must stay small and safe enough to hand to someone not entitled to the payload. |
| `assetType`, `jurisdiction`, `registryOffice`, `fincaNumber`, `mimeType`, `durationSeconds` | Domain facts. They belong in the profile, in the manifest's `externalReference`, and inside claims/evidence metadata — all of which the substrate carries opaquely. |
| A `status`/`state` field for the case | `ProtocolizationCase` state is vertical-internal and mutable. A `ProtocolizationResultV1` only exists for a case that reached `PROTOCOLIZED`; carrying a mutable status into an immutable result invites reading a stale one. Manifest lifecycle (`active`/`disputed`/`superseded`/`withdrawn`) already lives on `SovereignManifestV1.state`. |
| `supersedes` / `previousResultId` | Supersession is expressed the way Protocol already expresses it — `SovereignManifestV1.state = 'superseded'` plus a new `manifestVersion`, and `DerivationClaim` where a genuine derivation occurred. A parallel lineage field would be the `parentId` mistake `sovereign-asset-core.md` §16.1 already rejected. |

### 2.4 Invariants the contract must uphold

```text
I-1  governedResource.kind === PROTOCOLIZED_RESOURCE_KIND        (constant)
I-2  governedResource.id   === subject.sovereignAssetId          (never a digest/locator)
I-3  record.manifest.sovereignAssetId === subject.sovereignAssetId
I-4  record.manifest.externalReference === subject.externalReference (byte-exact or both absent)
I-5  every *Refs array contains identifiers only — no embedded objects
I-6  the envelope canonicalizes under aoc-canonical-json/1
     ⇒ absent optionals are structurally omitted, never `undefined`
I-7  no field of the envelope requires knowledge of the asset class to interpret
I-8  the envelope carries no legal conclusion and no ownership assertion
I-9  attestationRefs may be empty — a profile that requires no professional attestation
     is legitimate, and an empty array must never be read as "attested"
I-10 verificationRefs being non-empty asserts that checks ran, never that they passed
```

I-9 and I-10 exist because the failure mode of a result envelope is that a downstream
reader treats *presence of a field* as *a favourable outcome*. Outcomes live in the
referenced records, never in the shape of the envelope.

---

## 3. The gate question

> Could Protocol consume this result without caring whether the original object was a PDF,
> a WAV, a physical painting, or a plot of land?

**Yes.** Walked through explicitly, because assertion is not evidence:

| Original object | `subject.externalReference` | `record.manifest.contentIdentity` | `evidenceRefs` | `attestationRefs` | Anything else different? |
|---|---|---|---|---|---|
| PDF | absent (or a DOI/ISBN namespace) | present — sha256 of the bytes | document evidence | per profile | no |
| WAV | absent (or an ISWC/ISRC namespace) | present — sha256 of the bytes | authorship + provenance evidence | per profile | no |
| Physical painting | e.g. a catalogue-raisonné namespace | **absent** — no canonical byte representation | condition report, provenance chain, photographs (each itself a digital evidence artifact) | per profile | no |
| Plot of land | e.g. a national land-registry namespace + folio id | **absent** | registry lookup result, certifications | per profile — typically required | no |

Every difference is confined to (a) whether `contentIdentity` is present, (b) what strings
sit inside an opaque `externalReference`, and (c) which references are populated. **No
field is added, removed or reinterpreted per asset class**, and no consumer of the envelope
branches on asset type. `sovereign-asset-core.md` §15.7 already demonstrates the physical
and non-byte cases at the identity layer using exactly these structures.

The boundary is correct.

### 3.1 The honest limit of that answer

"Protocol can consume it" is a statement about *representation*, not *sufficiency*.
A protocolized plot of land and a protocolized WAV file are equally representable and
equally **not** legally equivalent. What differs between them is entirely inside the
profile: which evidence is required, which professional must attest, within what scope, and
how fresh the evidence must be. That is precisely why the profile is the vertical's central
concept (APV-03) and why it stays opaque here.

---

## 4. Tenancy

`governedResource.tenantId` is **required** in this contract even though
`ResourceRef.tenantId` is optional in Protocol, and even though
`TENANT_AND_ACTOR_BOUNDARIES.md` records tenancy as advisory at the substrate level.

The vertical originates the record, so the vertical is the only layer that can attach the
tenant truthfully. A `ProtocolizationResultV1` emitted without a tenant would hand
Enterprise a resource it cannot isolate, and Protocol will not fill the gap. Enforcement of
this is a vertical obligation (ADR §6) and an APV-19 test obligation.

---

## 5. Proposed contract tests

To be implemented alongside the first vertical code (APV-10 at the latest), placed under
the vertical's own test directory and added to `jest.config.js` `testMatch` in the same PR.
Naming follows the existing `tests/contracts/*.test.ts` convention.

### 5.1 Structural conformance

| # | Test | Asserts |
|---|---|---|
| T-01 | derives `governedResource` from the subject | I-1, I-2 |
| T-02 | rejects a result whose `governedResource.id` is a manifest digest, content digest, external-reference id or locator | I-2 |
| T-03 | keeps subject and manifest identity aligned | I-3, I-4 |
| T-04 | canonicalizes under `aoc-canonical-json/1` and round-trips byte-identically | I-6 |
| T-05 | rejects `undefined`-valued optionals (present-but-undefined ≠ absent) | I-6 |
| T-06 | rejects any embedded object inside a `*Refs` array | I-5 |
| T-07 | rejects an envelope carrying an unknown/extra field | contract closure |
| T-08 | requires a non-blank `tenantId` on `governedResource` | §4 |
| T-09 | rejects a `profileVersion` that is not `^\d+\.\d+\.\d+$` | §2.1 |

### 5.2 Asset-class invariance — the GATE A3 rehearsal

| # | Test | Asserts |
|---|---|---|
| T-10 | builds a valid result for each of: byte subject with `contentIdentity`; byte subject without; non-byte subject with `externalReference`; non-byte subject without — using **one** builder and **one** code path | §3 |
| T-11 | a consumer that validates the envelope never branches on `profile.profileId` | boundary integrity |
| T-12 | `packages/asset-protocolization/src/**` imports nothing outside `@aoc/protocol/*` and Node built-ins (mirrors `protocol-purity.test.ts`) | ADR §3 |
| T-13 | no core Protocol type gained a field or enum member (snapshot of the relevant Protocol symbol surfaces) | GATE A3 |

### 5.3 Epistemic honesty

| # | Test | Asserts |
|---|---|---|
| T-14 | a result with `attestationRefs: []` is valid and is never reported as attested | I-9 |
| T-15 | a result whose referenced verifications all failed is still a structurally valid result | I-10 |
| T-16 | no field named `owner`/`legalOwner`/`titleHolder`/`valid`/`registered`/`enforceable` exists anywhere on the envelope (asserted over the actual key set, not by convention) | §2.3, I-8 |
| T-17 | the envelope contains no bytes, document payload or PII (asserted over serialized output) | §2.3 |
| T-18 | mutating the envelope after construction does not invalidate `record` verification — and mutating `record` **does** — proving the envelope is not, and cannot be mistaken for, the proof | boundary integrity |

### 5.4 Negative / adversarial (feeds APV-12 and APV-19)

| # | Test | Asserts |
|---|---|---|
| T-19 | a result naming a subject whose manifest fails `verifySovereignManifest` is rejected at emission | APV-10 precondition |
| T-20 | two results for the same `sovereignAssetId` with the same `manifestVersion` are detected as a duplicate protocolization attempt | APV-19 |
| T-21 | a result referencing an attestation outside the profile's required scope is rejected | APV-08/APV-19 |
| T-22 | a result whose `governedResource.tenantId` differs from the case tenant is rejected | APV-19 cross-tenant |

---

## 6. Amendment policy

`aoc-protocolization-result/1` is frozen by this document. Additive optional fields require
an amendment section here plus a demonstration that every existing invariant still holds.
Any change that would make a field's meaning depend on the asset class is not an amendment
— it is a boundary violation, and the correct response is a new profile, not a new field.

---

## 7. GATE A0 readiness

| Requirement | State |
|---|---|
| `Protocol != Asset Protocolization` | Frozen — ADR §1, §2.1 vs §2.2 |
| `Asset Protocolization != Enterprise Governance` | Frozen — ADR §1, §2.2 vs §2.3 |
| `Enterprise Governance != Tokenizer` | Frozen — ADR §1, §2.3 vs §2.4 |
| Vertical → substrate contract | Frozen — this document §2 |
| Gate question answered affirmatively with evidence | §3 |
| Contract tests proposed | §5 |

**Open items that must be resolved by a human before APV-03 begins** (from APV-00 §8):
U-1 (AOC.VERIFIABILITY), U-2 (external-registry enum), U-3 (`CanonicalAssertionId`
minting), U-4 (fee ledger placement), U-6 (case persistence port). U-5 (package placement)
is closed by ADR §3.

Nothing in APV-03…APV-20 may be implemented until GATE A0 is signed off.
