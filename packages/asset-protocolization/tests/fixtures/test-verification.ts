import {
  AttestationType,
  ClaimType,
  CredentialType,
  EvidenceType,
  PrincipalKind,
  RegistryAuthorityLevel,
  RegistryEntryType,
  RegistryType,
} from '@aoc/protocol/claims';
import type { CanonicalClaim, CanonicalClaimId, CanonicalRegistryEntryRef } from '@aoc/protocol/claims';
import { computeContentIdentity } from '@aoc/protocol/identity';
import type { ContentIdentity } from '@aoc/protocol/identity';

import {
  ASSET_PROFILE_SCHEMA_VERSION,
  AssetIdentityStrategy,
  AssetProfileScope,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
  BUILT_IN_VERIFICATION_CHECKS,
  VerificationCheckOutcome,
  VerificationResolutionStatus,
  createAssetProfileCatalog,
  createVerificationCheckRegistry,
} from '@aoc/asset-protocolization';
import type {
  AssetProfile,
  AssetProfileCatalog,
  AssetVerificationCheck,
  ProtocolizationCaseSubject,
  ProtocolizationVerificationContext,
  VerificationCheckContext,
  VerificationCheckExecution,
  VerificationCheckRegistry,
  VerificationClaimResolver,
  VerificationContentResolver,
  VerificationResolvers,
} from '@aoc/asset-protocolization';

import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1, TEST_PROFILE_V1 } from './test-profiles';
import {
  TEST_DECLARATION_ONLY_SHAPE_V1,
  TEST_DECLARATION_SHAPE_V1,
  TEST_DECLARATION_SHAPE_V1_AT_2_0_0,
} from './test-declarations';
import {
  TEST_CONDITIONAL_SHAPE_V1,
  TEST_PROFILE_V1_AT_2_0_0,
  TENANT_A,
  createTestClock,
} from './test-cases';
import type { TestClock } from './test-cases';

/**
 * Test-only fixtures for the verification pipeline.
 *
 * Nothing here is a product contract, a jurisdiction, a registry, a profession,
 * an asset class or a real check. Every profile below is an abstract shape and
 * every check an abstract executor: they exist to prove that fundamentally
 * different *kinds of subject* — one with bytes, one named only in an external
 * namespace — reach the same engine without it knowing, or being able to ask,
 * what either of them is.
 *
 * The test checks in particular are the point of the slice. `test.check.pass`,
 * `test.check.fail` and their siblings are registered by tests, executed through
 * the same registry as the production library, and the engine cannot tell the
 * difference — which is exactly what "adding a check requires no engine change"
 * has to mean.
 */

// ---------------------------------------------------------------------------
// Abstract check ids
// ---------------------------------------------------------------------------

/**
 * These are **test fixtures, not a vocabulary**. There is no enum of check ids
 * anywhere in the production package: a check id is an opaque dotted token
 * (APV-03), so a real check later is a registration, not a code change, and
 * certainly not a Protocol change.
 */
export const TEST_CHECK_ALPHA = 'test.check.alpha';
export const TEST_CHECK_BETA = 'test.check.beta';
export const TEST_CHECK_GAMMA = 'test.check.gamma';
export const TEST_CHECK_PASS = 'test.check.pass';
export const TEST_CHECK_FAIL = 'test.check.fail';
export const TEST_CHECK_WARNING = 'test.check.warning';
export const TEST_CHECK_MANUAL_REVIEW = 'test.check.manual-review';
export const TEST_CHECK_UNAVAILABLE = 'test.check.unavailable';
export const TEST_CHECK_ASYNC = 'test.check.async';
/** Declared by a fixture profile and deliberately never registered. */
export const TEST_CHECK_UNREGISTERED = 'test.check.unregistered';
/** A check nobody anticipated. Proves the registry is genuinely open. */
export const TEST_CHECK_FUTURE_SOURCE = 'test.check.future-source';

// ---------------------------------------------------------------------------
// Test check implementations
// ---------------------------------------------------------------------------

function constantCheck(
  checkId: string,
  execution: VerificationCheckExecution,
): AssetVerificationCheck {
  return { checkId, execute: () => execution };
}

export const testAlphaCheck = constantCheck(TEST_CHECK_ALPHA, {
  outcome: VerificationCheckOutcome.Pass,
  reasonCode: 'test.alpha.satisfied',
});

export const testBetaCheck = constantCheck(TEST_CHECK_BETA, {
  outcome: VerificationCheckOutcome.Pass,
  reasonCode: 'test.beta.satisfied',
});

export const testGammaCheck = constantCheck(TEST_CHECK_GAMMA, {
  outcome: VerificationCheckOutcome.Pass,
  reasonCode: 'test.gamma.satisfied',
});

export const testPassCheck = constantCheck(TEST_CHECK_PASS, {
  outcome: VerificationCheckOutcome.Pass,
  reasonCode: 'test.pass',
  summary: 'A test check whose pass condition is defined to hold.',
});

export const testFailCheck = constantCheck(TEST_CHECK_FAIL, {
  outcome: VerificationCheckOutcome.Fail,
  reasonCode: 'test.fail',
  summary: 'A test check whose failure condition is defined to hold.',
});

export const testWarningCheck = constantCheck(TEST_CHECK_WARNING, {
  outcome: VerificationCheckOutcome.Warning,
  reasonCode: 'test.warning',
  summary: 'A test check that found a non-fatal concern.',
});

export const testManualReviewCheck = constantCheck(TEST_CHECK_MANUAL_REVIEW, {
  outcome: VerificationCheckOutcome.ManualReview,
  reasonCode: 'test.ambiguous',
  summary: 'A test check that cannot responsibly conclude.',
});

export const testUnavailableCheck = constantCheck(TEST_CHECK_UNAVAILABLE, {
  outcome: VerificationCheckOutcome.Unavailable,
  reasonCode: 'dependency.unavailable',
  summary: 'A test check whose dependency could not be consulted.',
});

/** Proves the contract admits an asynchronous executor without the engine changing. */
export const testAsyncCheck: AssetVerificationCheck = {
  checkId: TEST_CHECK_ASYNC,
  execute: async () =>
    Promise.resolve({
      outcome: VerificationCheckOutcome.Pass,
      reasonCode: 'test.async.satisfied',
    }),
};

/**
 * A check written *after* the engine, consulting a port the engine knows nothing
 * about, registered without a line of production code changing.
 *
 * This is the extensibility proof: no Protocol change, no case-core change, no
 * engine change, no asset-category branch.
 */
export function createFutureSourceCheck(available: boolean): AssetVerificationCheck {
  return {
    checkId: TEST_CHECK_FUTURE_SOURCE,
    execute: async (context: VerificationCheckContext) =>
      Promise.resolve(
        available
          ? {
              outcome: VerificationCheckOutcome.Pass,
              reasonCode: 'test.future-source.observed',
              summary: `Observed at ${context.now}.`,
            }
          : {
              outcome: VerificationCheckOutcome.Unavailable,
              reasonCode: 'dependency.unavailable',
              summary: 'The future source could not be consulted.',
            },
      ),
  };
}

/** Returns something outside the closed outcome set. The engine must refuse it. */
export const testMalformedOutcomeCheck = {
  checkId: 'test.check.malformed-outcome',
  execute: () => ({ outcome: 'Excellent' }),
} as unknown as AssetVerificationCheck;

/** Returns a field the result model does not carry. The engine must refuse it. */
export const testUnknownFieldCheck = {
  checkId: 'test.check.unknown-field',
  execute: () => ({ outcome: VerificationCheckOutcome.Pass, verdict: 'READY' }),
} as unknown as AssetVerificationCheck;

/**
 * Throws. The engine must let it propagate rather than laundering a defect into
 * an `Unavailable` result.
 */
export const testThrowingCheck: AssetVerificationCheck = {
  checkId: 'test.check.throws',
  execute: () => {
    throw new TypeError('deliberate defect in a check implementation');
  },
};

/**
 * Every deterministic test check, ready to register.
 *
 * A deployment registers the production library alongside whatever it writes
 * itself, and the engine cannot tell the two apart — which is exactly what
 * "adding a check requires no engine change" has to mean. The default test
 * context therefore registers both.
 */
export const TEST_VERIFICATION_CHECKS: readonly AssetVerificationCheck[] = [
  testAlphaCheck,
  testBetaCheck,
  testGammaCheck,
  testPassCheck,
  testFailCheck,
  testWarningCheck,
  testManualReviewCheck,
  testUnavailableCheck,
  testAsyncCheck,
];

// ---------------------------------------------------------------------------
// Test resolvers
// ---------------------------------------------------------------------------

/** Resolves exactly the claims it was given; anything else is `NotFound`. */
export function createTestClaimResolver(
  claims: Readonly<Record<string, CanonicalClaim>>,
): VerificationClaimResolver {
  return {
    resolveClaim: (claimRef: CanonicalClaimId) => {
      const claim = claims[claimRef];
      return claim === undefined
        ? { status: VerificationResolutionStatus.NotFound }
        : { status: VerificationResolutionStatus.Resolved, claim };
    },
  };
}

/** A claim source that is down. Never `Fail` — the record is not in question. */
export const unavailableClaimResolver: VerificationClaimResolver = {
  resolveClaim: () => ({ status: VerificationResolutionStatus.Unavailable }),
};

/** Hands back exactly these bytes. No storage, no network, no filesystem. */
export function createTestContentResolver(bytes: Uint8Array): VerificationContentResolver {
  return {
    readContent: () => ({ status: VerificationResolutionStatus.Resolved, bytes }),
  };
}

export const unavailableContentResolver: VerificationContentResolver = {
  readContent: () => ({ status: VerificationResolutionStatus.Unavailable }),
};

export const TEST_CONTENT_BYTES = new Uint8Array([1, 2, 3, 4, 5]);
export const TEST_CONTENT_IDENTITY_FOR_BYTES: ContentIdentity =
  computeContentIdentity(TEST_CONTENT_BYTES);
export const TEST_OTHER_CONTENT_BYTES = new Uint8Array([9, 9, 9]);

// ---------------------------------------------------------------------------
// Abstract profile shapes
// ---------------------------------------------------------------------------

const CONTENT_IDENTITY_REQUIREMENT = {
  id: 'identity.content.required',
  kind: AssetRequirementKind.Identity,
  obligation: AssetRequirementObligation.Required,
  acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
  satisfaction: AssetRequirementSatisfaction.All,
} as const;

/**
 * Shape V — a content subject whose profile declares verification requirements
 * covering every outcome the model can produce.
 */
export const TEST_VERIFICATION_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification',
  scope: AssetProfileScope.Global,
  jurisdictions: [{ code: 'GLOBAL' }],
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: 'evidence.provenance.minimum',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [EvidenceType.Document, EvidenceType.SystemRecord],
      minimumCount: 1,
      freshness: { maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
    {
      id: 'attestation.professional.required',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [AttestationType.Human],
      minimumCount: 1,
      attester: {
        acceptedPrincipalKinds: [PrincipalKind.Human],
        credential: {
          acceptedTypes: [CredentialType.ProfessionalCredential],
          freshness: { mustNotBeExpired: true },
        },
      },
    },
    {
      /** One check, so a single-execution proof has an unambiguous target. */
      id: 'verification.alpha',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_ALPHA],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      /** Every outcome, on one requirement, so a batch produces all five. */
      id: 'verification.suite',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [
        TEST_CHECK_PASS,
        TEST_CHECK_FAIL,
        TEST_CHECK_WARNING,
        TEST_CHECK_MANUAL_REVIEW,
        TEST_CHECK_UNAVAILABLE,
      ],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
  metadata: { label: 'Test verification shape', description: 'Test-only fixture. Not a product profile.' },
};

/**
 * The same line at `2.0.0`, where `verification.alpha` declares a *different*
 * check. Used to prove a case pinned to `1.0.0` never starts executing `2.0.0`'s
 * checks once `2.0.0` is catalogued.
 */
export const TEST_VERIFICATION_SHAPE_V1_AT_2_0_0: AssetProfile = {
  ...TEST_VERIFICATION_SHAPE_V1,
  version: '2.0.0',
  requirements: TEST_VERIFICATION_SHAPE_V1.requirements.map((requirement) =>
    requirement.id === 'verification.alpha'
      ? { ...requirement, checkIds: [TEST_CHECK_BETA] }
      : requirement,
  ),
};

/**
 * One requirement of every APV-03 kind, plus a verification requirement.
 *
 * The mixed-kind regression fixture: executing a verification check against any
 * of the first four must be refused, and none of them may acquire verification
 * progress as a result.
 */
export const TEST_VERIFICATION_MIXED_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-mixed.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-mixed',
  scope: AssetProfileScope.Global,
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Optional,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: 'evidence.supporting.optional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [EvidenceType.Document],
      minimumCount: 1,
    },
    {
      id: 'attestation.review.optional',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [AttestationType.Human],
      minimumCount: 1,
    },
    {
      id: 'verification.alpha',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_ALPHA],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      /** A second verification requirement declaring the *same* check id. */
      id: 'verification.secondary',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_ALPHA, TEST_CHECK_BETA],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
};

/** Declares a check nothing registers. Used to prove the configuration failure is loud. */
export const TEST_VERIFICATION_UNREGISTERED_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-unregistered.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-unregistered',
  scope: AssetProfileScope.Global,
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'verification.unregistered',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_UNREGISTERED],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
};

/**
 * Every declared check passes, and a professional attestation is required.
 *
 * The hard acceptance fixture: all checks green must still leave the case
 * un-ready, un-approved and un-attested.
 */
export const TEST_VERIFICATION_ALL_PASS_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-all-pass.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-all-pass',
  scope: AssetProfileScope.Global,
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'attestation.professional.required',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [AttestationType.Human],
      minimumCount: 1,
      attester: {
        acceptedPrincipalKinds: [PrincipalKind.Human],
        credential: { acceptedTypes: [CredentialType.ProfessionalCredential] },
      },
    },
    {
      id: 'verification.alpha',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_PASS],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'verification.beta',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_ALPHA, TEST_CHECK_BETA],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
};

/** An abstract external registry. Custom type, external authority, no real-world identity. */
export const TEST_VERIFICATION_REGISTRY_ENTRY: CanonicalRegistryEntryRef = {
  id: 'test-registry-entry-9001',
  registryRef: {
    id: 'test-registry-9001',
    type: RegistryType.Custom,
    namespace: 'test.namespace.external-registry',
    authorityLevel: RegistryAuthorityLevel.External,
  },
  entryType: RegistryEntryType.Custom,
  locator: 'test/entry/9001',
};

/** A registry entry from a registry the constraint below does not accept. */
export const TEST_VERIFICATION_FOREIGN_REGISTRY_ENTRY: CanonicalRegistryEntryRef = {
  ...TEST_VERIFICATION_REGISTRY_ENTRY,
  id: 'test-registry-entry-9002',
  registryRef: {
    ...TEST_VERIFICATION_REGISTRY_ENTRY.registryRef,
    id: 'test-registry-9002',
    namespace: 'test.namespace.other-registry',
    authorityLevel: RegistryAuthorityLevel.SelfDeclared,
  },
};

/**
 * Shape W — a subject with no byte representation at all, identified only inside
 * an external namespace, running the *same* generic engine and the *same*
 * production checks.
 */
export const TEST_VERIFICATION_EXTERNAL_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-external.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-external-subject',
  scope: AssetProfileScope.Global,
  requirements: [
    {
      id: 'identity.content.not-required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.NotRequired,
      acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
      satisfaction: AssetRequirementSatisfaction.Any,
      metadata: { reason: 'The subject has no canonical byte representation.' },
    },
    {
      id: 'identity.external-registry.required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Required,
      acceptedStrategies: [
        AssetIdentityStrategy.RegistryEntry,
        AssetIdentityStrategy.ExternalReference,
      ],
      satisfaction: AssetRequirementSatisfaction.Any,
      registry: {
        acceptedTypes: [RegistryType.Custom],
        acceptedAuthorityLevels: [RegistryAuthorityLevel.External],
        acceptedEntryTypes: [RegistryEntryType.Custom],
        acceptedNamespaces: ['test.namespace.external-registry'],
      },
    },
    {
      id: 'verification.identity',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: ['check.identity.strategy', 'check.material.present', 'check.content.digest'],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
};

/**
 * Shape B — a content subject wired to the production check library, with a
 * minimum evidence count of two and a one-hour freshness window.
 */
export const TEST_VERIFICATION_BUILTIN_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-builtin.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-builtin',
  scope: AssetProfileScope.Global,
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      id: 'evidence.provenance.minimum',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [EvidenceType.Document, EvidenceType.SystemRecord],
      minimumCount: 2,
      freshness: { maxAgeSeconds: 3600 },
    },
    {
      id: 'verification.builtin',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [
        'check.material.present',
        'check.material.minimum-count',
        'check.identity.strategy',
        'check.evidence.freshness',
        'check.declaration.claim-type',
        'check.declaration.competing',
        'check.content.digest',
      ],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
};

/**
 * An `Optional` verification requirement beside a `Conditional` evidence
 * requirement, so tests can prove that an optional failure rejects nothing and
 * an unresolved condition is never silently passed.
 */
export const TEST_VERIFICATION_OPTIONAL_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-optional.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-optional',
  scope: AssetProfileScope.Global,
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'evidence.supplementary.conditional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Conditional,
      condition: {
        conditionId: 'test.condition.supplementary',
        dependsOn: ['identity.content.required'],
      },
      acceptedTypes: [EvidenceType.Document],
      minimumCount: 1,
    },
    {
      id: 'verification.optional',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Optional,
      checkIds: [TEST_CHECK_FAIL],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'verification.present',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: ['check.material.present'],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
};

/**
 * A malformed profile that declares one check id twice.
 *
 * `validateAssetProfile` rejects this shape, so it can only arise from a
 * reconstructed or corrupted document — which is exactly the case the engine
 * must fail loudly on rather than execute twice.
 */
export const TEST_VERIFICATION_DUPLICATE_SHAPE_V1 = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.verification-duplicate.v1',
  version: '1.0.0',
  assetCategory: 'test.category.verification-duplicate',
  scope: AssetProfileScope.Global,
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    {
      id: 'verification.duplicated',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: [TEST_CHECK_ALPHA, TEST_CHECK_ALPHA],
      satisfaction: AssetRequirementSatisfaction.All,
    },
  ],
} as unknown as AssetProfile;

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export const TEST_VERIFICATION_ASSET_ID = 'aoc:sovereign-asset:aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
export const TEST_VERIFICATION_EXTERNAL_ASSET_ID =
  'aoc:sovereign-asset:ffffffff-1111-4222-8333-444444444444';

/** A subject whose pinned content identity is the digest of `TEST_CONTENT_BYTES`. */
export const TEST_DIGESTIBLE_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: { sovereignAssetId: TEST_VERIFICATION_ASSET_ID },
  contentIdentity: TEST_CONTENT_IDENTITY_FOR_BYTES,
};

/** A subject named only inside an external namespace. Deliberately carries no bytes. */
export const TEST_VERIFICATION_EXTERNAL_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: {
    sovereignAssetId: TEST_VERIFICATION_EXTERNAL_ASSET_ID,
    externalReference: { namespace: 'test.namespace.external', id: 'test-entry-9001' },
  },
};

// ---------------------------------------------------------------------------
// Composition helpers
// ---------------------------------------------------------------------------

/**
 * Every profile the verification tests draw on, catalogued once.
 *
 * The catalogue holds `1.0.0` *and* `2.0.0` of the same line simultaneously,
 * which is what makes the pinning proof meaningful: a case must keep executing
 * `1.0.0`'s checks while `2.0.0` sits right beside it.
 */
export function createVerificationCatalog(): AssetProfileCatalog {
  return createAssetProfileCatalog([
    TEST_CONTENT_SHAPE_V1,
    TEST_EXTERNAL_SHAPE_V1,
    TEST_PROFILE_V1,
    TEST_PROFILE_V1_AT_2_0_0,
    TEST_CONDITIONAL_SHAPE_V1,
    TEST_DECLARATION_SHAPE_V1,
    TEST_DECLARATION_SHAPE_V1_AT_2_0_0,
    TEST_DECLARATION_ONLY_SHAPE_V1,
    TEST_VERIFICATION_SHAPE_V1,
    TEST_VERIFICATION_MIXED_SHAPE_V1,
    TEST_VERIFICATION_UNREGISTERED_SHAPE_V1,
    TEST_VERIFICATION_ALL_PASS_SHAPE_V1,
    TEST_VERIFICATION_EXTERNAL_SHAPE_V1,
    TEST_VERIFICATION_BUILTIN_SHAPE_V1,
    TEST_VERIFICATION_OPTIONAL_SHAPE_V1,
  ]);
}

export interface VerificationTestContext extends ProtocolizationVerificationContext {
  readonly clock: TestClock;
}

/**
 * Builds a verification context.
 *
 * Note what the composition layer supplies and the domain never does: the
 * catalogue, the clock, the acting tenant, the check registry and the resolver
 * ports. Nothing in `src/` constructs any of them.
 */
export function createVerificationContext(options: {
  readonly tenantId?: string;
  readonly catalog?: AssetProfileCatalog;
  readonly clock?: TestClock;
  readonly checks?: VerificationCheckRegistry;
  readonly resolvers?: VerificationResolvers;
} = {}): VerificationTestContext {
  return {
    catalog: options.catalog ?? createVerificationCatalog(),
    clock: options.clock ?? createTestClock(),
    tenantId: options.tenantId ?? TENANT_A,
    checks:
      options.checks ??
      createVerificationCheckRegistry([
        ...BUILT_IN_VERIFICATION_CHECKS,
        ...TEST_VERIFICATION_CHECKS,
      ]),
    ...(options.resolvers === undefined ? {} : { resolvers: options.resolvers }),
  };
}
