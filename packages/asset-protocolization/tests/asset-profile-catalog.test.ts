import {
  ASSET_PROFILE_ERROR_CODES,
  ASSET_PROFILE_VALIDATION_CODES,
  AssetProfileError,
  AssetRequirementKind,
  AssetRequirementObligation,
  createAssetProfileCatalog,
  getAssetProfileRequirement,
  hasAssetProfileRequirement,
  listAssetProfileReadinessRequirements,
  listAssetProfileRequirements,
} from '@aoc/asset-protocolization';

import {
  TEST_CONTENT_SHAPE_V1,
  TEST_EXTERNAL_SHAPE_V1,
  TEST_PROFILE_V1,
  TEST_PROFILE_V1_REVISED,
  TEST_PROFILE_V2,
  withProfileOverrides,
} from './fixtures/test-profiles';

describe('asset profile catalogue', () => {
  it('registers and resolves a well-formed profile deterministically', () => {
    const catalog = createAssetProfileCatalog([TEST_PROFILE_V1]);

    expect(catalog.has('test.profile.v1', '1.0.0')).toBe(true);
    expect(catalog.get('test.profile.v1', '1.0.0')).toBe(TEST_PROFILE_V1);
    expect(catalog.get('test.profile.v1', '1.0.0')).toBe(catalog.get('test.profile.v1', '1.0.0'));
    expect(catalog.get('test.profile.v1', '9.9.9')).toBeUndefined();
    expect(catalog.has('test.absent.v1', '1.0.0')).toBe(false);
  });

  it('keeps distinct profile lines and distinct versions side by side without overwrite', () => {
    const catalog = createAssetProfileCatalog([TEST_PROFILE_V1, TEST_PROFILE_V2, TEST_PROFILE_V1_REVISED]);

    expect(catalog.get('test.profile.v1', '1.0.0')?.requirements).toHaveLength(1);
    expect(catalog.get('test.profile.v1', '1.1.0')?.requirements).toHaveLength(2);
    expect(catalog.get('test.profile.v2', '1.0.0')?.requirements).toHaveLength(2);
    expect(catalog.versionsOf('test.profile.v1')).toEqual(['1.0.0', '1.1.0']);
    expect(catalog.versionsOf('test.profile.v2')).toEqual(['1.0.0']);
  });

  it('orders listings deterministically, by profile id then by numeric version fields', () => {
    const forward = createAssetProfileCatalog([TEST_PROFILE_V2, TEST_PROFILE_V1_REVISED, TEST_PROFILE_V1]);
    const reverse = createAssetProfileCatalog([TEST_PROFILE_V1, TEST_PROFILE_V1_REVISED, TEST_PROFILE_V2]);
    const keysOf = (entries: readonly { profileId: string; version: string }[]) =>
      entries.map((entry) => `${entry.profileId}@${entry.version}`);

    expect(keysOf(forward.list())).toEqual(['test.profile.v1@1.0.0', 'test.profile.v1@1.1.0', 'test.profile.v2@1.0.0']);
    expect(keysOf(reverse.list())).toEqual(keysOf(forward.list()));
  });

  it('sorts versions numerically rather than lexically', () => {
    const catalog = createAssetProfileCatalog([
      { ...TEST_PROFILE_V1, version: '1.10.0' },
      { ...TEST_PROFILE_V1, version: '1.9.0' },
      { ...TEST_PROFILE_V1, version: '10.0.0' },
      { ...TEST_PROFILE_V1, version: '2.0.0' },
    ]);
    expect(catalog.versionsOf('test.profile.v1')).toEqual(['1.9.0', '1.10.0', '2.0.0', '10.0.0']);
  });

  it('filters by profile line and by asset category', () => {
    const catalog = createAssetProfileCatalog([TEST_PROFILE_V1, TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1]);

    expect(catalog.list({ profileId: 'test.content.v1' })).toEqual([TEST_CONTENT_SHAPE_V1]);
    expect(catalog.list({ assetCategory: 'test.category.external-subject' })).toEqual([TEST_EXTERNAL_SHAPE_V1]);
    expect(catalog.list({ assetCategory: 'test.category.absent' })).toEqual([]);
  });

  it('rejects a duplicate (profileId, version) registration deterministically', () => {
    const catalog = createAssetProfileCatalog([TEST_PROFILE_V1]);

    expect(() => catalog.register(TEST_PROFILE_V1)).toThrow(AssetProfileError);
    try {
      catalog.register({ ...TEST_PROFILE_V1, assetCategory: 'test.category.other' });
      throw new Error('expected a duplicate-version rejection');
    } catch (error) {
      const failure = error as AssetProfileError;
      expect(failure.code).toBe(ASSET_PROFILE_ERROR_CODES.versionAlreadyRegistered);
      expect(failure.details).toEqual({
        reasonCodes: [ASSET_PROFILE_ERROR_CODES.versionAlreadyRegistered],
        profileId: 'test.profile.v1',
        version: '1.0.0',
      });
    }
    // The already-registered version is untouched by the failed attempt.
    expect(catalog.get('test.profile.v1', '1.0.0')?.assetCategory).toBe('test.category.minimal');
  });

  it('refuses to register a malformed profile and reports the validation reasons', () => {
    const catalog = createAssetProfileCatalog();

    try {
      catalog.register(withProfileOverrides({ profileId: '' }) as never);
      throw new Error('expected a validation rejection');
    } catch (error) {
      const failure = error as AssetProfileError;
      expect(failure).toBeInstanceOf(AssetProfileError);
      expect(failure.code).toBe(ASSET_PROFILE_ERROR_CODES.invalidProfile);
      expect(failure.details.reasonCodes).toContain(ASSET_PROFILE_VALIDATION_CODES.invalidProfileId);
    }
    expect(catalog.list()).toEqual([]);
  });

  it('fails at construction when a pre-populated profile is invalid or duplicated', () => {
    expect(() => createAssetProfileCatalog([TEST_PROFILE_V1, TEST_PROFILE_V1])).toThrow(AssetProfileError);
    expect(() => createAssetProfileCatalog([withProfileOverrides({ version: '1' }) as never])).toThrow(
      AssetProfileError,
    );
  });

  it('freezes a catalogued profile so the rules a case was assessed under cannot change', () => {
    const mutable = { ...TEST_PROFILE_V1, requirements: [...TEST_PROFILE_V1.requirements] };
    const catalog = createAssetProfileCatalog([mutable]);
    const resolved = catalog.get('test.profile.v1', '1.0.0');

    expect(Object.isFrozen(resolved)).toBe(true);
    expect(Object.isFrozen(resolved?.requirements)).toBe(true);
    expect(Object.isFrozen(resolved?.requirements[0])).toBe(true);
  });

  it('accepts a new profile without any change to the catalogue implementation', () => {
    const catalog = createAssetProfileCatalog();
    catalog.register({ ...TEST_PROFILE_V1, profileId: 'test.future.v1', assetCategory: 'test.category.future' });

    expect(catalog.has('test.future.v1', '1.0.0')).toBe(true);
  });
});

describe('asset profile selectors', () => {
  it('looks a requirement up deterministically by its stable identifier', () => {
    expect(getAssetProfileRequirement(TEST_CONTENT_SHAPE_V1, 'evidence.provenance.minimum')?.kind).toBe(
      AssetRequirementKind.Evidence,
    );
    expect(getAssetProfileRequirement(TEST_CONTENT_SHAPE_V1, 'evidence.absent')).toBeUndefined();
    expect(hasAssetProfileRequirement(TEST_CONTENT_SHAPE_V1, 'identity.content.required')).toBe(true);
  });

  it('filters requirements by kind and obligation', () => {
    expect(
      listAssetProfileRequirements(TEST_EXTERNAL_SHAPE_V1, { kind: AssetRequirementKind.Identity }).map(
        (requirement) => requirement.id,
      ),
    ).toEqual(['identity.content.not-required', 'identity.external-registry.required']);

    expect(
      listAssetProfileRequirements(TEST_EXTERNAL_SHAPE_V1, {
        obligation: AssetRequirementObligation.NotRequired,
      }).map((requirement) => requirement.id),
    ).toEqual(['identity.content.not-required']);
  });

  it('answers what must be satisfied before a case may become ready', () => {
    expect(listAssetProfileReadinessRequirements(TEST_CONTENT_SHAPE_V1).map((requirement) => requirement.id)).toEqual([
      'identity.content.required',
      'declaration.authorship.required',
      'evidence.provenance.minimum',
      'verification.content.integrity',
    ]);

    // `NotRequired` is a recorded decision, never a readiness obligation.
    expect(
      listAssetProfileReadinessRequirements(TEST_EXTERNAL_SHAPE_V1).map((requirement) => requirement.id),
    ).not.toContain('identity.content.not-required');
  });

  it('narrows readiness requirements to a jurisdiction', () => {
    const scoped = {
      ...TEST_PROFILE_V1,
      jurisdictions: [{ code: 'CR' }, { code: 'US-CA' }],
      requirements: [
        { ...TEST_PROFILE_V1.requirements[0], jurisdictions: [{ code: 'CR' }] },
        {
          ...TEST_PROFILE_V1.requirements[0],
          id: 'identity.content.us',
          jurisdictions: [{ code: 'US-CA' }],
        },
        { ...TEST_PROFILE_V1.requirements[0], id: 'identity.content.anywhere' },
      ],
    };

    expect(listAssetProfileReadinessRequirements(scoped, 'CR').map((requirement) => requirement.id)).toEqual([
      'identity.content.required',
      'identity.content.anywhere',
    ]);
    expect(listAssetProfileReadinessRequirements(scoped, 'US-CA').map((requirement) => requirement.id)).toEqual([
      'identity.content.us',
      'identity.content.anywhere',
    ]);
  });
});
