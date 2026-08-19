import { EvidenceType } from '@aoc/protocol/claims';
import { ContentDigestAlgorithm } from '@aoc/protocol/identity';
import type { ContentIdentity, SovereignSubjectRef } from '@aoc/protocol/identity';

import {
  ASSET_PROFILE_SCHEMA_VERSION,
  AssetIdentityStrategy,
  AssetProfileScope,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
  createAssetProfileCatalog,
} from '@aoc/asset-protocolization';
import type {
  AssetProfile,
  AssetProfileCatalog,
  ProtocolizationCaseContext,
  ProtocolizationCaseSubject,
  ProtocolizationClock,
} from '@aoc/asset-protocolization';

import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1, TEST_PROFILE_V1 } from './test-profiles';
import {
  TEST_DECLARATION_ONLY_SHAPE_V1,
  TEST_DECLARATION_SHAPE_V1,
  TEST_DECLARATION_SHAPE_V1_AT_2_0_0,
} from './test-declarations';

/**
 * Test-only fixtures for the `ProtocolizationCase` slice.
 *
 * As with `test-profiles.ts`, nothing here is a product contract. The profiles
 * are abstract shapes, the subjects are abstract subjects, and no identifier
 * names an asset category, a jurisdiction, a registry or a profession. They
 * exist to prove that one aggregate handles fundamentally different subject
 * shapes without knowing what either of them is.
 */

/**
 * A clock that only moves when a test moves it.
 *
 * The whole reason `ProtocolizationClock` is a port: a domain that read the
 * host clock could not be asserted against, and "the second operation stamped a
 * later instant than the first" would be a race rather than a property.
 */
export interface TestClock extends ProtocolizationClock {
  advance(seconds: number): void;
  set(instant: string): void;
}

export function createTestClock(start = '2026-01-01T00:00:00.000Z'): TestClock {
  let current = Date.parse(start);
  return {
    now: () => new Date(current).toISOString(),
    advance: (seconds: number) => {
      current += seconds * 1000;
    },
    set: (instant: string) => {
      current = Date.parse(instant);
    },
  };
}

/** A syntactically valid `SovereignAssetId`. Minted values would be non-deterministic. */
export const TEST_SOVEREIGN_ASSET_ID = 'aoc:sovereign-asset:11111111-2222-4333-8444-555555555555';
export const TEST_SECOND_SOVEREIGN_ASSET_ID = 'aoc:sovereign-asset:66666666-7777-4888-9999-aaaaaaaaaaaa';

export const TEST_CONTENT_IDENTITY: ContentIdentity = {
  algorithm: ContentDigestAlgorithm.Sha256,
  digest: 'a'.repeat(64),
};

/** Shape A — a subject with a canonical byte representation. */
export const TEST_CONTENT_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: { sovereignAssetId: TEST_SOVEREIGN_ASSET_ID },
  contentIdentity: TEST_CONTENT_IDENTITY,
};

/**
 * Shape B — a subject with no byte representation at all, named only by an
 * external namespace. Deliberately carries no `contentIdentity`.
 */
export const TEST_EXTERNAL_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: {
    sovereignAssetId: TEST_SECOND_SOVEREIGN_ASSET_ID,
    externalReference: { namespace: 'test.namespace.external', id: 'test-entry-0001' },
  },
};

/**
 * Shape C — a subject that is neither yet: identified only by its minted
 * sovereign id, because the material that will identify it has not arrived.
 * Proves that neither content identity nor an external reference is assumed.
 */
export const TEST_BARE_SUBJECT: ProtocolizationCaseSubject = {
  subjectRef: { sovereignAssetId: TEST_SOVEREIGN_ASSET_ID },
};

export const TEST_SUBJECT_REF: SovereignSubjectRef = TEST_CONTENT_SUBJECT.subjectRef;

/**
 * A second major version of `TEST_PROFILE_V1`'s line, used to prove that
 * publishing a new version leaves existing cases on the version they pinned.
 * Its requirement set differs deliberately, so a case that silently migrated
 * would be detectable by its projection rather than only by its pin.
 */
export const TEST_PROFILE_V1_AT_2_0_0: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: TEST_PROFILE_V1.profileId,
  version: '2.0.0',
  assetCategory: TEST_PROFILE_V1.assetCategory,
  scope: AssetProfileScope.Global,
  requirements: [
    {
      id: 'identity.content.required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Required,
      acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'identity.external.optional',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Optional,
      acceptedStrategies: [AssetIdentityStrategy.ExternalReference],
      satisfaction: AssetRequirementSatisfaction.Any,
    },
  ],
};

/**
 * A shape with a `Conditional` requirement, so the case tests can prove that an
 * unevaluated condition is reported as unresolved rather than collapsed into a
 * truth value. APV-03's fixtures declare none.
 */
export const TEST_CONDITIONAL_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.conditional.v1',
  version: '1.0.0',
  assetCategory: 'test.category.conditional',
  scope: AssetProfileScope.Global,
  requirements: [
    {
      id: 'identity.content.required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Required,
      acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
      satisfaction: AssetRequirementSatisfaction.All,
    },
    {
      id: 'evidence.supplementary.conditional',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Conditional,
      condition: {
        conditionId: 'test.condition.supplementary',
        dependsOn: ['identity.content.required'],
      },
      acceptedTypes: [EvidenceType.Document],
      acceptedSubtypes: ['test.subtype.supplementary'],
      minimumCount: 1,
    },
  ],
};

/** Every profile the case tests draw on, catalogued once. */
export function createTestCatalog(): AssetProfileCatalog {
  return createAssetProfileCatalog([
    TEST_CONTENT_SHAPE_V1,
    TEST_EXTERNAL_SHAPE_V1,
    TEST_PROFILE_V1,
    TEST_PROFILE_V1_AT_2_0_0,
    TEST_CONDITIONAL_SHAPE_V1,
    TEST_DECLARATION_SHAPE_V1,
    TEST_DECLARATION_SHAPE_V1_AT_2_0_0,
    TEST_DECLARATION_ONLY_SHAPE_V1,
  ]);
}

export const TENANT_A = 'tenant-a';
export const TENANT_B = 'tenant-b';

export interface TestContext extends ProtocolizationCaseContext {
  readonly clock: TestClock;
}

export function createTestContext(
  tenantId: string = TENANT_A,
  catalog: AssetProfileCatalog = createTestCatalog(),
  clock: TestClock = createTestClock(),
): TestContext {
  return { catalog, clock, tenantId };
}
