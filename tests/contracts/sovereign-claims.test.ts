import { mintSovereignAssetId } from '@aoc/protocol/identity';
import {
  AuthorityClaimKind,
  buildAuthorityClaim,
  buildOriginClaim,
  contestClaim,
  generateSovereignKeyPair,
  signClaim,
  verifySignedClaim,
} from '@aoc/protocol/manifest';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';

describe('OriginClaim / AuthorityClaim (§12, §13) — reuse of CanonicalClaim', () => {
  it('builds an OriginClaim as a CanonicalClaim-shaped, epistemically honest declaration', () => {
    const sovereignAssetId = mintSovereignAssetId();
    const claim = buildOriginClaim({
      id: 'claim:origin:1',
      sovereignAssetId,
      issuer: 'principal:alice',
      assertedOrigin: 'Recorded live at Studio A on 2026-01-01',
      assertedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(claim.type).toBe(ClaimType.Origin);
    expect(claim.subject).toBe(sovereignAssetId);
    expect(claim.issuer).toBe('principal:alice');
    expect(claim.metadata.assertedOrigin).toBe('Recorded live at Studio A on 2026-01-01');
  });

  it('builds an AuthorityClaim without ever asserting legal ownership', () => {
    const sovereignAssetId = mintSovereignAssetId();
    const claim = buildAuthorityClaim({
      id: 'claim:authority:1',
      sovereignAssetId,
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Authorship,
      statement: 'Alice asserts she authored this work.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(claim.type).toBe(ClaimType.Authorship);
    expect((claim as any).owner).toBeUndefined();
    expect((claim as any).legalOwner).toBeUndefined();
    expect(claim.metadata.kind).toBe(AuthorityClaimKind.Authorship);
  });
});

describe('SignedClaim (§14) — cryptographic attributability', () => {
  it('signs a claim and verifies it independently', () => {
    const sovereignAssetId = mintSovereignAssetId();
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const claim = buildAuthorityClaim({
      id: 'claim:authority:2',
      sovereignAssetId,
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Rights,
      statement: 'Alice asserts distribution rights.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });

    const signed = signClaim(claim, privateKeyPem, signingKey);
    const result = verifySignedClaim(signed);
    expect(result.valid).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('invalidates verification when the claim subject is substituted after signing', () => {
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const claim = buildAuthorityClaim({
      id: 'claim:authority:3',
      sovereignAssetId: mintSovereignAssetId(),
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Rights,
      statement: 'Alice asserts distribution rights.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });
    const signed = signClaim(claim, privateKeyPem, signingKey);

    const tampered = { ...signed, claim: { ...signed.claim, subject: mintSovereignAssetId() } };
    const result = verifySignedClaim(tampered);
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('CLAIM_DIGEST_MISMATCH');
  });

  it('invalidates verification when the issuer is substituted after signing', () => {
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const claim = buildAuthorityClaim({
      id: 'claim:authority:4',
      sovereignAssetId: mintSovereignAssetId(),
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Rights,
      statement: 'Alice asserts distribution rights.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });
    const signed = signClaim(claim, privateKeyPem, signingKey);

    const tampered = { ...signed, claim: { ...signed.claim, issuer: 'principal:mallory' } };
    const result = verifySignedClaim(tampered);
    expect(result.valid).toBe(false);
  });

  it('invalidates verification when the signature is replayed against a different claim', () => {
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const claimA = buildAuthorityClaim({
      id: 'claim:authority:5a',
      sovereignAssetId: mintSovereignAssetId(),
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Rights,
      statement: 'Claim A.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });
    const claimB = buildAuthorityClaim({
      id: 'claim:authority:5b',
      sovereignAssetId: mintSovereignAssetId(),
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Rights,
      statement: 'Claim B.',
      issuedAt: '2026-01-01T00:00:00.000Z',
    });
    const signedA = signClaim(claimA, privateKeyPem, signingKey);

    const replayed = { ...signedA, claim: claimB };
    const result = verifySignedClaim(replayed);
    expect(result.valid).toBe(false);
  });
});

describe('Contested claims (§20, §37) — dispute without adjudication', () => {
  it('marks a claim as Contested while preserving the original claim and its evidence', () => {
    const { signingKey, privateKeyPem } = generateSovereignKeyPair();
    const claim = buildAuthorityClaim({
      id: 'claim:authority:contested',
      sovereignAssetId: mintSovereignAssetId(),
      issuer: 'principal:alice',
      kind: AuthorityClaimKind.Authorship,
      statement: 'Alice asserts authorship.',
      issuedAt: '2026-01-01T00:00:00.000Z',
      evidenceRefs: ['evidence:studio-log-1'],
    });
    const signed = signClaim(claim, privateKeyPem, signingKey);

    const standing = contestClaim({
      id: 'standing:contest:1',
      claimRef: claim.id,
      reason: 'Bob asserts he co-authored this work; see evidence:contract-1.',
      effectiveAt: '2026-02-01T00:00:00.000Z',
    });

    expect(standing.status).toBe(StandingStatus.Contested);
    expect(standing.claimRef).toBe(claim.id);
    // The original claim is untouched and still independently verifiable.
    expect(claim.evidenceRefs).toEqual(['evidence:studio-log-1']);
    expect(verifySignedClaim(signed).valid).toBe(true);
  });
});
