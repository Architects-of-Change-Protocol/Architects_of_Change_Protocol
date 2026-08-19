import {
  AttestationType,
  ClaimType,
  EvidenceType,
  PrincipalKind,
  ReferenceSourceKind,
} from '@aoc/protocol/claims';
import type { CanonicalClaim, CanonicalPrincipalRef, CanonicalReferenceSource } from '@aoc/protocol/claims';

import {
  ASSET_PROFILE_SCHEMA_VERSION,
  AssetIdentityStrategy,
  AssetProfileScope,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
  DeclarationPathway,
} from '@aoc/asset-protocolization';
import type { AssetProfile, ProtocolizationDeclarationSubmission } from '@aoc/asset-protocolization';

/**
 * Test-only fixtures for the declaration slice.
 *
 * Nothing here is a product contract, a jurisdiction, a registry, a profession
 * or an asset class. Every declarant below is an abstract principal and every
 * proposition an abstract token: they exist to prove that fundamentally
 * different *kinds of assertion* — authorship-like, authority-like,
 * correspondence-like — reach the same operation without it knowing, or being
 * able to ask, what any of them is about.
 *
 * Note what is **not** here: an enum of declaration kinds. A new category of
 * declaration is a profile that names `ClaimType.Custom` plus a `claimSubtype`
 * token, which is why the profiles below are the only place a new proposition
 * family is introduced.
 */

/** Abstract declarants. None of them is authenticated, resolved or authorized. */
export const TEST_DECLARANT_A: CanonicalPrincipalRef = {
  id: 'test-principal-0001',
  kind: PrincipalKind.Human,
  displayName: 'Test declarant A',
};

export const TEST_DECLARANT_B: CanonicalPrincipalRef = {
  id: 'test-principal-0002',
  kind: PrincipalKind.Human,
  displayName: 'Test declarant B',
};

export const TEST_DECLARANT_ORGANIZATION: CanonicalPrincipalRef = {
  id: 'test-principal-0003',
  kind: PrincipalKind.Organization,
};

/**
 * A participant whose canonical identity has not been resolved yet.
 *
 * Admissible on purpose: "an unresolved principal asserted X" is the honest
 * record when identity resolution has not happened, and it is a first-class
 * case in progressive protocolization rather than a defect.
 */
export const TEST_DECLARANT_UNKNOWN: CanonicalPrincipalRef = {
  id: 'test-principal-0004',
  kind: PrincipalKind.Unknown,
};

export const TEST_CLAIM_ID = 'aoc:claim:c1111111-1111-4111-8111-111111111111';
export const TEST_SECOND_CLAIM_ID = 'aoc:claim:c2222222-2222-4222-8222-222222222222';
export const TEST_THIRD_CLAIM_ID = 'aoc:claim:c3333333-3333-4333-8333-333333333333';
export const TEST_FOURTH_CLAIM_ID = 'aoc:claim:c4444444-4444-4444-8444-444444444444';

export const TEST_ASSERTION_ID = 'aoc:assertion:a1111111-1111-4111-8111-111111111111';

export const TEST_DECLARATION_SOURCE: CanonicalReferenceSource = {
  kind: ReferenceSourceKind.InternalId,
  value: 'test://declarations/intake/0001',
  label: 'Test declaration channel',
};

/**
 * A `CanonicalClaim`, constructed *by the test* rather than by the production
 * package.
 *
 * That is the point of the `Canonical` pathway: a caller that legitimately
 * holds a Protocol claim record may hand it over, and the operation reads its
 * `id` and `type` and then discards it. The production package never constructs
 * one of these, because doing so would require minting a canonical record id
 * *and* an `assertionRef` naming a `CanonicalAssertion` that would not exist.
 *
 * Note `attestationRefs: []`. An empty list is the honest state of a claim
 * nobody has attested — and it is exactly why a declaration is not an
 * attestation.
 */
export function testCanonicalClaim(overrides: Partial<CanonicalClaim> = {}): CanonicalClaim {
  return {
    id: TEST_CLAIM_ID,
    type: ClaimType.Authorship,
    subject: 'test-subject-0001',
    issuer: { id: TEST_DECLARANT_A.id, kind: PrincipalKind.Human },
    assertionRef: TEST_ASSERTION_ID,
    evidenceRefs: [],
    attestationRefs: [],
    issuedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Builds a `Reference`-pathway submission with sensible test defaults. */
export function referencedDeclaration(
  overrides: Partial<ProtocolizationDeclarationSubmission> & { readonly caseId: string },
): ProtocolizationDeclarationSubmission {
  return {
    declarationId: 'declaration-0001',
    materialId: 'material-d001',
    declarant: TEST_DECLARANT_A,
    pathway: DeclarationPathway.Reference,
    claimRef: TEST_CLAIM_ID,
    claimType: ClaimType.Authorship,
    requirementIds: ['declaration.authorship.required'],
    ...overrides,
  } as ProtocolizationDeclarationSubmission;
}

/** Builds a `Canonical`-pathway submission carrying a claim document. */
export function canonicalDeclaration(
  overrides: Partial<ProtocolizationDeclarationSubmission> & { readonly caseId: string },
): ProtocolizationDeclarationSubmission {
  return {
    declarationId: 'declaration-0001',
    materialId: 'material-d001',
    declarant: TEST_DECLARANT_A,
    pathway: DeclarationPathway.Canonical,
    claim: testCanonicalClaim(),
    requirementIds: ['declaration.authorship.required'],
    ...overrides,
  } as ProtocolizationDeclarationSubmission;
}

/**
 * A profile whose declaration requirements are *authority-like* and
 * *correspondence-like*, expressed entirely through `ClaimType` +
 * `claimSubtype`.
 *
 * This is the mechanism the whole slice rests on: a new kind of declaration is
 * a new profile, never a new enum member and never a change to this package or
 * to AOC Protocol. `subject-correspondence` below is a proposition family that
 * nothing in production code has heard of, and it works.
 */
export const TEST_DECLARATION_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.declaration.v1',
  version: '1.0.0',
  assetCategory: 'test.category.declaration',
  scope: AssetProfileScope.Global,
  jurisdictions: [{ code: 'GLOBAL' }],
  requirements: [
    {
      id: 'identity.content.required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Required,
      acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'declaration.authorship.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
      metadata: {
        reason: 'Test-only. Requiring an authorship declaration never establishes authorship.',
      },
    },
    {
      /**
       * A second requirement in the *same* proposition family, so tests can
       * prove that correlating one declaration to several declaration
       * requirements is still permitted — the kind rule is "every correlated
       * requirement is a Declaration requirement", not "exactly one".
       *
       * `Optional`, so it stays out of the pending-material projection.
       */
      id: 'declaration.authorship.secondary',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Optional,
      claimType: ClaimType.Authorship,
      minimumCount: 1,
    },
    {
      /**
       * "Actor A states that Actor A may act for Entity B."
       *
       * Requiring this records an assertion of representation. It resolves no
       * delegation, validates no mandate and grants no capability.
       */
      id: 'declaration.representation.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorization,
      minimumCount: 1,
    },
    {
      /**
       * "This external entry corresponds to this subject."
       *
       * A proposition family invented purely by this fixture, carried by
       * `ClaimType.Custom` plus a vertical subtype token. No production code
       * knows it exists.
       */
      id: 'declaration.correspondence.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Custom,
      claimSubtype: 'test.declaration.subject-correspondence',
      minimumCount: 1,
    },
    /**
     * Three non-declaration requirements, one per remaining APV-03 kind that a
     * declaration might plausibly be mis-filed against. They exist so the
     * mixed-kind regression tests use requirement kinds that genuinely exist in
     * APV-03 rather than invented ones. All `Optional`, so they stay out of the
     * pending-material projection.
     */
    {
      id: 'evidence.supporting.optional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [EvidenceType.Document],
      minimumCount: 1,
    },
    {
      id: 'verification.declared.integrity',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Optional,
      checkIds: ['check.declared.consistency'],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'attestation.declared.review',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Optional,
      acceptedTypes: [AttestationType.Human],
      minimumCount: 1,
    },
    {
      id: 'declaration.supplementary.conditional',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Conditional,
      condition: {
        conditionId: 'test.condition.supplementary-declaration',
        dependsOn: ['identity.content.required'],
      },
      claimType: ClaimType.Custom,
      claimSubtype: 'test.declaration.supplementary',
      minimumCount: 1,
    },
  ],
  metadata: {
    label: 'Test declaration shape',
    description: 'Test-only fixture. Not a product profile.',
  },
};

/**
 * A profile whose *only* declaration requirements are the two above, used to
 * prove that a case whose declaration material is complete is still not ready.
 */
export const TEST_DECLARATION_ONLY_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.declaration-only.v1',
  version: '1.0.0',
  assetCategory: 'test.category.declaration-only',
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
      id: 'declaration.representation.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorization,
      minimumCount: 1,
    },
  ],
};

/**
 * A later version of the same line, declaring a requirement `1.0.0` does not.
 *
 * Used to prove that publishing a new version leaves an existing case on the
 * version it pinned: a declaration correlated to a requirement that exists only
 * here must fail for a case pinned to `1.0.0`.
 */
export const TEST_DECLARATION_SHAPE_V1_AT_2_0_0: AssetProfile = {
  ...TEST_DECLARATION_SHAPE_V1,
  version: '2.0.0',
  requirements: [
    ...TEST_DECLARATION_SHAPE_V1.requirements,
    {
      id: 'declaration.successor.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Custom,
      claimSubtype: 'test.declaration.successor',
      minimumCount: 1,
    },
  ],
};

/**
 * Narrows an `AdapterResult` returned by the in-memory repository.
 *
 * The port is deliberately `T | Promise<T>` so a database-backed adapter can
 * satisfy it; the in-memory reference implementation is synchronous, and these
 * tests assert on its values directly.
 */
export function sync<T>(result: T | Promise<T>): T {
  return result as T;
}
