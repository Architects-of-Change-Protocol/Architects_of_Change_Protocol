import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { mintSovereignAssetId } from '@aoc/protocol/identity';
import {
  buildSovereigntyPortabilityBundleV1,
  serializeSovereigntyPortabilityBundle,
} from '@aoc/protocol/portability';

/**
 * SM-06 boundary proofs.
 *
 * Portability is defined as much by what it refuses to do as by what it does,
 * and several of those refusals are only checkable by reading the production
 * source: a capsule that quietly called `computeContentIdentity` or
 * `verifySignedClaim` would still pass every behavioural test while having
 * absorbed another mineral's contract.
 */

const PROTOCOL_SRC = join(__dirname, '..', '..', 'packages', 'protocol', 'src');

/**
 * Prose that names a primitive in order to explain why it is deliberately NOT
 * called must not be mistaken for a call to it, so comments are stripped before
 * scanning — the same technique the SM-04 and SM-05 capsule suites use.
 */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const readPortabilitySource = (): string => {
  const portabilityDir = join(PROTOCOL_SRC, 'portability');
  const files = readdirSync(portabilityDir).map((name) => join(portabilityDir, name));
  files.push(join(PROTOCOL_SRC, 'sovereignty-capabilities', 'capsules', 'portability.ts'));
  return files.map((path) => stripComments(readFileSync(path, 'utf8'))).join('\n');
};

const PORTABILITY_SOURCE = readPortabilitySource();

const CAPSULE_SOURCE = stripComments(
  readFileSync(join(PROTOCOL_SRC, 'sovereignty-capabilities', 'capsules', 'portability.ts'), 'utf8'),
);

const expectAbsent = (needles: readonly string[]): void => {
  for (const needle of needles) {
    expect(PORTABILITY_SOURCE).not.toContain(needle);
  }
};

describe('SM-06 / Portability never performs another mineral’s work (BOUNDARY TESTS 1-8)', () => {
  it('BOUNDARY TEST 1 — never mints a SovereignAssetId', () => {
    expectAbsent(['mintSovereignAssetId', 'randomUUID', 'createIdentitySovereigntyCapabilityImplementation']);
  });

  it('BOUNDARY TEST 2 — never computes a ContentIdentity', () => {
    expectAbsent(['computeContentIdentity', 'createIntegritySovereigntyCapabilityImplementation']);
  });

  it('BOUNDARY TEST 3 — never computes a manifest digest', () => {
    expectAbsent(['computeManifestDigest']);
  });

  it('BOUNDARY TEST 4 — never verifies a ContentIdentity', () => {
    expectAbsent(['verifyContentIdentity', 'contentIdentitiesEqual']);
  });

  it('BOUNDARY TEST 5 — never verifies a sovereign manifest', () => {
    expectAbsent(['verifySovereignManifest', 'verifySovereignSignature', 'VerificationKeyResolver']);
  });

  it('BOUNDARY TEST 6 — never verifies a signed claim', () => {
    expectAbsent(['verifySignedClaim']);
  });

  it('BOUNDARY TEST 7 — never signs a claim', () => {
    expectAbsent(['signClaim', 'signSovereignPayload', 'generateSovereignKeyPair']);
  });

  it('BOUNDARY TEST 8 — never signs a manifest', () => {
    expectAbsent(['signSovereignManifest']);
  });

  it('never creates provenance and never registers or persists anything', () => {
    expectAbsent([
      'buildOriginClaim',
      'buildAuthorityClaim',
      'buildDerivationClaim',
      'contestClaim',
      'traceSovereignLineage',
      'SovereignAssetRegistry',
      'resolveSovereignAsset',
      'register(',
    ]);
  });

  it('derives its capability ref from the SM-01 registry rather than a hand-written literal', () => {
    expect(CAPSULE_SOURCE).not.toMatch(/aoc:sovereignty-capability:portability/);
    expect(CAPSULE_SOURCE).not.toMatch(/version\s*:\s*['"]\d+\.\d+\.\d+['"]/);
    expect(CAPSULE_SOURCE).toContain("requireSovereigntyCapabilityRef('portability')");
  });
});

describe('SM-06 / Portability reaches nothing outside itself (BOUNDARY TESTS 9-11)', () => {
  it('BOUNDARY TEST 9 — imports no Enterprise package', () => {
    expectAbsent(['@aoc/enterprise', 'enterprise/', 'tenant', 'AccessGrant', 'ExecutionGrant']);
  });

  it('BOUNDARY TEST 10 — imports no provider, storage or runtime package', () => {
    expectAbsent([
      '@aoc-runtime/',
      'StoragePointer',
      'storageUri',
      'pinata',
      'Pinata',
      's3',
      'S3',
      'ipfs',
      'IPFS',
    ]);
  });

  it('BOUNDARY TEST 11 — performs no filesystem, network, crypto or dynamic-code call', () => {
    expectAbsent([
      'node:fs',
      'node:http',
      'node:https',
      'node:net',
      'node:crypto',
      'node:child_process',
      'fetch(',
      'XMLHttpRequest',
      'WebSocket',
      'eval(',
      'new Function',
      'require(',
      'import(',
    ]);
  });

  it('accepts no key material, credential or secret', () => {
    expectAbsent([
      'privateKey',
      'privateKeyPem',
      'secretKey',
      'seedPhrase',
      'walletSecret',
      'apiKey',
      'accessToken',
      'password',
      'credential',
    ]);
  });

  it('never compresses, encrypts or re-encodes the wire representation', () => {
    expectAbsent(['gzip', 'brotli', 'deflate', 'zlib', 'cbor', 'CBOR', 'msgpack', 'protobuf', 'base64', 'cipher']);
  });

  it('is free of import-time side effects: constructing the capsule is what does the work', () => {
    expectAbsent(['Date.now(', 'new Date(', 'process.env']);

    // Every *module-scope* line — i.e. every unindented, non-blank line — is a
    // declaration or a continuation of one, never a bare call that would mint,
    // read a clock, open something or register a handler at import time.
    const moduleScopeStarts = PORTABILITY_SOURCE.split('\n')
      .filter((line) => line.trim() !== '' && !/^\s/.test(line))
      .filter((line) => !/^(import|export|const|type|interface|function|\}|\)|\]|'|`)/.test(line));

    expect(moduleScopeStarts).toEqual([]);
  });
});

describe('SM-06 / the bundle contract carries no foreign semantics (BOUNDARY TESTS 12-15)', () => {
  const bundle = buildSovereigntyPortabilityBundleV1({
    subject: { sovereignAssetId: mintSovereignAssetId() },
  });
  const wire = serializeSovereigntyPortabilityBundle(bundle);

  it('BOUNDARY TEST 12 — has no raw content bytes field', () => {
    for (const field of ['contentBytes', 'bytes', 'payload', 'data', 'blob', 'attachment', 'file']) {
      expect(wire).not.toContain(`"${field}"`);
      expect(PORTABILITY_SOURCE).not.toContain(`readonly ${field}`);
    }
  });

  it('BOUNDARY TEST 13 — has no ownership, custody or transfer field', () => {
    for (const field of ['owner', 'legalOwner', 'ownership', 'custody', 'custodian', 'transferredTo', 'holder']) {
      expect(wire).not.toContain(`"${field}"`);
      expect(PORTABILITY_SOURCE).not.toContain(`readonly ${field}`);
    }
  });

  it('BOUNDARY TEST 14 — has no licence or terms envelope semantics', () => {
    for (const field of ['license', 'licence', 'terms', 'restrictions', 'permissions', 'royalty']) {
      expect(wire).not.toContain(`"${field}"`);
      expect(PORTABILITY_SOURCE).not.toContain(`readonly ${field}`);
    }
  });

  it('BOUNDARY TEST 15 — has no governance or policy envelope semantics', () => {
    for (const field of ['policy', 'governanceContext', 'approvalRequirements', 'grantRequirements', 'quota']) {
      expect(wire).not.toContain(`"${field}"`);
      expect(PORTABILITY_SOURCE).not.toContain(`readonly ${field}`);
    }
  });

  it('has no bundle digest, hash, checksum or signature: integrity is explicit composition', () => {
    for (const field of ['digest', 'hash', 'checksum', 'bundleSignature', 'bundleHash', 'bundleDigest']) {
      expect(wire).not.toContain(`"${field}"`);
    }
    expect(Object.keys(bundle).sort()).toEqual([
      'canonicalizationProfile',
      'claims',
      'manifests',
      'schemaVersion',
      'standings',
      'subject',
    ]);
  });

  it('branches on no subject namespace or domain: the subject model stays open-world', () => {
    for (const domain of [
      "'file'", "'image'", "'music'", "'video'", "'document'", "'property'", "'token'", "'agent'", "'nft'",
      'alien-system', 'property-registry', 'external-token-system',
    ]) {
      expect(PORTABILITY_SOURCE).not.toContain(domain);
    }
    expect(PORTABILITY_SOURCE).not.toContain('namespace ===');
    expect(PORTABILITY_SOURCE).not.toContain('startsWith(');
  });

  it('reuses the one canonicalizer and defines no second serialization', () => {
    expect(PORTABILITY_SOURCE).toContain('canonicalizeJSON');
    expect(PORTABILITY_SOURCE).toContain('CANONICAL_JSON_PROFILE');
    expectAbsent(['stableStringify', 'json-stable-stringify', 'JSON.stringify(']);
    expect(canonicalizeJSON(bundle)).toBe(wire);
  });

  it('performs no recursive ancestor expansion of a derivation edge', () => {
    expectAbsent(['exportEntireLineage', 'recursiv', 'ancestorBundle', 'traverse']);
  });
});
