import { ClaimType } from '@aoc/protocol/claims';

import {
  DECLARATION_ERROR_CODES,
  PROTOCOLIZATION_CASE_ERROR_CODES,
  ProtocolizationMaterialKind,
  createInMemoryDeclarationRepository,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  intakeProtocolizationEvidence,
  recordProtocolizationDeclaration,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TENANT_A, TEST_CONTENT_SUBJECT, createTestContext } from './fixtures/test-cases';
import {
  TEST_CLAIM_ID,
  TEST_DECLARANT_A,
  TEST_DECLARANT_B,
  TEST_DECLARATION_SHAPE_V1,
  TEST_FOURTH_CLAIM_ID,
  TEST_SECOND_CLAIM_ID,
  TEST_THIRD_CLAIM_ID,
  referencedDeclaration,
  sync,
} from './fixtures/test-declarations';
import {
  TEST_EVIDENCE_ID,
  TEST_SECOND_EVIDENCE_ID,
  referencedSubmission,
} from './fixtures/test-evidence';

/**
 * Declarations and evidence arriving in every order, over the life of a case —
 * and conflicting declarations coexisting without anybody choosing a winner.
 *
 * This is the shape of real protocolization: a case begins while the external
 * world is unresolved, material accumulates asynchronously from several
 * participants, and evaluation happens later, over the accumulated record.
 */

const DECLARATION_PIN = { profileId: TEST_DECLARATION_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(context = createTestContext(), caseId = 'case-0001'): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId,
    profile: DECLARATION_PIN,
    subject: TEST_CONTENT_SUBJECT,
  }).protocolizationCase;
}

/** Evidence intake against this profile's own evidence requirement. */
function admitEvidence(
  context: ReturnType<typeof createTestContext>,
  current: ProtocolizationCase,
  overrides: Record<string, unknown> = {},
): ProtocolizationCase {
  return intakeProtocolizationEvidence(
    context,
    current,
    referencedSubmission({
      caseId: current.caseId,
      requirementIds: ['evidence.supporting.optional'],
      ...overrides,
    }),
  ).protocolizationCase;
}

describe('a declaration may exist long before any evidence', () => {
  it('records a declaration into a case that holds nothing at all', () => {
    const context = createTestContext();
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', statement: 'I created this work.' }),
    );

    expect(record.supportingEvidenceRefs).toBeUndefined();
    expect(
      protocolizationCase.materials.filter(
        (material) => material.kind === ProtocolizationMaterialKind.Evidence,
      ),
    ).toEqual([]);

    // Structurally present, and nothing more: admissibility is not evidentiary
    // sufficiency, and a profile's `minimumCount` is a later evaluator's
    // arithmetic.
    expect(
      getProtocolizationCaseRequirementProgress(
        protocolizationCase,
        TEST_DECLARATION_SHAPE_V1,
        'declaration.authorship.required',
      )?.materialStatus,
    ).toBe('MaterialPresent');
    expect(record).not.toHaveProperty('sufficient');
  });

  it('lets evidence arrive afterwards without rewriting the declaration', () => {
    const context = createTestContext();
    const declared = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    context.clock.advance(86_400);
    const withEvidence = admitEvidence(context, declared.protocolizationCase);

    expect(withEvidence.materials).toHaveLength(2);
    // The record is a historical fact about one act. Later evidence does not
    // reach back into it.
    expect(declared.record.supportingEvidenceRefs).toBeUndefined();
    expect(declared.record.recordedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('evidence may exist long before the declaration', () => {
  it('links evidence that is already in the case, without duplicating it', () => {
    const context = createTestContext();
    const withEvidence = admitEvidence(context, openCase(context));

    context.clock.advance(3600);
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      withEvidence,
      referencedDeclaration({
        caseId: 'case-0001',
        supportingEvidenceRefs: [TEST_EVIDENCE_ID],
      }),
    );

    expect(record.supportingEvidenceRefs).toEqual([TEST_EVIDENCE_ID]);
    // One evidence material, one declaration material. The evidence is
    // referenced, never copied into the declaration.
    expect(
      protocolizationCase.materials.filter(
        (material) => material.kind === ProtocolizationMaterialKind.Evidence,
      ),
    ).toHaveLength(1);
    expect(record).not.toHaveProperty('evidence');
  });

  it('links several evidence items to one declaration', () => {
    const context = createTestContext();
    let current = admitEvidence(context, openCase(context));
    context.clock.advance(60);
    current = admitEvidence(context, current, {
      intakeId: 'intake-0002',
      materialId: 'material-e002',
      evidenceRef: TEST_SECOND_EVIDENCE_ID,
    });

    context.clock.advance(60);
    const { record } = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({
        caseId: 'case-0001',
        supportingEvidenceRefs: [TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID],
      }),
    );

    expect(record.supportingEvidenceRefs).toEqual([TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID]);
  });

  it('lets one evidence item relate to several declarations', () => {
    const context = createTestContext();
    let current = admitEvidence(context, openCase(context));

    context.clock.advance(60);
    const first = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({ caseId: 'case-0001', supportingEvidenceRefs: [TEST_EVIDENCE_ID] }),
    );
    current = first.protocolizationCase;

    context.clock.advance(60);
    const second = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
        supportingEvidenceRefs: [TEST_EVIDENCE_ID],
      }),
    );

    expect(first.record.supportingEvidenceRefs).toEqual([TEST_EVIDENCE_ID]);
    expect(second.record.supportingEvidenceRefs).toEqual([TEST_EVIDENCE_ID]);
    // Still one evidence material in the case. Two declarations point at it.
    expect(
      second.protocolizationCase.materials.filter(
        (material) => material.kind === ProtocolizationMaterialKind.Evidence,
      ),
    ).toHaveLength(1);
  });

  it('refuses a link to evidence that is not in this case', () => {
    const context = createTestContext();
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        openCase(context),
        referencedDeclaration({
          caseId: 'case-0001',
          supportingEvidenceRefs: [TEST_EVIDENCE_ID],
        }),
      ),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.unknownEvidenceLink }));
  });

  it('refuses a link to evidence that lives in another tenant’s case', () => {
    // Tenant B admits the evidence into its own case.
    const tenantB = createTestContext('tenant-b');
    admitEvidence(tenantB, openCase(tenantB, 'case-b'));

    // Tenant A names it anyway. The failure is indistinguishable from "no such
    // evidence anywhere", which is exactly the answer tenant A is entitled to:
    // a case holds only material admitted into it, so no tenant comparison is
    // needed to make this impossible.
    const tenantA = createTestContext(TENANT_A);
    expect(() =>
      recordProtocolizationDeclaration(
        tenantA,
        openCase(tenantA),
        referencedDeclaration({
          caseId: 'case-0001',
          supportingEvidenceRefs: [TEST_EVIDENCE_ID],
        }),
      ),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.unknownEvidenceLink }));
  });

  it('reaches no conclusion about whether linked evidence supports the declaration', () => {
    const context = createTestContext();
    const current = admitEvidence(context, openCase(context));
    context.clock.advance(60);
    const { record, declarationEvent } = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({ caseId: 'case-0001', supportingEvidenceRefs: [TEST_EVIDENCE_ID] }),
    );

    // The evidence may support the assertion, contradict it, be irrelevant,
    // stale, ambiguous or forged. APV-06 records only that the declarant
    // pointed at it, and there is no field where any verdict could live.
    for (const field of [
      'evidenceSupportsClaim',
      'supportStrength',
      'relevance',
      'sufficiency',
      'corroborated',
      'contradicted',
    ]) {
      expect(record).not.toHaveProperty(field);
      expect(declarationEvent).not.toHaveProperty(field);
    }
  });
});

describe('conflicting declarations coexist', () => {
  it('records two participants asserting propositions that cannot both hold', () => {
    const context = createTestContext();
    const repository = createInMemoryDeclarationRepository();

    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        declarant: TEST_DECLARANT_A,
        statement: 'I created this work.',
      }),
    );
    repository.save(first.record);

    context.clock.advance(3600);
    const second = recordProtocolizationDeclaration(
      context,
      first.protocolizationCase,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        declarant: TEST_DECLARANT_B,
        claimRef: TEST_SECOND_CLAIM_ID,
        statement: 'Declarant A did not create this work; I did.',
      }),
    );
    repository.save(second.record);

    // Both are in the case, both are in the log, in the order they were made.
    expect(second.protocolizationCase.materials).toHaveLength(2);
    const history = sync(repository.listByCase(TENANT_A, 'case-0001'));
    expect(history.map((entry) => entry.declarationId)).toEqual([
      'declaration-0001',
      'declaration-0002',
    ]);
    expect(history.map((entry) => entry.declarant.id)).toEqual([
      TEST_DECLARANT_A.id,
      TEST_DECLARANT_B.id,
    ]);

    // Neither was overwritten, neither was marked false, no winner was chosen,
    // and no failure was emitted for the pair. Detecting and adjudicating the
    // conflict is APV-07's work — and it needs both of these to do it.
    expect(first.record.statement).toBe('I created this work.');
    for (const record of history) {
      expect(record).not.toHaveProperty('superseded');
      expect(record).not.toHaveProperty('supersededBy');
      expect(record).not.toHaveProperty('conflicted');
      expect(record).not.toHaveProperty('rejected');
      expect(record).not.toHaveProperty('isTrue');
    }

    // Both requirements' correlations survive: the case knows two declarations
    // answer the same requirement, and does not rank them.
    expect(
      getProtocolizationCaseRequirementProgress(
        second.protocolizationCase,
        TEST_DECLARATION_SHAPE_V1,
        'declaration.authorship.required',
      )?.materialIds,
    ).toEqual(['material-d001', 'material-d002']);
  });

  it('records the same proposition asserted by two different declarants', () => {
    const context = createTestContext();
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', declarant: TEST_DECLARANT_A }),
    );

    context.clock.advance(60);
    const second = recordProtocolizationDeclaration(
      context,
      first.protocolizationCase,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        declarant: TEST_DECLARANT_B,
        claimRef: TEST_SECOND_CLAIM_ID,
        statement: 'I created this work.',
      }),
    );

    // Two participants asserting the same thing is two declarations, not one.
    expect(second.protocolizationCase.materials).toHaveLength(2);
    expect(first.record.declarationId).not.toBe(second.record.declarationId);
  });
});

describe('repeated declarations behave deterministically', () => {
  it('refuses a second declaration naming the same claim in the same case', () => {
    const context = createTestContext();
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        first.protocolizationCase,
        referencedDeclaration({
          caseId: 'case-0001',
          declarationId: 'declaration-0002',
          materialId: 'material-d002',
        }),
      ),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.duplicateClaim }));
  });

  it('refuses an exact replay of the same submission', () => {
    const context = createTestContext();
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    // The claim check fires before the material check, so the more specific
    // code wins — and it is the same code either way for the same replay.
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        first.protocolizationCase,
        referencedDeclaration({ caseId: 'case-0001' }),
      ),
    ).toThrow(expect.objectContaining({ code: DECLARATION_ERROR_CODES.duplicateClaim }));
  });

  it('refuses a second declaration reusing a material id already in the case', () => {
    const context = createTestContext();
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    expect(() =>
      recordProtocolizationDeclaration(
        context,
        first.protocolizationCase,
        referencedDeclaration({
          caseId: 'case-0001',
          declarationId: 'declaration-0002',
          claimRef: TEST_SECOND_CLAIM_ID,
          claimType: ClaimType.Authorization,
          requirementIds: ['declaration.representation.required'],
        }),
      ),
    ).toThrow(expect.objectContaining({ code: PROTOCOLIZATION_CASE_ERROR_CODES.duplicateMaterial }));
  });

  it('never treats identical statement text as identity', () => {
    const context = createTestContext();
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', statement: 'I created this work.' }),
    );

    context.clock.advance(60);
    const second = recordProtocolizationDeclaration(
      context,
      first.protocolizationCase,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        declarant: TEST_DECLARANT_B,
        claimRef: TEST_SECOND_CLAIM_ID,
        statement: 'I created this work.',
      }),
    );

    // Word-for-word identical, and correctly two declarations: two people said
    // it. Deduplicating on text would have destroyed one of them.
    expect(second.protocolizationCase.materials).toHaveLength(2);
    expect(first.record.statement).toBe(second.record.statement);
    expect(first.record.claimRef).not.toBe(second.record.claimRef);
  });

  it('rejects a failed declaration without mutating the case or its revision', () => {
    const context = createTestContext();
    const before = openCase(context);

    expect(() =>
      recordProtocolizationDeclaration(
        context,
        before,
        referencedDeclaration({ caseId: 'case-0001', requirementIds: ['declaration.nonexistent'] }),
      ),
    ).toThrow();

    expect(before.revision).toBe(1);
    expect(before.materials).toEqual([]);
    expect(before.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('a long-lived case accumulates an ordered, immutable history', () => {
  it('interleaves declarations and evidence over months', () => {
    const context = createTestContext();
    const repository = createInMemoryDeclarationRepository();
    let current = openCase(context);

    // T1 — declarant A asserts.
    const t1 = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({ caseId: 'case-0001', declarant: TEST_DECLARANT_A }),
    );
    repository.save(t1.record);
    current = t1.protocolizationCase;

    // T2 — evidence arrives.
    context.clock.advance(86_400);
    current = admitEvidence(context, current);

    // T3 — more evidence.
    context.clock.advance(86_400 * 30);
    current = admitEvidence(context, current, {
      intakeId: 'intake-0002',
      materialId: 'material-e002',
      evidenceRef: TEST_SECOND_EVIDENCE_ID,
    });

    // T4 — declarant B asserts something else, pointing at both.
    context.clock.advance(86_400 * 30);
    const t4 = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        declarant: TEST_DECLARANT_B,
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
        supportingEvidenceRefs: [TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID],
      }),
    );
    repository.save(t4.record);
    current = t4.protocolizationCase;

    // T5 — a third declaration, correcting nothing and superseding nothing.
    context.clock.advance(60);
    const t5 = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0003',
        materialId: 'material-d003',
        claimRef: TEST_THIRD_CLAIM_ID,
        claimType: ClaimType.Custom,
        claimSubtype: 'test.declaration.subject-correspondence',
        requirementIds: ['declaration.correspondence.required'],
      }),
    );
    repository.save(t5.record);
    current = t5.protocolizationCase;

    expect(current.revision).toBe(6);
    expect(current.materials).toHaveLength(5);

    const history = sync(repository.listByCase(TENANT_A, 'case-0001'));
    expect(history.map((entry) => entry.recordedAt)).toEqual([
      '2026-01-01T00:00:00.000Z',
      '2026-03-03T00:00:00.000Z',
      '2026-03-03T00:01:00.000Z',
    ]);
    // Every declaration is still individually observable. There is no "current
    // declaration state" that the last one overwrote.
    expect(history.map((entry) => entry.claimRef)).toEqual([
      TEST_CLAIM_ID,
      TEST_SECOND_CLAIM_ID,
      TEST_THIRD_CLAIM_ID,
    ]);
  });

  it('records a correction as a new declaration, leaving the original intact', () => {
    const context = createTestContext();
    const repository = createInMemoryDeclarationRepository();

    const original = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', statement: 'I created this work in 2019.' }),
    );
    repository.save(original.record);

    context.clock.advance(86_400);
    const correction = recordProtocolizationDeclaration(
      context,
      original.protocolizationCase,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        claimRef: TEST_FOURTH_CLAIM_ID,
        statement: 'Correction: I created this work in 2020.',
      }),
    );
    repository.save(correction.record);

    const history = sync(repository.listByCase(TENANT_A, 'case-0001'));
    expect(history).toHaveLength(2);
    expect(history[0].statement).toBe('I created this work in 2019.');
    // The original was neither rewritten nor removed. Erasing it would destroy
    // the only evidence of what was first asserted.
    expect(history[0]).not.toHaveProperty('supersededBy');
    expect(history[1]).not.toHaveProperty('supersedes');
  });
});
