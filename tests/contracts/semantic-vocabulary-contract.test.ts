import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  ClaimType,
  CredentialType,
  EvidenceType,
  ProofType,
  RegistryType,
  type CanonicalAttestation,
  type CanonicalClaim,
  type CanonicalClaimVocabularyProfile,
  type CanonicalCredential,
  type CanonicalCredentialVocabularyProfile,
  type CanonicalEvidence,
  type CanonicalEvidenceVocabularyProfile,
  type CanonicalProofEnvelope,
  type CanonicalProofVocabularyProfile,
  type CanonicalRegistryEntry,
  type CanonicalRegistryVocabularyProfile,
  type CanonicalSemanticCategory,
  type CanonicalSemanticCategoryId,
  type CanonicalSemanticId,
  type CanonicalSemanticNamespace,
  type CanonicalSemanticRef,
  type CanonicalSemanticTerm,
  type CanonicalSemanticTermId,
  type CanonicalSemanticVocabulary,
  type CanonicalSemanticVocabularyId,
  type CanonicalVerification,
} from '@aoc/protocol/claims';

type AssertAssignable<Expected, Actual extends Expected> = true;
type AssertNoKey<T, K extends PropertyKey> = K extends keyof T ? never : true;

type _SemanticIdsCompile = AssertAssignable<CanonicalSemanticId, 'semantic-ref-1'>;
type _SemanticNamespaceCompiles = AssertAssignable<CanonicalSemanticNamespace, 'aoc.claims'>;
type _SemanticTermIdCompiles = AssertAssignable<CanonicalSemanticTermId, 'term-1'>;
type _SemanticVocabularyIdCompiles = AssertAssignable<CanonicalSemanticVocabularyId, 'vocabulary-1'>;
type _SemanticCategoryIdCompiles = AssertAssignable<CanonicalSemanticCategoryId, 'category-1'>;

const semanticRef: CanonicalSemanticRef = {
  id: 'semantic-ref-1',
  termRef: 'term-1',
  namespace: 'aoc.claims',
  metadata: { source: 'contract-test' },
};

type _SemanticTermCompiles = AssertAssignable<
  CanonicalSemanticTerm,
  {
    readonly id: 'term-1';
    readonly name: 'Governance Approval';
    readonly description: 'A descriptive semantic term.';
    readonly namespace: 'aoc.claims';
    readonly aliases: readonly ['approval'];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _SemanticCategoryCompiles = AssertAssignable<
  CanonicalSemanticCategory,
  {
    readonly id: 'category-1';
    readonly name: 'Governance Concepts';
    readonly description: 'Related governance vocabulary terms.';
    readonly namespace: 'aoc.claims';
    readonly termRefs: readonly ['term-1'];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _SemanticVocabularyCompiles = AssertAssignable<
  CanonicalSemanticVocabulary,
  {
    readonly id: 'vocabulary-1';
    readonly name: 'AOC Claims Vocabulary';
    readonly description: 'Portable RFC-005 semantic terms.';
    readonly namespace: 'aoc.claims';
    readonly categories: readonly [CanonicalSemanticCategory];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _SemanticRefCompiles = AssertAssignable<
  CanonicalSemanticRef,
  {
    readonly id: 'semantic-ref-1';
    readonly termRef: 'term-1';
    readonly namespace: 'aoc.claims';
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ClaimProfileCompiles = AssertAssignable<
  CanonicalClaimVocabularyProfile,
  {
    readonly claimType: typeof ClaimType.Governance;
    readonly semanticRefs: readonly [CanonicalSemanticRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _EvidenceProfileCompiles = AssertAssignable<
  CanonicalEvidenceVocabularyProfile,
  {
    readonly evidenceType: typeof EvidenceType.AuditRecord;
    readonly semanticRefs: readonly [CanonicalSemanticRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _ProofProfileCompiles = AssertAssignable<
  CanonicalProofVocabularyProfile,
  {
    readonly proofType: typeof ProofType.TraceProof;
    readonly semanticRefs: readonly [CanonicalSemanticRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialProfileCompiles = AssertAssignable<
  CanonicalCredentialVocabularyProfile,
  {
    readonly credentialType: typeof CredentialType.GovernanceCredential;
    readonly semanticRefs: readonly [CanonicalSemanticRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _RegistryProfileCompiles = AssertAssignable<
  CanonicalRegistryVocabularyProfile,
  {
    readonly registryType: typeof RegistryType.PolicyRegistry;
    readonly semanticRefs: readonly [CanonicalSemanticRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _EvidenceAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalEvidence,
  {
    readonly id: 'evidence-1';
    readonly type: typeof EvidenceType.Document;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly source: 'source-1';
    readonly description: 'Board evidence.';
    readonly createdAt: '2026-06-03T00:00:00.000Z';
    readonly semanticRefs: readonly [CanonicalSemanticRef];
  }
>;

type _ClaimAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalClaim,
  {
    readonly id: 'claim-1';
    readonly type: typeof ClaimType.Governance;
    readonly subject: 'principal-1';
    readonly issuer: 'issuer-1';
    readonly assertionRef: 'assertion-1';
    readonly evidenceRefs: readonly ['evidence-1'];
    readonly attestationRefs: readonly ['attestation-1'];
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly semanticRefs: readonly [CanonicalSemanticRef];
  }
>;

type _AttestationAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalAttestation,
  {
    readonly id: 'attestation-1';
    readonly type: 'Governance';
    readonly attester: 'governance-body-1';
    readonly claimRef: 'claim-1';
    readonly statement: 'Governance body attests to this claim.';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly semanticRefs: readonly [CanonicalSemanticRef];
  }
>;

type _VerificationAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalVerification,
  {
    readonly id: 'verification-1';
    readonly claimRef: 'claim-1';
    readonly status: 'Verified';
    readonly verifier: 'verifier-1';
    readonly verifiedAt: '2026-06-03T00:00:00.000Z';
    readonly findings: readonly ['supported'];
    readonly semanticRefs: readonly [CanonicalSemanticRef];
  }
>;

type _ProofEnvelopeAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalProofEnvelope,
  {
    readonly id: 'proof-envelope-1';
    readonly proofType: typeof ProofType.IntegrityProof;
    readonly proofRefs: readonly [];
    readonly subject: 'claim-1';
    readonly issuer: 'issuer-1';
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly semanticRefs: readonly [CanonicalSemanticRef];
    readonly metadata: Readonly<Record<string, unknown>>;
  }
>;

type _CredentialAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalCredential,
  {
    readonly id: 'credential-1';
    readonly type: typeof CredentialType.GovernanceCredential;
    readonly format: 'JSON';
    readonly issuer: { readonly id: 'issuer-1'; readonly kind: 'GovernanceBody' };
    readonly subject: { readonly id: 'principal-1'; readonly kind: 'Principal' };
    readonly claimRefs: readonly ['claim-1'];
    readonly issuedAt: '2026-06-03T00:00:00.000Z';
    readonly semanticRefs: readonly [CanonicalSemanticRef];
  }
>;

type _RegistryEntryAcceptsOptionalSemanticRefs = AssertAssignable<
  CanonicalRegistryEntry,
  {
    readonly id: 'registry-entry-1';
    readonly registryRef: { readonly id: 'registry-1'; readonly type: typeof RegistryType.PolicyRegistry; readonly namespace: 'aoc.policy'; readonly locator: 'urn:aoc:registry:1'; readonly authorityLevel: 'GovernanceDeclared' };
    readonly entryType: 'Policy';
    readonly subject: 'policy-1';
    readonly locator: 'urn:aoc:policy:1';
    readonly status: 'Active';
    readonly createdAt: '2026-06-03T00:00:00.000Z';
    readonly semanticRefs: readonly [CanonicalSemanticRef];
  }
>;

type _SemanticTermHasNoScore = AssertNoKey<CanonicalSemanticTerm, 'score'>;
type _SemanticTermHasNoTrustScore = AssertNoKey<CanonicalSemanticTerm, 'trustScore'>;
type _SemanticCategoryHasNoResolver = AssertNoKey<CanonicalSemanticCategory, 'resolver'>;
type _SemanticVocabularyHasNoDecision = AssertNoKey<CanonicalSemanticVocabulary, 'decision'>;
type _SemanticRefHasNoAuthority = AssertNoKey<CanonicalSemanticRef, 'authority'>;

describe('semantic vocabulary contract integrity', () => {
  it('exposes canonical semantic vocabulary types through the claims import surface', () => {
    expect(semanticRef.id).toBe('semantic-ref-1');
    expect(ClaimType.Governance).toBe('Governance');
    expect(EvidenceType.AuditRecord).toBe('AuditRecord');
    expect(ProofType.TraceProof).toBe('TraceProof');
    expect(CredentialType.GovernanceCredential).toBe('GovernanceCredential');
    expect(RegistryType.PolicyRegistry).toBe('PolicyRegistry');
  });

  it('keeps vocabulary contracts behavior-free and outside Enterprise semantics', () => {
    const vocabularyDir = join(process.cwd(), 'packages/protocol/src/claims/vocabulary');
    const contractFiles = [
      'semantic-identifiers.ts',
      'semantic-term.ts',
      'semantic-category.ts',
      'semantic-vocabulary.ts',
      'semantic-reference.ts',
      'claim-vocabulary-profile.ts',
      'evidence-vocabulary-profile.ts',
      'proof-vocabulary-profile.ts',
      'credential-vocabulary-profile.ts',
      'registry-vocabulary-profile.ts',
    ];

    const source = contractFiles.map((file) => readFileSync(join(vocabularyDir, file), 'utf8')).join('\n');

    expect(source).not.toMatch(/\b(function|class|const enum)\b/);
    expect(source).not.toMatch(/vector|embedding|trustScore|authorityResolver|standingEvaluator|semanticSearch|graphTraversal/);
    expect(source).not.toMatch(/deriveAuthority|evaluateStanding|score|rank|authorize|decide/);
  });
});
