import {
  AttestationType,
  ClaimType,
  CredentialType,
  EvidenceType,
  RegistryAuthorityLevel,
  RegistryType,
  VerificationStatus,
} from '@aoc/protocol/claims';

import {
  AssetIdentityStrategy,
  AssetRequirementKind,
  AssetRequirementObligation,
  createAssetProfileCatalog,
  getAssetProfileRequirement,
  isAssetRequirementOfKind,
  listAssetProfileRequirements,
  validateAssetProfile,
} from '@aoc/asset-protocolization';
import type { AssetProfile } from '@aoc/asset-protocolization';

import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1 } from './fixtures/test-profiles';

/**
 * APV-03's architectural proof.
 *
 * The framework must be able to express two fundamentally different abstract
 * shapes through one code path: a digital-content subject that has bytes, and an
 * externally registered subject that has none. Neither fixture is a product
 * profile, and neither names a jurisdiction's law, a registry, or a profession.
 */
describe('one framework, two fundamentally different asset shapes', () => {
  const shapes: readonly (readonly [string, AssetProfile])[] = [
    ['content subject', TEST_CONTENT_SHAPE_V1],
    ['externally registered non-content subject', TEST_EXTERNAL_SHAPE_V1],
  ];

  it.each(shapes)('validates and catalogues the %s through the same code path', (_label, shape) => {
    expect(validateAssetProfile(shape).valid).toBe(true);

    const catalog = createAssetProfileCatalog([shape]);
    expect(catalog.get(shape.profileId, shape.version)).toBe(shape);
  });

  it('holds both shapes in one catalogue with no shape-specific handling', () => {
    const catalog = createAssetProfileCatalog([TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1]);
    expect(catalog.list()).toHaveLength(2);
    expect(catalog.list({ assetCategory: 'test.category.content' })).toEqual([TEST_CONTENT_SHAPE_V1]);
  });

  it('Shape A requires content identity', () => {
    const requirement = getAssetProfileRequirement(TEST_CONTENT_SHAPE_V1, 'identity.content.required');

    expect(requirement?.obligation).toBe(AssetRequirementObligation.Required);
    expect(isAssetRequirementOfKind(requirement!, AssetRequirementKind.Identity)).toBe(true);
    if (!isAssetRequirementOfKind(requirement!, AssetRequirementKind.Identity)) return;
    expect(requirement.acceptedStrategies).toEqual([AssetIdentityStrategy.ContentIdentity]);
  });

  it('Shape B omits content identity and requires an external reference instead', () => {
    const excluded = getAssetProfileRequirement(TEST_EXTERNAL_SHAPE_V1, 'identity.content.not-required');
    expect(excluded?.obligation).toBe(AssetRequirementObligation.NotRequired);

    const required = getAssetProfileRequirement(TEST_EXTERNAL_SHAPE_V1, 'identity.external-registry.required');
    expect(required?.obligation).toBe(AssetRequirementObligation.Required);
    if (!isAssetRequirementOfKind(required!, AssetRequirementKind.Identity)) throw new Error('expected identity');

    expect(required.acceptedStrategies).toContain(AssetIdentityStrategy.RegistryEntry);
    expect(required.acceptedStrategies).not.toContain(AssetIdentityStrategy.ContentIdentity);
    // The generic external-registry model frozen by Gate A0 / U-2 — no
    // jurisdiction- or domain-specific enum member anywhere.
    expect(required.registry?.acceptedTypes).toEqual([RegistryType.Custom]);
    expect(required.registry?.acceptedAuthorityLevels).toEqual([RegistryAuthorityLevel.External]);
  });

  it('Shape B carries a freshness constraint over an observation instant', () => {
    const requirement = getAssetProfileRequirement(TEST_EXTERNAL_SHAPE_V1, 'evidence.registry.observation');
    if (!isAssetRequirementOfKind(requirement!, AssetRequirementKind.Evidence)) throw new Error('expected evidence');
    expect(requirement.freshness?.maxAgeSeconds).toBeGreaterThan(0);
  });

  it('Shape B constrains the attester by generic Protocol credential semantics only', () => {
    const requirement = getAssetProfileRequirement(TEST_EXTERNAL_SHAPE_V1, 'attestation.professional.required');
    if (!isAssetRequirementOfKind(requirement!, AssetRequirementKind.Attestation)) {
      throw new Error('expected attestation');
    }

    expect(requirement.acceptedTypes).toEqual([AttestationType.Human]);
    expect(requirement.attester?.credential?.acceptedTypes).toEqual([CredentialType.ProfessionalCredential]);
    // Roles are opaque vertical tokens; no profession is named by the framework.
    expect(requirement.attester?.acceptedRoles).toEqual(['test.role.reviewer']);
  });

  it('expresses declaration and evidence requirements without constructing any Protocol record', () => {
    const declarations = listAssetProfileRequirements(TEST_CONTENT_SHAPE_V1, {
      kind: AssetRequirementKind.Declaration,
    });
    const evidence = listAssetProfileRequirements(TEST_CONTENT_SHAPE_V1, { kind: AssetRequirementKind.Evidence });

    expect(declarations).toHaveLength(1);
    expect(evidence).toHaveLength(1);
    if (!isAssetRequirementOfKind(declarations[0], AssetRequirementKind.Declaration)) throw new Error('kind');
    if (!isAssetRequirementOfKind(evidence[0], AssetRequirementKind.Evidence)) throw new Error('kind');

    // The requirement names Protocol's vocabulary; it never carries a record.
    expect(declarations[0].claimType).toBe(ClaimType.Authorship);
    expect(evidence[0].acceptedTypes).toContain(EvidenceType.Document);

    const fields = new Set<string>();
    const collect = (value: unknown): void => {
      if (typeof value !== 'object' || value === null) return;
      if (Array.isArray(value)) {
        value.forEach(collect);
        return;
      }
      for (const [key, nested] of Object.entries(value)) {
        fields.add(key);
        collect(nested);
      }
    };
    collect([TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1]);

    // Nothing in a profile is a `CanonicalEvidence`/`CanonicalClaim`/
    // `CanonicalAttestation`/`CanonicalVerification` record: a profile states
    // requirements, and records are minted later and live in Protocol's shapes.
    // (`attester` is deliberately absent from this list — on a requirement it is
    // a *constraint* on who may attest, not `CanonicalAttestation.attester`.)
    for (const recordField of [
      'evidenceRefs',
      'attestationRefs',
      'claimRef',
      'assertionRef',
      'issuer',
      'issuedAt',
      'verifier',
      'verifiedAt',
      'findings',
      'statement',
      'proofRefs',
      'registryRefs',
      'credentialRefs',
      'subject',
      'createdAt',
    ]) {
      expect(fields).not.toContain(recordField);
    }
  });

  it('never widens or reuses Protocol VerificationStatus as a check outcome', () => {
    const requirement = getAssetProfileRequirement(TEST_EXTERNAL_SHAPE_V1, 'verification.registry.lookup');
    if (!isAssetRequirementOfKind(requirement!, AssetRequirementKind.Verification)) throw new Error('kind');

    // The profile names checks; it declares no outcome vocabulary at all, so
    // Protocol's three-member record status is untouched (APV-00 F-2).
    expect(requirement.checkIds.length).toBeGreaterThan(0);
    expect(Object.keys(VerificationStatus)).toEqual(['Pending', 'Verified', 'Failed']);
    expect(JSON.stringify(TEST_EXTERNAL_SHAPE_V1)).not.toContain('MANUAL_REVIEW');
  });

  it('carries no legal conclusion, ownership assertion or domain field', () => {
    const serialized = JSON.stringify([TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1]).toLowerCase();
    for (const forbidden of [
      'owner',
      'titleholder',
      'legalowner',
      'enforceable',
      'notary',
      'lawyer',
      'finca',
      'registronacional',
      'costa rica',
      'token',
      'mint',
      'erc-20',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
