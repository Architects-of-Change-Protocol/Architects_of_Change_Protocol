import {
  ClaimType,
  EvidenceType,
  ProofFormat,
  ProofStatus,
  ProofType,
  type CanonicalAssertion,
  type CanonicalAttestation,
  type CanonicalAttestationProof,
  type CanonicalAuditProof,
  type CanonicalChainProof,
  type CanonicalClaim,
  type CanonicalEvidence,
  type CanonicalHashProof,
  type CanonicalIntegrityProof,
  type CanonicalProofEnvelope,
  type CanonicalProofRef,
  type CanonicalSignatureProof,
  type CanonicalTraceProof,
  type CanonicalVerification,
} from '@aoc/protocol/claims';

type AssertAssignable<Expected, Actual extends Expected> = true;
type AssertNoKey<T, K extends PropertyKey> = K extends keyof T ? never : true;

type _ProofRefCompiles = AssertAssignable<
  CanonicalProofRef,
  {
    readonly id: 'proof-ref-1';
    readonly type: typeof ProofType.HashProof;
    readonly source: 'urn:aoc:proof:hash:1';
    readonly description: 'Detached digest proof.';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _HashProofCompiles = AssertAssignable<
  CanonicalHashProof,
  {
    readonly id: 'hash-proof-1';
    readonly algorithm: 'SHA256';
    readonly digest: 'abc123';
    readonly subject: 'claim-1';
    readonly generatedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _SignatureProofCompiles = AssertAssignable<
  CanonicalSignatureProof,
  {
    readonly id: 'signature-proof-1';
    readonly signer: 'issuer-1';
    readonly signatureFormat: typeof ProofFormat.JWS;
    readonly signatureReference: 'urn:aoc:signature:1';
    readonly signedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _AttestationProofCompiles = AssertAssignable<
  CanonicalAttestationProof,
  {
    readonly id: 'attestation-proof-1';
    readonly attestationRef: 'attestation-1';
    readonly attester: 'board-1';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _IntegrityProofCompiles = AssertAssignable<
  CanonicalIntegrityProof,
  {
    readonly id: 'integrity-proof-1';
    readonly subject: 'claim-1';
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly generatedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ChainProofCompiles = AssertAssignable<
  CanonicalChainProof,
  {
    readonly id: 'chain-proof-1';
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly rootProof: CanonicalProofRef;
    readonly generatedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _AuditProofCompiles = AssertAssignable<
  CanonicalAuditProof,
  {
    readonly id: 'audit-proof-1';
    readonly auditReference: 'urn:aoc:audit:1';
    readonly subject: 'claim-1';
    readonly generatedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _TraceProofCompiles = AssertAssignable<
  CanonicalTraceProof,
  {
    readonly id: 'trace-proof-1';
    readonly traceReference: 'urn:aoc:trace:1';
    readonly subject: 'runtime-1';
    readonly generatedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ProofEnvelopeCompiles = AssertAssignable<
  CanonicalProofEnvelope,
  {
    readonly id: 'proof-envelope-1';
    readonly proofType: typeof ProofType.IntegrityProof;
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly subject: 'claim-1';
    readonly issuer: 'issuer-1';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _EvidenceAcceptsProofRefs = AssertAssignable<
  CanonicalEvidence,
  {
    readonly id: 'evidence-1';
    readonly type: typeof EvidenceType.Document;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly source: 'source-1';
    readonly description: 'Board document';
    readonly createdAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly [CanonicalProofRef];
  }
>;

type _AssertionAcceptsProofRefs = AssertAssignable<
  CanonicalAssertion,
  {
    readonly id: 'assertion-1';
    readonly subject: 'principal-1';
    readonly statement: 'Victor may approve budgets.';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly issuer: 'issuer-1';
    readonly createdAt: '2026-06-03T00:00:00.000Z';
  }
>;

type _ClaimAcceptsProofRefs = AssertAssignable<
  CanonicalClaim,
  {
    readonly id: 'claim-1';
    readonly type: typeof ClaimType.Capability;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly assertionRef: 'assertion-1';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly attestationRefs: readonly ['attestation-1'];
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
  }
>;

type _AttestationAcceptsProofRefs = AssertAssignable<
  CanonicalAttestation,
  {
    readonly id: 'attestation-1';
    readonly type: 'Governance';
    readonly attester: 'board-1';
    readonly claimRef: 'claim-1';
    readonly statement: 'Board supports this claim.';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly [CanonicalProofRef];
  }
>;

type _VerificationAcceptsProofRefs = AssertAssignable<
  CanonicalVerification,
  {
    readonly id: 'verification-1';
    readonly claimRef: 'claim-1';
    readonly status: 'Verified';
    readonly verifier: 'verifier-1';
    readonly verifiedAt: '2026-06-03T00:00:00.000Z';
    readonly findings: readonly ['supported'];
    readonly proofRefs: readonly [CanonicalProofRef];
  }
>;

type _ProofEnvelopeHasNoVerificationResult = AssertNoKey<CanonicalProofEnvelope, 'verificationResult'>;
type _ProofEnvelopeHasNoStanding = AssertNoKey<CanonicalProofEnvelope, 'standing'>;
type _ProofEnvelopeHasNoAuthority = AssertNoKey<CanonicalProofEnvelope, 'authority'>;
type _ProofEnvelopeHasNoDecision = AssertNoKey<CanonicalProofEnvelope, 'decision'>;

describe('proof envelope contract integrity', () => {
  it('exposes canonical proof contracts and enum values from the claims import surface', () => {
    expect(ProofType.HashProof).toBe('HashProof');
    expect(ProofType.CredentialProof).toBe('CredentialProof');
    expect(ProofFormat.JWS).toBe('JWS');
    expect(ProofStatus.Declared).toBe('Declared');
  });
});
