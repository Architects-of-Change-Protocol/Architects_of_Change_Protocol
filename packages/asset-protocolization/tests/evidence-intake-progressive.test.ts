import { EvidenceType, ReferenceSourceKind } from '@aoc/protocol/claims';

import {
  EvidenceIntakePathway,
  ProtocolizationMaterialKind,
  ProtocolizationRequirementMaterialStatus,
  createInMemoryEvidenceIntakeRepository,
  createProtocolizationCase,
  getProtocolizationCaseRequirementProgress,
  intakeProtocolizationEvidence,
} from '@aoc/asset-protocolization';
import type {
  EvidenceIntakeReceipt,
  ProtocolizationCase,
  ProtocolizationEvidenceSubmission,
} from '@aoc/asset-protocolization';

import {
  TENANT_A,
  TEST_BARE_SUBJECT,
  TEST_CONTENT_SUBJECT,
  TEST_EXTERNAL_SUBJECT,
  createTestContext,
} from './fixtures/test-cases';
import { TEST_CONTENT_SHAPE_V1, TEST_EXTERNAL_SHAPE_V1 } from './fixtures/test-profiles';
import {
  TEST_CATEGORY_CRYPTOGRAPHIC,
  TEST_CATEGORY_EXTERNAL_REGISTRY,
  TEST_CATEGORY_IDENTITY,
  TEST_CATEGORY_PROFESSIONAL,
  TEST_CATEGORY_PROVENANCE,
  TEST_CATEGORY_UNANTICIPATED,
  TEST_EVIDENCE_ID,
  TEST_REGISTRY_LOOKUP_RESULT,
  TEST_REGISTRY_OBSERVED_AT,
  TEST_SECOND_EVIDENCE_ID,
  TEST_THIRD_EVIDENCE_ID,
  normalizeRegistryObservation,
  referencedSubmission,
  testCanonicalEvidence,
  testCredentialledEvidence,
} from './fixtures/test-evidence';

/**
 * The APV-05 architecture proofs.
 *
 * Each `describe` below is one of the frozen proofs: that a content-based
 * subject fits, that an externally-referenced subject fits, that evidence
 * accumulates over time without history being rewritten, that acceptance is
 * compatible with total semantic ignorance, and that a stale-capable timestamp
 * is preserved without a staleness verdict being reached.
 */

const CONTENT_PIN = { profileId: TEST_CONTENT_SHAPE_V1.profileId, profileVersion: '1.0.0' };
const EXTERNAL_PIN = { profileId: TEST_EXTERNAL_SHAPE_V1.profileId, profileVersion: '1.0.0' };

function openCase(
  context: ReturnType<typeof createTestContext>,
  profile = CONTENT_PIN,
  subject = TEST_CONTENT_SUBJECT,
  caseId = 'case-0001',
): ProtocolizationCase {
  return createProtocolizationCase(context, { caseId, profile, subject }).protocolizationCase;
}

describe('proof A — generic content/provenance evidence', () => {
  it('accepts a supplied CanonicalEvidence document and associates its reference', () => {
    const context = createTestContext();
    const evidence = testCanonicalEvidence({ type: EvidenceType.SystemRecord });

    const submission: ProtocolizationEvidenceSubmission = {
      intakeId: 'intake-0001',
      caseId: 'case-0001',
      materialId: 'material-0001',
      categoryId: TEST_CATEGORY_PROVENANCE,
      pathway: EvidenceIntakePathway.Canonical,
      evidence,
      requirementIds: ['evidence.provenance.minimum'],
      sourceRef: { kind: ReferenceSourceKind.AuditTrace, value: 'test://traces/0001' },
    };

    const { protocolizationCase, receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      submission,
    );

    // The document's own id becomes the recorded reference…
    expect(receipt.evidenceRef).toBe(evidence.id);
    expect(protocolizationCase.materials[0]).toMatchObject({
      kind: ProtocolizationMaterialKind.Evidence,
      evidenceRef: evidence.id,
    });

    // …and the document itself is not copied anywhere. No snapshot of a
    // Protocol record ends up in vertical workflow state.
    const serialized = JSON.stringify({ protocolizationCase, receipt });
    expect(serialized).not.toContain(evidence.description);
    expect(serialized).not.toContain('test-issuer-0001');

    expect(
      getProtocolizationCaseRequirementProgress(
        protocolizationCase,
        TEST_CONTENT_SHAPE_V1,
        'evidence.provenance.minimum',
      )?.materialStatus,
    ).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
  });

  it('reaches no verdict and adds no state', () => {
    const context = createTestContext();
    const { protocolizationCase } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001', categoryId: TEST_CATEGORY_PROVENANCE }),
    );

    expect(protocolizationCase.state).toBe('Draft');
    expect(JSON.stringify(protocolizationCase)).not.toMatch(/Ready|Verified|Satisfied|Approved/);
  });

  it('carries cryptographic and credential material through Protocol references alone', () => {
    const context = createTestContext();
    const evidence = testCredentialledEvidence();

    // Integrity proofs, a signature proof and a professional credential all
    // ride on Protocol's own reference types inside the evidence record. APV-05
    // defines no digest type, no signature type and no credential type, and it
    // checks none of them.
    expect(evidence.proofRefs?.map((proof) => proof.type)).toEqual(['HashProof', 'SignatureProof']);
    expect(evidence.credentialRefs?.[0].type).toBe('ProfessionalCredential');

    const { receipt } = intakeProtocolizationEvidence(context, openCase(context), {
      intakeId: 'intake-0001',
      caseId: 'case-0001',
      materialId: 'material-0001',
      categoryId: TEST_CATEGORY_PROFESSIONAL,
      pathway: EvidenceIntakePathway.Canonical,
      evidence,
      requirementIds: ['evidence.provenance.minimum'],
    });

    expect(receipt.evidenceRef).toBe(TEST_THIRD_EVIDENCE_ID);
    // Receiving a credentialled record is not an attestation, an approval or a
    // credential check. Nothing on the receipt says otherwise.
    expect(Object.keys(receipt)).not.toContain('credentialRefs');
  });
});

describe('proof B — external registry evidence', () => {
  it('accepts a generic external registry observation and preserves observedAt', () => {
    const context = createTestContext();
    const submission = normalizeRegistryObservation({
      intakeId: 'intake-0001',
      materialId: 'material-0001',
      caseId: 'case-registry',
      requirementIds: ['evidence.registry.observation'],
      evidenceRef: TEST_EVIDENCE_ID,
      lookup: TEST_REGISTRY_LOOKUP_RESULT,
    });

    const { protocolizationCase, receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context, EXTERNAL_PIN, TEST_EXTERNAL_SUBJECT, 'case-registry'),
      submission,
    );

    expect(receipt.categoryId).toBe(TEST_CATEGORY_EXTERNAL_REGISTRY);
    expect(receipt.observedAt).toBe(TEST_REGISTRY_OBSERVED_AT);
    expect(receipt.sourceRef).toEqual({
      kind: ReferenceSourceKind.Registry,
      value: 'test.namespace.external-registry',
    });
    expect(
      getProtocolizationCaseRequirementProgress(
        protocolizationCase,
        TEST_EXTERNAL_SHAPE_V1,
        'evidence.registry.observation',
      )?.materialStatus,
    ).toBe(ProtocolizationRequirementMaterialStatus.MaterialPresent);
  });

  it('draws no legal conclusion and makes no registry call', () => {
    const context = createTestContext();
    const { protocolizationCase, receipt, intakeEvent } = intakeProtocolizationEvidence(
      context,
      openCase(context, EXTERNAL_PIN, TEST_EXTERNAL_SUBJECT, 'case-registry'),
      normalizeRegistryObservation({
        intakeId: 'intake-0001',
        materialId: 'material-0001',
        caseId: 'case-registry',
        requirementIds: ['evidence.registry.observation'],
        evidenceRef: TEST_EVIDENCE_ID,
        lookup: TEST_REGISTRY_LOOKUP_RESULT,
      }),
    );

    // A registry observation having been received means an external observation
    // entered the case. It does not mean any right, title or authority exists.
    const serialized = JSON.stringify({ protocolizationCase, receipt, intakeEvent });
    expect(serialized).not.toMatch(/owner|ownership|title|authoritative|confirmed|established/i);
  });

  it('routes an unanticipated evidence source through the same operation', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001', categoryId: TEST_CATEGORY_UNANTICIPATED }),
    );

    // Adding a category required no change to Protocol, to the case aggregate,
    // or to the intake operation — only a new opaque token.
    expect(receipt.categoryId).toBe(TEST_CATEGORY_UNANTICIPATED);
  });
});

describe('proof C — multiple evidence items over time', () => {
  it('accumulates evidence across months without rewriting history', () => {
    const context = createTestContext('tenant-a', undefined, undefined);
    const repository = createInMemoryEvidenceIntakeRepository();
    let current = openCase(context, CONTENT_PIN, TEST_BARE_SUBJECT, 'case-long-lived');
    const opened = current;
    const receipts: EvidenceIntakeReceipt[] = [];

    const timeline: readonly (readonly [string, string, string, string])[] = [
      ['2026-01-05T09:00:00.000Z', TEST_EVIDENCE_ID, TEST_CATEGORY_IDENTITY, 'identity.content.required'],
      ['2026-02-17T14:30:00.000Z', TEST_SECOND_EVIDENCE_ID, TEST_CATEGORY_PROVENANCE, 'evidence.provenance.minimum'],
      ['2026-06-30T23:59:59.000Z', TEST_THIRD_EVIDENCE_ID, TEST_CATEGORY_CRYPTOGRAPHIC, 'evidence.provenance.minimum'],
    ];

    timeline.forEach(([instant, evidenceRef, categoryId, requirementId], index) => {
      context.clock.set(instant);
      const transition = intakeProtocolizationEvidence(
        context,
        current,
        referencedSubmission({
          caseId: 'case-long-lived',
          intakeId: `intake-000${index + 1}`,
          materialId: `material-000${index + 1}`,
          categoryId,
          evidenceRef,
          requirementIds: [requirementId],
        }),
      );
      current = transition.protocolizationCase;
      receipts.push(transition.receipt);
      repository.save(transition.receipt);
    });

    // Every intake is still individually auditable, with its own instant.
    expect(receipts.map((receipt) => receipt.receivedAt)).toEqual(timeline.map(([instant]) => instant));
    expect(new Set(receipts.map((receipt) => receipt.receivedAt)).size).toBe(3);
    expect(repository.listByCase(TENANT_A, 'case-long-lived')).toEqual(receipts);

    // Nothing was overwritten: three materials, in arrival order, each keeping
    // the instant it arrived at.
    expect(current.materials.map((material) => material.addedAt)).toEqual(
      timeline.map(([instant]) => instant),
    );
    expect(current.materials).toHaveLength(3);
    expect(current.revision).toBe(4);

    // The later cryptographic item does not erase the earlier provenance item
    // it arguably supersedes. Both remain observable; formalizing supersession
    // is a later slice's work.
    expect(
      getProtocolizationCaseRequirementProgress(
        current,
        TEST_CONTENT_SHAPE_V1,
        'evidence.provenance.minimum',
      )?.materialIds,
    ).toEqual(['material-0002', 'material-0003']);

    // And the case is still about the same subject, under the same pin, for the
    // same tenant, six months later.
    expect(current.subject).toEqual(opened.subject);
    expect(current.profile).toEqual(opened.profile);
    expect(current.tenantId).toBe(opened.tenantId);
    expect(current.createdAt).toBe(opened.createdAt);
  });

  it('never deletes or mutates an accepted receipt', () => {
    const context = createTestContext();
    const first = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );
    const snapshot = JSON.parse(JSON.stringify(first.receipt));

    context.clock.advance(86_400);
    intakeProtocolizationEvidence(
      context,
      first.protocolizationCase,
      referencedSubmission({
        caseId: 'case-0001',
        intakeId: 'intake-0002',
        materialId: 'material-0002',
        evidenceRef: TEST_SECOND_EVIDENCE_ID,
      }),
    );

    expect(JSON.parse(JSON.stringify(first.receipt))).toEqual(snapshot);
  });
});

describe('proof D — structurally accepted, semantically unknown', () => {
  it('accepts evidence while knowing nothing about whether it is true', () => {
    const context = createTestContext();
    const { protocolizationCase, receipt, intakeEvent } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001' }),
    );

    const surfaces: readonly Record<string, unknown>[] = [
      receipt as unknown as Record<string, unknown>,
      intakeEvent as unknown as Record<string, unknown>,
      protocolizationCase as unknown as Record<string, unknown>,
      protocolizationCase.materials[0] as unknown as Record<string, unknown>,
    ];

    const forbidden = [
      'verified',
      'isVerified',
      'valid',
      'isValid',
      'authentic',
      'isAuthentic',
      'trusted',
      'approved',
      'isApproved',
      'satisfied',
      'ready',
      'isReady',
      'owner',
      'isOwner',
      'ownership',
      'ownershipEstablished',
      'authoritative',
      'isAuthoritative',
      'claimProven',
      'status',
      'outcome',
      'result',
    ];

    for (const surface of surfaces) {
      for (const key of forbidden) {
        expect(Object.prototype.hasOwnProperty.call(surface, key)).toBe(false);
      }
    }

    // What acceptance produced is a record that something arrived — nothing more.
    expect(receipt.receivedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(intakeEvent.eventType).toBe('ProtocolizationEvidenceReceived');
  });

  it('does not make the case ready, however much evidence arrives', () => {
    const context = createTestContext();
    let current = openCase(context);

    for (const [index, requirementId] of TEST_CONTENT_SHAPE_V1.requirements
      .map((requirement) => requirement.id)
      .entries()) {
      context.clock.advance(60);
      current = intakeProtocolizationEvidence(
        context,
        current,
        referencedSubmission({
          caseId: 'case-0001',
          intakeId: `intake-000${index + 1}`,
          materialId: `material-000${index + 1}`,
          evidenceRef: `aoc:evidence:e000000${index + 1}`,
          requirementIds: [requirementId],
        }),
      ).protocolizationCase;
    }

    // Material present for literally every requirement the profile declares.
    expect(
      TEST_CONTENT_SHAPE_V1.requirements.every(
        (requirement) =>
          getProtocolizationCaseRequirementProgress(current, TEST_CONTENT_SHAPE_V1, requirement.id)
            ?.materialStatus === ProtocolizationRequirementMaterialStatus.MaterialPresent,
      ),
    ).toBe(true);

    // And the case is still a Draft. Completeness of material is not readiness,
    // and there is no state, flag or projection anywhere that says it is.
    expect(current.state).toBe('Draft');
  });
});

describe('proof E — stale-capable evidence, no staleness verdict', () => {
  it('preserves a source observation far outside the profile’s freshness window', () => {
    const context = createTestContext();
    context.clock.set('2026-08-01T00:00:00.000Z');

    // The profile requires a registry observation no older than 30 days. This
    // one is roughly 17 months old.
    const requirement = TEST_EXTERNAL_SHAPE_V1.requirements.find(
      (entry) => entry.id === 'evidence.registry.observation',
    );
    expect(requirement).toMatchObject({ freshness: { maxAgeSeconds: 60 * 60 * 24 * 30 } });

    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context, EXTERNAL_PIN, TEST_EXTERNAL_SUBJECT, 'case-registry'),
      normalizeRegistryObservation({
        intakeId: 'intake-0001',
        materialId: 'material-0001',
        caseId: 'case-registry',
        requirementIds: ['evidence.registry.observation'],
        evidenceRef: TEST_EVIDENCE_ID,
        lookup: TEST_REGISTRY_LOOKUP_RESULT,
      }),
    );

    // Accepted. APV-05 evaluates no freshness constraint — that is APV-07's —
    // and it must not silently pre-empt one by refusing intake.
    expect(receipt.observedAt).toBe(TEST_REGISTRY_OBSERVED_AT);
    expect(receipt.receivedAt).toBe('2026-08-01T00:00:00.000Z');
    expect(Date.parse(receipt.observedAt as string)).toBeLessThan(Date.parse(receipt.receivedAt));

    // Both instants survive, distinctly, so a later evaluator has what it needs.
    expect(receipt.observedAt).not.toBe(receipt.receivedAt);
  });

  it('accepts an observation stamped after the intake instant rather than judging the clock skew', () => {
    const context = createTestContext();
    const { receipt } = intakeProtocolizationEvidence(
      context,
      openCase(context),
      referencedSubmission({ caseId: 'case-0001', observedAt: '2030-01-01T00:00:00.000Z' }),
    );

    // A source ahead of us is clock skew, not a structurally impossible
    // timestamp. Deciding what to make of it is a later slice's judgement.
    expect(receipt.observedAt).toBe('2030-01-01T00:00:00.000Z');
    expect(receipt.receivedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
