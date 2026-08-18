import { ClaimType, EvidenceType, RegistryAuthorityLevel } from '@aoc/protocol/claims';

import {
  ASSET_PROFILE_SCHEMA_VERSION,
  ASSET_PROFILE_VALIDATION_CODES,
  AssetIdentityStrategy,
  AssetProfileScope,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
  isValidAssetProfile,
  validateAssetProfile,
} from '@aoc/asset-protocolization';

import {
  TEST_CONTENT_SHAPE_V1,
  TEST_EXTERNAL_SHAPE_V1,
  TEST_PROFILE_V1,
  withProfileOverrides,
  withRequirements,
} from './fixtures/test-profiles';

const identityRequirement = {
  id: 'identity.content.required',
  kind: AssetRequirementKind.Identity,
  obligation: AssetRequirementObligation.Required,
  acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
  satisfaction: AssetRequirementSatisfaction.All,
};

const reasonsOf = (value: unknown): readonly string[] => validateAssetProfile(value).reasons;

describe('asset profile validation — well-formed profiles', () => {
  it('accepts the minimal fixture and both architectural shapes', () => {
    for (const candidate of [TEST_PROFILE_V1, TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1]) {
      expect(validateAssetProfile(candidate)).toEqual({ valid: true, reasons: [], issues: [] });
      expect(isValidAssetProfile(candidate)).toBe(true);
    }
  });

  it('reports every reason with the path it was raised at', () => {
    const result = validateAssetProfile(withProfileOverrides({ profileId: 'NOT VALID' }));

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual([
      { code: ASSET_PROFILE_VALIDATION_CODES.invalidProfileId, path: 'profileId' },
    ]);
    // `reasons` is the repository-standard projection of `issues`.
    expect(result.reasons).toEqual(result.issues.map((issue) => issue.code));
  });
});

describe('asset profile validation — profile identity and shape', () => {
  it('rejects a non-object document', () => {
    for (const candidate of [null, undefined, 'profile', 42, []]) {
      expect(reasonsOf(candidate)).toEqual([ASSET_PROFILE_VALIDATION_CODES.invalidStructure]);
    }
  });

  it('rejects a missing or malformed profile id', () => {
    for (const profileId of [undefined, '', '   ', 'Test.Profile', 'test..profile', '.test', 'test.', 'a'.repeat(129)]) {
      expect(reasonsOf(withProfileOverrides({ profileId }))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidProfileId,
      );
    }
  });

  it('rejects a version that is not <major>.<minor>.<patch>', () => {
    for (const version of [undefined, '', '1', '1.0', 'v1.0.0', '1.0.0-rc.1', '1.0.0.0']) {
      expect(reasonsOf(withProfileOverrides({ version }))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidProfileVersion,
      );
    }
  });

  it('rejects an unsupported schema version', () => {
    expect(reasonsOf(withProfileOverrides({ schemaVersion: 'aoc-asset-profile/2' }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.unsupportedSchemaVersion,
    );
    expect(ASSET_PROFILE_SCHEMA_VERSION).toBe('aoc-asset-profile/1');
  });

  it('rejects a malformed asset category', () => {
    expect(reasonsOf(withProfileOverrides({ assetCategory: 'Physical Building' }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidAssetCategory,
    );
  });

  it('rejects an unknown profile scope, and rejects tenant-scoping a profile definition', () => {
    expect(reasonsOf(withProfileOverrides({ scope: 'Tenant' }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidProfileScope,
    );
    // Profile definitions are global; a tenant does not belong on one. APV-04
    // carries the required tenant on `ProtocolizationCase` instead.
    expect(reasonsOf(withProfileOverrides({ tenantId: 'tenant-1' }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.unknownProfileField,
    );
    expect(AssetProfileScope.Global).toBe('Global');
  });

  it('rejects any unknown top-level field', () => {
    const result = validateAssetProfile(withProfileOverrides({ fincaNumber: '92817' }));
    expect(result.issues).toContainEqual({
      code: ASSET_PROFILE_VALIDATION_CODES.unknownProfileField,
      path: 'fincaNumber',
    });
  });

  it('rejects malformed profile metadata without letting presentation text carry meaning', () => {
    expect(reasonsOf(withProfileOverrides({ metadata: { label: '   ' } }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidProfileMetadata,
    );
    expect(reasonsOf(withProfileOverrides({ metadata: { headline: 'x' } }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidProfileMetadata,
    );
  });

  it('rejects a present-but-undefined optional, which could never be canonicalized', () => {
    expect(reasonsOf(withProfileOverrides({ metadata: undefined }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidProfileMetadata,
    );
    expect(reasonsOf(withProfileOverrides({ jurisdictions: undefined }))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidProfileJurisdictions,
    );
  });

  it('rejects a malformed jurisdiction representation', () => {
    for (const jurisdictions of [[], [{ code: 'cr' }], [{ code: 'CR' }, { code: 'CR' }], [{ code: 'CR', extra: 1 }]]) {
      expect(reasonsOf(withProfileOverrides({ jurisdictions }))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidProfileJurisdictions,
      );
    }
  });

  it('rejects an empty or missing requirement set', () => {
    expect(reasonsOf(withRequirements([]))).toEqual([ASSET_PROFILE_VALIDATION_CODES.emptyRequirementSet]);
    expect(reasonsOf(withProfileOverrides({ requirements: undefined }))).toEqual([
      ASSET_PROFILE_VALIDATION_CODES.emptyRequirementSet,
    ]);
  });
});

describe('asset profile validation — requirement identity', () => {
  it('rejects an empty or malformed requirement id', () => {
    for (const id of [undefined, '', '  ', 'Identity.Content', 'identity..content']) {
      expect(reasonsOf(withRequirements([{ ...identityRequirement, id }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidRequirementId,
      );
    }
  });

  it('rejects duplicate requirement ids', () => {
    const result = validateAssetProfile(withRequirements([identityRequirement, { ...identityRequirement }]));
    expect(result.issues).toContainEqual({
      code: ASSET_PROFILE_VALIDATION_CODES.duplicateRequirementId,
      path: 'requirements[1].id',
    });
  });

  it('rejects an unsupported requirement kind and an unsupported requirement shape', () => {
    expect(reasonsOf(withRequirements([{ ...identityRequirement, kind: 'Ownership' }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.unsupportedRequirementKind,
    );
    expect(reasonsOf(withRequirements(['identity.content.required']))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidRequirementStructure,
    );
    expect(reasonsOf(withRequirements([{ ...identityRequirement, notaryId: 'n-1' }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.unknownRequirementField,
    );
  });

  it('rejects an unknown obligation', () => {
    expect(reasonsOf(withRequirements([{ ...identityRequirement, obligation: 'Mandatory' }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidRequirementObligation,
    );
  });
});

describe('asset profile validation — conditional requirements', () => {
  const conditional = {
    ...identityRequirement,
    id: 'identity.content.conditional',
    obligation: AssetRequirementObligation.Conditional,
  };

  it('requires a condition when the obligation is Conditional, and forbids one otherwise', () => {
    expect(reasonsOf(withRequirements([conditional]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.missingRequirementCondition,
    );
    expect(
      reasonsOf(withRequirements([{ ...identityRequirement, condition: { conditionId: 'when.something' } }])),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.unexpectedRequirementCondition);
  });

  it('accepts a well-formed condition that depends on a declared requirement', () => {
    const result = validateAssetProfile(
      withRequirements([
        identityRequirement,
        {
          ...conditional,
          condition: { conditionId: 'when.identity.satisfied', dependsOn: ['identity.content.required'] },
        },
      ]),
    );
    expect(result.valid).toBe(true);
  });

  it('rejects a malformed condition', () => {
    for (const condition of [{}, { conditionId: '' }, { conditionId: 'ok', extra: 1 }, { conditionId: 'ok', dependsOn: [] }]) {
      expect(reasonsOf(withRequirements([{ ...conditional, condition }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidRequirementCondition,
      );
    }
  });

  it('rejects a dangling or self-referential requirement reference', () => {
    expect(
      reasonsOf(
        withRequirements([{ ...conditional, condition: { conditionId: 'c.1', dependsOn: ['evidence.absent'] } }]),
      ),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.unknownRequirementReference);

    expect(
      reasonsOf(
        withRequirements([
          { ...conditional, condition: { conditionId: 'c.1', dependsOn: ['identity.content.conditional'] } },
        ]),
      ),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.selfReferentialCondition);
  });

  it('rejects a condition expressed over material the same profile never requires', () => {
    expect(
      reasonsOf(
        withRequirements([
          {
            ...identityRequirement,
            id: 'identity.external.not-required',
            obligation: AssetRequirementObligation.NotRequired,
            acceptedStrategies: [AssetIdentityStrategy.ExternalReference],
          },
          { ...conditional, condition: { conditionId: 'c.1', dependsOn: ['identity.external.not-required'] } },
        ]),
      ),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.contradictoryConditionDependency);
  });
});

describe('asset profile validation — identity requirements', () => {
  it('accepts every supported strategy combination', () => {
    const combinations = [
      { acceptedStrategies: [AssetIdentityStrategy.ContentIdentity], satisfaction: AssetRequirementSatisfaction.All },
      {
        acceptedStrategies: [AssetIdentityStrategy.ExternalReference, AssetIdentityStrategy.RegistryEntry],
        satisfaction: AssetRequirementSatisfaction.Any,
      },
      {
        acceptedStrategies: [
          AssetIdentityStrategy.ContentIdentity,
          AssetIdentityStrategy.ExternalReference,
          AssetIdentityStrategy.RegistryEntry,
        ],
        satisfaction: AssetRequirementSatisfaction.All,
      },
    ];
    for (const combination of combinations) {
      expect(validateAssetProfile(withRequirements([{ ...identityRequirement, ...combination }])).valid).toBe(true);
    }
  });

  it('rejects an empty, duplicated or unknown strategy list', () => {
    for (const acceptedStrategies of [[], ['ContentIdentity', 'ContentIdentity'], ['Fingerprint'], undefined]) {
      expect(reasonsOf(withRequirements([{ ...identityRequirement, acceptedStrategies }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidIdentityStrategies,
      );
    }
  });

  it('rejects an unknown satisfaction mode', () => {
    expect(reasonsOf(withRequirements([{ ...identityRequirement, satisfaction: 'Most' }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidRequirementSatisfaction,
    );
  });

  it('rejects a registry constraint on a requirement that never accepts a registry entry', () => {
    expect(
      reasonsOf(
        withRequirements([
          {
            ...identityRequirement,
            registry: { acceptedAuthorityLevels: [RegistryAuthorityLevel.External] },
          },
        ]),
      ),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.unexpectedRegistryConstraint);
  });

  it('rejects an invalid external registry reference constraint', () => {
    const withRegistry = (registry: unknown) => ({
      ...identityRequirement,
      acceptedStrategies: [AssetIdentityStrategy.RegistryEntry],
      registry,
    });
    for (const registry of [{}, { acceptedTypes: [] }, { acceptedTypes: ['LandRegistry'] }, { acceptedNamespaces: [''] }, { unknown: 1 }]) {
      expect(reasonsOf(withRequirements([withRegistry(registry)]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidRegistryConstraint,
      );
    }
  });

  it('detects a mechanically contradictory identity requirement pair', () => {
    const result = validateAssetProfile(
      withRequirements([
        identityRequirement,
        {
          ...identityRequirement,
          id: 'identity.content.not-required',
          obligation: AssetRequirementObligation.NotRequired,
        },
      ]),
    );
    expect(result.reasons).toContain(ASSET_PROFILE_VALIDATION_CODES.contradictoryIdentityStrategy);
  });

  it('does not report a contradiction when the excluded strategy was only one of several alternatives', () => {
    const result = validateAssetProfile(
      withRequirements([
        {
          ...identityRequirement,
          acceptedStrategies: [AssetIdentityStrategy.ContentIdentity, AssetIdentityStrategy.ExternalReference],
          satisfaction: AssetRequirementSatisfaction.Any,
        },
        {
          ...identityRequirement,
          id: 'identity.content.not-required',
          obligation: AssetRequirementObligation.NotRequired,
        },
      ]),
    );
    expect(result.reasons).not.toContain(ASSET_PROFILE_VALIDATION_CODES.contradictoryIdentityStrategy);
  });
});

describe('asset profile validation — declaration, evidence, verification and attestation requirements', () => {
  const declaration = {
    id: 'declaration.ownership.required',
    kind: AssetRequirementKind.Declaration,
    obligation: AssetRequirementObligation.Required,
    claimType: ClaimType.Authorization,
  };

  it('rejects an unknown claim type and requires a subtype for Custom claims', () => {
    expect(reasonsOf(withRequirements([{ ...declaration, claimType: 'Ownership' }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidClaimType,
    );
    expect(reasonsOf(withRequirements([{ ...declaration, claimType: ClaimType.Custom }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.missingClaimSubtype,
    );
    expect(
      validateAssetProfile(
        withRequirements([{ ...declaration, claimType: ClaimType.Custom, claimSubtype: 'registry-subject' }]),
      ).valid,
    ).toBe(true);
    expect(reasonsOf(withRequirements([{ ...declaration, claimSubtype: '  ' }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidClaimSubtype,
    );
  });

  it('rejects a non-positive minimum count and a minimum count on a NotRequired requirement', () => {
    for (const minimumCount of [0, -1, 1.5, '2']) {
      expect(reasonsOf(withRequirements([{ ...declaration, minimumCount }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidMinimumCount,
      );
    }
    expect(
      reasonsOf(
        withRequirements([
          { ...declaration, obligation: AssetRequirementObligation.NotRequired, minimumCount: 1 },
        ]),
      ),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.contradictoryMinimumCount);
  });

  it('rejects an empty or unknown evidence type list, and demands a subtype for Custom evidence', () => {
    const evidence = {
      id: 'evidence.identity.required',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [EvidenceType.Document],
    };
    for (const acceptedTypes of [[], ['EscrituraPublica'], undefined, [EvidenceType.Document, EvidenceType.Document]]) {
      expect(reasonsOf(withRequirements([{ ...evidence, acceptedTypes }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidEvidenceTypes,
      );
    }
    expect(reasonsOf(withRequirements([{ ...evidence, acceptedTypes: [EvidenceType.Custom] }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.missingEvidenceSubtypes,
    );
    expect(reasonsOf(withRequirements([{ ...evidence, acceptedSubtypes: [] }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidEvidenceSubtypes,
    );
  });

  it('rejects an invalid credential constraint', () => {
    expect(
      reasonsOf(
        withRequirements([
          {
            id: 'evidence.credential.required',
            kind: AssetRequirementKind.Evidence,
            obligation: AssetRequirementObligation.Required,
            acceptedTypes: [EvidenceType.Certification],
            credential: { acceptedTypes: ['NotaryLicence'] },
          },
        ]),
      ),
    ).toContain(ASSET_PROFILE_VALIDATION_CODES.invalidCredentialConstraint);
  });

  it('rejects an empty, duplicated or malformed verification check list', () => {
    const verification = {
      id: 'verification.registry.lookup',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: ['check.registry.resolves'],
      satisfaction: AssetRequirementSatisfaction.All,
    };
    for (const checkIds of [[], ['Check.Registry'], ['a', 'a'], undefined, [1]]) {
      expect(reasonsOf(withRequirements([{ ...verification, checkIds }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidVerificationCheckIds,
      );
    }
  });

  it('rejects an invalid attestation type list and an invalid attester constraint', () => {
    const attestation = {
      id: 'attestation.professional.required',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: ['Human'],
    };
    expect(reasonsOf(withRequirements([{ ...attestation, acceptedTypes: ['Notary'] }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidAttestationTypes,
    );
    expect(reasonsOf(withRequirements([{ ...attestation, attester: {} }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidAttesterConstraint,
    );
    expect(reasonsOf(withRequirements([{ ...attestation, attester: { acceptedRoles: [] } }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidAttesterConstraint,
    );
  });
});

describe('asset profile validation — freshness and jurisdiction', () => {
  const evidence = {
    id: 'evidence.registry.observation',
    kind: AssetRequirementKind.Evidence,
    obligation: AssetRequirementObligation.Required,
    acceptedTypes: [EvidenceType.Certification],
  };

  it('accepts each generic freshness form', () => {
    for (const freshness of [
      { maxAgeSeconds: 3600 },
      { observedAfter: '2026-01-01T00:00:00Z' },
      { mustNotBeExpired: true },
      { maxAgeSeconds: 60, observedAfter: '2026-01-01T00:00:00.123Z', mustNotBeExpired: true },
    ]) {
      expect(validateAssetProfile(withRequirements([{ ...evidence, freshness }])).valid).toBe(true);
    }
  });

  it('rejects an empty or malformed freshness constraint', () => {
    for (const freshness of [
      {},
      { mustNotBeExpired: false },
      { maxAgeSeconds: 0 },
      { maxAgeSeconds: -1 },
      { maxAgeSeconds: 1.5 },
      { observedAfter: '2026-01-01' },
      { observedAfter: '2026-01-01T00:00:00+02:00' },
      { observedAfter: '2026-02-31T00:00:00Z' },
      { unknown: true },
    ]) {
      expect(reasonsOf(withRequirements([{ ...evidence, freshness }]))).toContain(
        ASSET_PROFILE_VALIDATION_CODES.invalidFreshnessConstraint,
      );
    }
  });

  it('rejects a requirement scoped outside the profile jurisdictions', () => {
    const scoped = withProfileOverrides({
      jurisdictions: [{ code: 'CR' }],
      requirements: [{ ...identityRequirement, jurisdictions: [{ code: 'US-CA' }] }],
    });
    expect(reasonsOf(scoped)).toContain(ASSET_PROFILE_VALIDATION_CODES.jurisdictionOutsideProfileScope);
  });

  it('places no jurisdictional restriction on a GLOBAL profile', () => {
    const scoped = withProfileOverrides({
      jurisdictions: [{ code: 'GLOBAL' }],
      requirements: [{ ...identityRequirement, jurisdictions: [{ code: 'US-CA' }] }],
    });
    expect(validateAssetProfile(scoped).valid).toBe(true);
  });

  it('rejects a malformed requirement jurisdiction list', () => {
    expect(reasonsOf(withRequirements([{ ...identityRequirement, jurisdictions: [{ code: 'costa rica' }] }]))).toContain(
      ASSET_PROFILE_VALIDATION_CODES.invalidRequirementJurisdictions,
    );
  });
});
