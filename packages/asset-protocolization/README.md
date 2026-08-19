# `@aoc/asset-protocolization`

The Asset Protocolization Vertical — a vertical built **on** Soberanía Protocol.

> It is not Soberanía Protocol, it is not Soberanía Enterprise, and it does not tokenize.

## What this package contains

### APV-03 — the asset profile framework

An `AssetProfile` states what must be satisfied for a particular category of
asset to be processed by the vertical — which identifying material, which
declarations, which evidence, which automated checks and which attestation, in
which jurisdictions, and how fresh each input must be.

```ts
import {
  createAssetProfileCatalog,
  listAssetProfileReadinessRequirements,
} from '@aoc/asset-protocolization';

const catalog = createAssetProfileCatalog([myProfile]);
const resolved = catalog.get('my.profile.v1', '1.0.0');
const outstanding = listAssetProfileReadinessRequirements(resolved!, 'GLOBAL');
```

### APV-04 — the `ProtocolizationCase` aggregate

A `ProtocolizationCase` is one tenant's attempt to protocolize one subject under
one pinned profile version. It records what was supplied against which
requirements and where the attempt is in its lifecycle
(`Draft → Active → Cancelled`).

```ts
import {
  addProtocolizationCaseMaterial,
  createProtocolizationCase,
  listProtocolizationCasePendingMaterialRequirements,
} from '@aoc/asset-protocolization';

// `clock` and the case id come from the composition layer; this package is pure.
const context = { catalog, clock, tenantId: 'tenant-a' };
const { protocolizationCase, event } = createProtocolizationCase(context, {
  caseId: 'case-0001',
  profile: { profileId: 'my.profile.v1', profileVersion: '1.0.0' },
  subject: { subjectRef: { sovereignAssetId } },
});
```

Material presence is never truth: associating a claim, evidence, attestation or
verification reference records that the case was told about it — never that it
is valid, current, sufficient, checked or that the case is ready.

### APV-05 — the evidence intake layer

How a case is *told about* evidence: one operation that structurally admits a
submission, correlates it to requirements of the case's pinned profile, records
an immutable receipt, and performs the association through APV-04's own
`ProtocolizationMaterialKind.Evidence` pathway.

```ts
import { intakeProtocolizationEvidence } from '@aoc/asset-protocolization';

const { protocolizationCase, receipt, caseEvent, intakeEvent } =
  intakeProtocolizationEvidence(context, openCase, {
    intakeId: 'intake-0001',
    caseId: 'case-0001',
    materialId: 'material-0001',
    categoryId: 'my.intake.external-registry', // opaque; no enum of sources exists
    pathway: 'Reference',
    evidenceRef: canonicalEvidenceId,          // Protocol's CanonicalEvidenceId
    requirementIds: ['evidence.provenance.minimum'],
    observedAt: registryLookup.observedAt,     // the source's instant, never invented
  });
```

Nothing is persisted by the operation: it returns the updated case *and* the
receipt so a composition layer can commit both together. Evidence accumulates
over the life of a case, and no intake rewrites or deletes what an earlier one
recorded.

```text
Evidence received     !=  evidence verified.
Evidence associated   !=  requirement satisfied.
Evidence complete     !=  case ready.
```

### APV-06 — the declaration / claim preparation layer

How a participant *asserts something* into a case: one operation that structurally admits a
submission, correlates it to declaration requirements of the case's pinned profile,
optionally links evidence APV-05 already admitted, records an immutable declaration record,
and performs the association through APV-04's own
`ProtocolizationMaterialKind.Declaration` pathway.

```ts
import { recordProtocolizationDeclaration } from '@aoc/asset-protocolization';

const { protocolizationCase, record, caseEvent, declarationEvent } =
  recordProtocolizationDeclaration(context, openCase, {
    declarationId: 'declaration-0001',
    caseId: 'case-0001',
    materialId: 'material-d001',
    declarant: { id: principalId, kind: 'Human' }, // Protocol's CanonicalPrincipalRef
    pathway: 'Reference',
    claimRef: canonicalClaimId,                    // Protocol's CanonicalClaimId
    claimType: 'Authorship',                       // Protocol's ClaimType
    requirementIds: ['declaration.authorship.required'],
    statement: 'I created this work.',             // presentation only, never semantics
    supportingEvidenceRefs: [canonicalEvidenceId], // linkage, never support
    declaredAt: whenTheySayTheyDeclaredIt,         // distinct from when we recorded it
  });
```

The package never constructs a `CanonicalClaim`: doing so would require minting a canonical
record id *and* an `assertionRef` naming a `CanonicalAssertion` that would not exist. A
declaration names a claim, or supplies one the caller already holds, and the vertical records
its own account of who asserted what, when.

A new *kind* of declaration is a profile that names `ClaimType.Custom` plus a `claimSubtype`
token — a configuration change, never a code change here and never a change to Protocol.

```text
Declaration recorded     !=  declaration true.
Claim exists             !=  claim verified.
Evidence linked          !=  claim proven.
Declarant identity       !=  declarant authority.
All declarations present !=  case ready.
```

Conflicting declarations coexist: APV-06 preserves both and adjudicates neither. Declaration
history is append-only — a correction is a new declaration, never a rewrite.

## What it does not contain

No evidence, claim, attestation, verification, standing, credential, proof,
provenance-source, subject-identity, principal-reference or integrity type — every
one of those is Protocol's and is referenced, never redefined. No verification
execution, no conflict adjudication, no identity resolution, no authority or
delegation resolution, no readiness decision, no protocolization finalization, no
review workflow, no registry connector, no fee assessment, no governance, no
tokenization, and no database adapter or blob store (the case, evidence-intake and
declaration persistence **ports** are here; binding any of them to a store is not).
No file, blob or upload handling: evidence reaches this package as a reference,
never as bytes. No concrete product profile: the fixtures under `tests/fixtures/`
are test-only.

## Dependency envelope

`@aoc/protocol` and nothing else. `scripts/check-version-graph.mjs` classifies
every `@aoc/*` package other than `@aoc/protocol` as a **facade**, and a facade
may depend only on `protocol` or `external`. That is the intended constraint, not
an obstacle: every concrete capability arrives by injection of a
Protocol-declared port, bound in a composition root.

## Documentation

- `docs/asset-protocolization/APV_03_ASSET_PROFILE_FRAMEWORK.md` — the profile slice.
- `docs/asset-protocolization/APV_04_PROTOCOLIZATION_CASE.md` — the case slice.
- `docs/asset-protocolization/APV_05_EVIDENCE_INTAKE.md` — the evidence intake slice.
- `docs/asset-protocolization/APV_06_DECLARATION_CLAIM_PREPARATION.md` — the declaration
  slice.
- `docs/asset-protocolization/README.md` — the workstream and the Gate A0 record.
- `docs/architecture/adr-asset-protocolization-vertical-boundary.md` — the frozen
  boundary.
