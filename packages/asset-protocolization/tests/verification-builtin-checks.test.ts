import { ClaimType, PrincipalKind } from '@aoc/protocol/claims';

import {
  BUILT_IN_VERIFICATION_CHECKS,
  DeclarationPathway,
  EvidenceIntakePathway,
  ProtocolizationMaterialKind,
  VerificationCheckOutcome,
  addProtocolizationCaseMaterial,
  createProtocolizationCase,
  executeProtocolizationVerificationCheck,
  intakeProtocolizationEvidence,
  recordProtocolizationDeclaration,
} from '@aoc/asset-protocolization';
import type {
  EvidenceIntakeReceipt,
  ProtocolizationCase,
  ProtocolizationDeclarationRecord,
  ProtocolizationVerificationResult,
} from '@aoc/asset-protocolization';

import { TEST_CATEGORY_DOCUMENT, TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID } from './fixtures/test-evidence';
import {
  TEST_CLAIM_ID,
  TEST_DECLARANT_A,
  TEST_DECLARANT_B,
  TEST_SECOND_CLAIM_ID,
  testCanonicalClaim,
} from './fixtures/test-declarations';
import {
  TEST_CONTENT_BYTES,
  TEST_CONTENT_IDENTITY_FOR_BYTES,
  TEST_DIGESTIBLE_SUBJECT,
  TEST_OTHER_CONTENT_BYTES,
  TEST_VERIFICATION_BUILTIN_SHAPE_V1,
  TEST_VERIFICATION_EXTERNAL_SHAPE_V1,
  TEST_VERIFICATION_EXTERNAL_SUBJECT,
  TEST_VERIFICATION_FOREIGN_REGISTRY_ENTRY,
  TEST_VERIFICATION_REGISTRY_ENTRY,
  createTestClaimResolver,
  createTestContentResolver,
  createVerificationContext,
  unavailableClaimResolver,
  unavailableContentResolver,
} from './fixtures/test-verification';
import type { VerificationTestContext } from './fixtures/test-verification';

const REQUIREMENT = 'verification.builtin';

function openBuiltinCase(context: VerificationTestContext): ProtocolizationCase {
  return createProtocolizationCase(context, {
    caseId: 'case-builtin-001',
    profile: { profileId: TEST_VERIFICATION_BUILTIN_SHAPE_V1.profileId, profileVersion: '1.0.0' },
    subject: TEST_DIGESTIBLE_SUBJECT,
  }).protocolizationCase;
}

async function run(
  context: VerificationTestContext,
  protocolizationCase: ProtocolizationCase,
  checkId: string,
  inputs: {
    readonly evidenceReceipts?: readonly EvidenceIntakeReceipt[];
    readonly declarations?: readonly ProtocolizationDeclarationRecord[];
    readonly requirementId?: string;
  } = {},
): Promise<ProtocolizationVerificationResult> {
  const { result } = await executeProtocolizationVerificationCheck(context, protocolizationCase, {
    executionId: `execution-${checkId}-${protocolizationCase.revision}`,
    requirementId: inputs.requirementId ?? REQUIREMENT,
    checkId,
    ...(inputs.evidenceReceipts === undefined ? {} : { evidenceReceipts: inputs.evidenceReceipts }),
    ...(inputs.declarations === undefined ? {} : { declarations: inputs.declarations }),
  });
  return result;
}

/** Builds a case carrying identity material, two evidences and one declaration. */
async function fullyPopulatedCase(
  context: VerificationTestContext,
  options: { readonly observedAt?: string; readonly declarant?: typeof TEST_DECLARANT_A } = {},
): Promise<{
  readonly protocolizationCase: ProtocolizationCase;
  readonly receipts: readonly EvidenceIntakeReceipt[];
  readonly declarations: readonly ProtocolizationDeclarationRecord[];
}> {
  let protocolizationCase = openBuiltinCase(context);

  context.clock.advance(60);
  protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
    materialId: 'material-identity',
    kind: ProtocolizationMaterialKind.ContentIdentity,
    requirementIds: ['identity.content.required'],
    contentIdentity: TEST_CONTENT_IDENTITY_FOR_BYTES,
  }).protocolizationCase;

  const receipts: EvidenceIntakeReceipt[] = [];
  for (const [index, evidenceRef] of [TEST_EVIDENCE_ID, TEST_SECOND_EVIDENCE_ID].entries()) {
    context.clock.advance(60);
    const intake = intakeProtocolizationEvidence(context, protocolizationCase, {
      intakeId: `intake-${index}`,
      caseId: protocolizationCase.caseId,
      materialId: `material-evidence-${index}`,
      categoryId: TEST_CATEGORY_DOCUMENT,
      pathway: EvidenceIntakePathway.Reference,
      evidenceRef,
      requirementIds: ['evidence.provenance.minimum'],
      ...(options.observedAt === undefined ? {} : { observedAt: options.observedAt }),
    });
    protocolizationCase = intake.protocolizationCase;
    receipts.push(intake.receipt);
  }

  context.clock.advance(60);
  const declared = recordProtocolizationDeclaration(context, protocolizationCase, {
    declarationId: 'declaration-builtin-1',
    caseId: protocolizationCase.caseId,
    materialId: 'material-declaration-1',
    declarant: options.declarant ?? TEST_DECLARANT_A,
    pathway: DeclarationPathway.Reference,
    claimRef: TEST_CLAIM_ID,
    claimType: ClaimType.Authorship,
    requirementIds: ['declaration.authorship.required'],
  });

  return {
    protocolizationCase: declared.protocolizationCase,
    receipts,
    declarations: [declared.record],
  };
}

describe('built-in verification checks', () => {
  it('are asset-agnostic: nothing names a category, jurisdiction, registry or profession', () => {
    for (const check of BUILT_IN_VERIFICATION_CHECKS) {
      expect(check.checkId).toMatch(/^check\.[a-z0-9.-]+$/);
      for (const forbidden of ['costa', 'finca', 'realestate', 'artwork', 'song', 'vehicle', 'nft']) {
        expect(check.checkId).not.toContain(forbidden);
      }
    }
  });

  describe('check.material.present', () => {
    it('fails when a required requirement has no material', async () => {
      const context = createVerificationContext();
      const opened = openBuiltinCase(context);

      const result = await run(context, opened, 'check.material.present');

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('material.missing');
      expect(result.inputRefs?.map((ref) => ref.ref).sort()).toEqual([
        'declaration.authorship.required',
        'evidence.provenance.minimum',
        'identity.content.required',
      ]);
    });

    it('passes once every required requirement has material', async () => {
      const context = createVerificationContext();
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.material.present');

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('material.present');
    });

    it('never counts the verification requirement itself', async () => {
      const context = createVerificationContext();
      const { protocolizationCase } = await fullyPopulatedCase(context);

      // `verification.builtin` is Required and permanently Pending, because
      // executions are never written back as case material. A check that counted
      // it could never pass, on any case, ever.
      const state = protocolizationCase.requirementStates.find(
        (candidate) => candidate.requirementId === REQUIREMENT,
      );
      expect(state?.materialIds).toEqual([]);
      expect((await run(context, protocolizationCase, 'check.material.present')).outcome).toBe(
        VerificationCheckOutcome.Pass,
      );
    });
  });

  describe('check.material.minimum-count', () => {
    it('fails when fewer materials are present than the pinned profile requires', async () => {
      const context = createVerificationContext();
      let protocolizationCase = openBuiltinCase(context);
      context.clock.advance(60);
      protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
        materialId: 'material-evidence-only-one',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: TEST_EVIDENCE_ID,
      }).protocolizationCase;

      // The profile requires two.
      const result = await run(context, protocolizationCase, 'check.material.minimum-count');

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('material.count.insufficient');
      expect(result.inputRefs?.some((ref) => ref.ref === 'evidence.provenance.minimum')).toBe(true);
    });

    it('passes once the declared minimum is met', async () => {
      const context = createVerificationContext();
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.material.minimum-count');

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('count.satisfied');
    });

    it('counts only material of the kind that mechanically answers the requirement', async () => {
      const context = createVerificationContext();
      let protocolizationCase = openBuiltinCase(context);
      context.clock.advance(60);
      protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
        materialId: 'material-evidence-1',
        kind: ProtocolizationMaterialKind.Evidence,
        requirementIds: ['evidence.provenance.minimum'],
        evidenceRef: TEST_EVIDENCE_ID,
      }).protocolizationCase;
      context.clock.advance(60);
      // A *declaration* correlated to the evidence requirement would be refused
      // by APV-06's kind guard; APV-04's raw pathway still allows it, and it must
      // contribute nothing to the evidence count.
      protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
        materialId: 'material-declaration-miscounted',
        kind: ProtocolizationMaterialKind.Declaration,
        requirementIds: ['evidence.provenance.minimum'],
        claimRef: TEST_CLAIM_ID,
      }).protocolizationCase;

      const result = await run(context, protocolizationCase, 'check.material.minimum-count');

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
    });
  });

  describe('check.identity.strategy', () => {
    it('passes when the accepted strategy is evidenced', async () => {
      const context = createVerificationContext();
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.identity.strategy');

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('identity.strategy.satisfied');
    });

    describe('architecture proof S — an external, non-content subject', () => {
      function openExternalCase(context: VerificationTestContext): ProtocolizationCase {
        return createProtocolizationCase(context, {
          caseId: 'case-external-001',
          profile: {
            profileId: TEST_VERIFICATION_EXTERNAL_SHAPE_V1.profileId,
            profileVersion: '1.0.0',
          },
          subject: TEST_VERIFICATION_EXTERNAL_SUBJECT,
        }).protocolizationCase;
      }

      it('runs the same generic engine and checks against a subject with no bytes', async () => {
        const context = createVerificationContext();
        let protocolizationCase = openExternalCase(context);
        context.clock.advance(60);
        protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
          materialId: 'material-registry-entry',
          kind: ProtocolizationMaterialKind.RegistryEntry,
          requirementIds: ['identity.external-registry.required'],
          registryEntryRef: TEST_VERIFICATION_REGISTRY_ENTRY,
        }).protocolizationCase;

        const identity = await run(context, protocolizationCase, 'check.identity.strategy', {
          requirementId: 'verification.identity',
        });
        expect(identity.outcome).toBe(VerificationCheckOutcome.Pass);

        const present = await run(context, protocolizationCase, 'check.material.present', {
          requirementId: 'verification.identity',
        });
        expect(present.outcome).toBe(VerificationCheckOutcome.Pass);
      });

      it('reports Unavailable — never Fail — when a subject has no content identity to digest', async () => {
        const context = createVerificationContext({
          resolvers: { content: createTestContentResolver(TEST_CONTENT_BYTES) },
        });
        const protocolizationCase = openExternalCase(context);

        const result = await run(context, protocolizationCase, 'check.content.digest', {
          requirementId: 'verification.identity',
        });

        expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
        expect(result.reasonCode).toBe('content.identity.absent');
        expect(result.outcome).not.toBe(VerificationCheckOutcome.Fail);
      });

      it('fails a registry entry outside the generic constraint the profile declares', async () => {
        const context = createVerificationContext();
        let protocolizationCase = openExternalCase(context);
        context.clock.advance(60);
        protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
          materialId: 'material-registry-foreign',
          kind: ProtocolizationMaterialKind.RegistryEntry,
          requirementIds: ['identity.external-registry.required'],
          registryEntryRef: TEST_VERIFICATION_FOREIGN_REGISTRY_ENTRY,
        }).protocolizationCase;

        const result = await run(context, protocolizationCase, 'check.identity.strategy', {
          requirementId: 'verification.identity',
        });

        expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
        expect(result.reasonCode).toBe('identity.registry.mismatch');
      });

      it('makes no statement about authority when identity material is present', async () => {
        const context = createVerificationContext();
        let protocolizationCase = openExternalCase(context);
        context.clock.advance(60);
        protocolizationCase = addProtocolizationCaseMaterial(context, protocolizationCase, {
          materialId: 'material-registry-entry',
          kind: ProtocolizationMaterialKind.RegistryEntry,
          requirementIds: ['identity.external-registry.required'],
          registryEntryRef: TEST_VERIFICATION_REGISTRY_ENTRY,
        }).protocolizationCase;

        const result = await run(context, protocolizationCase, 'check.identity.strategy', {
          requirementId: 'verification.identity',
        });

        const serialized = JSON.stringify(result).toLowerCase();
        for (const forbidden of ['author', 'owner', 'entitle', 'permit', 'grant', 'represent', 'legal']) {
          expect(serialized).not.toContain(forbidden);
        }
      });
    });
  });

  describe('architecture proof L — evidence freshness', () => {
    it('fails an observation older than the pinned constraint permits', async () => {
      const context = createVerificationContext();
      // The profile allows one hour. The observation is a year old.
      const { protocolizationCase, receipts } = await fullyPopulatedCase(context, {
        observedAt: '2025-01-01T00:00:00.000Z',
      });

      const result = await run(context, protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: receipts,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('freshness.exceeded');
    });

    it('leaves the stale evidence in the case, unmarked and undeleted', async () => {
      const context = createVerificationContext();
      const { protocolizationCase, receipts } = await fullyPopulatedCase(context, {
        observedAt: '2025-01-01T00:00:00.000Z',
      });
      const before = JSON.stringify(protocolizationCase);

      await run(context, protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: receipts,
      });

      expect(JSON.stringify(protocolizationCase)).toBe(before);
      expect(
        protocolizationCase.materials.filter(
          (material) => material.kind === ProtocolizationMaterialKind.Evidence,
        ),
      ).toHaveLength(2);
      expect(receipts.every((receipt) => receipt.observedAt === '2025-01-01T00:00:00.000Z')).toBe(
        true,
      );
    });

    it('passes an observation inside the pinned window', async () => {
      const context = createVerificationContext();
      const { protocolizationCase, receipts } = await fullyPopulatedCase(context, {
        observedAt: '2026-01-01T00:00:30.000Z',
      });

      const result = await run(context, protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: receipts,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('freshness.satisfied');
    });

    it('reports Unavailable when no observation instant was ever supplied', async () => {
      const context = createVerificationContext();
      // APV-05 refuses to default `observedAt`, so there is nothing to compare.
      const { protocolizationCase, receipts } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: receipts,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.reasonCode).toBe('freshness.observation.missing');
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Fail);
    });

    it('warns rather than failing on a future-dated observation', async () => {
      const context = createVerificationContext();
      const { protocolizationCase, receipts } = await fullyPopulatedCase(context, {
        observedAt: '2030-01-01T00:00:00.000Z',
      });

      const result = await run(context, protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: receipts,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Warning);
      expect(result.reasonCode).toBe('freshness.observed.in.future');
    });

    it('is deterministic under the injected clock', async () => {
      const first = createVerificationContext();
      const second = createVerificationContext();
      const a = await fullyPopulatedCase(first, { observedAt: '2025-01-01T00:00:00.000Z' });
      const b = await fullyPopulatedCase(second, { observedAt: '2025-01-01T00:00:00.000Z' });

      const one = await run(first, a.protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: a.receipts,
      });
      const two = await run(second, b.protocolizationCase, 'check.evidence.freshness', {
        evidenceReceipts: b.receipts,
      });

      expect(one.outcome).toBe(two.outcome);
      expect(one.reasonCode).toBe(two.reasonCode);
      expect(one.executedAt).toBe(two.executedAt);
    });
  });

  describe('architecture proof M — claim type resolution', () => {
    it('passes when the resolved record carries the type the declaration recorded', async () => {
      const context = createVerificationContext({
        resolvers: {
          claim: createTestClaimResolver({
            [TEST_CLAIM_ID]: testCanonicalClaim({ type: ClaimType.Authorship }),
          }),
        },
      });
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.claim-type', {
        declarations,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('claim.type.consistent');
    });

    it('fails when the resolved record is of a different type', async () => {
      const context = createVerificationContext({
        resolvers: {
          claim: createTestClaimResolver({
            [TEST_CLAIM_ID]: testCanonicalClaim({ type: ClaimType.Certification }),
          }),
        },
      });
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.claim-type', {
        declarations,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('claim.type.mismatch');
    });

    it('does not rewrite the declaration when the types disagree', async () => {
      const context = createVerificationContext({
        resolvers: {
          claim: createTestClaimResolver({
            [TEST_CLAIM_ID]: testCanonicalClaim({ type: ClaimType.Certification }),
          }),
        },
      });
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);
      const before = JSON.stringify(declarations);

      await run(context, protocolizationCase, 'check.declaration.claim-type', { declarations });

      expect(JSON.stringify(declarations)).toBe(before);
      expect(declarations[0].claimType).toBe(ClaimType.Authorship);
    });

    it('reports Unavailable — never Pass — when the record cannot be resolved', async () => {
      const context = createVerificationContext({
        resolvers: { claim: createTestClaimResolver({}) },
      });
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.claim-type', {
        declarations,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.reasonCode).toBe('claim.unresolved');
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Pass);
    });

    it('distinguishes an outage from a missing record', async () => {
      const context = createVerificationContext({ resolvers: { claim: unavailableClaimResolver } });
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.claim-type', {
        declarations,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.reasonCode).toBe('dependency.unavailable');
    });

    it('never promotes the caller’s word to a checked fact when no resolver is bound', async () => {
      const context = createVerificationContext();
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.claim-type', {
        declarations,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.reasonCode).toBe('claim.resolver.unavailable');
    });

    it('proves the record’s type, and nothing about the proposition', async () => {
      const context = createVerificationContext({
        resolvers: {
          claim: createTestClaimResolver({
            [TEST_CLAIM_ID]: testCanonicalClaim({ type: ClaimType.Authorship }),
          }),
        },
      });
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.claim-type', {
        declarations,
      });

      const serialized = JSON.stringify(result).toLowerCase();
      for (const forbidden of ['true', 'proven', 'owner', 'authorized', 'confirmed']) {
        expect(serialized).not.toContain(forbidden);
      }
    });
  });

  describe('architecture proof N — competing declarations', () => {
    it('passes when one requirement carries assertions from a single declarant', async () => {
      const context = createVerificationContext();
      const { protocolizationCase, declarations } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.declaration.competing', {
        declarations,
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('declaration.uncontested');
    });

    it('declines to conclude when two declarants assert into the same requirement', async () => {
      const context = createVerificationContext();
      const populated = await fullyPopulatedCase(context);
      context.clock.advance(60);
      const second = recordProtocolizationDeclaration(context, populated.protocolizationCase, {
        declarationId: 'declaration-builtin-2',
        caseId: populated.protocolizationCase.caseId,
        materialId: 'material-declaration-2',
        declarant: TEST_DECLARANT_B,
        pathway: DeclarationPathway.Reference,
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorship,
        requirementIds: ['declaration.authorship.required'],
      });

      const result = await run(context, second.protocolizationCase, 'check.declaration.competing', {
        declarations: [...populated.declarations, second.record],
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.ManualReview);
      expect(result.reasonCode).toBe('declaration.competing');
      // Never `Fail`: nothing in the frozen vocabulary encodes negation, so
      // automation has no basis on which to pick a winner.
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Fail);
    });

    it('preserves both competing declarations, unrewritten', async () => {
      const context = createVerificationContext();
      const populated = await fullyPopulatedCase(context);
      context.clock.advance(60);
      const second = recordProtocolizationDeclaration(context, populated.protocolizationCase, {
        declarationId: 'declaration-builtin-2',
        caseId: populated.protocolizationCase.caseId,
        materialId: 'material-declaration-2',
        declarant: TEST_DECLARANT_B,
        pathway: DeclarationPathway.Reference,
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorship,
        requirementIds: ['declaration.authorship.required'],
      });
      const declarations = [...populated.declarations, second.record];
      const before = JSON.stringify(declarations);

      await run(context, second.protocolizationCase, 'check.declaration.competing', { declarations });

      expect(JSON.stringify(declarations)).toBe(before);
      expect(declarations).toHaveLength(2);
      expect(declarations.map((record) => record.declarant.id).sort()).toEqual([
        TEST_DECLARANT_A.id,
        TEST_DECLARANT_B.id,
      ].sort());
    });

    it('reads no free-form statement text', async () => {
      const context = createVerificationContext();
      let protocolizationCase = openBuiltinCase(context);
      context.clock.advance(60);
      const declared = recordProtocolizationDeclaration(context, protocolizationCase, {
        declarationId: 'declaration-with-text',
        caseId: protocolizationCase.caseId,
        materialId: 'material-declaration-text',
        declarant: TEST_DECLARANT_A,
        pathway: DeclarationPathway.Reference,
        claimRef: TEST_CLAIM_ID,
        claimType: ClaimType.Authorship,
        statement: 'I did NOT author this, and the other party is lying.',
        requirementIds: ['declaration.authorship.required'],
      });
      protocolizationCase = declared.protocolizationCase;

      const result = await run(context, protocolizationCase, 'check.declaration.competing', {
        declarations: [declared.record],
      });

      // A human would read a contradiction here. The check does not, because
      // parsing prose into a truth value is not a mechanical finding.
      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(JSON.stringify(result)).not.toContain('lying');
      expect(JSON.stringify(result)).not.toContain('NOT author');
    });

    it('creates no attestation, approval or reviewer when it declines to conclude', async () => {
      const context = createVerificationContext();
      const populated = await fullyPopulatedCase(context);
      context.clock.advance(60);
      const second = recordProtocolizationDeclaration(context, populated.protocolizationCase, {
        declarationId: 'declaration-builtin-2',
        caseId: populated.protocolizationCase.caseId,
        materialId: 'material-declaration-2',
        declarant: TEST_DECLARANT_B,
        pathway: DeclarationPathway.Reference,
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorship,
        requirementIds: ['declaration.authorship.required'],
      });

      const result = await run(context, second.protocolizationCase, 'check.declaration.competing', {
        declarations: [...populated.declarations, second.record],
      });

      const serialized = JSON.stringify(result).toLowerCase();
      for (const forbidden of ['attest', 'approv', 'reviewer', 'assigned', 'queue', 'signature']) {
        expect(serialized).not.toContain(forbidden);
      }
      expect(second.protocolizationCase.requirementStates.every((state) => state !== undefined)).toBe(
        true,
      );
    });

    it('is machine-readable: only structured declarant identity decides the outcome', async () => {
      const context = createVerificationContext();
      const populated = await fullyPopulatedCase(context);
      context.clock.advance(60);
      // The *same* declarant, twice: not competing, whatever the claims say.
      const second = recordProtocolizationDeclaration(context, populated.protocolizationCase, {
        declarationId: 'declaration-same-declarant',
        caseId: populated.protocolizationCase.caseId,
        materialId: 'material-declaration-same',
        declarant: { ...TEST_DECLARANT_A, kind: PrincipalKind.Human },
        pathway: DeclarationPathway.Reference,
        claimRef: TEST_SECOND_CLAIM_ID,
        claimType: ClaimType.Authorship,
        requirementIds: ['declaration.authorship.required'],
      });

      const result = await run(context, second.protocolizationCase, 'check.declaration.competing', {
        declarations: [...populated.declarations, second.record],
      });

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
    });
  });

  describe('architecture proof O — digest comparison', () => {
    it('passes when the resolved bytes produce the pinned content identity', async () => {
      const context = createVerificationContext({
        resolvers: { content: createTestContentResolver(TEST_CONTENT_BYTES) },
      });
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.content.digest');

      expect(result.outcome).toBe(VerificationCheckOutcome.Pass);
      expect(result.reasonCode).toBe('digest.matches');
    });

    it('fails on a deterministic mismatch', async () => {
      const context = createVerificationContext({
        resolvers: { content: createTestContentResolver(TEST_OTHER_CONTENT_BYTES) },
      });
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.content.digest');

      expect(result.outcome).toBe(VerificationCheckOutcome.Fail);
      expect(result.reasonCode).toBe('digest.mismatch');
    });

    it('reports Unavailable — never Fail — when the content source is down', async () => {
      const context = createVerificationContext({
        resolvers: { content: unavailableContentResolver },
      });
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.content.digest');

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.reasonCode).toBe('dependency.unavailable');
      expect(result.outcome).not.toBe(VerificationCheckOutcome.Fail);
    });

    it('reports Unavailable when no content resolver is bound at all', async () => {
      const context = createVerificationContext();
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.content.digest');

      expect(result.outcome).toBe(VerificationCheckOutcome.Unavailable);
      expect(result.reasonCode).toBe('content.resolver.unavailable');
    });

    it('carries no bytes into the result', async () => {
      const context = createVerificationContext({
        resolvers: { content: createTestContentResolver(TEST_CONTENT_BYTES) },
      });
      const { protocolizationCase } = await fullyPopulatedCase(context);

      const result = await run(context, protocolizationCase, 'check.content.digest');

      expect(JSON.stringify(result)).not.toContain('1,2,3,4,5');
      expect(result.inputRefs).toEqual([
        { kind: 'Subject', ref: TEST_DIGESTIBLE_SUBJECT.subjectRef.sovereignAssetId },
      ]);
    });
  });
});
