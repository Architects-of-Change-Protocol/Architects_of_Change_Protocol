import { ClaimType, PrincipalKind, ReferenceSourceKind } from '@aoc/protocol/claims';

import {
  DECLARATION_VALIDATION_CODES,
  DeclarationPathway,
  PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION,
  isAdmissibleProtocolizationDeclarationSubmission,
  isDeclarationPathway,
  isValidDeclarationId,
  isValidProtocolizationDeclarationRecord,
  validateProtocolizationDeclarationRecord,
  validateProtocolizationDeclarationSubmission,
} from '@aoc/asset-protocolization';
import type { ProtocolizationDeclarationRecord } from '@aoc/asset-protocolization';

import {
  TEST_CLAIM_ID,
  TEST_DECLARANT_A,
  TEST_DECLARANT_UNKNOWN,
  TEST_DECLARATION_SOURCE,
  canonicalDeclaration,
  referencedDeclaration,
  testCanonicalClaim,
} from './fixtures/test-declarations';
import { TEST_EVIDENCE_ID } from './fixtures/test-evidence';

/**
 * Structural admission of declaration submissions and records.
 *
 * Every assertion below is about *shape*. Not one of them is about whether a
 * proposition is true, whether a declarant is who they say, or whether anything
 * was proven — and there is deliberately no field on either type where such an
 * answer could be recorded.
 */

const VALID_RECORD: ProtocolizationDeclarationRecord = {
  schemaVersion: PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION,
  declarationId: 'declaration-0001',
  tenantId: 'tenant-a',
  caseId: 'case-0001',
  profile: { profileId: 'test.declaration.v1', profileVersion: '1.0.0' },
  declarant: TEST_DECLARANT_A,
  claimType: ClaimType.Authorship,
  claimRef: TEST_CLAIM_ID,
  materialId: 'material-d001',
  requirementIds: ['declaration.authorship.required'],
  recordedAt: '2026-01-01T00:00:00.000Z',
  caseRevision: 2,
};

describe('declaration identifiers', () => {
  it.each([
    ['a uuid', '11111111-2222-4333-8444-555555555555'],
    ['a namespaced token', 'aoc:declaration:0001'],
    ['a dotted token', 'declaration.0001'],
  ])('admits %s as a declaration id', (_label, value) => {
    expect(isValidDeclarationId(value)).toBe(true);
  });

  it.each([
    ['a blank string', ''],
    ['whitespace', 'declaration 0001'],
    ['a leading separator', '-declaration'],
    ['a path separator', 'declaration/0001'],
    ['a newline', 'declaration\n0001'],
    ['a non-string', 42],
  ])('refuses %s', (_label, value) => {
    expect(isValidDeclarationId(value)).toBe(false);
  });
});

describe('declaration pathways', () => {
  it('has exactly two, and neither of them constructs a claim', () => {
    expect(Object.values(DeclarationPathway).sort()).toEqual(['Canonical', 'Reference']);
    expect(isDeclarationPathway('Reference')).toBe(true);
    expect(isDeclarationPathway('Prepared')).toBe(false);
    expect(isDeclarationPathway('Verified')).toBe(false);
  });
});

describe('submission admission', () => {
  it('admits a minimal reference-pathway submission', () => {
    const result = validateProtocolizationDeclarationSubmission(
      referencedDeclaration({ caseId: 'case-0001' }),
    );
    expect(result).toEqual({ admitted: true, reasons: [] });
  });

  it('admits a minimal canonical-pathway submission', () => {
    expect(
      isAdmissibleProtocolizationDeclarationSubmission(canonicalDeclaration({ caseId: 'case-0001' })),
    ).toBe(true);
  });

  it('admits every optional together', () => {
    const result = validateProtocolizationDeclarationSubmission(
      referencedDeclaration({
        caseId: 'case-0001',
        claimSubtype: 'test.declaration.narrowed',
        statement: 'I assert the test proposition.',
        supportingEvidenceRefs: [TEST_EVIDENCE_ID],
        declaredAt: '2025-12-24T10:00:00.000Z',
        sourceRef: TEST_DECLARATION_SOURCE,
        correlationId: 'request-0001',
      }),
    );
    expect(result).toEqual({ admitted: true, reasons: [] });
  });

  it('admits a declarant whose canonical identity is unresolved', () => {
    // "An unresolved principal asserted X" is the honest record when identity
    // resolution has not happened. Refusing it would push callers into
    // inventing a `PrincipalKind` they do not know.
    expect(
      isAdmissibleProtocolizationDeclarationSubmission(
        referencedDeclaration({ caseId: 'case-0001', declarant: TEST_DECLARANT_UNKNOWN }),
      ),
    ).toBe(true);
  });

  it.each([
    ['a non-object', 'declaration', DECLARATION_VALIDATION_CODES.notAnObject],
    ['no pathway', { declarationId: 'd1' }, DECLARATION_VALIDATION_CODES.invalidPathway],
  ])('refuses %s', (_label, value, code) => {
    expect(validateProtocolizationDeclarationSubmission(value)).toEqual({
      admitted: false,
      reasons: [code],
    });
  });

  it.each([
    ['a malformed declaration id', { declarationId: 'has space' }, DECLARATION_VALIDATION_CODES.invalidDeclarationId],
    ['a malformed case id', { caseId: 'has space' }, DECLARATION_VALIDATION_CODES.invalidCaseId],
    ['a malformed material id', { materialId: '' }, DECLARATION_VALIDATION_CODES.invalidMaterialId],
    ['an absent declarant', { declarant: undefined }, DECLARATION_VALIDATION_CODES.invalidDeclarant],
    ['a declarant with no kind', { declarant: { id: 'p1' } }, DECLARATION_VALIDATION_CODES.invalidDeclarant],
    [
      'a declarant with a kind Protocol does not declare',
      { declarant: { id: 'p1', kind: 'Notary' } },
      DECLARATION_VALIDATION_CODES.invalidDeclarant,
    ],
    ['a bare-string declarant', { declarant: 'test-principal-0001' }, DECLARATION_VALIDATION_CODES.invalidDeclarant],
    ['no requirement ids', { requirementIds: [] }, DECLARATION_VALIDATION_CODES.invalidRequirementIds],
    [
      'duplicate requirement ids',
      { requirementIds: ['declaration.authorship.required', 'declaration.authorship.required'] },
      DECLARATION_VALIDATION_CODES.invalidRequirementIds,
    ],
    ['a blank claim reference', { claimRef: '   ' }, DECLARATION_VALIDATION_CODES.invalidClaimRef],
    [
      'a claim type Protocol does not declare',
      { claimType: 'Ownership' },
      DECLARATION_VALIDATION_CODES.invalidClaimType,
    ],
    ['a blank claim subtype', { claimSubtype: '' }, DECLARATION_VALIDATION_CODES.invalidClaimSubtype],
    ['a present-but-undefined subtype', { claimSubtype: undefined }, DECLARATION_VALIDATION_CODES.invalidClaimSubtype],
    ['a blank statement', { statement: '   ' }, DECLARATION_VALIDATION_CODES.invalidStatement],
    ['an over-long statement', { statement: 'x'.repeat(4097) }, DECLARATION_VALIDATION_CODES.invalidStatement],
    [
      'an empty supporting evidence list',
      { supportingEvidenceRefs: [] },
      DECLARATION_VALIDATION_CODES.invalidSupportingEvidenceRefs,
    ],
    [
      'duplicate supporting evidence refs',
      { supportingEvidenceRefs: [TEST_EVIDENCE_ID, TEST_EVIDENCE_ID] },
      DECLARATION_VALIDATION_CODES.invalidSupportingEvidenceRefs,
    ],
    ['a local-offset declaredAt', { declaredAt: '2026-01-01T00:00:00+02:00' }, DECLARATION_VALIDATION_CODES.invalidDeclaredAt],
    ['an impossible declaredAt', { declaredAt: '2026-02-31T00:00:00.000Z' }, DECLARATION_VALIDATION_CODES.invalidDeclaredAt],
    ['a sourceRef with no locator', { sourceRef: { kind: ReferenceSourceKind.URI, value: '' } }, DECLARATION_VALIDATION_CODES.invalidSourceRef],
    ['a blank correlation id', { correlationId: '' }, DECLARATION_VALIDATION_CODES.invalidCorrelationId],
  ])('refuses %s', (_label, overrides, code) => {
    const result = validateProtocolizationDeclarationSubmission(
      referencedDeclaration({ caseId: 'case-0001', ...(overrides as Record<string, unknown>) }),
    );
    expect(result.admitted).toBe(false);
    expect(result.reasons).toContain(code);
  });

  it('refuses an unknown field', () => {
    const result = validateProtocolizationDeclarationSubmission({
      ...referencedDeclaration({ caseId: 'case-0001' }),
      isTrue: true,
    });
    expect(result.reasons).toContain(DECLARATION_VALIDATION_CODES.unknownField);
  });

  it('refuses a claim document missing the fields the operation reads', () => {
    for (const overrides of [{ id: '' }, { type: 'Ownership' }, { issuedAt: 'yesterday' }]) {
      const result = validateProtocolizationDeclarationSubmission(
        canonicalDeclaration({
          caseId: 'case-0001',
          claim: { ...testCanonicalClaim(), ...overrides },
        } as never),
      );
      expect(result.reasons).toContain(DECLARATION_VALIDATION_CODES.invalidClaimDocument);
    }
  });

  it('refuses a reference-pathway payload on the canonical pathway, and vice versa', () => {
    const canonicalWithRef = {
      ...canonicalDeclaration({ caseId: 'case-0001' }),
      claimRef: TEST_CLAIM_ID,
    };
    expect(validateProtocolizationDeclarationSubmission(canonicalWithRef).reasons).toContain(
      DECLARATION_VALIDATION_CODES.unknownField,
    );

    const referenceWithClaim = {
      ...referencedDeclaration({ caseId: 'case-0001' }),
      claim: testCanonicalClaim(),
    };
    expect(validateProtocolizationDeclarationSubmission(referenceWithClaim).reasons).toContain(
      DECLARATION_VALIDATION_CODES.unknownField,
    );
  });
});

describe('record validation', () => {
  it('admits a minimal record', () => {
    expect(validateProtocolizationDeclarationRecord(VALID_RECORD)).toEqual({
      admitted: true,
      reasons: [],
    });
    expect(isValidProtocolizationDeclarationRecord(VALID_RECORD)).toBe(true);
  });

  it.each([
    ['a foreign schema version', { schemaVersion: 'aoc-protocolization-declaration/2' }, DECLARATION_VALIDATION_CODES.invalidSchemaVersion],
    ['a blank tenant', { tenantId: '' }, DECLARATION_VALIDATION_CODES.invalidTenantId],
    ['a malformed profile pin', { profile: { profileId: 'p', profileVersion: '1.0' } }, DECLARATION_VALIDATION_CODES.invalidProfileRef],
    ['no declarant', { declarant: undefined }, DECLARATION_VALIDATION_CODES.invalidDeclarant],
    ['no claim type', { claimType: undefined }, DECLARATION_VALIDATION_CODES.invalidClaimType],
    ['no recordedAt', { recordedAt: undefined }, DECLARATION_VALIDATION_CODES.invalidRecordedAt],
    ['a zero case revision', { caseRevision: 0 }, DECLARATION_VALIDATION_CODES.invalidCaseRevision],
    ['a fractional case revision', { caseRevision: 1.5 }, DECLARATION_VALIDATION_CODES.invalidCaseRevision],
  ])('refuses %s', (_label, overrides, code) => {
    const result = validateProtocolizationDeclarationRecord({
      ...VALID_RECORD,
      ...(overrides as Record<string, unknown>),
    });
    expect(result.admitted).toBe(false);
    expect(result.reasons).toContain(code);
  });

  it('refuses a record carrying a verdict field', () => {
    for (const field of [
      'isTrue',
      'isVerified',
      'isApproved',
      'isAuthorized',
      'claimProven',
      'ownershipEstablished',
      'evidenceSupportsClaim',
    ]) {
      const result = validateProtocolizationDeclarationRecord({ ...VALID_RECORD, [field]: true });
      expect(result.reasons).toContain(DECLARATION_VALIDATION_CODES.unknownField);
    }
  });
});

describe('the record surface carries no verdict', () => {
  it('exposes exactly the workflow fields, and no outcome vocabulary', () => {
    expect(Object.keys(VALID_RECORD).sort()).toEqual([
      'caseId',
      'caseRevision',
      'claimRef',
      'claimType',
      'declarant',
      'declarationId',
      'materialId',
      'profile',
      'recordedAt',
      'requirementIds',
      'schemaVersion',
      'tenantId',
    ]);
  });

  it('names a claim rather than carrying one', () => {
    // A record points at Protocol's claim record. It never snapshots it, so it
    // can never disagree with the record it names.
    expect(typeof VALID_RECORD.claimRef).toBe('string');
    expect(VALID_RECORD).not.toHaveProperty('claim');
    expect(VALID_RECORD).not.toHaveProperty('assertion');
    expect(VALID_RECORD).not.toHaveProperty('assertionRef');
  });

  it('keeps the declarant a Protocol principal reference, not a vertical identity', () => {
    expect(VALID_RECORD.declarant.kind).toBe(PrincipalKind.Human);
    expect(VALID_RECORD.declarant).not.toHaveProperty('authenticated');
    expect(VALID_RECORD.declarant).not.toHaveProperty('authorized');
    expect(VALID_RECORD.declarant).not.toHaveProperty('verified');
  });
});
