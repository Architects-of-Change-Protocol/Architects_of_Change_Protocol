import { RegistryAuthorityLevel, RegistryEntryType, RegistryType } from '@aoc/protocol/claims';

import {
  AssetRequirementObligation,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  PROTOCOLIZATION_CASE_EVENT_TYPES,
  ProtocolizationCaseError,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
  addProtocolizationCaseMaterial,
  associateProtocolizationCaseMaterial,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  isValidProtocolizationCase,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
  protocolizationMaterialPayloadKey,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase, ProtocolizationCaseMaterialInput } from '@aoc/asset-protocolization';

import { TEST_CONTENT_IDENTITY, TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import type { TestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1 } from './fixtures/test-profiles';

function caseOn(context: TestContext, profileId: string, version: string): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId: 'case-material',
    profile: { profileId, profileVersion: version },
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

const contentCase = (context: TestContext): ProtocolizationCase =>
  caseOn(context, TEST_CONTENT_SHAPE_V1.profileId, TEST_CONTENT_SHAPE_V1.version);

const contentMaterial: ProtocolizationCaseMaterialInput = {
  materialId: 'material-0001',
  kind: ProtocolizationMaterialKind.ContentIdentity,
  requirementIds: ['identity.content.required'],
  contentIdentity: TEST_CONTENT_IDENTITY,
};

const errorOf = (run: () => unknown): ProtocolizationCaseError => {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ProtocolizationCaseError);
    return error as ProtocolizationCaseError;
  }
  throw new Error('expected the operation to fail');
};

describe('ProtocolizationCase material correlation', () => {
  it('records a material against a requirement of the pinned profile', () => {
    const context = createTestContext();
    context.clock.advance(10);
    const { protocolizationCase, event } = addProtocolizationCaseMaterial(
      context,
      contentCase(context),
      contentMaterial,
    );

    expect(protocolizationCase.materials).toHaveLength(1);
    expect(protocolizationCase.materials[0]).toEqual({
      ...contentMaterial,
      addedAt: '2026-01-01T00:00:10.000Z',
    });
    expect(event.eventType).toBe(PROTOCOLIZATION_CASE_EVENT_TYPES.materialAdded);
    expect(isValidProtocolizationCase(protocolizationCase)).toBe(true);
  });

  it('moves only the correlated requirement to MaterialPresent', () => {
    const context = createTestContext();
    const { protocolizationCase } = addProtocolizationCaseMaterial(
      context,
      contentCase(context),
      contentMaterial,
    );

    const byId = new Map(protocolizationCase.requirementStates.map((state) => [state.requirementId, state]));
    expect(byId.get('identity.content.required')?.materialStatus).toBe(
      ProtocolizationRequirementMaterialStatus.MaterialPresent,
    );
    expect(byId.get('identity.content.required')?.materialIds).toEqual(['material-0001']);
    expect(byId.get('identity.content.required')?.firstMaterialAt).toBe(
      protocolizationCase.materials[0].addedAt,
    );
    expect(byId.get('evidence.provenance.minimum')?.materialStatus).toBe(
      ProtocolizationRequirementMaterialStatus.Pending,
    );
  });

  it('keeps firstMaterialAt at the first association while updatedAt tracks the latest', () => {
    const context = createTestContext();
    const first = addProtocolizationCaseMaterial(context, contentCase(context), contentMaterial)
      .protocolizationCase;
    context.clock.advance(600);
    const second = addProtocolizationCaseMaterial(context, first, {
      ...contentMaterial,
      materialId: 'material-0002',
    }).protocolizationCase;

    const state = second.requirementStates.find(
      (entry) => entry.requirementId === 'identity.content.required',
    );
    expect(state?.firstMaterialAt).toBe('2026-01-01T00:00:00.000Z');
    expect(state?.updatedAt).toBe('2026-01-01T00:10:00.000Z');
    expect(state?.materialIds).toEqual(['material-0001', 'material-0002']);
  });

  it('correlates one material with several requirements at once', () => {
    const context = createTestContext();
    const { protocolizationCase } = addProtocolizationCaseMaterial(context, contentCase(context), {
      materialId: 'material-0001',
      kind: ProtocolizationMaterialKind.Evidence,
      requirementIds: ['evidence.provenance.minimum', 'declaration.authorship.required'],
      evidenceRef: 'evidence-0001',
    });

    for (const requirementId of ['evidence.provenance.minimum', 'declaration.authorship.required']) {
      const state = protocolizationCase.requirementStates.find(
        (entry) => entry.requirementId === requirementId,
      );
      expect(state?.materialIds).toEqual(['material-0001']);
    }
  });

  it('associates an existing material with a further requirement', () => {
    const context = createTestContext();
    const withMaterial = addProtocolizationCaseMaterial(context, contentCase(context), {
      materialId: 'material-0001',
      kind: ProtocolizationMaterialKind.Evidence,
      requirementIds: ['evidence.provenance.minimum'],
      evidenceRef: 'evidence-0001',
    }).protocolizationCase;
    context.clock.advance(5);

    const { protocolizationCase, event } = associateProtocolizationCaseMaterial(context, withMaterial, {
      materialId: 'material-0001',
      requirementIds: ['declaration.authorship.required'],
    });

    expect(protocolizationCase.materials[0].requirementIds).toEqual([
      'evidence.provenance.minimum',
      'declaration.authorship.required',
    ]);
    expect(
      protocolizationCase.requirementStates.find(
        (state) => state.requirementId === 'declaration.authorship.required',
      )?.materialIds,
    ).toEqual(['material-0001']);
    expect(event.eventType).toBe(PROTOCOLIZATION_CASE_EVENT_TYPES.materialAssociated);
    expect(isValidProtocolizationCase(protocolizationCase)).toBe(true);
  });

  it('rejects an unknown requirement id', () => {
    const context = createTestContext();
    const error = errorOf(() =>
      addProtocolizationCaseMaterial(context, contentCase(context), {
        ...contentMaterial,
        requirementIds: ['requirement.absent'],
      }),
    );

    expect(error.code).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement);
    expect(error.details.requirementIds).toEqual(['requirement.absent']);
  });

  it('rejects a requirement id that belongs to another profile version', () => {
    const context = createTestContext();
    // `identity.external-registry.required` is declared by the external shape,
    // not by the profile this case is pinned to.
    const error = errorOf(() =>
      addProtocolizationCaseMaterial(context, contentCase(context), {
        ...contentMaterial,
        requirementIds: ['identity.external-registry.required'],
      }),
    );

    expect(error.code).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement);
    expect(
      TEST_EXTERNAL_SHAPE_V1.requirements.some(
        (requirement) => requirement.id === 'identity.external-registry.required',
      ),
    ).toBe(true);
  });

  it('rejects an empty requirement id list', () => {
    const context = createTestContext();
    expect(
      errorOf(() =>
        addProtocolizationCaseMaterial(context, contentCase(context), {
          ...contentMaterial,
          requirementIds: [],
        }),
      ).code,
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement);
  });

  it('rejects a repeated requirement id inside one association', () => {
    const context = createTestContext();
    expect(
      errorOf(() =>
        addProtocolizationCaseMaterial(context, contentCase(context), {
          ...contentMaterial,
          requirementIds: ['identity.content.required', 'identity.content.required'],
        }),
      ).code,
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation);
  });

  it('rejects a duplicate material id', () => {
    const context = createTestContext();
    const withMaterial = addProtocolizationCaseMaterial(context, contentCase(context), contentMaterial)
      .protocolizationCase;

    expect(errorOf(() => addProtocolizationCaseMaterial(context, withMaterial, contentMaterial)).code).toBe(
      PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial,
    );
  });

  it('rejects re-associating a material with a requirement it already answers', () => {
    const context = createTestContext();
    const withMaterial = addProtocolizationCaseMaterial(context, contentCase(context), contentMaterial)
      .protocolizationCase;

    expect(
      errorOf(() =>
        associateProtocolizationCaseMaterial(context, withMaterial, {
          materialId: 'material-0001',
          requirementIds: ['identity.content.required'],
        }),
      ).code,
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.duplicateAssociation);
  });

  it('rejects associating a material the case has never been given', () => {
    const context = createTestContext();
    expect(
      errorOf(() =>
        associateProtocolizationCaseMaterial(context, contentCase(context), {
          materialId: 'material-absent',
          requirementIds: ['identity.content.required'],
        }),
      ).code,
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.unknownMaterial);
  });

  it.each([
    ['a blank material id', { ...contentMaterial, materialId: '' }],
    ['a material id with whitespace', { ...contentMaterial, materialId: 'material 0001' }],
    ['an unknown material kind', { ...contentMaterial, kind: 'Ownership' }],
    ['a malformed content digest', { ...contentMaterial, contentIdentity: { algorithm: 'sha256', digest: 'x' } }],
    ['a blank record id', {
      materialId: 'material-0001',
      kind: ProtocolizationMaterialKind.Evidence,
      requirementIds: ['evidence.provenance.minimum'],
      evidenceRef: '  ',
    }],
    ['a payload that does not match the kind', {
      materialId: 'material-0001',
      kind: ProtocolizationMaterialKind.Evidence,
      requirementIds: ['evidence.provenance.minimum'],
      contentIdentity: TEST_CONTENT_IDENTITY,
    }],
  ])('rejects %s', (_label, material) => {
    const context = createTestContext();
    expect(
      errorOf(() =>
        addProtocolizationCaseMaterial(context, contentCase(context), material as ProtocolizationCaseMaterialInput),
      ).code,
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.invalidCase);
  });

  it('accepts every material kind the profile framework can require', () => {
    const context = createTestContext();
    const external = createProtocolizationCase(context, {
      caseId: 'case-kinds',
      profile: { profileId: TEST_EXTERNAL_SHAPE_V1.profileId, profileVersion: TEST_EXTERNAL_SHAPE_V1.version },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;

    const materials: readonly ProtocolizationCaseMaterialInput[] = [
      {
        materialId: 'm-external',
        kind: ProtocolizationMaterialKind.ExternalReference,
        requirementIds: ['identity.external-registry.required'],
        externalReference: { namespace: 'test.namespace.external', id: 'test-entry-0001' },
      },
      {
        materialId: 'm-registry',
        kind: ProtocolizationMaterialKind.RegistryEntry,
        requirementIds: ['evidence.registry.observation'],
        registryEntryRef: {
          id: 'entry-0001',
          registryRef: {
            id: 'registry-0001',
            type: RegistryType.Custom,
            namespace: 'test.namespace.registry',
            authorityLevel: RegistryAuthorityLevel.External,
          },
          entryType: RegistryEntryType.Custom,
          locator: 'test-locator',
        },
      },
      {
        materialId: 'm-declaration',
        kind: ProtocolizationMaterialKind.Declaration,
        requirementIds: ['declaration.authority.required'],
        claimRef: 'claim-0001',
      },
      {
        materialId: 'm-verification',
        kind: ProtocolizationMaterialKind.Verification,
        requirementIds: ['verification.registry.lookup'],
        verificationRef: 'verification-0001',
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
    ];

    const result = materials.reduce(
      (accumulated, material) =>
        addProtocolizationCaseMaterial(context, accumulated, material).protocolizationCase,
      external,
    );

    expect(result.materials.map((material) => material.kind)).toEqual([
      ProtocolizationMaterialKind.ExternalReference,
      ProtocolizationMaterialKind.RegistryEntry,
      ProtocolizationMaterialKind.Declaration,
      ProtocolizationMaterialKind.Verification,
      ProtocolizationMaterialKind.Attestation,
      ProtocolizationMaterialKind.Credential,
    ]);
    for (const material of result.materials) {
      expect(material).toHaveProperty(protocolizationMaterialPayloadKey(material.kind));
    }
  });

  it('never mutates the profile definition it correlates against', () => {
    const context = createTestContext();
    const before = JSON.parse(JSON.stringify(context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0')));

    addProtocolizationCaseMaterial(context, contentCase(context), contentMaterial);

    expect(context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0')).toEqual(before);
    expect(TEST_CONTENT_SHAPE_V1.requirements.map((requirement) => requirement.obligation)).toEqual([
      AssetRequirementObligation.Required,
      AssetRequirementObligation.Required,
      AssetRequirementObligation.Required,
      AssetRequirementObligation.Required,
      AssetRequirementObligation.NotRequired,
    ]);
  });
});

describe('ProtocolizationCase requirement progress', () => {
  it('reads kind and obligation from the profile rather than from the case', () => {
    const context = createTestContext();
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0');
    const progress = listProtocolizationCaseRequirementProgress(contentCase(context), profile!);

    expect(progress.map((entry) => entry.requirementId)).toEqual(
      TEST_CONTENT_SHAPE_V1.requirements.map((requirement) => requirement.id),
    );
    expect(progress.map((entry) => entry.obligation)).toEqual(
      TEST_CONTENT_SHAPE_V1.requirements.map((requirement) => requirement.obligation),
    );
    expect(progress.map((entry) => entry.kind)).toEqual(
      TEST_CONTENT_SHAPE_V1.requirements.map((requirement) => requirement.kind),
    );
  });

  it('reports NotRequired as declared instead of flattening it to a boolean', () => {
    const context = createTestContext();
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0');
    const progress = getProtocolizationCaseRequirementProgress(
      contentCase(context),
      profile!,
      'attestation.professional.not-required',
    );

    expect(progress?.obligation).toBe(AssetRequirementObligation.NotRequired);
    expect(progress?.conditionStatus).toBe(ProtocolizationRequirementConditionStatus.NotApplicable);
  });

  it('lists only Required and Conditional requirements without material as pending', () => {
    const context = createTestContext();
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0');
    const withMaterial = addProtocolizationCaseMaterial(context, contentCase(context), contentMaterial)
      .protocolizationCase;

    const pending = listProtocolizationCasePendingMaterialRequirements(withMaterial, profile!);

    expect(pending.map((entry) => entry.requirementId)).toEqual([
      'declaration.authorship.required',
      'evidence.provenance.minimum',
      'verification.content.integrity',
    ]);
    // The `NotRequired` attestation never blocks, and the requirement that now
    // has material has dropped out.
    expect(pending.map((entry) => entry.requirementId)).not.toContain(
      'attestation.professional.not-required',
    );
  });

  it('refuses to report progress against a profile the case is not pinned to', () => {
    const context = createTestContext();
    const other = context.catalog.get(TEST_EXTERNAL_SHAPE_V1.profileId, '1.0.0');

    expect(() => listProtocolizationCaseRequirementProgress(contentCase(context), other!)).toThrow(
      ProtocolizationCaseError,
    );
    expect(
      errorOf(() => listProtocolizationCaseRequirementProgress(contentCase(context), other!)).code,
    ).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.profileMismatch);
  });

  it('returns undefined for a requirement the profile does not declare', () => {
    const context = createTestContext();
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0');

    expect(
      getProtocolizationCaseRequirementProgress(contentCase(context), profile!, 'requirement.absent'),
    ).toBeUndefined();
  });
});
