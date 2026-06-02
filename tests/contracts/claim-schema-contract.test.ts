import {
  AttestationType,
  AuthorityStatus,
  ClaimType,
  DecisionStatus,
  EvidenceType,
  StandingStatus,
  VerificationStatus,
  type CanonicalAssertion,
  type CanonicalAttestation,
  type CanonicalAuthority,
  type CanonicalCapability,
  type CanonicalClaim,
  type CanonicalDecision,
  type CanonicalEvidence,
  type CanonicalStanding,
  type CanonicalVerification,
} from '@aoc/protocol/claims';

type AssertAssignable<Expected, Actual extends Expected> = true;
type AssertNoKey<T, K extends PropertyKey> = K extends keyof T ? never : true;

type _EvidenceCompiles = AssertAssignable<
  CanonicalEvidence,
  {
    readonly id: 'evidence-1';
    readonly type: typeof EvidenceType.Document;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly source: 'source-1';
    readonly description: 'Board document';
    readonly createdAt: '2026-06-02T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _AssertionCompiles = AssertAssignable<
  CanonicalAssertion,
  {
    readonly id: 'assertion-1';
    readonly subject: 'principal-1';
    readonly statement: 'Victor may approve budgets.';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly issuer: 'issuer-1';
    readonly createdAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _ClaimCompiles = AssertAssignable<
  CanonicalClaim,
  {
    readonly id: 'claim-1';
    readonly type: typeof ClaimType.Capability;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly assertionRef: 'assertion-1';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly attestationRefs: readonly ['attestation-1'];
    readonly issuedAt: '2026-06-02T00:00:00.000Z';
    readonly expiresAt: '2027-06-02T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ClaimHasNoVerificationResults = AssertNoKey<CanonicalClaim, 'verificationResults'>;
type _ClaimHasNoStanding = AssertNoKey<CanonicalClaim, 'standing'>;
type _ClaimHasNoAuthority = AssertNoKey<CanonicalClaim, 'authority'>;
type _ClaimHasNoDecisions = AssertNoKey<CanonicalClaim, 'decisions'>;

type _AttestationCompiles = AssertAssignable<
  CanonicalAttestation,
  {
    readonly id: 'attestation-1';
    readonly type: typeof AttestationType.Governance;
    readonly attester: 'board-1';
    readonly claimRef: 'claim-1';
    readonly statement: 'Board supports this claim.';
    readonly issuedAt: '2026-06-02T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _VerificationCompiles = AssertAssignable<
  CanonicalVerification,
  {
    readonly id: 'verification-1';
    readonly claimRef: 'claim-1';
    readonly status: typeof VerificationStatus.Verified;
    readonly verifier: 'verifier-1';
    readonly verifiedAt: '2026-06-02T00:00:00.000Z';
    readonly findings: readonly ['supported'];
    readonly confidence: 0.95;
  }
>;

type _StandingCompiles = AssertAssignable<
  CanonicalStanding,
  {
    readonly id: 'standing-1';
    readonly claimRef: 'claim-1';
    readonly status: typeof StandingStatus.Active;
    readonly reason: 'Verified and active.';
    readonly effectiveAt: '2026-06-02T00:00:00.000Z';
    readonly expiresAt: '2027-06-02T00:00:00.000Z';
  }
>;

type _CapabilityCompiles = AssertAssignable<
  CanonicalCapability,
  {
    readonly id: 'capability-1';
    readonly name: 'CanApproveBudget';
    readonly description: 'Derived budget approval capability.';
    readonly claimRefs: readonly ['claim-1'];
    readonly standingRefs: readonly ['standing-1'];
  }
>;

type _AuthorityCompiles = AssertAssignable<
  CanonicalAuthority,
  {
    readonly id: 'authority-1';
    readonly capabilityRefs: readonly ['capability-1'];
    readonly scope: Readonly<Record<string, unknown>>;
    readonly status: typeof AuthorityStatus.Granted;
    readonly issuedAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _DecisionCompiles = AssertAssignable<
  CanonicalDecision,
  {
    readonly id: 'decision-1';
    readonly authorityRef: 'authority-1';
    readonly status: typeof DecisionStatus.Approved;
    readonly decisionMaker: 'decision-maker-1';
    readonly decisionDate: '2026-06-02T00:00:00.000Z';
    readonly reason: 'Authority chain satisfied.';
  }
>;

describe('claim schema contract integrity', () => {
  it('exposes canonical claim schema contracts and enum values from one import surface', () => {
    expect(ClaimType.Identity).toBe('Identity');
    expect(EvidenceType.BoardResolution).toBe('BoardResolution');
    expect(AttestationType.AI).toBe('AI');
    expect(VerificationStatus.Pending).toBe('Pending');
    expect(StandingStatus.NotYetActive).toBe('NotYetActive');
    expect(AuthorityStatus.Granted).toBe('Granted');
    expect(DecisionStatus.Executed).toBe('Executed');
  });
});
