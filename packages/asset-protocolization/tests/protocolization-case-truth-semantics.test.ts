import {
  AssetRequirementObligation,
  ProtocolizationCaseState,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
  addProtocolizationCaseMaterial,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase, ProtocolizationCaseMaterialInput } from '@aoc/asset-protocolization';

import {
  TEST_CONDITIONAL_SHAPE_V1,
  TEST_CONTENT_IDENTITY,
  TEST_CONTENT_SUBJECT,
  createTestContext,
} from './fixtures/test-cases';
import type { TestContext } from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1 } from './fixtures/test-profiles';

/**
 * The epistemic acceptance tests.
 *
 * The failure mode this slice has to be immune to is a reader treating the
 * *presence* of something as a *favourable outcome* — the same asymmetry APV-02
 * froze as I-9 and I-10 for the result envelope. These assert it mechanically,
 * over the actual key set of the produced values, rather than trusting a comment
 * to hold the line.
 */

function caseWith(
  context: TestContext,
  materials: readonly ProtocolizationCaseMaterialInput[],
): ProtocolizationCase {
  const created = createProtocolizationCase(context, {
    caseId: 'case-truth',
    profile: { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: TEST_CONTENT_SHAPE_V1.version },
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
  return materials.reduce(
    (accumulated, material) =>
      addProtocolizationCaseMaterial(context, accumulated, material).protocolizationCase,
    created,
  );
}

const everyKey = (value: unknown, seen: string[] = []): readonly string[] => {
  if (typeof value !== 'object' || value === null) return seen;
  for (const [key, entry] of Object.entries(value)) {
    seen.push(key);
    everyKey(entry, seen);
  }
  return seen;
};

describe('material presence is not truth', () => {
  it('a declaration reference does not make the declaration true or ownership established', () => {
    const context = createTestContext();
    const result = caseWith(context, [
      {
        materialId: 'm-claim',
        kind: ProtocolizationMaterialKind.Declaration,
        requirementIds: ['declaration.authorship.required'],
        claimRef: 'claim-0001',
      },
    ]);

    const progress = getProtocolizationCaseRequirementProgress(
      result,
      context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0')!,
      'declaration.authorship.required',
    );

    // The strongest statement the case makes is "material is present".
    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    expect(Object.values(progress ?? {})).not.toContain('Verified');
    expect(Object.values(progress ?? {})).not.toContain('Satisfied');
    expect(result.state).toBe(ProtocolizationCaseState.Draft);
  });

  it('an evidence reference does not make the evidence valid or the requirement verified', () => {
    const context = createTestContext();
    const result = caseWith(context, [
      {
        materialId: 'm-evidence',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: 'evidence-0001',
      },
    ]);

    const progress = getProtocolizationCaseRequirementProgress(
      result,
      context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0')!,
      'evidence.provenance.minimum',
    );

    expect(Object.keys(progress ?? {})).toEqual(
      expect.not.arrayContaining(['verified', 'valid', 'satisfied', 'accepted', 'passed']),
    );
    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
  });

  it('a verification reference carries no outcome, so nothing can be read as a pass', () => {
    const context = createTestContext();
    const result = caseWith(context, [
      {
        materialId: 'm-verification',
        kind: ProtocolizationMaterialKind.Verification,
        requirementIds: ['verification.content.integrity'],
        verificationRef: 'verification-0001',
      },
    ]);

    const material = result.materials[0];
    expect(Object.keys(material).sort()).toEqual(
      ['addedAt', 'kind', 'materialId', 'requirementIds', 'verificationRef'].sort(),
    );
    // No status, no findings, no confidence — the outcome lives in the
    // `CanonicalVerification` record, which this package never carries.
    expect(material).not.toHaveProperty('status');
    expect(material).not.toHaveProperty('outcome');
  });

  it('an attestation reference does not make the case attested', () => {
    const context = createTestContext();
    const result = caseWith(context, [
      {
        materialId: 'm-attestation',
        kind: ProtocolizationMaterialKind.Attestation,
        requirementIds: ['evidence.provenance.minimum'],
        attestationRef: 'attestation-0001',
      },
    ]);

    expect(everyKey(result)).toEqual(
      expect.not.arrayContaining(['attested', 'isAttested', 'attestedBy', 'notarized']),
    );
  });

  it('material against every required requirement does not make the case ready', () => {
    const context = createTestContext();
    const result = caseWith(context, [
      {
        materialId: 'm-content',
        kind: ProtocolizationMaterialKind.ContentIdentity,
        requirementIds: ['identity.content.required'],
        contentIdentity: TEST_CONTENT_IDENTITY,
      },
      {
        materialId: 'm-claim',
        kind: ProtocolizationMaterialKind.Declaration,
        requirementIds: ['declaration.authorship.required'],
        claimRef: 'claim-0001',
      },
      {
        materialId: 'm-evidence',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: 'evidence-0001',
      },
      {
        materialId: 'm-verification',
        kind: ProtocolizationMaterialKind.Verification,
        requirementIds: ['verification.content.integrity'],
        verificationRef: 'verification-0001',
      },
    ]);
    const profile = context.catalog.get(TEST_CONTENT_SHAPE_V1.profileId, '1.0.0')!;

    // Nothing is pending for material, and the case is still only a draft.
    expect(listProtocolizationCasePendingMaterialRequirements(result, profile)).toEqual([]);
    expect(result.state).toBe(ProtocolizationCaseState.Draft);
    expect(Object.values(ProtocolizationCaseState)).not.toContain('Ready');
    expect(Object.values(ProtocolizationCaseState)).not.toContain('Protocolized');
    expect(Object.values(ProtocolizationCaseState)).not.toContain('Approved');
  });

  it('offers no isReady, isVerified or isProtocolizable on the public surface', () => {
    // Read as a runtime value rather than a typed import: the assertion is about
    // the actual export surface, which a typed import would hide behind names.
    const facade = require('@aoc/asset-protocolization') as Record<string, unknown>;
    // `isValid*` structural validators are legitimate and present; what must not
    // exist is a predicate that claims an epistemic or legal outcome.
    const forbidden = /^(?:is|has)(?:Ready|Verified|Protocolizable|Satisfied|Attested|Approved|Owned|Registered)/;

    expect(Object.keys(facade).filter((name) => forbidden.test(name))).toEqual([]);
    // Guard the guard: the facade is non-empty, so the assertion is not vacuous.
    expect(Object.keys(facade)).toContain('createProtocolizationCase');
  });

  it('reports an unevaluated condition as unresolved rather than as a truth value', () => {
    const context = createTestContext();
    const created = createProtocolizationCase(context, {
      caseId: 'case-conditional',
      profile: {
        profileId: TEST_CONDITIONAL_SHAPE_V1.profileId,
        profileVersion: TEST_CONDITIONAL_SHAPE_V1.version,
      },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    const profile = context.catalog.get(TEST_CONDITIONAL_SHAPE_V1.profileId, '1.0.0')!;

    const conditional = listProtocolizationCaseRequirementProgress(created, profile).find(
      (progress) => progress.obligation === AssetRequirementObligation.Conditional,
    );

    expect(conditional?.requirementId).toBe('evidence.supplementary.conditional');
    expect(conditional?.conditionStatus).toBe(ProtocolizationRequirementConditionStatus.Unresolved);
    // Not `true`, not `false`, not "applies", not "not applicable".
    expect(Object.values(ProtocolizationRequirementConditionStatus)).toEqual([
      'NotApplicable',
      'Unresolved',
    ]);
  });

  it('keeps a conditional requirement in the pending list rather than deciding it away', () => {
    const context = createTestContext();
    const created = createProtocolizationCase(context, {
      caseId: 'case-conditional',
      profile: {
        profileId: TEST_CONDITIONAL_SHAPE_V1.profileId,
        profileVersion: TEST_CONDITIONAL_SHAPE_V1.version,
      },
      subject: TEST_CONTENT_SUBJECT,
    }).protocolizationCase;
    const profile = context.catalog.get(TEST_CONDITIONAL_SHAPE_V1.profileId, '1.0.0')!;

    expect(
      listProtocolizationCasePendingMaterialRequirements(created, profile).map((p) => p.requirementId),
    ).toEqual(['identity.content.required', 'evidence.supplementary.conditional']);
  });

  it('carries no ownership, legal-status or authority field anywhere on a case', () => {
    const context = createTestContext();
    const result = caseWith(context, [
      {
        materialId: 'm-claim',
        kind: ProtocolizationMaterialKind.Declaration,
        requirementIds: ['declaration.authorship.required'],
        claimRef: 'claim-0001',
      },
    ]);

    const forbidden = [
      'owner',
      'legalOwner',
      'titleHolder',
      'ownershipPercentage',
      'registered',
      'enforceable',
      'titleClear',
      'goodStanding',
      'transferable',
      'authorizedBy',
      'approvedBy',
      'waived',
      'exempt',
    ];

    expect(everyKey(result)).toEqual(expect.not.arrayContaining(forbidden));
  });

  it('offers no waiver, override or force-ready operation on the public surface', () => {
    // As above: the runtime export surface, not the declared type.
    const facade = require('@aoc/asset-protocolization') as Record<string, unknown>;
    const forbidden = /waive|override|bypass|forceReady|approveException|adminOverride/i;

    expect(Object.keys(facade).filter((name) => forbidden.test(name))).toEqual([]);
  });
});
