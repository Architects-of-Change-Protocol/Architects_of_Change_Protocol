import {
  CredentialType,
  EvidenceType,
  PrincipalKind,
  ProofType,
  ReferenceSourceKind,
  RegistryAuthorityLevel,
  RegistryLookupStatus,
  RegistryEntryType,
  RegistryType,
} from '@aoc/protocol/claims';
import type {
  CanonicalEvidence,
  CanonicalReferenceSource,
  CanonicalRegistryEntryRef,
  CanonicalRegistryLookupResult,
} from '@aoc/protocol/claims';

import { EvidenceIntakePathway } from '@aoc/asset-protocolization';
import type {
  EvidenceIntakeCategoryId,
  ProtocolizationEvidenceSubmission,
} from '@aoc/asset-protocolization';

/**
 * Test-only fixtures for the evidence intake slice.
 *
 * Nothing here is a product contract, a jurisdiction, a registry, a profession
 * or an asset class. Every category id below is an abstract token that exists
 * to prove one thing: that fundamentally different evidence *pathways* reach
 * the same intake operation without it knowing — or being able to ask — what
 * kind of thing any of them is about.
 *
 * The registry material in particular is a deliberately abstract external
 * registry. `RegistryType.Custom` + `RegistryAuthorityLevel.External` is the
 * generic model Gate A0 `U-2` settled on, and no test here names a country, a
 * national registry, a land record or a property right.
 */

/**
 * Abstract intake categories.
 *
 * These are **test fixtures, not a vocabulary**. There is no enum of categories
 * anywhere in the production package: a category id is an opaque dotted token,
 * so adding a real one later is a configuration change, not a code change, and
 * certainly not a Protocol change. Each of these stands in for a future intake
 * pathway named in the roadmap.
 */
export const TEST_CATEGORY_DOCUMENT: EvidenceIntakeCategoryId = 'test.intake.uploaded-document';
export const TEST_CATEGORY_EXTERNAL_REGISTRY: EvidenceIntakeCategoryId = 'test.intake.external-registry';
export const TEST_CATEGORY_CRYPTOGRAPHIC: EvidenceIntakeCategoryId = 'test.intake.cryptographic';
export const TEST_CATEGORY_IDENTITY: EvidenceIntakeCategoryId = 'test.intake.identity';
export const TEST_CATEGORY_PROFESSIONAL: EvidenceIntakeCategoryId = 'test.intake.professional';
export const TEST_CATEGORY_TECHNICAL: EvidenceIntakeCategoryId = 'test.intake.technical';
export const TEST_CATEGORY_PROVENANCE: EvidenceIntakeCategoryId = 'test.intake.provenance';

/** A category nobody anticipated. Proves the set is genuinely open. */
export const TEST_CATEGORY_UNANTICIPATED: EvidenceIntakeCategoryId = 'test.intake.some-future-source';

export const TEST_EVIDENCE_ID = 'aoc:evidence:e1111111-1111-4111-8111-111111111111';
export const TEST_SECOND_EVIDENCE_ID = 'aoc:evidence:e2222222-2222-4222-8222-222222222222';
export const TEST_THIRD_EVIDENCE_ID = 'aoc:evidence:e3333333-3333-4333-8333-333333333333';

/** An abstract external registry. Custom type, external authority, no real-world identity. */
export const TEST_REGISTRY_ENTRY_REF: CanonicalRegistryEntryRef = {
  id: 'test-registry-entry-0001',
  registryRef: {
    id: 'test-registry-0001',
    type: RegistryType.Custom,
    namespace: 'test.namespace.external-registry',
    authorityLevel: RegistryAuthorityLevel.External,
  },
  entryType: RegistryEntryType.Custom,
  locator: 'test/entry/0001',
};

/**
 * An observation from that registry, at an instant the registry chose.
 *
 * `observedAt` is deliberately much older than any test's intake instant. The
 * point is that APV-05 carries it through untouched and reaches **no verdict**
 * about it: not fresh, not stale, not expired. A later slice evaluates the
 * profile's freshness constraint against exactly this value.
 */
export const TEST_REGISTRY_OBSERVED_AT = '2025-03-04T09:15:00.000Z';

export const TEST_REGISTRY_LOOKUP_RESULT: CanonicalRegistryLookupResult = {
  status: RegistryLookupStatus.Found,
  registryRef: TEST_REGISTRY_ENTRY_REF.registryRef,
  entries: [],
  observedAt: TEST_REGISTRY_OBSERVED_AT,
};

export const TEST_DOCUMENT_SOURCE: CanonicalReferenceSource = {
  kind: ReferenceSourceKind.Document,
  value: 'test://documents/0001',
  label: 'Test document locator',
};

export const TEST_REGISTRY_SOURCE: CanonicalReferenceSource = {
  kind: ReferenceSourceKind.Registry,
  value: 'test.namespace.external-registry',
};

/**
 * A `CanonicalEvidence` document, constructed *by the test* rather than by the
 * production package.
 *
 * That is the point of the `Canonical` pathway: a caller that legitimately
 * holds a Protocol evidence record may hand it over, and intake reads its `id`,
 * `type` and `createdAt` and then discards it. The production package never
 * constructs one of these, because constructing one requires minting a
 * canonical record id and asserting an issuer, a source and a description that
 * intake does not legitimately know.
 */
export function testCanonicalEvidence(
  overrides: Partial<CanonicalEvidence> = {},
): CanonicalEvidence {
  return {
    id: TEST_EVIDENCE_ID,
    type: EvidenceType.Document,
    subject: 'test-subject-0001',
    issuer: { id: 'test-issuer-0001', kind: PrincipalKind.Organization },
    source: { kind: ReferenceSourceKind.Document, value: 'test://documents/0001' },
    description: 'Test-only evidence record. Asserts nothing about any real thing.',
    createdAt: '2025-06-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Evidence carrying integrity and credential material through Protocol's own
 * reference types.
 *
 * Proves that cryptographic and professional/credential material is
 * representable without APV-05 inventing a primitive for either — and without
 * APV-05 checking a digest, validating a signature, or deciding that a
 * credential belongs to anyone.
 */
export function testCredentialledEvidence(): CanonicalEvidence {
  return testCanonicalEvidence({
    id: TEST_THIRD_EVIDENCE_ID,
    type: EvidenceType.Certification,
    proofRefs: [
      {
        id: 'test-proof-0001',
        type: ProofType.HashProof,
        source: { kind: ReferenceSourceKind.URI, value: 'test://proofs/0001' },
      },
      {
        id: 'test-proof-0002',
        type: ProofType.SignatureProof,
        source: { kind: ReferenceSourceKind.URI, value: 'test://proofs/0002' },
      },
    ],
    credentialRefs: [
      { id: 'test-credential-0001', type: CredentialType.ProfessionalCredential },
    ],
    registryRefs: [TEST_REGISTRY_ENTRY_REF],
  });
}

/** Builds a `Reference`-pathway submission with sensible test defaults. */
export function referencedSubmission(
  overrides: Partial<ProtocolizationEvidenceSubmission> & {
    readonly caseId: string;
  },
): ProtocolizationEvidenceSubmission {
  return {
    intakeId: 'intake-0001',
    materialId: 'material-0001',
    categoryId: TEST_CATEGORY_DOCUMENT,
    pathway: EvidenceIntakePathway.Reference,
    evidenceRef: TEST_EVIDENCE_ID,
    requirementIds: ['evidence.provenance.minimum'],
    ...overrides,
  } as ProtocolizationEvidenceSubmission;
}

/**
 * A test-only "adapter": it turns a source-shaped observation into a
 * submission.
 *
 * There is no `EvidenceIntakeAdapter` port in the production package, and this
 * is why one is not needed. `ProtocolizationEvidenceSubmission` *is* the
 * boundary: anything that can produce one — a registry client, an upload
 * handler, a credential presentation reader — plugs in, and the intake
 * operation is identical for all of them. Normalization lives in the
 * composition layer where the I/O lives, not in a pure domain package.
 */
export function normalizeRegistryObservation(input: {
  readonly intakeId: string;
  readonly materialId: string;
  readonly caseId: string;
  readonly requirementIds: readonly string[];
  readonly evidenceRef: string;
  readonly lookup: CanonicalRegistryLookupResult;
}): ProtocolizationEvidenceSubmission {
  return {
    intakeId: input.intakeId,
    materialId: input.materialId,
    caseId: input.caseId,
    categoryId: TEST_CATEGORY_EXTERNAL_REGISTRY,
    pathway: EvidenceIntakePathway.Reference,
    evidenceRef: input.evidenceRef,
    requirementIds: input.requirementIds,
    // The registry said when it looked. The vertical says when it received.
    observedAt: input.lookup.observedAt,
    sourceRef: {
      kind: ReferenceSourceKind.Registry,
      value: input.lookup.registryRef.namespace,
    },
  };
}
