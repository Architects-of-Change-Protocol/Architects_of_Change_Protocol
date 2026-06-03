import {
  AttestationType,
  ClaimType,
  EvidenceType,
  ProofType,
  RegistryAuthorityLevel,
  RegistryEntryStatus,
  RegistryEntryType,
  RegistryLookupStatus,
  RegistryType,
  VerificationStatus,
  type CanonicalAttestation,
  type CanonicalClaim,
  type CanonicalEvidence,
  type CanonicalProofEnvelope,
  type CanonicalProofRef,
  type CanonicalRegistryAttestation,
  type CanonicalRegistryEntry,
  type CanonicalRegistryEntryRef,
  type CanonicalRegistryLookupRequest,
  type CanonicalRegistryLookupResult,
  type CanonicalRegistryManifest,
  type CanonicalRegistryRef,
  type CanonicalVerification,
} from '@aoc/protocol/claims';

type AssertAssignable<Expected, Actual extends Expected> = true;
type AssertNoKey<T, K extends PropertyKey> = K extends keyof T ? never : true;

type RegistryRefFixture = {
  readonly id: 'registry-1';
  readonly type: typeof RegistryType.ClaimRegistry;
  readonly namespace: 'aoc.claims';
  readonly authorityLevel: typeof RegistryAuthorityLevel.ProtocolRecognized;
  readonly source: 'urn:aoc:registry:claims';
  readonly metadata: Readonly<Record<string, unknown>>;
};

type RegistryEntryRefFixture = {
  readonly id: 'registry-entry-ref-1';
  readonly registryRef: RegistryRefFixture;
  readonly entryType: typeof RegistryEntryType.Claim;
  readonly locator: 'urn:aoc:claim:claim-1';
  readonly status: typeof RegistryEntryStatus.Active;
  readonly metadata: Readonly<Record<string, unknown>>;
};

type RegistryEntryFixture = {
  readonly id: 'registry-entry-1';
  readonly registryRef: RegistryRefFixture;
  readonly entryType: typeof RegistryEntryType.Claim;
  readonly subject: 'principal-1';
  readonly locator: 'urn:aoc:claim:claim-1';
  readonly status: typeof RegistryEntryStatus.Active;
  readonly createdAt: '2026-06-03T00:00:00.000Z';
  readonly updatedAt: '2026-06-03T01:00:00.000Z';
  readonly proofRefs: readonly [CanonicalProofRef];
  readonly metadata: Readonly<Record<string, unknown>>;
};

type _RegistryRefCompiles = AssertAssignable<CanonicalRegistryRef, RegistryRefFixture>;

type _RegistryEntryRefCompiles = AssertAssignable<CanonicalRegistryEntryRef, RegistryEntryRefFixture>;

type _RegistryEntryCompiles = AssertAssignable<CanonicalRegistryEntry, RegistryEntryFixture>;

type _RegistryLookupRequestCompiles = AssertAssignable<
  CanonicalRegistryLookupRequest,
  {
    readonly registryRef: RegistryRefFixture;
    readonly entryType: typeof RegistryEntryType.Claim;
    readonly subject: 'principal-1';
    readonly locator: 'urn:aoc:claim:claim-1';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _RegistryLookupResultCompiles = AssertAssignable<
  CanonicalRegistryLookupResult,
  {
    readonly status: typeof RegistryLookupStatus.Found;
    readonly registryRef: RegistryRefFixture;
    readonly entries: readonly [RegistryEntryFixture];
    readonly observedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _RegistryAttestationCompiles = AssertAssignable<
  CanonicalRegistryAttestation,
  {
    readonly id: 'registry-attestation-1';
    readonly registryRef: RegistryRefFixture;
    readonly attester: 'governance-body-1';
    readonly statement: 'Registry is recognized for the claims namespace.';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _RegistryManifestCompiles = AssertAssignable<
  CanonicalRegistryManifest,
  {
    readonly id: 'registry-manifest-1';
    readonly registryRef: RegistryRefFixture;
    readonly name: 'AOC Claims Registry';
    readonly description: 'Portable declaration of claims registry support.';
    readonly supportedEntryTypes: readonly [typeof RegistryEntryType.Claim, typeof RegistryEntryType.Evidence];
    readonly authorityLevel: typeof RegistryAuthorityLevel.ProtocolRecognized;
    readonly maintainedBy: 'governance-body-1';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ClaimAcceptsRegistryRefs = AssertAssignable<
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
    readonly registryRefs: readonly [RegistryEntryRefFixture];
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
  }
>;

type _EvidenceAcceptsRegistryRefs = AssertAssignable<
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
    readonly registryRefs: readonly [RegistryEntryRefFixture];
  }
>;

type _AttestationAcceptsRegistryRefs = AssertAssignable<
  CanonicalAttestation,
  {
    readonly id: 'attestation-1';
    readonly type: typeof AttestationType.Governance;
    readonly attester: 'board-1';
    readonly claimRef: 'claim-1';
    readonly statement: 'Board supports this claim.';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly registryRefs: readonly [RegistryEntryRefFixture];
  }
>;

type _VerificationAcceptsRegistryRefs = AssertAssignable<
  CanonicalVerification,
  {
    readonly id: 'verification-1';
    readonly claimRef: 'claim-1';
    readonly status: typeof VerificationStatus.Verified;
    readonly verifier: 'verifier-1';
    readonly verifiedAt: '2026-06-03T00:00:00.000Z';
    readonly findings: readonly ['supported'];
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly registryRefs: readonly [RegistryEntryRefFixture];
  }
>;

type _ProofEnvelopeAcceptsRegistryRefs = AssertAssignable<
  CanonicalProofEnvelope,
  {
    readonly id: 'proof-envelope-1';
    readonly proofType: typeof ProofType.IntegrityProof;
    readonly proofRefs: readonly [CanonicalProofRef];
    readonly registryRefs: readonly [RegistryEntryRefFixture];
    readonly subject: 'claim-1';
    readonly issuer: 'issuer-1';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _RegistryRefHasNoVerificationBehavior = AssertNoKey<CanonicalRegistryRef, 'verify'>;
type _RegistryRefHasNoResolveBehavior = AssertNoKey<CanonicalRegistryRef, 'resolve'>;
type _RegistryRefHasNoLookupClient = AssertNoKey<CanonicalRegistryRef, 'lookupClient'>;
type _RegistryEntryHasNoStandingBehavior = AssertNoKey<CanonicalRegistryEntry, 'standingEvaluator'>;
type _RegistryEntryHasNoAuthorityBehavior = AssertNoKey<CanonicalRegistryEntry, 'authorityResolver'>;
type _RegistryEntryHasNoDecisionBehavior = AssertNoKey<CanonicalRegistryEntry, 'authorizeDecision'>;
type _RegistryManifestHasNoTrustScore = AssertNoKey<CanonicalRegistryManifest, 'trustScore'>;

describe('registry interface contract integrity', () => {
  it('exposes registry enum values from the claims import surface', () => {
    expect(RegistryType.ClaimRegistry).toBe('ClaimRegistry');
    expect(RegistryType.Custom).toBe('Custom');
    expect(RegistryEntryType.Claim).toBe('Claim');
    expect(RegistryEntryType.Policy).toBe('Policy');
    expect(RegistryAuthorityLevel.ProtocolRecognized).toBe('ProtocolRecognized');
    expect(RegistryAuthorityLevel.Unknown).toBe('Unknown');
    expect(RegistryEntryStatus.Active).toBe('Active');
    expect(RegistryEntryStatus.Superseded).toBe('Superseded');
    expect(RegistryLookupStatus.Found).toBe('Found');
    expect(RegistryLookupStatus.Unauthorized).toBe('Unauthorized');
  });

  it('exports registry contracts from @aoc/protocol/claims without behavior', () => {
    const registryRef: CanonicalRegistryRef = {
      id: 'registry-1',
      type: RegistryType.ClaimRegistry,
      namespace: 'aoc.claims',
      authorityLevel: RegistryAuthorityLevel.ProtocolRecognized,
    };

    const entryRef: CanonicalRegistryEntryRef = {
      id: 'registry-entry-ref-1',
      registryRef,
      entryType: RegistryEntryType.Claim,
      locator: 'urn:aoc:claim:claim-1',
      status: RegistryEntryStatus.Active,
    };

    const manifest: CanonicalRegistryManifest = {
      id: 'registry-manifest-1',
      registryRef,
      name: 'AOC Claims Registry',
      supportedEntryTypes: [RegistryEntryType.Claim],
      authorityLevel: RegistryAuthorityLevel.ProtocolRecognized,
      maintainedBy: 'governance-body-1',
      issuedAt: '2026-06-03T00:00:00.000Z',
    };

    expect(entryRef.registryRef).toBe(registryRef);
    expect(manifest.supportedEntryTypes).toEqual([RegistryEntryType.Claim]);
    expect('verify' in registryRef).toBe(false);
    expect('resolveRegistry' in registryRef).toBe(false);
    expect('standingEvaluator' in manifest).toBe(false);
    expect('authorityResolver' in manifest).toBe(false);
    expect('authorizeDecision' in manifest).toBe(false);
  });
});
