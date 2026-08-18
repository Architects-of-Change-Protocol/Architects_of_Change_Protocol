import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { StandingStatus, VerificationStatus } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import {
  DerivationRelationKind,
  buildDerivationClaim,
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signClaim,
  signSovereignManifest,
} from '@aoc/protocol/manifest';
import {
  SOVEREIGNTY_CAPABILITY_KEYS,
  buildSovereigntyCapabilityInvocation,
  createVerifiabilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  SovereigntyCapabilityRef,
  VerifiabilitySovereigntyCapabilityInput,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-08 boundary proofs.
 *
 * Verifiability is defined as much by what it refuses to do as by what it does,
 * and several of those refusals are only checkable by reading the production
 * source: a capsule that quietly generated a key, accepted a private key,
 * signed an artifact, performed a content check, called a revocation lookup or
 * assigned a standing would still pass every behavioural test while having
 * absorbed a contract that is not its own.
 */

const PROTOCOL_SRC = join(__dirname, '..', '..', 'packages', 'protocol', 'src');

/**
 * Prose that names a primitive in order to explain why it is deliberately NOT
 * called must not be mistaken for a call to it, so comments are stripped before
 * scanning — the same technique the SM-04, SM-05, SM-06 and SM-07 suites use.
 */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const CAPSULE_PATH = join(PROTOCOL_SRC, 'sovereignty-capabilities', 'capsules', 'verifiability.ts');
const CLAIM_VERIFY_PATH = join(PROTOCOL_SRC, 'manifest', 'verify.ts');

const CAPSULE_SOURCE = stripComments(readFileSync(CAPSULE_PATH, 'utf8'));
const CLAIM_VERIFY_SOURCE = stripComments(readFileSync(CLAIM_VERIFY_PATH, 'utf8'));
const VERIFIABILITY_SOURCE = `${CAPSULE_SOURCE}\n${CLAIM_VERIFY_SOURCE}`;

const expectAbsentFromCapsule = (needles: readonly string[]): void => {
  for (const needle of needles) {
    expect({ needle, present: CAPSULE_SOURCE.includes(needle) }).toEqual({ needle, present: false });
  }
};

const expectAbsentFromVerifiability = (needles: readonly string[]): void => {
  for (const needle of needles) {
    expect({ needle, present: VERIFIABILITY_SOURCE.includes(needle) }).toEqual({ needle, present: false });
  }
};

const VERIFIABILITY_REF = getSovereigntyCapabilityRefByKey('verifiability') as SovereigntyCapabilityRef;
const AT = '2026-04-01T09:00:00.000Z';
const KEY_PAIR = generateSovereignKeyPair(); // TEST ONLY

describe('SM-08 / security boundaries (SECURITY TESTS 1-15)', () => {
  it('SECURITY TEST 1 — no private key field exists anywhere in the production input contract', () => {
    expectAbsentFromVerifiability([
      'privateKey',
      'privateKeyPem',
      'secretKey',
      'seedPhrase',
      'mnemonic',
      'walletSecret',
      'kmsSecret',
      'signingSecret',
    ]);
    // `seed` and `secret` are checked as whole identifier fragments so the word
    // cannot slip in under another spelling.
    expect(CAPSULE_SOURCE).not.toMatch(/\bseed\b/i);
    expect(CAPSULE_SOURCE).not.toMatch(/\bsecret\b/i);
  });

  it('SECURITY TEST 2 — the production capsule never generates a key pair', () => {
    expectAbsentFromCapsule(['generateSovereignKeyPair', 'generateKeyPairSync', 'randomBytes', 'randomUUID']);
  });

  it('SECURITY TESTS 3-5 — the production capsule never signs', () => {
    expectAbsentFromCapsule(['signClaim', 'signSovereignManifest', 'signSovereignPayload', 'createSign', '.sign(']);
    // The claim-verification helper likewise verifies only.
    expect(CLAIM_VERIFY_SOURCE).not.toContain('signSovereignPayload');
    expect(CLAIM_VERIFY_SOURCE).not.toContain('signSovereignManifest');
    expect(CLAIM_VERIFY_SOURCE).not.toMatch(/\bsignClaim\b/);
  });

  it('SECURITY TESTS 6-10 — generic evidence carries no cryptographic material or artifact', async () => {
    const id = parseSovereignAssetId(mintSovereignAssetId());
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider-p1/object/92817',
      }),
      contentIdentity: computeContentIdentity(new TextEncoder().encode('bytes')),
      registrant: 'principal:sm08-issuer',
      createdAt: AT,
    });
    const signed = signSovereignManifest(manifest, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, new Date(AT));
    // Deliberately broken so the evidence under test is a *negative* one.
    const tampered = { ...signed, manifestDigest: '0'.repeat(64) };

    const result = await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: VERIFIABILITY_REF,
        input: { operation: 'verify-signed-manifest', signedManifest: tampered } as VerifiabilitySovereigntyCapabilityInput,
      }),
      createVerifiabilitySovereigntyCapabilityImplementation({
        verificationKeyResolver: { resolveVerificationKey: () => ({ keyId: KEY_PAIR.signingKey.keyId, issuer: 'principal:sm08-issuer' }) },
      }),
    );

    expect(result.status).toBe('succeeded');
    const serializedEvidence = JSON.stringify(result.evidence);
    for (const leak of [
      KEY_PAIR.privateKeyPem,
      KEY_PAIR.signingKey.publicKey,
      KEY_PAIR.signingKey.keyId,
      signed.proof.signature,
      signed.proof.payloadHash,
      signed.manifestDigest,
      tampered.manifestDigest,
      manifest.contentIdentity?.digest ?? 'unreachable',
      'BEGIN PRIVATE KEY',
      'BEGIN PUBLIC KEY',
      'ed25519',
      'aoc-sovereign-manifest/1',
      'manifestStructure',
      'issuerBinding',
      'verification',
      'proof',
      'registrant',
      'validUntil',
    ]) {
      expect({ leak, present: serializedEvidence.includes(leak) }).toEqual({ leak, present: false });
    }
    // Only execution metadata.
    expect(Object.keys(result.evidence).sort()).toEqual([
      'capability',
      'completedAt',
      'invocationId',
      'outcome',
      'requestedAt',
      'schemaVersion',
      'subject',
    ]);
  });

  it('SECURITY TESTS 11-13 — no filesystem, network or database reaches the production source', () => {
    expectAbsentFromVerifiability([
      'node:fs',
      'node:path',
      'readFileSync',
      'writeFileSync',
      'fetch(',
      'axios',
      'http',
      'XMLHttpRequest',
      'WebSocket',
      'pg',
      'mongo',
      'prisma',
      'sqlite',
      'redis',
      'localStorage',
      'process.env',
    ]);
  });

  it('SECURITY TEST 14 — no Enterprise, runtime, provider or legacy dependency is introduced', () => {
    expectAbsentFromVerifiability([
      '@aoc/enterprise',
      'pmfreak',
      '@aoc-runtime/',
      'enterprise',
      'governance runtime',
      'protocol/enforcement',
      'protocol/execution',
      '../../runtime',
      '../../storage',
      '../../vault',
    ]);
  });

  it('SECURITY TEST 15 — no key registry, key store or key directory is introduced', () => {
    expectAbsentFromVerifiability([
      'registerVerificationKey',
      'GlobalVerificationKeyRegistry',
      'TrustedKeyStore',
      'KeyMarketplace',
      'KeyDirectory',
      'globalThis',
      'keyStore',
      'keyRegistry',
    ]);
  });

  it('no second cryptographic implementation exists in the capsule', () => {
    expectAbsentFromCapsule([
      'node:crypto',
      'createHash',
      'sha256',
      'SHA-256',
      'base64url',
      'Buffer.from',
      'ed25519',
      'secp256k1',
      'ECDSA',
      'RSA',
      'BLS',
      'P-256',
      'Keccak',
      'SHA-3',
      'multihash',
      'personal_sign',
      'EIP-712',
    ]);
    // The one canonicalizer is imported, never reimplemented.
    expect(CAPSULE_SOURCE).toContain("from '../../canonical'");
    expect(CAPSULE_SOURCE).not.toContain('JSON.stringify(');
  });

  it('the capsule delegates every cryptographic check to the owning primitives', () => {
    for (const primitive of ['verifySovereignManifest', 'verifySignedSovereignClaim', 'verifySovereignSignature']) {
      expect(CAPSULE_SOURCE).toContain(primitive);
    }
    // …and the claim helper delegates the digest/signature half to verifySignedClaim.
    expect(CLAIM_VERIFY_SOURCE).toContain('verifySignedClaim(signed)');
  });

  it('no revocation, certificate chain, DID or wallet semantics appear', () => {
    expectAbsentFromVerifiability([
      'RevocationLookup',
      'lookupRevocationStatus',
      'revoked',
      'revocation',
      'OCSP',
      'CRL',
      'X.509',
      'x509',
      'certificate',
      'certificateChain',
      'did:key',
      'did:web',
      'DIDResolver',
      'resolveDid',
      'blockchain',
      'rpc',
      'wallet',
      'credentialStatus',
    ]);
  });

  it('no key validity window or freshness policy is applied', () => {
    expectAbsentFromCapsule(['validFrom', 'validUntil', 'expiresAt', 'expired', 'maxAge', 'ttl', 'TTL', 'freshness']);
    expect(CLAIM_VERIFY_SOURCE).not.toContain('validUntil');
  });

  it('the capsule captures no clock and mints no id', () => {
    expectAbsentFromCapsule(['new Date(', 'Date.now', 'toISOString', 'clock', 'verifiedAt', 'checkedAt', 'verificationId', 'reportId']);
  });
});

describe('SM-08 / epistemic boundaries (BOUNDARY TESTS 1-10)', () => {
  it('BOUNDARY TESTS 1-3 — no truth, authorization or legal-ownership vocabulary exists in production source', () => {
    expectAbsentFromVerifiability([
      'historicallyTrue',
      'legalOwner',
      'legalOwnership',
      'authorizedDerivative',
      'copyright',
      'licenseValid',
      'licence',
      'factCheck',
      'plagiarism',
      'court',
      'ownershipVerified',
      'ownerOf',
      'kyc',
      'KYC',
    ]);
  });

  it('BOUNDARY TEST 4 — a valid signature cannot change standing: no standing symbol is reachable', () => {
    expectAbsentFromVerifiability([
      'contestClaim',
      'StandingStatus',
      'CanonicalStanding',
      'buildStanding',
      'Verified',
      'Contested',
    ]);
  });

  it('BOUNDARY TEST 5 — the capsule never reads a standing, so a valid signature and a contest cannot interact', () => {
    expect(CAPSULE_SOURCE).not.toContain('standing');
    expect(CAPSULE_SOURCE).not.toContain('Standing');
  });

  it('BOUNDARY TEST 6 — no CanonicalVerification is created', () => {
    expectAbsentFromVerifiability([
      'CanonicalVerification',
      'claimRef',
      'verifier:',
      'findings',
      "from '../../claims/verification'",
      "from '../claims/verification'",
    ]);
  });

  it('BOUNDARY TEST 7 — VerificationStatus is neither imported, assigned nor widened', () => {
    expectAbsentFromVerifiability(['VerificationStatus']);
    // The generic claims vocabulary is untouched by SM-08.
    expect(Object.keys(VerificationStatus).length).toBeGreaterThan(0);
    for (const status of Object.values(VerificationStatus)) {
      expect(VERIFIABILITY_SOURCE).not.toContain(`VerificationStatus.${status}`);
    }
    for (const invented of ['CryptographicallyVerified', 'SignatureValid', 'PartiallyVerified']) {
      expect(Object.values(VerificationStatus)).not.toContain(invented);
    }
  });

  it('BOUNDARY TEST 8 — no governance decision vocabulary is emitted', () => {
    for (const verdict of ['ALLOW', 'DENY', 'APPROVE', 'REJECT', 'GRANT', 'BLOCK', 'ENFORCE']) {
      expect(VERIFIABILITY_SOURCE).not.toContain(verdict);
    }
    expectAbsentFromVerifiability(['PolicyDecision', 'GovernanceDecisionProvider', 'allow', 'deny']);
  });

  it('BOUNDARY TEST 9 — no licence validity result exists', () => {
    expectAbsentFromVerifiability(['licenseValid', 'licensing', 'terms', 'LicenseTerms']);
  });

  it('BOUNDARY TEST 10 — no trust, confidence or risk score exists', () => {
    expectAbsentFromVerifiability([
      'trustScore',
      'confidenceScore',
      'credibilityScore',
      'reputation',
      'assuranceScore',
      'riskScore',
      'score',
      'percentage',
      'weight',
    ]);
  });

  it('no VerificationProvider is depended on', () => {
    expectAbsentFromVerifiability(['VerificationProvider', 'verifyClaim(']);
  });

  it('the verification report itself is never signed and never becomes evidence material', () => {
    expectAbsentFromCapsule(['signSovereignPayload', 'evidenceRefs', 'CanonicalEvidenceId']);
  });
});

describe('SM-08 / mineral separation (MINERAL TESTS 1-8)', () => {
  it('MINERAL TESTS 1, 3-6 — the capsule invokes no other capability', () => {
    expectAbsentFromCapsule([
      'invokeSovereigntyCapability',
      'createIdentitySovereigntyCapabilityImplementation',
      'createIntegritySovereigntyCapabilityImplementation',
      'createProvenanceSovereigntyCapabilityImplementation',
      'createPortabilitySovereigntyCapabilityImplementation',
      'createInteroperabilitySovereigntyCapabilityImplementation',
      "requireSovereigntyCapabilityRef('identity')",
      "requireSovereigntyCapabilityRef('integrity')",
      "requireSovereigntyCapabilityRef('provenance')",
      "requireSovereigntyCapabilityRef('portability')",
      "requireSovereigntyCapabilityRef('interoperability')",
    ]);
    expect(CAPSULE_SOURCE).toContain("requireSovereigntyCapabilityRef('verifiability')");
  });

  it('MINERAL TEST 2 — no content bytes are accepted or computed', () => {
    expectAbsentFromCapsule([
      'contentBytes',
      'Uint8Array',
      'computeContentIdentity',
      'verifyContentIdentity',
      'ContentIdentity',
      'contentIdentitiesEqual',
    ]);
  });

  it('MINERAL TEST 6b — no identity is minted', () => {
    expectAbsentFromCapsule(['mintSovereignAssetId', 'buildSovereignManifestV1', 'computeManifestDigest']);
  });

  it('MINERAL TESTS 4-5 — no bundle or descriptor is built, parsed or mutated', () => {
    expectAbsentFromCapsule([
      'buildSovereigntyPortabilityBundleV1',
      'parseSovereigntyPortabilityBundle',
      'serializeSovereigntyPortabilityBundle',
      'buildSovereigntyInteroperabilityDescriptorV1',
      'assessSovereigntyInteroperabilityCompatibility',
      '../../portability',
      '../../interoperability',
    ]);
  });

  it('MINERAL TEST 3b — no provenance is created', () => {
    expectAbsentFromCapsule(['buildOriginClaim', 'buildAuthorityClaim', 'buildDerivationClaim', 'traceSovereignLineage']);
  });

  it('MINERAL TEST 7 — other minerals feed Verifiability only through explicit caller composition', async () => {
    // Nothing here calls another capsule: the caller assembles the artifacts and
    // hands them over, and the verification is an ordinary invocation over them.
    const id = parseSovereignAssetId(mintSovereignAssetId());
    const claim = buildDerivationClaim({
      id: 'claim:sm08-boundary',
      sovereignAssetId: id,
      issuer: 'principal:sm08-issuer',
      sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
      relation: DerivationRelationKind.DerivedFrom,
      issuedAt: AT,
    });
    const signedClaim = signClaim(claim, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, new Date(AT));
    const result = await invokeSovereigntyCapability(
      buildSovereigntyCapabilityInvocation({
        capability: VERIFIABILITY_REF,
        input: { operation: 'verify-signed-claim', signedClaim } as VerifiabilitySovereigntyCapabilityInput,
      }),
      createVerifiabilitySovereigntyCapabilityImplementation(),
    );
    expect(result.status).toBe('succeeded');
    expect(result.evidence.capability.id).toBe('aoc:sovereignty-capability:verifiability');
  });

  it('MINERAL TEST 8 — exactly eight canonical minerals remain, in order, all at 1.0.0', () => {
    expect(SOVEREIGNTY_CAPABILITY_KEYS).toHaveLength(8);
    expect([...SOVEREIGNTY_CAPABILITY_KEYS]).toEqual([
      'identity',
      'integrity',
      'provenance',
      'portability',
      'interoperability',
      'verifiability',
      'licensing_terms',
      'governance_compatibility',
    ]);
    const capabilities = listSovereigntyCapabilities();
    expect(capabilities).toHaveLength(8);
    for (const capability of capabilities) {
      expect(capability.version).toBe('1.0.0');
    }
    // No AOC.CRYPTOGRAPHY / AOC.SIGNATURE / AOC.TRUST / AOC.PROOF / AOC.KEYS.
    for (const invented of ['cryptography', 'signature', 'trust', 'proof', 'keys']) {
      expect(SOVEREIGNTY_CAPABILITY_KEYS as readonly string[]).not.toContain(invented);
    }
  });

  it('no subject namespace, asset type or business domain is branched on', () => {
    expect(CAPSULE_SOURCE).not.toContain('namespace ===');
    expect(CAPSULE_SOURCE).not.toContain('namespace.startsWith');
    expectAbsentFromCapsule(['assetType', 'mediaType', 'token', 'property', 'music', 'image', 'nft', 'NFT', 'agentType']);
  });

  it('the standing vocabulary is untouched by SM-08', () => {
    expect(Object.values(StandingStatus)).toContain('Contested');
    expect(Object.values(StandingStatus)).toContain('Verified');
  });
});
