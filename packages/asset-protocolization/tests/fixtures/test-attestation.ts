import {
  AttestationType,
  ClaimType,
  CredentialStatus,
  CredentialType,
  EvidenceType,
  PrincipalKind,
  ProofType,
  ReferenceSourceKind,
} from '@aoc/protocol/claims';
import type {
  CanonicalCredentialRef,
  CanonicalPrincipalRef,
  CanonicalProofRef,
} from '@aoc/protocol/claims';
import { ContentDigestAlgorithm } from '@aoc/protocol/identity';

import {
  ASSET_PROFILE_SCHEMA_VERSION,
  AssetIdentityStrategy,
  AssetProfileScope,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
  BUILT_IN_VERIFICATION_CHECKS,
  DeclarationPathway,
  EvidenceIntakePathway,
  ProfessionalReviewBasisKind,
  createAssetProfileCatalog,
  createProtocolizationCase,
  createVerificationCheckRegistry,
  intakeProtocolizationEvidence,
  recordProtocolizationDeclaration,
  runProtocolizationVerification,
} from '@aoc/asset-protocolization';
import type {
  AssetProfile,
  AssetProfileCatalog,
  AttestationSigner,
  AttestationSigningRequest,
  EvidenceIntakeReceipt,
  ProfessionalReviewContext,
  ProfessionalReviewScope,
  ProtocolizationCase,
  ProtocolizationCaseSubject,
  ProtocolizationDeclarationRecord,
  ProtocolizationVerificationResult,
} from '@aoc/asset-protocolization';

import { TENANT_A, createTestClock } from './test-cases';
import type { TestClock } from './test-cases';
import { TEST_CLAIM_ID, TEST_SECOND_CLAIM_ID } from './test-declarations';
import { TEST_CATEGORY_PROFESSIONAL, TEST_EVIDENCE_ID } from './test-evidence';
import {
  TEST_CHECK_FAIL,
  TEST_CHECK_MANUAL_REVIEW,
  TEST_CHECK_PASS,
  TEST_CHECK_UNAVAILABLE,
  TEST_CHECK_WARNING,
  TEST_VERIFICATION_CHECKS,
} from './test-verification';

/**
 * Test-only fixtures for the professional attestation workflow.
 *
 * Nothing here is a product contract, a jurisdiction, a registry, a profession
 * or a legal role. Every profile is an abstract shape and every reviewer an
 * abstract principal: they exist to prove that the workflow handles
 * fundamentally different subjects and constraints without knowing, or being
 * able to ask, what any of them is.
 *
 * `test.role.reviewer` in particular is deliberately meaningless. No production
 * code reads it, and that is the point — a real profession later is a profile's
 * configuration, not a change to this package.
 */

// ---------------------------------------------------------------------------
// Reviewers and credentials
// ---------------------------------------------------------------------------

export const TEST_REVIEWER_HUMAN: CanonicalPrincipalRef = {
  id: 'aoc:principal:reviewer-human-0001',
  kind: PrincipalKind.Human,
  displayName: 'Test Reviewer A',
};

export const TEST_REVIEWER_SECOND_HUMAN: CanonicalPrincipalRef = {
  id: 'aoc:principal:reviewer-human-0002',
  kind: PrincipalKind.Human,
  displayName: 'Test Reviewer B',
};

export const TEST_REVIEWER_ORGANIZATION: CanonicalPrincipalRef = {
  id: 'aoc:principal:reviewer-org-0001',
  kind: PrincipalKind.Organization,
};

/** A reviewer of a kind the primary fixture requirement does not accept. */
export const TEST_REVIEWER_SYSTEM: CanonicalPrincipalRef = {
  id: 'aoc:principal:reviewer-system-0001',
  kind: PrincipalKind.System,
};

export const TEST_PROFESSIONAL_CREDENTIAL: CanonicalCredentialRef = {
  id: 'aoc:credential:professional-0001',
  type: CredentialType.ProfessionalCredential,
};

/** Same credential, carrying a *declared* status. Declared is never verified. */
export const TEST_ACTIVE_PROFESSIONAL_CREDENTIAL: CanonicalCredentialRef = {
  id: 'aoc:credential:professional-0002',
  type: CredentialType.ProfessionalCredential,
  status: { status: CredentialStatus.Active },
};

export const TEST_REVOKED_PROFESSIONAL_CREDENTIAL: CanonicalCredentialRef = {
  id: 'aoc:credential:professional-0003',
  type: CredentialType.ProfessionalCredential,
  status: { status: CredentialStatus.Revoked },
};

/** A credential of a type the primary fixture requirement does not accept. */
export const TEST_IDENTITY_CREDENTIAL: CanonicalCredentialRef = {
  id: 'aoc:credential:identity-0001',
  type: CredentialType.IdentityCredential,
};

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

export const TEST_ATTESTATION_ID = 'aoc:attestation:at111111-1111-4111-8111-111111111111';
export const TEST_SECOND_ATTESTATION_ID = 'aoc:attestation:at222222-2222-4222-8222-222222222222';
export const TEST_ATTESTATION_ASSET_ID = 'aoc:sovereign-asset:a8888888-8888-4888-8888-888888888888';
export const TEST_ATTESTATION_EXTERNAL_ASSET_ID =
  'aoc:sovereign-asset:b9999999-9999-4999-8999-999999999999';

export const TEST_PRIMARY_ATTESTATION_REQUIREMENT = 'attestation.primary.required';
export const TEST_SECONDARY_ATTESTATION_REQUIREMENT = 'attestation.secondary.optional';
export const TEST_REVIEW_VERIFICATION_REQUIREMENT = 'verification.review.outcomes';

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

/** Shape A — a subject with a canonical byte representation. */
export const TEST_ATTESTATION_CONTENT_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: { sovereignAssetId: TEST_ATTESTATION_ASSET_ID },
  contentIdentity: { algorithm: ContentDigestAlgorithm.Sha256, digest: 'b'.repeat(64) },
};

/** Shape B — a subject named only inside an external namespace. Deliberately no bytes. */
export const TEST_ATTESTATION_EXTERNAL_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: {
    sovereignAssetId: TEST_ATTESTATION_EXTERNAL_ASSET_ID,
    externalReference: { namespace: 'test.namespace.external', id: 'test-entry-7001' },
  },
};

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

const REVIEW_VERIFICATION_REQUIREMENT = {
  id: TEST_REVIEW_VERIFICATION_REQUIREMENT,
  kind: AssetRequirementKind.Verification,
  obligation: AssetRequirementObligation.Optional,
  // Every one of the five APV-07 outcomes, so a packet built over this profile
  // genuinely contains a Pass, a Fail, a Warning, a ManualReview and an
  // Unavailable rather than hand-written result documents.
  checkIds: [
    TEST_CHECK_PASS,
    TEST_CHECK_FAIL,
    TEST_CHECK_WARNING,
    TEST_CHECK_MANUAL_REVIEW,
    TEST_CHECK_UNAVAILABLE,
  ],
  satisfaction: AssetRequirementSatisfaction.All,
} as const;

/**
 * The primary abstract shape.
 *
 * It carries one requirement of every APV-03 kind, so the mixed-kind regression
 * tests name requirement kinds that genuinely exist, and **two** attestation
 * requirements, so the independence proofs are not hypothetical.
 */
export const TEST_ATTESTATION_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.attestation.v1',
  version: '1.0.0',
  assetCategory: 'test.category.attestation',
  scope: AssetProfileScope.Global,
  jurisdictions: [{ code: 'GLOBAL' }],
  requirements: [
    {
      id: 'identity.content.required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Optional,
      acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: 'evidence.supporting.optional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [EvidenceType.Document, EvidenceType.Certification],
      minimumCount: 1,
    },
    REVIEW_VERIFICATION_REQUIREMENT,
    {
      id: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [AttestationType.Human],
      minimumCount: 1,
      jurisdictions: [{ code: 'GLOBAL' }],
      attester: {
        acceptedPrincipalKinds: [PrincipalKind.Human],
        // An opaque token this package cannot and must not interpret.
        acceptedRoles: ['test.role.reviewer'],
        jurisdictions: [{ code: 'GLOBAL' }],
        credential: { acceptedTypes: [CredentialType.ProfessionalCredential] },
      },
      metadata: {
        reason: 'Test-only. Requiring an attestation never establishes that anything is true.',
      },
    },
    {
      /**
       * A second attestation requirement, deliberately with different accepted
       * types and no attester constraint at all, so tests can prove the two are
       * reviewed independently and never collapse into one flag.
       */
      id: TEST_SECONDARY_ATTESTATION_REQUIREMENT,
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [AttestationType.Organization, AttestationType.Human],
      minimumCount: 1,
    },
  ],
  metadata: {
    label: 'Test attestation shape',
    description: 'Test-only fixture. Not a product profile.',
  },
};

/**
 * The same profile *line*, later version, same attestation requirement id —
 * and different professional requirements.
 *
 * This is what makes the pinning proof meaningful: a `1.0.0`-pinned case must
 * keep reviewing under `1.0.0`'s accepted types and credential constraint while
 * `2.0.0` sits right beside it in the catalogue.
 */
export const TEST_ATTESTATION_SHAPE_V1_AT_2_0_0: AssetProfile = {
  ...TEST_ATTESTATION_SHAPE_V1,
  version: '2.0.0',
  requirements: [
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      // Narrowed to Organization only, and a different credential type.
      acceptedTypes: [AttestationType.Organization],
      minimumCount: 1,
      attester: {
        acceptedPrincipalKinds: [PrincipalKind.Organization],
        credential: { acceptedTypes: [CredentialType.CertificationCredential] },
      },
    },
  ],
};

/**
 * A shape whose attester credential constraint names acceptable *declared*
 * statuses, so the status-compatibility proof has something mechanical to
 * check. It still establishes nothing about whether the credential is genuinely
 * active.
 */
export const TEST_ATTESTATION_STATUS_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.attestation-status.v1',
  version: '1.0.0',
  assetCategory: 'test.category.attestation',
  scope: AssetProfileScope.Global,
  requirements: [
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: 'evidence.supporting.optional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [EvidenceType.Document, EvidenceType.Certification],
      minimumCount: 1,
    },
    {
      id: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [AttestationType.Human],
      attester: {
        credential: {
          acceptedTypes: [CredentialType.ProfessionalCredential],
          acceptedStatuses: [CredentialStatus.Active],
        },
      },
    },
  ],
};

/**
 * A shape with no attester constraint whatsoever, used to prove that a profile
 * which asks for nothing mechanical gets nothing mechanical enforced — and that
 * the workflow still records a fully scoped, fully identified decision.
 */
export const TEST_ATTESTATION_OPEN_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.attestation-open.v1',
  version: '1.0.0',
  assetCategory: 'test.category.attestation',
  scope: AssetProfileScope.Global,
  requirements: [
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: 'evidence.supporting.optional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [EvidenceType.Document, EvidenceType.Certification],
      minimumCount: 1,
    },
    {
      id: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [AttestationType.Human, AttestationType.Organization],
    },
  ],
};

// ---------------------------------------------------------------------------
// Composition helpers
// ---------------------------------------------------------------------------

export function createAttestationCatalog(): AssetProfileCatalog {
  return createAssetProfileCatalog([
    TEST_ATTESTATION_SHAPE_V1,
    TEST_ATTESTATION_SHAPE_V1_AT_2_0_0,
    TEST_ATTESTATION_STATUS_SHAPE_V1,
    TEST_ATTESTATION_OPEN_SHAPE_V1,
  ]);
}

/**
 * A deterministic test signer.
 *
 * It lives here, in tests, and deliberately not in `src/`. It performs no
 * cryptography: it returns a `CanonicalProofRef` whose source names the
 * attestation it was asked about, which is exactly enough to prove that the
 * port is wired, that the reference travels onto the attestation, and that
 * nothing in production code invents one. A real signer is an infrastructure
 * binding with its own owner.
 */
export function createTestAttestationSigner(): AttestationSigner & {
  readonly calls: AttestationSigningRequest[];
} {
  const calls: AttestationSigningRequest[] = [];
  return {
    calls,
    sign(request: AttestationSigningRequest): CanonicalProofRef {
      calls.push(request);
      return {
        id: `test-proof-${request.attestationId}`,
        type: ProofType.SignatureProof,
        source: { kind: ReferenceSourceKind.InternalId, value: `test-signer:${request.decisionId}` },
        description: 'Test-only deterministic proof reference. No cryptography was performed.',
      };
    },
  };
}

/** A signer that cannot sign. Proves an attestation is refused rather than faked. */
export function createFailingAttestationSigner(): AttestationSigner {
  return {
    sign(): CanonicalProofRef {
      throw new Error('test signer is unavailable');
    },
  };
}

export interface ReviewTestContext extends ProfessionalReviewContext {
  readonly clock: TestClock;
}

export function createReviewContext(
  options: {
    readonly tenantId?: string;
    readonly catalog?: AssetProfileCatalog;
    readonly clock?: TestClock;
    readonly signer?: AttestationSigner;
  } = {},
): ReviewTestContext {
  return {
    catalog: options.catalog ?? createAttestationCatalog(),
    clock: options.clock ?? createTestClock(),
    tenantId: options.tenantId ?? TENANT_A,
    ...(options.signer === undefined ? {} : { signer: options.signer }),
  };
}

/** Everything a review basis is built from, returned together. */
export interface ReviewableCase {
  readonly protocolizationCase: ProtocolizationCase;
  readonly receipts: readonly EvidenceIntakeReceipt[];
  readonly declarations: readonly ProtocolizationDeclarationRecord[];
  readonly verificationResults: readonly ProtocolizationVerificationResult[];
}

/**
 * Builds a case that has actually been through APV-05, APV-06 and APV-07.
 *
 * Deliberately not hand-written records: the receipts, the declarations and the
 * verification results below are produced by the real operations of the earlier
 * slices, so a packet built over them proves reuse rather than resemblance.
 */
export async function buildReviewableCase(
  context: ReviewTestContext,
  options: {
    readonly caseId?: string;
    readonly profileId?: string;
    readonly profileVersion?: string;
    readonly subject?: ProtocolizationCaseSubject;
    readonly runVerification?: boolean;
  } = {},
): Promise<ReviewableCase> {
  const created = createProtocolizationCase(context, {
    caseId: options.caseId ?? 'case-review-0001',
    profile: {
      profileId: options.profileId ?? TEST_ATTESTATION_SHAPE_V1.profileId,
      profileVersion: options.profileVersion ?? '1.0.0',
    },
    subject: options.subject ?? TEST_ATTESTATION_CONTENT_SUBJECT,
  });

  context.clock.advance(60);
  const declared = recordProtocolizationDeclaration(context, created.protocolizationCase, {
    declarationId: 'declaration-review-0001',
    caseId: created.protocolizationCase.caseId,
    materialId: 'material-declaration-0001',
    declarant: {
      id: 'aoc:principal:declarant-0001',
      kind: PrincipalKind.Human,
      displayName: 'Test Declarant',
    },
    pathway: DeclarationPathway.Reference,
    claimRef: TEST_CLAIM_ID,
    claimType: ClaimType.Authorship,
    requirementIds: ['declaration.authorship.required'],
    statement: 'Test-only declaration statement.',
  } as never);

  context.clock.advance(60);
  const received = intakeProtocolizationEvidence(context, declared.protocolizationCase, {
    intakeId: 'intake-review-0001',
    caseId: declared.protocolizationCase.caseId,
    materialId: 'material-evidence-0001',
    categoryId: TEST_CATEGORY_PROFESSIONAL,
    pathway: EvidenceIntakePathway.Reference,
    evidenceRef: TEST_EVIDENCE_ID,
    requirementIds: ['evidence.supporting.optional'],
  } as never);

  const protocolizationCase = received.protocolizationCase;
  if (options.runVerification === false) {
    return {
      protocolizationCase,
      receipts: [received.receipt],
      declarations: [declared.record],
      verificationResults: [],
    };
  }

  context.clock.advance(60);
  const run = await runProtocolizationVerification(
    {
      catalog: context.catalog,
      clock: context.clock,
      tenantId: context.tenantId,
      checks: createVerificationCheckRegistry([
        ...BUILT_IN_VERIFICATION_CHECKS,
        ...TEST_VERIFICATION_CHECKS,
      ]),
    },
    protocolizationCase,
    {
      executionIds: [
        'execution-review-0001',
        'execution-review-0002',
        'execution-review-0003',
        'execution-review-0004',
        'execution-review-0005',
      ],
      evidenceReceipts: [received.receipt],
      declarations: [declared.record],
    },
  );

  return {
    protocolizationCase,
    receipts: [received.receipt],
    declarations: [declared.record],
    verificationResults: run.results,
  };
}

/** A well-formed scope for the primary attestation requirement of one case. */
export function primaryScope(
  protocolizationCase: ProtocolizationCase,
  overrides: Partial<ProfessionalReviewScope> = {},
): ProfessionalReviewScope {
  return {
    requirementId: TEST_PRIMARY_ATTESTATION_REQUIREMENT,
    attestationType: AttestationType.Human,
    subjectRef: protocolizationCase.subject.subjectRef,
    caseRevision: protocolizationCase.revision,
    propositionRefs: [{ kind: ProfessionalReviewBasisKind.ClaimRecord, ref: TEST_CLAIM_ID }],
    scopeStatement: 'Test-only: reviewed the authorship declaration and its stated basis.',
    limitations: ['Test-only limitation. Establishes nothing outside this scope.'],
    ...overrides,
  };
}

/** A well-formed scope for the secondary attestation requirement of one case. */
export function secondaryScope(
  protocolizationCase: ProtocolizationCase,
  overrides: Partial<ProfessionalReviewScope> = {},
): ProfessionalReviewScope {
  return {
    requirementId: TEST_SECONDARY_ATTESTATION_REQUIREMENT,
    attestationType: AttestationType.Organization,
    subjectRef: protocolizationCase.subject.subjectRef,
    caseRevision: protocolizationCase.revision,
    propositionRefs: [{ kind: ProfessionalReviewBasisKind.ClaimRecord, ref: TEST_SECOND_CLAIM_ID }],
    ...overrides,
  };
}

/** The basis references a reviewer typically records for the fixture case. */
export function reviewedRefs(
  basis: ReviewableCase,
): readonly { readonly kind: string; readonly ref: string }[] {
  return [
    { kind: ProfessionalReviewBasisKind.DeclarationRecord, ref: basis.declarations[0]!.declarationId },
    { kind: ProfessionalReviewBasisKind.IntakeReceipt, ref: basis.receipts[0]!.intakeId },
    ...basis.verificationResults.map((result) => ({
      kind: ProfessionalReviewBasisKind.VerificationResult,
      ref: result.executionId,
    })),
  ];
}
