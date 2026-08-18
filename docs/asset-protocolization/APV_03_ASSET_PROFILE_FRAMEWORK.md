# APV-03 — Asset Profile Framework

| Field | Value |
|---|---|
| Work package | APV-03 (Workstream A, Asset Protocolization Vertical) |
| Status | Implemented — first vertical code slice |
| Package | `@aoc/asset-protocolization` (`packages/asset-protocolization`) |
| Depends on | [`APV_00_RECONNAISSANCE.md`](./APV_00_RECONNAISSANCE.md), [`adr-asset-protocolization-vertical-boundary.md`](../architecture/adr-asset-protocolization-vertical-boundary.md), [`APV_02_VERTICAL_PROTOCOL_CONTRACT.md`](./APV_02_VERTICAL_PROTOCOL_CONTRACT.md) |
| Gate | GATE A0 — **RATIFIED** (see [`README.md`](./README.md#gate-a0--ratified)) |
| Protocol core modified | **No** |

This document describes only what APV-03 added. The frozen artifacts above are
the architectural baseline and are not restated here.

---

## 1. What an `AssetProfile` is

> An `AssetProfile` states **what must be satisfied for a particular category of
> asset to be processed by the Asset Protocolization Vertical**.

It is a machine-readable requirement document. It is the answer to *"what does
this kind of thing need?"* — not to *"what is true about this thing?"*

---

## 2. What it owns

- profile identity and versioning (`profileId` + `version`);
- the asset category a profile applies to, as an opaque vertical token;
- **identity requirements** — which identifying material the subject must carry;
- **declaration requirements** — which claims the applicant must supply;
- **evidence requirements** — which evidence must be supplied, and how much;
- **verification requirements** — which automated checks must have been run;
- **attestation requirements** — whether attestation is required, optional,
  conditional or explicitly not required, and what the attester must be;
- **jurisdiction context** for a profile and for individual requirements;
- **freshness constraints** over observation instants;
- stable machine-readable requirement identifiers;
- validation of profile documents;
- resolution of a profile by `(profileId, version)`.

## 3. What it explicitly does not own

- `Evidence`, `Claim`, `Attestation`, `Verification`, `Standing`, `Credential`,
  `Proof`, subject identity, integrity — all Protocol's, none redefined;
- the check-outcome vocabulary (`PASS`/`FAIL`/`WARNING`/`MANUAL_REVIEW`/
  `UNAVAILABLE`) — APV-07's, and never a widening of Protocol's
  `VerificationStatus`;
- `ProtocolizationCase`, its lifecycle, its persistence and its tenancy — APV-04;
- evidence intake, storage, verification execution, review workbench,
  attestation workflow, fee assessment — later slices;
- authority, policy, approvals, grants, enforcement, revocation — AOC Enterprise;
- token issuance, custody, settlement — the tokenizer, outside Workstream A
  entirely.

A profile **describes requirements around Protocol primitives**. It never
replaces one, and it never executes anything.

---

## 4. Relationship to Protocol primitives

Every constraint a profile expresses is written in a Protocol vocabulary that
already exists. APV-03 added no member to any of them.

| Profile concept | Protocol primitive it constrains |
|---|---|
| `AssetIdentityStrategy.ContentIdentity` | `ContentIdentity` (`@aoc/protocol/identity`) |
| `AssetIdentityStrategy.ExternalReference` | `SovereignExternalReference` |
| `AssetIdentityStrategy.RegistryEntry` | `CanonicalRegistryEntryRef` + `CanonicalRegistryRef` |
| `AssetRegistryConstraint.acceptedTypes` | `RegistryType` (an external registry is `Custom`) |
| `AssetRegistryConstraint.acceptedAuthorityLevels` | `RegistryAuthorityLevel` (an external registry is `External`) |
| `AssetRegistryConstraint.acceptedEntryTypes` | `RegistryEntryType` |
| `AssetDeclarationRequirement.claimType` | `ClaimType` (+ a vertical `claimSubtype` narrowing `Custom`) |
| `AssetEvidenceRequirement.acceptedTypes` | `EvidenceType` (+ a vertical `acceptedSubtypes` narrowing `Custom`) |
| `AssetAttestationRequirement.acceptedTypes` | `AttestationType` |
| `AssetAttesterConstraint.acceptedPrincipalKinds` | `PrincipalKind` |
| `AssetCredentialConstraint.acceptedTypes` | `CredentialType` (a licensed professional is `ProfessionalCredential`) |
| `AssetCredentialConstraint.acceptedStatuses` | `CredentialStatus` |
| `AssetFreshnessConstraint.observedAfter` | `UtcDateTime`, compared by a later slice against `observedAt` / `createdAt` / `issuedAt` |
| `AssetProfileError` | `ProtocolError` (`code` + `message` + `details`) |

The one local structural helper is `isValidUtcDateTime`. Protocol's
`isCanonicalTimestamp` is deliberately internal to `packages/protocol/src/claims`
and is not re-exported, so the vertical validates the published `UtcDateTime`
*type* with its own guard rather than reaching into Protocol source. If Protocol
ever publishes the validator, this collapses into a re-export.

---

## 5. How a future profile is added

1. Author an `AssetProfile` document — a plain object, no class, no subclassing.
2. Choose a `profileId` (dotted lowercase) and a `version` (`<major>.<minor>.<patch>`).
3. Give every requirement a stable dotted identifier.
4. Express each requirement in the Protocol vocabulary above.
5. Register it: `catalog.register(profile)` — or pass it to
   `createAssetProfileCatalog([...])`.
6. Add a vertical adapter only if the profile needs to reach an external system.

**No change to Protocol. No change to the catalogue implementation. No change to
the validator.** That is the hard acceptance criterion of this slice, and
`asset-profile-catalog.test.ts` asserts it directly.

Concrete product profiles (`digital.artifact.v1`, `realestate.cr.v1`) are **not**
part of APV-03. The first product profile is APV-11. The fixtures under
`packages/asset-protocolization/tests/fixtures/` are test-only and are not
product contracts.

---

## 6. Versioning semantics

- A profile is identified by the pair `(profileId, version)`.
- `version` matches exactly `/^\d+\.\d+\.\d+$/` — the form APV-02 §2.1 froze for
  `ProtocolizationProfileRef.profileVersion`.
- A registered `(profileId, version)` is **immutable**. The catalogue refuses to
  replace one (`ASSET_PROFILE_VERSION_ALREADY_REGISTERED`) and deep-freezes what
  it holds, so the rules a case was assessed under can never change underneath it.
- Versions of one line coexist; distinct lines coexist. Neither supersedes the
  other implicitly — ordering is for deterministic listing only and confers no
  compatibility meaning.
- Evolution is a new version, or a new line. Never an edit in place.

---

## 7. Validation semantics

`validateAssetProfile(value)` follows the repository's established validator
contract — `{ valid, reasons }` with stable SCREAMING_SNAKE codes, structure
only, fail-closed, and a present-but-`undefined` optional reported as invalid
rather than treated as absent (matching `validateSovereignManifestV1`,
`validateCanonicalStanding`, `validateSovereignExternalReference`).

It additionally returns `issues: { code, path }[]`, of which `reasons` is exactly
the projection `issues.map((issue) => issue.code)`. A profile is a composite
document; a bare code cannot say *which* requirement is wrong.

Rejected, among others: a missing or malformed profile id; a version that is not
three numeric fields; an unsupported schema version; an unknown top-level or
requirement field (including a `tenantId` on a profile definition); an empty
requirement set; an empty or malformed requirement id; duplicate requirement ids;
an unsupported requirement kind or shape; an unknown obligation; a `Conditional`
requirement without a condition (or a condition without one); a dangling,
self-referential or never-satisfiable requirement reference; an empty, duplicated
or unknown identity-strategy, evidence-type, attestation-type, credential-type or
check-id list; an invalid external-registry constraint, or one on a requirement
that never accepts a registry entry; a malformed jurisdiction, or a requirement
scoped outside its profile's jurisdictions; an empty or malformed freshness
constraint; malformed metadata; a non-positive minimum count, or a minimum count
on a `NotRequired` requirement; and a mechanically contradictory identity pair.

What it deliberately does **not** decide: whether the requirements are legally
sufficient, sensible for the category, or satisfied by any case. The first two
are a human judgement at authoring time; the third is APV-04's.

---

## 8. Extension points

| Need | Extension point | Protocol change? |
|---|---|---|
| A new asset category | a new `AssetProfile`, a new `assetCategory` token | no |
| A new external registry | `AssetRegistryConstraint.acceptedNamespaces` (opaque) | no |
| A new professional role | `AssetAttesterConstraint.acceptedRoles` (opaque token) | no |
| A new automated check | a new `AssetVerificationCheckId` in `checkIds`; APV-07 supplies the executor | no |
| A new conditional rule | `AssetRequirementCondition.conditionId`; a later slice supplies the evaluator | no |
| A domain-specific claim or evidence flavour | `ClaimType.Custom` + `claimSubtype`, `EvidenceType.Custom` + `acceptedSubtypes` | no |
| A new jurisdiction | any `JurisdictionRef.code` matching the open token grammar | no |
| Tenant-scoped profile definitions | an additive `AssetProfileScope` member + an amendment here | no |

Readiness is **derived** from obligations by
`listAssetProfileReadinessRequirements`, not stored as a second list, so a
profile can never disagree with itself about what it requires.

---

## 9. Gate A0 ratification

Ratified. The five decisions (`U-1`, `U-2`, `U-3`, `U-4`, `U-6`) and how APV-03
implements each are recorded in [`README.md`](./README.md#gate-a0--ratified).

`U-3` in particular: the vertical owns `CanonicalAssertionId` minting. APV-03
does not mint one, because it creates no claim — so no helper was written. That
ownership stands and is discharged by the slice that first needs it.

---

## 10. Architectural prohibitions

These hold after APV-03 and are asserted by
`packages/asset-protocolization/tests/asset-profile-boundaries.test.ts`:

```text
no import outside @aoc/protocol's declared subpaths and Node built-ins
no dependency other than @aoc/protocol
no import of Enterprise, a runtime package, another facade, or any package's src/
no parallel Evidence / Claim / Attestation / Verification / Standing / Proof type
no class or const the ownership scanner reserves for Enterprise (LAW-002)
no `new *Runtime|*Adapter|*Provider()` and no `registry.resolve()` (LAW-006/007)
no tokenization vocabulary anywhere
no jurisdiction-, registry- or profession-specific value in the framework
no legal conclusion and no ownership assertion
```

And, restated because it is the point of the whole boundary:

```text
Protocol                 != Asset Protocolization
Asset Protocolization    != Enterprise Governance
Enterprise Governance    != Tokenizer
```
