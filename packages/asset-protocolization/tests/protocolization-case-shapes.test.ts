import { RegistryAuthorityLevel, RegistryEntryType, RegistryType } from '@aoc/protocol/claims';

import {
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  addProtocolizationCaseMaterial,
  createProtocolizationCase,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase, ProtocolizationCaseMaterialInput } from '@aoc/asset-protocolization';

import {
  TEST_CONTENT_IDENTITY,
  TEST_CONTENT_SUBJECT,
  TEST_EXTERNAL_SUBJECT,
  TEST_PROFILE_V1_AT_2_0_0,
  createTestContext,
} from './fixtures/test-cases';
import type { TestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1, TEST_PROFILE_V1 } from './fixtures/test-profiles';

/**
 * The architectural acceptance proof.
 *
 * One `ProtocolizationCase` implementation, one code path, two subjects that
 * have nothing structurally in common: one has bytes and no external existence,
 * the other has external existence and no bytes. Both are processed by the same
 * operations, and nothing in the package branches on which is which.
 */

function apply(
  context: TestContext,
  start: ProtocolizationCase,
  materials: readonly ProtocolizationCaseMaterialInput[],
): ProtocolizationCase {
  return materials.reduce(
    (accumulated, material) =>
      addProtocolizationCaseMaterial(context, accumulated, material).protocolizationCase,
    start,
  );
}

describe('architecture proof — one aggregate, two subject shapes', () => {
  it('handles Shape A: a content-addressable subject', () => {
    const context = createTestContext();
    const created = createProtocolizationCase(context, {
      caseId: 'case-shape-a',
      profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: TEST_CONTENT_SHAPE_V1.version },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;

    const result = apply(context, created, [
      {
        materialId: 'm-content',
        kind: ProtocolizationMaterialKind.ContentIdentity,
        requirementIds: ['identity.content.required'],
        contentIdentity: TEST_CONTENT_IDENTITY,
      },
      {
        materialId: 'm-provenance',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: 'evidence-provenance-0001',
      },
      {
        materialId: 'm-authorship',
        kind: ProtocolizationMaterialKind.Declaration,
        requirementIds: ['declaration.authorship.required'],
        claimRef: 'claim-authorship-0001',
      },
    ]);

    expect(result.subject.contentIdentity).toEqual(TEST_CONTENT_IDENTITY);
    expect(result.profile).toEqual({ profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '1.0.0' });
    expect(result.tenantId).toBe('tenant-a');
    expect(result.materials).toHaveLength(3);
    expect(
      result.requirementStates
        .filter((state) => state.materialStatus === ProtocolizationRequirementMaterialStatus.MaterialPresent)
        .map((state) => state.requirementId),
    ).toEqual([
      'identity.content.required',
      'declaration.authorship.required',
      'evidence.provenance.minimum',
    ]);
  });

  it('handles Shape B: an externally referenced subject with no bytes', () => {
    const context = createTestContext();
    const created = createProtocolizationCase(context, {
      caseId: 'case-shape-b',
      profile: { profileId: TEST_EXTERNAL_SHAPE_V1.profileId, profileVersion: TEST_EXTERNAL_SHAPE_V1.version },
      subject: TEST_EXTERNAL_SUBJECT,
    }).protocolizationCase;

    const result = apply(context, created, [
      {
        materialId: 'm-registry-entry',
        kind: ProtocolizationMaterialKind.RegistryEntry,
        requirementIds: ['identity.external-registry.required'],
        registryEntryRef: {
          id: 'entry-0001',
          registryRef: {
            id: 'registry-0001',
            // The generic model Gate A0 / U-2 froze: no jurisdiction- or
            // domain-specific enum member anywhere.
            type: RegistryType.Custom,
            namespace: 'test.namespace.registry',
            authorityLevel: RegistryAuthorityLevel.External,
          },
          entryType: RegistryEntryType.Custom,
          locator: 'test-locator-0001',
        },
      },
      {
        materialId: 'm-registry-observation',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.registry.observation'],
        evidenceRef: 'evidence-observation-0001',
      },
      {
        materialId: 'm-attestation',
        kind: ProtocolizationMaterialKind.Attestation,
        requirementIds: ['attestation.professional.required'],
        attestationRef: 'attestation-0001',
      },
      {
        materialId: 'm-credential',
        kind: ProtocolizationMaterialKind.Credential,
        requirementIds: ['attestation.professional.required'],
        credentialRef: 'credential-0001',
      },
    ]);

    expect(result.subject.contentIdentity).toBeUndefined();
    expect(result.subject.subjectRef.externalReference?.namespace).toBe('test.namespace.external');
    expect(result.materials).toHaveLength(4);
    expect(
      result.requirementStates.find(
        (state) => state.requirementId === 'attestation.professional.required',
      )?.materialIds,
    ).toEqual(['m-attestation', 'm-credential']);

    // The freshness-relevant material is tracked; the freshness constraint that
    // governs it is the profile's, and evaluating it is a later slice's.
    const profile = context.catalog.get(TEST_EXTERNAL_SHAPE_V1.profileId, '1.0.0');
    const observation = listProtocolizationCaseRequirementProgress(result, profile!).find(
      (progress) => progress.requirementId === 'evidence.registry.observation',
    );
    expect(observation?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
  });

  it('assumes neither content identity nor a registry reference exists', () => {
    const context = createTestContext();
    const contentShape = createProtocolizationCase(context, {
      caseId: 'case-no-registry',
      profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: TEST_CONTENT_SHAPE_V1.version },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    const externalShape = createProtocolizationCase(context, {
      caseId: 'case-no-content',
      profile: { profileId: TEST_EXTERNAL_SHAPE_V1.profileId, profileVersion: TEST_EXTERNAL_SHAPE_V1.version },
      subject: TEST_EXTERNAL_SUBJECT,
    }).protocolizationCase;

    expect(contentShape.subject.subjectRef.externalReference).toBeUndefined();
    expect(externalShape.subject.contentIdentity).toBeUndefined();
    // Both are valid cases; neither absence is a defect.
    expect(contentShape.state).toBe(externalShape.state);
  });

  it('runs both shapes through exactly the same operations', () => {
    const context = createTestContext();
    const build = (caseId: string, profileId: string, version: string, subject: typeof TEST_CONTENT_SUBJECT) =>
      createProtocolizationCase(context, {
        caseId,
        profile: { profileId, profileVersion: version },
        subject,
      }).protocolizationCase;

    const shapeA = build('case-a', TEST_CONTENT_SHAPE_V1.profileId, '1.0.0', TEST_CONTENT_SUBJECT);
    const shapeB = build('case-b', TEST_EXTERNAL_SHAPE_V1.profileId, '1.0.0', TEST_EXTERNAL_SUBJECT);

    // The aggregate's own shape is identical; only the profile pin, the subject
    // and the projected requirement ids differ — all of them data.
    expect(Object.keys(shapeA).sort()).toEqual(Object.keys(shapeB).sort());
    expect(shapeA.requirementStates.length).toBe(TEST_CONTENT_SHAPE_V1.requirements.length);
    expect(shapeB.requirementStates.length).toBe(TEST_EXTERNAL_SHAPE_V1.requirements.length);
  });
});

describe('profile version coexistence', () => {
  it('keeps two versions of one profile line catalogued side by side', () => {
    const context = createTestContext();

    expect(context.catalog.versionsOf(TEST_PROFILE_V1.profileId)).toEqual(['1.0.0', '2.0.0']);
    expect(context.catalog.get(TEST_PROFILE_V1.profileId, '1.0.0')?.requirements).toHaveLength(1);
    expect(context.catalog.get(TEST_PROFILE_V1.profileId, '2.0.0')?.requirements).toHaveLength(2);
  });

  it('leaves a case pinned to 1.0.0 on 1.0.0 after 2.0.0 exists', () => {
    const context = createTestContext();
    const onV1 = createProtocolizationCase(context, {
      caseId: 'case-v1',
      profile: { profileId: TEST_PROFILE_V1.profileId, profileVersion: '1.0.0' },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    const onV2 = createProtocolizationCase(context, {
      caseId: 'case-v2',
      profile: { profileId: TEST_PROFILE_V1.profileId, profileVersion: '2.0.0' },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;

    expect(onV1.profile.profileVersion).toBe('1.0.0');
    expect(onV2.profile.profileVersion).toBe('2.0.0');
    expect(onV1.requirementStates.map((state) => state.requirementId)).toEqual([
      'identity.content.required',
    ]);
    expect(onV2.requirementStates.map((state) => state.requirementId)).toEqual([
      'identity.content.required',
      'identity.external.optional',
    ]);
  });

  it('does not let a later version change what an existing case requires', () => {
    const context = createTestContext();
    const onV1 = createProtocolizationCase(context, {
      caseId: 'case-v1',
      profile: { profileId: TEST_PROFILE_V1.profileId, profileVersion: '1.0.0' },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;

    // 2.0.0 adds a requirement. The v1 case must not acquire it, and a
    // requirement id that exists only in 2.0.0 must not become associable.
    expect(TEST_PROFILE_V1_AT_2_0_0.requirements.map((requirement) => requirement.id)).toContain(
      'identity.external.optional',
    );
    expect(() =>
      addProtocolizationCaseMaterial(context, onV1, {
        materialId: 'm-external',
        kind: ProtocolizationMaterialKind.ExternalReference,
        requirementIds: ['identity.external.optional'],
        externalReference: { namespace: 'test.namespace.external', id: 'x' },
      }),
    ).toThrow(/identity\.external\.optional/);

    const profile = context.catalog.get(TEST_PROFILE_V1.profileId, '1.0.0');
    expect(listProtocolizationCasePendingMaterialRequirements(onV1, profile!).map((p) => p.requirementId)).toEqual(
      ['identity.content.required'],
    );
  });

  it('survives a catalogue that gains versions after the case was created', () => {
    const context = createTestContext();
    const onV1 = createProtocolizationCase(context, {
      caseId: 'case-v1',
      profile: { profileId: TEST_PROFILE_V1.profileId, profileVersion: '1.0.0' },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    const pinBefore = { ...onV1.profile };

    context.catalog.register({ ...TEST_PROFILE_V1_AT_2_0_0, version: '3.0.0' });

    expect(onV1.profile).toEqual(pinBefore);
    expect(context.catalog.versionsOf(TEST_PROFILE_V1.profileId)).toEqual(['1.0.0', '2.0.0', '3.0.0']);
  });
});
