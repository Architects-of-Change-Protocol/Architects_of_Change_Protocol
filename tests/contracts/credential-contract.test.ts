import {
  ClaimType,
  CredentialFormat,
  CredentialIssuerKind,
  CredentialStatus,
  CredentialSubjectKind,
  CredentialType,
  EvidenceType,
  ProofType,
  RegistryAuthorityLevel,
  RegistryEntryStatus,
  RegistryEntryType,
  RegistryType,
  VerificationStatus,
  type CanonicalAttestation,
  type CanonicalClaim,
  type CanonicalCredential,
  type CanonicalCredentialAttestation,
  type CanonicalCredentialIssuer,
  type CanonicalCredentialManifest,
  type CanonicalCredentialPresentation,
  type CanonicalCredentialRef,
  type CanonicalCredentialStatusRef,
  type CanonicalCredentialSubject,
  type CanonicalEvidence,
  type CanonicalPrincipalRef,
  type CanonicalProofEnvelope,
  type CanonicalProofRef,
  type CanonicalRegistryEntryRef,
  type CanonicalRegistryRef,
  type CanonicalVerification,
} from '@aoc/protocol/claims';

type AssertAssignable<Expected, Actual extends Expected> = true;
type AssertNoKey<T, K extends PropertyKey> = K extends keyof T ? never : true;

const principalRef: CanonicalPrincipalRef = {
  id: 'principal-1',
  kind: 'Human',
  displayName: 'AOC Principal',
};

const registryRef: CanonicalRegistryRef = {
  id: 'credential-registry-1',
  type: RegistryType.CredentialRegistry,
  namespace: 'aoc.credentials',
  authorityLevel: RegistryAuthorityLevel.ProtocolRecognized,
};

const registryEntryRef: CanonicalRegistryEntryRef = {
  id: 'credential-entry-1',
  registryRef,
  entryType: RegistryEntryType.Credential,
  locator: 'urn:aoc:credential:credential-1',
  status: RegistryEntryStatus.Active,
};

const proofRef: CanonicalProofRef = {
  id: 'proof-1',
  type: ProofType.SignatureProof,
  source: 'signature-envelope-1',
};

const credentialIssuer: CanonicalCredentialIssuer = {
  id: 'issuer-1',
  kind: CredentialIssuerKind.Organization,
  principalRef,
  registryRefs: [registryEntryRef],
};

const credentialSubject: CanonicalCredentialSubject = {
  id: 'subject-1',
  kind: CredentialSubjectKind.Principal,
  principalRef,
  registryRefs: [registryEntryRef],
};

const credentialStatusRef: CanonicalCredentialStatusRef = {
  status: CredentialStatus.Active,
  statusSource: 'credential-status-list-1',
  observedAt: '2026-06-03T00:00:00.000Z',
  proofRefs: [proofRef],
  registryRefs: [registryEntryRef],
};

const credentialRef: CanonicalCredentialRef = {
  id: 'credential-1',
  type: CredentialType.IdentityCredential,
  format: CredentialFormat.JSON,
  locator: 'urn:aoc:credential:credential-1',
  issuer: credentialIssuer,
  subject: credentialSubject,
  status: credentialStatusRef,
  proofRefs: [proofRef],
  registryRefs: [registryEntryRef],
};

type _CredentialSubjectCompiles = AssertAssignable<
  CanonicalCredentialSubject,
  {
    readonly id: 'subject-1';
    readonly kind: typeof CredentialSubjectKind.Principal;
    readonly principalRef: CanonicalPrincipalRef;
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialIssuerCompiles = AssertAssignable<
  CanonicalCredentialIssuer,
  {
    readonly id: 'issuer-1';
    readonly kind: typeof CredentialIssuerKind.Organization;
    readonly principalRef: CanonicalPrincipalRef;
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialStatusRefCompiles = AssertAssignable<
  CanonicalCredentialStatusRef,
  {
    readonly status: typeof CredentialStatus.Active;
    readonly statusSource: 'status-list-1';
    readonly observedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialRefCompiles = AssertAssignable<
  CanonicalCredentialRef,
  {
    readonly id: 'credential-1';
    readonly type: typeof CredentialType.IdentityCredential;
    readonly format: typeof CredentialFormat.JSON;
    readonly locator: 'urn:aoc:credential:credential-1';
    readonly issuer: CanonicalCredentialIssuer;
    readonly subject: CanonicalCredentialSubject;
    readonly status: CanonicalCredentialStatusRef;
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialCompiles = AssertAssignable<
  CanonicalCredential,
  {
    readonly id: 'credential-1';
    readonly type: typeof CredentialType.IdentityCredential;
    readonly format: typeof CredentialFormat.JSON;
    readonly issuer: CanonicalCredentialIssuer;
    readonly subject: CanonicalCredentialSubject;
    readonly claimRefs: readonly ['claim-1'];
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly attestationRefs: readonly ['attestation-1'];
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly status: CanonicalCredentialStatusRef;
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly expiresAt: '2027-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialManifestCompiles = AssertAssignable<
  CanonicalCredentialManifest,
  {
    readonly id: 'credential-manifest-1';
    readonly credentialRef: CanonicalCredentialRef;
    readonly name: 'AOC Identity Credential';
    readonly description: 'Portable credential declaration.';
    readonly supportedClaimTypes: readonly [typeof ClaimType.Identity];
    readonly issuer: CanonicalCredentialIssuer;
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialAttestationCompiles = AssertAssignable<
  CanonicalCredentialAttestation,
  {
    readonly id: 'credential-attestation-1';
    readonly credentialRef: CanonicalCredentialRef;
    readonly attester: 'governance-body-1';
    readonly statement: 'Descriptor matches approved credential profile.';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialPresentationCompiles = AssertAssignable<
  CanonicalCredentialPresentation,
  {
    readonly id: 'credential-presentation-1';
    readonly credentialRefs: readonly CanonicalCredentialRef[];
    readonly holder: CanonicalPrincipalRef;
    readonly presentedTo: CanonicalPrincipalRef;
    readonly presentedAt: '2026-06-03T00:00:00.000Z';
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly registryRefs: readonly CanonicalRegistryEntryRef[];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CanonicalClaimAcceptsCredentialRefs = AssertAssignable<
  CanonicalClaim,
  {
    readonly id: 'claim-1';
    readonly type: typeof ClaimType.Identity;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly assertionRef: 'assertion-1';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly attestationRefs: readonly ['attestation-1'];
    readonly credentialRefs: readonly CanonicalCredentialRef[];
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
  }
>;

type _CanonicalEvidenceAcceptsCredentialRefs = AssertAssignable<
  CanonicalEvidence,
  {
    readonly id: 'evidence-1';
    readonly type: typeof EvidenceType.Document;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly source: 'source-1';
    readonly description: 'Identity document';
    readonly createdAt: '2026-06-03T00:00:00.000Z';
    readonly credentialRefs: readonly CanonicalCredentialRef[];
  }
>;

type _CanonicalAttestationAcceptsCredentialRefs = AssertAssignable<
  CanonicalAttestation,
  {
    readonly id: 'attestation-1';
    readonly type: 'Governance';
    readonly attester: 'governance-body-1';
    readonly claimRef: 'claim-1';
    readonly statement: 'Credential descriptor is supported.';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly credentialRefs: readonly CanonicalCredentialRef[];
  }
>;

type _CanonicalVerificationAcceptsCredentialRefs = AssertAssignable<
  CanonicalVerification,
  {
    readonly id: 'verification-1';
    readonly claimRef: 'claim-1';
    readonly status: typeof VerificationStatus.Verified;
    readonly verifier: 'verifier-1';
    readonly verifiedAt: '2026-06-03T00:00:00.000Z';
    readonly findings: readonly ['credential referenced'];
    readonly credentialRefs: readonly CanonicalCredentialRef[];
  }
>;

type _CanonicalProofEnvelopeAcceptsCredentialRefs = AssertAssignable<
  CanonicalProofEnvelope,
  {
    readonly id: 'proof-envelope-1';
    readonly proofType: typeof ProofType.SignatureProof;
    readonly proofRefs: readonly CanonicalProofRef[];
    readonly credentialRefs: readonly CanonicalCredentialRef[];
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialHasNoVerificationResults = AssertNoKey<CanonicalCredential, 'verificationResults'>;
type _CredentialHasNoStanding = AssertNoKey<CanonicalCredential, 'standing'>;
type _CredentialHasNoAuthority = AssertNoKey<CanonicalCredential, 'authority'>;
type _CredentialHasNoDecisions = AssertNoKey<CanonicalCredential, 'decisions'>;
type _CredentialHasNoIssueBehavior = AssertNoKey<CanonicalCredential, 'issueCredential'>;
type _CredentialHasNoRevokeBehavior = AssertNoKey<CanonicalCredential, 'revokeCredential'>;
type _CredentialHasNoVerifyBehavior = AssertNoKey<CanonicalCredential, 'verifyCredential'>;

describe('credential contract integrity', () => {
  it('exports credential enum values from @aoc/protocol/claims', () => {
    expect(CredentialType.IdentityCredential).toBe('IdentityCredential');
    expect(CredentialType.CapabilityCredential).toBe('CapabilityCredential');
    expect(CredentialType.Custom).toBe('Custom');
    expect(CredentialFormat.JSON).toBe('JSON');
    expect(CredentialFormat.VC).toBe('VC');
    expect(CredentialStatus.Revoked).toBe('Revoked');
    expect(CredentialSubjectKind.GovernanceBody).toBe('GovernanceBody');
    expect(CredentialIssuerKind.Protocol).toBe('Protocol');
  });

  it('compiles portable credential descriptors and references', () => {
    const credential: CanonicalCredential = {
      id: 'credential-1',
      type: CredentialType.IdentityCredential,
      format: CredentialFormat.JSON,
      issuer: credentialIssuer,
      subject: credentialSubject,
      claimRefs: ['claim-1'],
      evidenceRefs: ['evidence-1'],
      attestationRefs: ['attestation-1'],
      proofRefs: [proofRef],
      registryRefs: [registryEntryRef],
      status: credentialStatusRef,
      issuedAt: '2026-06-03T00:00:00.000Z',
      expiresAt: '2027-06-03T00:00:00.000Z',
    };

    const manifest: CanonicalCredentialManifest = {
      id: 'credential-manifest-1',
      credentialRef,
      name: 'AOC Identity Credential',
      supportedClaimTypes: [ClaimType.Identity],
      issuer: credentialIssuer,
      issuedAt: '2026-06-03T00:00:00.000Z',
      proofRefs: [proofRef],
      registryRefs: [registryEntryRef],
    };

    const attestation: CanonicalCredentialAttestation = {
      id: 'credential-attestation-1',
      credentialRef,
      attester: 'governance-body-1',
      statement: 'Descriptor matches approved credential profile.',
      issuedAt: '2026-06-03T00:00:00.000Z',
    };

    const presentation: CanonicalCredentialPresentation = {
      id: 'credential-presentation-1',
      credentialRefs: [credentialRef],
      holder: principalRef,
      presentedTo: principalRef,
      presentedAt: '2026-06-03T00:00:00.000Z',
    };

    expect(credential.claimRefs).toEqual(['claim-1']);
    expect(manifest.credentialRef).toBe(credentialRef);
    expect(attestation.credentialRef).toBe(credentialRef);
    expect(presentation.credentialRefs).toEqual([credentialRef]);
  });

  it('keeps credential contracts free of verification, standing, authority, and decision behavior', () => {
    expect('verifyCredential' in credentialRef).toBe(false);
    expect('issueCredential' in credentialRef).toBe(false);
    expect('revokeCredential' in credentialRef).toBe(false);
    expect('credentialWallet' in credentialRef).toBe(false);
    expect('selectiveDisclosure' in credentialRef).toBe(false);
    expect('credentialTrustScore' in credentialRef).toBe(false);
    expect('standingEvaluator' in credentialRef).toBe(false);
    expect('authorityResolver' in credentialRef).toBe(false);
    expect('authorizeDecision' in credentialRef).toBe(false);
  });
});
