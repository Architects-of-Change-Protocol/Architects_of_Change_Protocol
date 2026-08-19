import { ClaimType, PrincipalKind } from '@aoc/protocol/claims';

import * as assetProtocolization from '@aoc/asset-protocolization';
import {
  PROTOCOLIZATION_DECLARATION_EVENT_TYPES,
  ProtocolizationCaseState,
  ProtocolizationRequirementMaterialStatus,
  createProtocolizationCase,
  listProtocolizationCasePendingMaterialRequirements,
  listProtocolizationCaseRequirementProgress,
  recordProtocolizationDeclaration,
} from '@aoc/asset-protocolization';
import type { ProtocolizationCase } from '@aoc/asset-protocolization';

import { TEST_CONTENT_SUBJECT, TEST_EXTERNAL_SUBJECT, createTestContext } from './fixtures/test-cases';
import {
  TEST_DECLARANT_A,
  TEST_DECLARANT_ORGANIZATION,
  TEST_DECLARATION_ONLY_SHAPE_V1,
  TEST_DECLARATION_SHAPE_V1,
  TEST_SECOND_CLAIM_ID,
  referencedDeclaration,
} from './fixtures/test-declarations';

/**
 * The truth boundary — the reason this slice exists, expressed as tests.
 *
 * ```text
 * DECLARATION RECORDED   !=  DECLARATION TRUE
 * CLAIM EXISTS           !=  CLAIM PROVEN
 * EVIDENCE LINKED        !=  CLAIM VERIFIED
 * CLAIM PREPARED         !=  PROFESSIONALLY ATTESTED
 * CLAIM PRESENT          !=  REQUIREMENT SATISFIED
 * ALL DECLARATIONS       !=  CASE READY
 * DECLARANT IDENTITY     !=  DECLARANT AUTHORITY
 * ```
 *
 * Each of these is asserted structurally — by proving that the field which
 * would carry the stronger meaning does not exist — rather than by asserting a
 * `false`. A `verified: false` could be flipped to `true` by one line; a field
 * that was never declared cannot.
 */

const DECLARATION_PIN = { profileId: TEST_DECLARATION_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(
  context = createTestContext(),
  profile = DECLARATION_PIN,
  caseId = 'case-0001',
  subject = TEST_CONTENT_SUBJECT,
): ProtocolizationCase {
  return createProtocolizationCase(context, { caseId, profile, subject }).protocolizationCase;
}

const VERDICT_FIELDS = [
  'isTrue',
  'isValid',
  'isVerified',
  'isApproved',
  'isAuthorized',
  'isAuthoritative',
  'verified',
  'approved',
  'authorized',
  'authorityVerified',
  'delegationValidated',
  'delegationValid',
  'enterpriseGrant',
  'claimConfirmed',
  'claimProven',
  'proven',
  'owner',
  'ownershipEstablished',
  'authorshipVerified',
  'evidenceSupportsClaim',
  'supported',
  'attested',
  'satisfied',
  'ready',
  'legalStatus',
  'legallyRecognized',
];

describe('a recorded declaration is not a true declaration', () => {
  it('exposes no truth, verification, approval or authority field', () => {
    const context = createTestContext();
    const { record, declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        statement: 'I created this work.',
      }),
    );

    for (const field of VERDICT_FIELDS) {
      expect(record).not.toHaveProperty(field);
      expect(declarationEvent).not.toHaveProperty(field);
    }
  });

  it('names the event for what happened: recorded', () => {
    expect(Object.values(PROTOCOLIZATION_DECLARATION_EVENT_TYPES)).toEqual([
      'ProtocolizationDeclarationRecorded',
    ]);

    // No event exists for a conclusion this slice cannot reach.
    const forbidden = [
      'ClaimVerified',
      'ClaimProven',
      'DeclarationApproved',
      'DeclarationVerified',
      'OwnershipConfirmed',
      'AuthorityConfirmed',
      'ProfessionalAttested',
      'CaseReady',
      'AssetProtocolized',
    ];
    for (const eventType of forbidden) {
      expect(Object.values(PROTOCOLIZATION_DECLARATION_EVENT_TYPES)).not.toContain(eventType);
    }
  });

  it('records only that the statement was made, not what it asserts', () => {
    const context = createTestContext();
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001', statement: 'I created this work.' }),
    );

    // The audit fact — "actor A declared X at T" — is fully recorded.
    expect(record.declarant).toEqual(TEST_DECLARANT_A);
    expect(record.recordedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(record.statement).toBe('I created this work.');

    // The proposition itself remains merely asserted. Nothing on the record
    // says the work was created by them, and no field could say it.
    expect(record).not.toHaveProperty('author');
    expect(record).not.toHaveProperty('owner');
    expect(record).not.toHaveProperty('createdBy');
  });
});

describe('an ownership- or authorship-like declaration establishes nothing', () => {
  it('does not make the declarant the author', () => {
    const context = createTestContext();
    const { protocolizationCase, record } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        claimType: ClaimType.Authorship,
        statement: 'I created this work.',
        requirementIds: ['declaration.authorship.required'],
      }),
    );

    expect(record.claimType).toBe(ClaimType.Authorship);
    // `ClaimType.Authorship` is Protocol's word for "a declaration of
    // authorship". Requiring one, and recording one, never makes it so.
    expect(record).not.toHaveProperty('authorshipVerified');
    expect(protocolizationCase).not.toHaveProperty('author');
    expect(protocolizationCase.subject).not.toHaveProperty('owner');
  });
});

describe('an authority declaration does not create authority', () => {
  it('records "actor A states that actor A may act for entity B" and nothing more', () => {
    const context = createTestContext();
    const { protocolizationCase, record, declarationEvent } = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({
        caseId: 'case-0001',
        declarant: TEST_DECLARANT_A,
        claimType: ClaimType.Authorization,
        claimRef: TEST_SECOND_CLAIM_ID,
        statement: 'I am authorized to act for the referenced entity.',
        requirementIds: ['declaration.representation.required'],
      }),
    );

    expect(record.claimType).toBe(ClaimType.Authorization);
    expect(record.declarant).toEqual(TEST_DECLARANT_A);

    // The hard proof. None of these exists anywhere on the outputs, and the
    // vertical has no mechanism that could set one.
    for (const field of [
      'authorityVerified',
      'authorized',
      'delegationValidated',
      'delegationValid',
      'representationCurrent',
      'enterpriseGrant',
      'grant',
      'capability',
      'policy',
    ]) {
      expect(record).not.toHaveProperty(field);
      expect(declarationEvent).not.toHaveProperty(field);
      expect(protocolizationCase).not.toHaveProperty(field);
    }
  });

  it('exports no authority-resolution operation at all', () => {
    const exported = Object.keys(assetProtocolization);
    const forbidden = exported.filter((name) =>
      /^(?:resolve|grant|revoke|authorize|delegate|approve|attest|verify|tokenize)/i.test(name),
    );
    expect(forbidden).toEqual([]);
  });
});

describe('a declarant is not a tenant and not a subject', () => {
  it('keeps all three distinct on one record', () => {
    const context = createTestContext('tenant-a');
    const { record } = recordProtocolizationDeclaration(
      context,
      openCase(context, DECLARATION_PIN, 'case-0001', TEST_EXTERNAL_SUBJECT),
      referencedDeclaration({ caseId: 'case-0001', declarant: TEST_DECLARANT_ORGANIZATION }),
    );

    expect(record.tenantId).toBe('tenant-a');
    expect(record.declarant.id).toBe('test-principal-0003');
    expect(record.declarant.kind).toBe(PrincipalKind.Organization);

    // The tenant is the workflow isolation boundary. The declarant is a
    // participant. Neither is derived from the other, and one tenant routinely
    // processes declarations from many participants.
    expect(record.declarant.id).not.toBe(record.tenantId);
    expect(record).not.toHaveProperty('subjectRef');
  });

  it('records two different declarants under one tenant', () => {
    const context = createTestContext('tenant-a');
    const first = recordProtocolizationDeclaration(
      context,
      openCase(context),
      referencedDeclaration({ caseId: 'case-0001' }),
    );

    context.clock.advance(60);
    const second = recordProtocolizationDeclaration(
      context,
      first.protocolizationCase,
      referencedDeclaration({
        caseId: 'case-0001',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        declarant: TEST_DECLARANT_ORGANIZATION,
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
      }),
    );

    expect(first.record.tenantId).toBe(second.record.tenantId);
    expect(first.record.declarant.id).not.toBe(second.record.declarant.id);
  });
});

describe('declaration material present is not requirement satisfied, and not READY', () => {
  it('leaves a case with every declaration requirement answered short of ready', () => {
    const context = createTestContext();
    const pin = {
      profileId: TEST_DECLARATION_ONLY_SHAPE_V1.profileId,
      profileVersion: '1.0.0',
    };
    let current = openCase(context, pin, 'case-complete');

    current = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({
        caseId: 'case-complete',
        requirementIds: ['declaration.authorship.required'],
      }),
    ).protocolizationCase;

    context.clock.advance(60);
    current = recordProtocolizationDeclaration(
      context,
      current,
      referencedDeclaration({
        caseId: 'case-complete',
        declarationId: 'declaration-0002',
        materialId: 'material-d002',
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorization,
        requirementIds: ['declaration.representation.required'],
      }),
    ).protocolizationCase;

    // Every requirement in the profile now has declaration material.
    expect(
      listProtocolizationCasePendingMaterialRequirements(current, TEST_DECLARATION_ONLY_SHAPE_V1),
    ).toEqual([]);
    for (const progress of listProtocolizationCaseRequirementProgress(
      current,
      TEST_DECLARATION_ONLY_SHAPE_V1,
    )) {
      expect(progress.materialStatus).toBe(
        ProtocolizationRequirementMaterialStatus.MaterialPresent,
      );
      // Presence, and only presence. There is no satisfaction verdict on the
      // projection, because deciding satisfaction needs the claims themselves
      // and an evaluator that does not exist in this slice.
      expect(progress).not.toHaveProperty('satisfied');
      expect(progress).not.toHaveProperty('verified');
    }

    // And the case is not ready — there is no `Ready` to be.
    expect(current.state).toBe(ProtocolizationCaseState.Draft);
    expect(Object.values(ProtocolizationCaseState).sort()).toEqual([
      'Active',
      'Cancelled',
      'Draft',
    ]);
    expect(current).not.toHaveProperty('ready');
    expect(current).not.toHaveProperty('readiness');
  });
});

describe('no verification, attestation, state-machine or execution vocabulary was added', () => {
  it('exports no verification outcome vocabulary', () => {
    const exported = Object.keys(assetProtocolization);
    for (const name of [
      'VerificationOutcome',
      'DeclarationVerificationOutcome',
      'DECLARATION_VERIFICATION_OUTCOMES',
      'verifyProtocolizationDeclaration',
      'evaluateProtocolizationDeclaration',
      'detectProtocolizationDeclarationConflicts',
    ]) {
      expect(exported).not.toContain(name);
    }

    // No PASS/FAIL/WARNING/MANUAL_REVIEW/UNAVAILABLE anywhere in the exported
    // surface's own values.
    const values = (Object.values(assetProtocolization) as readonly unknown[])
      .filter((value) => typeof value === 'object' && value !== null)
      .flatMap((value) => Object.values(value as Record<string, unknown>))
      .filter((value): value is string => typeof value === 'string');
    for (const outcome of ['PASS', 'FAIL', 'WARNING', 'MANUAL_REVIEW', 'UNAVAILABLE']) {
      expect(values).not.toContain(outcome);
    }
  });

  it('exports no attestation, readiness or protocolization workflow', () => {
    const exported = Object.keys(assetProtocolization);
    for (const name of [
      'attestProtocolizationCase',
      'ProfessionalReviewPackage',
      'ProtocolizationResult',
      'ProtocolizedAsset',
      'GovernableResourceRef',
      'markProtocolizationCaseReady',
      'protocolizeAsset',
    ]) {
      expect(exported).not.toContain(name);
    }
  });

  it('adds no case state beyond APV-04’s three', () => {
    expect(Object.keys(ProtocolizationCaseState).sort()).toEqual([
      'Active',
      'Cancelled',
      'Draft',
    ]);
  });
});
