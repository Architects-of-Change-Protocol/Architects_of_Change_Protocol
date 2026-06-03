import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PrincipalKind,
  ReferenceSourceKind,
  ScopeKind,
  type CanonicalAttestation,
  type CanonicalAuthority,
  type CanonicalClaim,
  type CanonicalDecision,
  type CanonicalEvidence,
  type CanonicalPrincipalRef,
  type CanonicalReferenceSource,
  type CanonicalScopeRef,
  type CanonicalVerification,
} from '@aoc/protocol/claims';

type AssertAssignable<Expected, Actual extends Expected> = true;
type AssertNoKey<T, K extends PropertyKey> = K extends keyof T ? never : true;

type _PrincipalRefCompiles = AssertAssignable<
  CanonicalPrincipalRef,
  {
    readonly id: 'principal-1';
    readonly kind: typeof PrincipalKind.Human;
    readonly displayName: 'Victor';
    readonly source: {
      readonly kind: typeof ReferenceSourceKind.Email;
      readonly value: 'victor@example.com';
      readonly label: 'Primary email';
      readonly metadata: Readonly<Record<string, unknown>>;
    };
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ReferenceSourceCompiles = AssertAssignable<
  CanonicalReferenceSource,
  {
    readonly kind: typeof ReferenceSourceKind.DID;
    readonly value: 'did:key:z6MkExample';
    readonly label: 'DID key';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ScopeRefCompiles = AssertAssignable<
  CanonicalScopeRef,
  {
    readonly kind: typeof ScopeKind.Workspace;
    readonly value: 'workspace-1';
    readonly description: 'Workspace boundary';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _EvidenceAcceptsStringReferences = AssertAssignable<
  CanonicalEvidence,
  {
    readonly id: 'evidence-1';
    readonly type: 'Document';
    readonly subject: 'subject-1';
    readonly issuer: 'issuer-1';
    readonly source: 'source-1';
    readonly description: 'Document evidence';
    readonly createdAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _EvidenceAcceptsStructuredReferences = AssertAssignable<
  CanonicalEvidence,
  {
    readonly id: 'evidence-2';
    readonly type: 'Document';
    readonly subject: CanonicalPrincipalRef;
    readonly issuer: CanonicalPrincipalRef;
    readonly source: CanonicalReferenceSource;
    readonly description: 'Structured document evidence';
    readonly createdAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _ClaimAcceptsStructuredPrincipalRefs = AssertAssignable<
  CanonicalClaim,
  {
    readonly id: 'claim-1';
    readonly type: 'Capability';
    readonly subject: CanonicalPrincipalRef;
    readonly issuer: CanonicalPrincipalRef;
    readonly assertionRef: 'assertion-1';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly attestationRefs: readonly ['attestation-1'];
    readonly issuedAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _AttestationAcceptsStructuredAttester = AssertAssignable<
  CanonicalAttestation,
  {
    readonly id: 'attestation-1';
    readonly type: 'AI';
    readonly attester: CanonicalPrincipalRef;
    readonly claimRef: 'claim-1';
    readonly statement: 'AI agent supports this claim.';
    readonly issuedAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _VerificationAcceptsStructuredVerifier = AssertAssignable<
  CanonicalVerification,
  {
    readonly id: 'verification-1';
    readonly claimRef: 'claim-1';
    readonly status: 'Verified';
    readonly verifier: CanonicalPrincipalRef;
    readonly verifiedAt: '2026-06-02T00:00:00.000Z';
    readonly findings: readonly ['valid'];
  }
>;

type _AuthorityAcceptsStructuredScope = AssertAssignable<
  CanonicalAuthority,
  {
    readonly id: 'authority-1';
    readonly capabilityRefs: readonly ['capability-1'];
    readonly scope: CanonicalScopeRef;
    readonly status: 'Granted';
    readonly issuedAt: '2026-06-02T00:00:00.000Z';
  }
>;

type _DecisionAcceptsStructuredDecisionMaker = AssertAssignable<
  CanonicalDecision,
  {
    readonly id: 'decision-1';
    readonly authorityRef: 'authority-1';
    readonly status: 'Approved';
    readonly decisionMaker: CanonicalPrincipalRef;
    readonly decisionDate: '2026-06-02T00:00:00.000Z';
  }
>;

type _CanonicalClaimHasNoVerification = AssertNoKey<CanonicalClaim, 'verification'>;
type _CanonicalClaimHasNoStanding = AssertNoKey<CanonicalClaim, 'standing'>;
type _CanonicalClaimHasNoAuthority = AssertNoKey<CanonicalClaim, 'authority'>;
type _CanonicalClaimHasNoDecision = AssertNoKey<CanonicalClaim, 'decision'>;

describe('principal reference contract integrity', () => {
  it('exposes principal, source, and scope reference enum values', () => {
    expect(PrincipalKind.Human).toBe('Human');
    expect(PrincipalKind.Organization).toBe('Organization');
    expect(PrincipalKind.System).toBe('System');
    expect(PrincipalKind.AI).toBe('AI');
    expect(PrincipalKind.Runtime).toBe('Runtime');
    expect(PrincipalKind.GovernanceBody).toBe('GovernanceBody');
    expect(PrincipalKind.MarketMaker).toBe('MarketMaker');
    expect(PrincipalKind.CredentialIssuer).toBe('CredentialIssuer');
    expect(PrincipalKind.Unknown).toBe('Unknown');

    expect(ReferenceSourceKind.URI).toBe('URI');
    expect(ReferenceSourceKind.DID).toBe('DID');
    expect(ReferenceSourceKind.Wallet).toBe('Wallet');
    expect(ReferenceSourceKind.Email).toBe('Email');
    expect(ReferenceSourceKind.Domain).toBe('Domain');
    expect(ReferenceSourceKind.Registry).toBe('Registry');
    expect(ReferenceSourceKind.InternalId).toBe('InternalId');
    expect(ReferenceSourceKind.ExternalId).toBe('ExternalId');
    expect(ReferenceSourceKind.Document).toBe('Document');
    expect(ReferenceSourceKind.AuditTrace).toBe('AuditTrace');
    expect(ReferenceSourceKind.RuntimeTrace).toBe('RuntimeTrace');
    expect(ReferenceSourceKind.Unknown).toBe('Unknown');

    expect(ScopeKind.Global).toBe('Global');
    expect(ScopeKind.Organization).toBe('Organization');
    expect(ScopeKind.Workspace).toBe('Workspace');
    expect(ScopeKind.Project).toBe('Project');
    expect(ScopeKind.Resource).toBe('Resource');
    expect(ScopeKind.Action).toBe('Action');
    expect(ScopeKind.Policy).toBe('Policy');
    expect(ScopeKind.Market).toBe('Market');
    expect(ScopeKind.Custom).toBe('Custom');
  });

  it('marks the legacy Claim shape as deprecated in the source text', () => {
    const source = readFileSync(join(process.cwd(), 'packages/protocol/src/claims/index.ts'), 'utf8');

    expect(source).toContain('@deprecated Use CanonicalClaim');
    expect(source).toContain('export interface LegacyClaim');
    expect(source).toContain('export type Claim = LegacyClaim');
  });

  it('exports reference contracts from @aoc/protocol/claims', () => {
    const principal: CanonicalPrincipalRef = {
      id: 'principal-1',
      kind: PrincipalKind.Runtime,
      source: { kind: ReferenceSourceKind.InternalId, value: 'runtime-1' },
    };
    const source: CanonicalReferenceSource = { kind: ReferenceSourceKind.AuditTrace, value: 'audit-1' };
    const scope: CanonicalScopeRef = { kind: ScopeKind.Policy, value: 'policy-1' };

    expect(principal.kind).toBe('Runtime');
    expect(source.kind).toBe('AuditTrace');
    expect(scope.kind).toBe('Policy');
  });
});
