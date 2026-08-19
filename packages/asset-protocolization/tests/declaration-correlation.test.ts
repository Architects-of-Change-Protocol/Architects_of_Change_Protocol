import { ClaimType } from '@aoc/protocol/claims';

import {
  AssetRequirementKind,
  DECLARATION_ERROR_CODES,
  DeclarationError,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProtocolizationCaseError,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementConditionStatus,
  ProtocolizationRequirementMaterialStatus,
  associateProtocolizationCaseMaterial,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
  recordProtocolizationDeclaration,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import {
  TEST_CLAIM_ID,
  TEST_DECLARATION_SHAPE_V1,
  TEST_DECLARATION_SHAPE_V1_AT_2_0_0,
  TEST_SECOND_CLAIM_ID,
  canonicalDeclaration,
  referencedDeclaration,
  testCanonicalClaim,
} from './fixtures/test-declarations';

/**
 * How a declaration reaches the case, how it correlates to the requirements of
 * the case's **pinned** profile version, and what that correlation does and
 * does not mean.
 */

const DECLARATION_PIN = { profileId: TEST_DECLARATION_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(
  context = createTestContext(),
  profile = DECLARATION_PIN,
  caseId = 'case-0001',
): ProtocolizationCase {
  return createProtocolizationCase(context, { caseId, profile, subject: TEST_CONTENT_SUBJECT })
    .protocolizationCase;
}

describe('case integration', () => {
  it('records the declaration as APV-04 case material, reusing the Declaration pathway', () => {
    const context = createTestContext();
    const { protocolizationCase, caseEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    // There is exactly one material list on a case. APV-06 does not add a
    // second, parallel declarations list.
    expect(protocolizationCase.materials).toHaveLength(1);
    expect(protocolizationCase.materials[0]).toMatchObject({
      materialId: 'material-d001',
      kind: ProtocolizationMaterialKind.Declaration,
      claimRef: TEST_CLAIM_ID,
      requirementIds: ['declaration.authorship.required'],
      addedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(caseEvent.eventType).toBe('ProtocolizationMaterialAdded');
  });

  it('records the reference and discards a supplied claim document', () => {
    const context = createTestContext();
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      canonicalDeclaration({ caseId: 'case-0001' }),
    );

    expect(record.claimRef).toBe(TEST_CLAIM_ID);
    expect(record.claimType).toBe(ClaimType.Authorship);
    // The document is read for its `id` and `type`, then dropped. Neither the
    // case nor the record carries a second copy of a Protocol record.
    expect(JSON.stringify(protocolizationCase)).not.toContain('assertionRef');
    expect(record).not.toHaveProperty('claim');
  });

  it('reads the claim type off a supplied document rather than a second spelling', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      canonicalDeclaration({
        caseId: 'case-0001',
        claim: testCanonicalClaim({ type: ClaimType.Authorization }),
        requirementIds: ['declaration.representation.required'],
      }),
    );

    expect(record.claimType).toBe(ClaimType.Authorization);
  });

  it('increments the case revision exactly once', () => {
    const context = createTestContext();
    const before = openCase(context);
    const { protocolizationCase, record, declarationEvent, caseEvent } =
      recordProtocolizationDeclaration(context, before, referencedDeclaration({ caseId: 'case-0001' }));

    expect(before.revision).toBe(1);
    expect(protocolizationCase.revision).toBe(2);
    expect(record.caseRevision).toBe(2);
    expect(declarationEvent.caseRevision).toBe(2);
    expect(caseEvent.caseRevision).toBe(2);
  });

  it('moves the correlated requirement from Pending to MaterialPresent, and nothing further', () => {
    const context = createTestContext();
    const before = openCase(context);

    expect(
      getProtocolizationCaseRequirementProgress(
        before,
        TEST_DECLARATION_SHAPE_V1,
        'declaration.authorship.required',
      )?.materialStatus,
    ).toBe(ProtocolizationRequirementMaterialStatus.Pending);

    const { protocolizationCase } = recordProtocolizationDeclaration(
      context,
      before,
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    const progress = getProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_DECLARATION_SHAPE_V1,
      'declaration.authorship.required',
    );

    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    expect(progress?.materialIds).toEqual(['material-d001']);

    // Still exactly two statuses. There is no `Declared`, `Asserted`,
    // `Verified`, `Satisfied` or `Ready` for a declaration to reach.
    expect(Object.values(ProtocolizationRequirementMaterialStatus).sort()).toEqual([
      'MaterialPresent',
      'Pending',
    ]);
  });

  // `Optional` requirements are deliberately absent from this projection:
  // APV-04 lists what readiness would still be waiting on, and an optional
  // requirement never is.
  it('leaves every other requirement untouched', () => {
    const context = createTestContext();
    const { protocolizationCase } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    expect(
      listProtocolizationCasePendingMaterialRequirements(
        protocolizationCase,
        TEST_DECLARATION_SHAPE_V1,
      ).map((entry) => entry.requirementId),
    ).toEqual([
      'identity.content.required',
      'declaration.representation.required',
      'declaration.correspondence.required',
      'declaration.supplementary.conditional',
    ]);
  });

  it('correlates one declaration with several declaration requirements at once', () => {
    const context = createTestContext();
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        requirementIds: ['declaration.authorship.required', 'declaration.authorship.secondary'],
      }),
    );

    // One claim, one material, two correlations. The kind rule is "every
    // correlated requirement is a Declaration requirement", not "exactly one".
    expect(protocolizationCase.materials).toHaveLength(1);
    expect(record.requirementIds).toEqual([
      'declaration.authorship.required',
      'declaration.authorship.secondary',
    ]);
  });

  it('widens an existing correlation through APV-04, not through a second declaration', () => {
    const context = createTestContext();
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    const widened = associateProtocolizationCaseMaterial(context, protocolizationCase, {
      materialId: record.materialId,
      requirementIds: ['identity.content.required'],
    });

    expect(widened.protocolizationCase.materials[0].requirementIds).toEqual([
      'declaration.authorship.required',
      'identity.content.required',
    ]);
    // The record is a historical fact about one declaration, not a live view of
    // the material's current correlations. It does not change.
    expect(record.requirementIds).toEqual(['declaration.authorship.required']);
  });

  it.each([
    ['an unknown requirement id', ['declaration.nonexistent']],
    ['a requirement id from a different profile', ['evidence.provenance.minimum']],
  ])('refuses %s', (_label, requirementIds) => {
    const context = createTestContext();
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({ caseId: 'case-0001', requirementIds }),
      ),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement }));
  });

  it('refuses a submission naming a different case', () => {
    const context = createTestContext();
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({ caseId: 'case-other' }),
      ),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.caseMismatch }));
  });
});

describe('requirement-kind compatibility', () => {
  /**
   * The frozen APV-06 invariant.
   *
   * APV-04's `correlate` is kind-blind: it moves *every* id in `requirementIds`
   * to `MaterialPresent` and stamps each with the new material's id. So if a
   * declaration could name a non-declaration requirement, the case would report
   * evidence / verification / attestation / identity material as present when a
   * claim reference — and nothing else — had arrived. Every correlated
   * requirement must therefore be a Declaration requirement.
   */
  it.each([
    ['an Evidence requirement', 'evidence.supporting.optional', AssetRequirementKind.Evidence],
    ['a Verification requirement', 'verification.declared.integrity', AssetRequirementKind.Verification],
    ['an Attestation requirement', 'attestation.declared.review', AssetRequirementKind.Attestation],
    ['an Identity requirement', 'identity.content.required', AssetRequirementKind.Identity],
  ])('refuses a declaration mixed with %s, before any case mutation', (_label, requirementId, kind) => {
    const context = createTestContext();
    const before = openCase(context);

    // The fixture really does declare that id at that kind — otherwise this
    // test would pass for the wrong reason.
    expect(
      TEST_DECLARATION_SHAPE_V1.requirements.find((requirement) => requirement.id === requirementId)
        ?.kind,
    ).toBe(kind);

    try {
      recordProtocolizationDeclaration(
        context,
        before,
        referencedDeclaration({
          caseId: 'case-0001',
          requirementIds: ['declaration.authorship.required', requirementId],
        }),
      );
      throw new Error('expected the declaration to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(DeclarationError);
      const declarationError = error as DeclarationError;
      expect(declarationError.code).toBe(DECLARATION_ERROR_CODES.incompatibleRequirement);
      // The details name exactly the offending id — not the whole list.
      expect(declarationError.details.requirementIds).toEqual([requirementId]);
    }

    // Rejected before `addProtocolizationCaseMaterial` ran: the case is
    // byte-for-byte what it was, with no material, no revision increment and
    // no requirement moved off Pending.
    expect(before.revision).toBe(1);
    expect(before.materials).toEqual([]);
    expect(before.updatedAt).toBe('2026-01-01T00:00:00.000Z');
    for (const requirement of [requirementId, 'declaration.authorship.required']) {
      expect(
        getProtocolizationCaseRequirementProgress(before, TEST_DECLARATION_SHAPE_V1, requirement)
          ?.materialStatus,
      ).toBe(ProtocolizationRequirementMaterialStatus.Pending);
    }
  });

  it('never lets a claim reference stand as material for a non-declaration requirement', () => {
    const context = createTestContext();
    let current = openCase(context);

    // A legitimate declaration, correlated only to declaration requirements.
    current = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({ caseId: 'case-0001' }),
    ).protocolizationCase;

    // Every requirement the case now reports as MaterialPresent is a
    // Declaration requirement. Nothing else moved.
    const present = listProtocolizationCaseRequirementProgress(current, TEST_DECLARATION_SHAPE_V1, {
      materialStatus: ProtocolizationRequirementMaterialStatus.MaterialPresent,
    });
    expect(present.map((entry) => entry.requirementId)).toEqual([
      'declaration.authorship.required',
    ]);
    for (const entry of present) {
      expect(
        TEST_DECLARATION_SHAPE_V1.requirements.find((r) => r.id === entry.requirementId)?.kind,
      ).toBe(AssetRequirementKind.Declaration);
    }
  });

  it('refuses a declaration correlated only to non-declaration requirements', () => {
    const context = createTestContext();

    // "Someone asserted something" is not a document. A profile that asked for
    // evidence has not been answered by an assertion, and the profile says so
    // mechanically: the requirement's kind is `Evidence`.
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({
          caseId: 'case-0001',
          requirementIds: ['evidence.supporting.optional'],
        }),
      ),
    ).toThrow(
      expect.objectContaining({ code: DECLARATION_ERROR_CODES.incompatibleRequirement }),
    );
  });

  it('refuses a declaration whose claim type is not the one the requirement names', () => {
    const context = createTestContext();
    try {
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({
          caseId: 'case-0001',
          claimType: ClaimType.Identity,
          requirementIds: ['declaration.authorship.required'],
        }),
      );
      throw new Error('expected the declaration to fail');
    } catch (error) {
      expect(error).toMatchObject({
        code: DECLARATION_ERROR_CODES.claimTypeMismatch,
        details: { requirementIds: ['declaration.authorship.required'] },
      });
    }
  });

  it('refuses a Custom declaration that omits the subtype the profile narrows to', () => {
    const context = createTestContext();
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({
          caseId: 'case-0001',
          claimType: ClaimType.Custom,
          requirementIds: ['declaration.correspondence.required'],
        }),
      ),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.claimTypeMismatch }));
  });

  it('accepts a Custom declaration carrying the subtype the profile narrows to', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        claimType: ClaimType.Custom,
        claimSubtype: 'test.declaration.subject-correspondence',
        requirementIds: ['declaration.correspondence.required'],
      }),
    );

    // A whole proposition family the production package has never heard of,
    // admitted with no code change anywhere: the profile defines it.
    expect(record.claimType).toBe(ClaimType.Custom);
    expect(record.claimSubtype).toBe('test.declaration.subject-correspondence');
  });
});

describe('pinned profile version governs correlation', () => {
  it('refuses a requirement that exists only in a newer version of the same line', () => {
    const context = createTestContext();
    const pinned = openCase(context, DECLARATION_PIN, 'case-pinned');

    expect(
      TEST_DECLARATION_SHAPE_V1_AT_2_0_0.requirements.map((requirement) => requirement.id),
    ).toContain('declaration.successor.required');
    expect(TEST_DECLARATION_SHAPE_V1.requirements.map((requirement) => requirement.id)).not.toContain(
      'declaration.successor.required',
    );

    try {
      recordProtocolizationDeclaration(
        context,
        pinned,
        referencedDeclaration({
          caseId: 'case-pinned',
          claimType: ClaimType.Custom,
          claimSubtype: 'test.declaration.successor',
          requirementIds: ['declaration.successor.required'],
        }),
      );
      throw new Error('expected the declaration to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(ProtocolizationCaseError);
      const caseError = error as ProtocolizationCaseError;
      expect(caseError.code).toBe(PROTOCOLIZATION_CASE_ERROR_CODES.unknownRequirement);
      expect(caseError.details.profile).toEqual(DECLARATION_PIN);
    }
  });

  it('records the pin the correlation was checked against', () => {
    const context = createTestContext();
    const { record, declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    expect(record.profile).toEqual(DECLARATION_PIN);
    expect(declarationEvent.profile).toEqual(DECLARATION_PIN);
  });

  it('never changes the case pin or subject, whatever is declared', () => {
    const context = createTestContext();
    const before = openCase(context);
    const { protocolizationCase } = recordProtocolizationDeclaration(
      context,
      before,
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    expect(protocolizationCase.profile).toEqual(before.profile);
    expect(protocolizationCase.subject).toEqual(before.subject);
    expect(protocolizationCase.tenantId).toBe(before.tenantId);
  });

  it('does not overwrite the case subject with the declarant', () => {
    const context = createTestContext();
    const before = openCase(context);
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      before,
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    // The declarant is a participant asserting something *about* the subject.
    // The subject is what the case is about. Conflating them would make every
    // case a case about whoever last filled in a form.
    expect(protocolizationCase.subject.subjectRef).toEqual(before.subject.subjectRef);
    expect(protocolizationCase.subject.subjectRef.sovereignAssetId).not.toBe(record.declarant.id);
  });
});

describe('obligations are respected, not reinterpreted', () => {
  it('leaves a Conditional declaration requirement Unresolved after a declaration arrives', () => {
    const context = createTestContext();
    const { protocolizationCase } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Custom,
        claimSubtype: 'test.declaration.supplementary',
        requirementIds: ['declaration.supplementary.conditional'],
      }),
    );

    const progress = getProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_DECLARATION_SHAPE_V1,
      'declaration.supplementary.conditional',
    );

    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    // Declaring against a conditional requirement does not resolve whether the
    // requirement even applies.
    expect(progress?.conditionStatus).toBe(ProtocolizationRequirementConditionStatus.Unresolved);
  });
});
