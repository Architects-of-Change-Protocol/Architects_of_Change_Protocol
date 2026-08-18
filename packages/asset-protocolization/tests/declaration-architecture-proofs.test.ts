import { ClaimType, PrincipalKind } from '@aoc/protocol/claims';

import {
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  createInMemoryDeclarationRepository,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  recordProtocolizationDeclaration,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import {
  TENANT_A,
  TEST_BARE_SUBJECT,
  TEST_CONTENT_SUBJECT,
  TEST_EXTERNAL_SUBJECT,
  createTestContext,
} from './fixtures/test-cases';
import {
  TEST_DECLARANT_A,
  TEST_DECLARANT_ORGANIZATION,
  TEST_DECLARATION_SHAPE_V1,
  TEST_SECOND_CLAIM_ID,
  TEST_THIRD_CLAIM_ID,
  referencedDeclaration,
  sync,
} from './fixtures/test-declarations';

/**
 * The APV-06 architecture proofs.
 *
 * One generic operation, fundamentally different kinds of subject and
 * fundamentally different kinds of assertion — with no branch anywhere on what
 * any of them is, and no conclusion anywhere about whether any of them is true.
 */

const DECLARATION_PIN = { profileId: TEST_DECLARATION_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(
  context: ReturnType<typeof createTestContext>,
  caseId: string,
  subject = TEST_CONTENT_SUBJECT,
): ProtocolizationCase {
  return createProtocolizationCase(context, { caseId, profile: DECLARATION_PIN, subject })
    .protocolizationCase;
}

describe('proof A — a content subject', () => {
  it('records a declaration about a subject that has bytes', () => {
    const context = createTestContext();
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      openCase(context, 'case-content', TEST_CONTENT_SUBJECT),
      referencedDeclaration({
        caseId: 'case-content',
        statement: 'I assert the test proposition about this content.',
      }),
    );

    expect(protocolizationCase.subject.contentIdentity).toBeDefined();
    expect(protocolizationCase.materials[0].kind).toBe(ProtocolizationMaterialKind.Declaration);
    expect(
      getProtocolizationCaseRequirementProgress(
        protocolizationCase,
        TEST_DECLARATION_SHAPE_V1,
        'declaration.authorship.required',
      )?.materialStatus,
    ).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);

    // No digest was computed, no bytes were read, and no conclusion was drawn
    // about the content or the assertion.
    expect(record).not.toHaveProperty('digestMatches');
    expect(record).not.toHaveProperty('isVerified');
  });
});

describe('proof B — an externally referenced subject', () => {
  it('records "this external entry corresponds to this subject" with no lookup and no conclusion', () => {
    const context = createTestContext();
    const external = openCase(context, 'case-external', TEST_EXTERNAL_SUBJECT);

    // A subject with no byte representation at all, named only by an abstract
    // external namespace.
    expect(external.subject.contentIdentity).toBeUndefined();
    expect(external.subject.subjectRef.externalReference).toEqual({
      namespace: 'test.namespace.external',
      id: 'test-entry-0001',
    });

    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      external,
      referencedDeclaration({
        caseId: 'case-external',
        claimType: ClaimType.Custom,
        claimSubtype: 'test.declaration.subject-correspondence',
        requirementIds: ['declaration.correspondence.required'],
        statement: 'The referenced external entry corresponds to this subject.',
      }),
    );

    expect(record.claimSubtype).toBe('test.declaration.subject-correspondence');
    expect(protocolizationCase.materials).toHaveLength(1);

    // Exactly the same operation as proof A. No external call was made, no
    // entry was resolved, and nothing concluded that the correspondence holds
    // or that it means anything in law.
    for (const field of [
      'resolved',
      'entryFound',
      'registryConfirmed',
      'authoritative',
      'legallyRecognized',
    ]) {
      expect(record).not.toHaveProperty(field);
    }
  });

  it('records a declaration about a subject that is not yet identified at all', () => {
    const context = createTestContext();
    const bare = openCase(context, 'case-bare', TEST_BARE_SUBJECT);

    // Progressive protocolization: the case begins before the material that
    // will identify the subject has arrived, and a participant may already
    // assert something about it.
    expect(bare.subject.contentIdentity).toBeUndefined();
    expect(bare.subject.subjectRef.externalReference).toBeUndefined();

    const { record } = recordProtocolizationDeclaration(
      context,
      bare,
      referencedDeclaration({ caseId: 'case-bare' }),
    );

    expect(record.declarant).toEqual(TEST_DECLARANT_A);
  });
});

describe('proof C — an authority-like declaration', () => {
  it('records "actor A states that actor A may act for entity B" and creates no authority', () => {
    const context = createTestContext();
    const repository = createInMemoryDeclarationRepository();

    const { protocolizationCase, record, declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context, 'case-authority'),
      referencedDeclaration({
        caseId: 'case-authority',
        declarant: TEST_DECLARANT_A,
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
        statement: 'I am authorized to act for the referenced entity.',
      }),
    );
    repository.save(record);

    // What was recorded: an assertion, by a named participant, at a time.
    expect(record.claimType).toBe(ClaimType.Authorization);
    expect(record.declarant.id).toBe(TEST_DECLARANT_A.id);
    expect(record.recordedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(sync(repository.listByCase(TENANT_A, 'case-authority'))).toEqual([record]);

    // What was not: any of this, anywhere, on any output. The hard proof.
    for (const field of [
      'authorityVerified',
      'authorized',
      'authority',
      'delegationValidated',
      'delegationValid',
      'representationValid',
      'representationCurrent',
      'enterpriseGrant',
      'grant',
      'grants',
      'capability',
      'capabilities',
      'policy',
      'mandate',
      'principalResolved',
    ]) {
      expect(record).not.toHaveProperty(field);
      expect(declarationEvent).not.toHaveProperty(field);
      expect(protocolizationCase).not.toHaveProperty(field);
    }

    // And the requirement it answers moved exactly one step: material present.
    const progress = getProtocolizationCaseRequirementProgress(
      protocolizationCase,
      TEST_DECLARATION_SHAPE_V1,
      'declaration.representation.required',
    );
    expect(progress?.materialStatus).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
    expect(progress).not.toHaveProperty('satisfied');
  });

  it('records an organization asserting representation without resolving the relationship', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context, 'case-org'),
      referencedDeclaration({
        caseId: 'case-org',
        declarant: TEST_DECLARANT_ORGANIZATION,
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
      }),
    );

    expect(record.declarant.kind).toBe(PrincipalKind.Organization);
    // Whether this organization may act for anyone is not asked and not
    // answered. `PrincipalKind` describes a principal; it confers nothing.
    expect(record.declarant).not.toHaveProperty('standing');
    expect(record.declarant).not.toHaveProperty('role');
  });
});

describe('one operation, three assertion families, no branching', () => {
  it('handles authorship-, authority- and correspondence-like declarations identically', () => {
    const context = createTestContext();
    let current = openCase(context, 'case-all');

    const declarations = [
      {
        claimType: ClaimType.Authorship,
        requirementIds: ['declaration.authorship.required'],
        claimRef: undefined,
      },
      {
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
        claimRef: TEST_SECOND_CLAIM_ID,
      },
      {
        claimType: ClaimType.Custom,
        claimSubtype: 'test.declaration.subject-correspondence',
        requirementIds: ['declaration.correspondence.required'],
        claimRef: TEST_THIRD_CLAIM_ID,
      },
    ];

    declarations.forEach((declaration, index) => {
      context.clock.advance(60);
      current = recordProtocolizationDeclaration(
        context,
        current,
        referencedDeclaration({
          caseId: 'case-all',
          declarationId: `declaration-000${index + 1}`,
          materialId: `material-d00${index + 1}`,
          ...(declaration.claimRef === undefined ? {} : { claimRef: declaration.claimRef }),
          claimType: declaration.claimType,
          ...(declaration.claimSubtype === undefined
            ? {}
            : { claimSubtype: declaration.claimSubtype }),
          requirementIds: declaration.requirementIds,
        }),
      ).protocolizationCase;
    });

    // Three fundamentally different propositions, one code path, one material
    // kind, and no member of any of them named anywhere in production code.
    expect(current.materials).toHaveLength(3);
    expect(new Set(current.materials.map((material) => material.kind))).toEqual(
      new Set([ProtocolizationMaterialKind.Declaration]),
    );
    expect(current.revision).toBe(4);
  });
});
