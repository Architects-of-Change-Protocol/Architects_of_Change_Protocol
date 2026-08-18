import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import { buildDerivationClaim, buildOriginClaim, buildSovereignManifestV1 } from '@aoc/protocol/manifest';
import { buildSovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import {
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  assessSovereigntyInteroperabilityCompatibility,
  buildSovereigntyInteroperabilityConsumerSupportV1,
  buildSovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';
import { SOVEREIGNTY_CAPABILITY_KEYS } from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-07 boundary proofs.
 *
 * Interoperability is defined as much by what it refuses to do as by what it
 * does, and several of those refusals are only checkable by reading the
 * production source: a capsule that quietly called `verifySignedClaim`, fetched
 * a support declaration, or dropped an unsupported artifact would still pass
 * every behavioural test while having absorbed another mineral's contract.
 */

const PROTOCOL_SRC = join(__dirname, '..', '..', 'packages', 'protocol', 'src');

/**
 * Prose that names a primitive in order to explain why it is deliberately NOT
 * called must not be mistaken for a call to it, so comments are stripped before
 * scanning — the same technique the SM-04, SM-05 and SM-06 suites use.
 */
const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const CAPSULE_PATH = join(PROTOCOL_SRC, 'sovereignty-capabilities', 'capsules', 'interoperability.ts');

const readInteroperabilitySource = (): string => {
  const dir = join(PROTOCOL_SRC, 'interoperability');
  const files = readdirSync(dir).map((name) => join(dir, name));
  files.push(CAPSULE_PATH);
  return files.map((path) => stripComments(readFileSync(path, 'utf8'))).join('\n');
};

const INTEROPERABILITY_SOURCE = readInteroperabilitySource();
const CAPSULE_SOURCE = stripComments(readFileSync(CAPSULE_PATH, 'utf8'));

const expectAbsent = (needles: readonly string[]): void => {
  for (const needle of needles) {
    expect(INTEROPERABILITY_SOURCE).not.toContain(needle);
  }
};

describe('SM-07 / Interoperability never performs another mineral’s work (BOUNDARY TESTS 1-8)', () => {
  it('BOUNDARY TEST 1 — never mints a SovereignAssetId', () => {
    expectAbsent(['mintSovereignAssetId', 'randomUUID', 'createIdentitySovereigntyCapabilityImplementation']);
  });

  it('BOUNDARY TEST 2 — never computes a ContentIdentity', () => {
    expectAbsent(['computeContentIdentity', 'createIntegritySovereigntyCapabilityImplementation']);
  });

  it('BOUNDARY TEST 3 — never verifies a ContentIdentity', () => {
    expectAbsent(['verifyContentIdentity', 'contentIdentitiesEqual', 'computeManifestDigest']);
  });

  it('BOUNDARY TEST 4 — never signs a claim', () => {
    expectAbsent(['signClaim', 'signSovereignPayload', 'generateSovereignKeyPair']);
  });

  it('BOUNDARY TEST 5 — never verifies a signed claim', () => {
    expectAbsent(['verifySignedClaim']);
  });

  it('BOUNDARY TEST 6 — never signs a manifest', () => {
    expectAbsent(['signSovereignManifest']);
  });

  it('BOUNDARY TEST 7 — never verifies a manifest or a signature', () => {
    expectAbsent(['verifySovereignManifest', 'verifySovereignSignature', 'VerificationKeyResolver']);
  });

  it('BOUNDARY TEST 8 — never builds provenance or traverses lineage', () => {
    expectAbsent([
      'buildOriginClaim',
      'buildAuthorityClaim',
      'buildDerivationClaim',
      'contestClaim',
      'traceSovereignLineage',
      'createProvenanceSovereigntyCapabilityImplementation',
    ]);
  });

  it('derives its capability ref from the SM-01 registry rather than a hand-written literal', () => {
    expect(CAPSULE_SOURCE).not.toMatch(/aoc:sovereignty-capability:interoperability/);
    expect(CAPSULE_SOURCE).not.toMatch(/version\s*:\s*['"]\d+\.\d+\.\d+['"]/);
    expect(CAPSULE_SOURCE).toContain("requireSovereigntyCapabilityRef('interoperability')");
  });
});

describe('SM-07 / Interoperability reaches nothing outside itself (BOUNDARY TESTS 9-13)', () => {
  it('BOUNDARY TEST 9 — never invokes the Portability capability, though it reuses its contract', () => {
    // Contract reuse is legitimate and required: describing a representation
    // means knowing what a valid one is.
    expect(INTEROPERABILITY_SOURCE).toContain("from '../portability'");
    expect(INTEROPERABILITY_SOURCE).toContain('validateSovereigntyPortabilityBundleV1');

    // Capability *execution* is not. The caller composes minerals.
    expectAbsent([
      'invokeSovereigntyCapability',
      'createPortabilitySovereigntyCapabilityImplementation',
      'buildSovereigntyCapabilityInvocation',
    ]);
  });

  it('BOUNDARY TEST 10 — imports no Enterprise package', () => {
    expectAbsent(['@aoc/enterprise', 'enterprise/', 'tenant', 'AccessGrant', 'ExecutionGrant']);
  });

  it('BOUNDARY TEST 11 — imports no provider, storage or runtime package', () => {
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

  it('BOUNDARY TEST 12 — performs no network call and no support discovery', () => {
    expectAbsent([
      'node:http',
      'node:https',
      'node:net',
      'fetch(',
      'XMLHttpRequest',
      'WebSocket',
      'axios',
      'undici',
      '.well-known',
      'wellKnown',
      'resolveDid',
      'didDocument',
      'serviceEndpoint',
      'userAgent',
      'User-Agent',
      'Accept:',
      'Content-Type',
    ]);
  });

  it('BOUNDARY TEST 13 — performs no filesystem, database, crypto or dynamic-code call', () => {
    expectAbsent([
      'node:fs',
      'node:crypto',
      'node:path',
      'node:child_process',
      'readFile',
      'writeFile',
      'createHash',
      'database',
      'persist',
      'eval(',
      'new Function',
      'require(',
      'import(',
    ]);
  });

  it('is free of import-time side effects beyond evaluating frozen constants', () => {
    expectAbsent(['Date.now(', 'new Date(', 'process.env']);

    // Every *module-scope* line — i.e. every unindented, non-blank line — is a
    // declaration or a continuation of one, never a bare call that would mint,
    // read a clock, open something or register a handler at import time.
    const moduleScopeStarts = INTEROPERABILITY_SOURCE.split('\n')
      .filter((line) => line.trim() !== '' && !/^\s/.test(line))
      .filter((line) => !/^(import|export|const|type|interface|function|\}|\)|\]|'|`)/.test(line));

    expect(moduleScopeStarts).toEqual([]);
  });
});

describe('SM-07 / no registry, no adapter, no translation (BOUNDARY TESTS 14-15)', () => {
  it('BOUNDARY TEST 14 — introduces no mutable profile or adapter registry', () => {
    expectAbsent([
      'registerProfile',
      'removeProfile',
      'findProfile',
      'ProfileRegistry',
      'ProfileMarketplace',
      'registerInteropAdapter',
      'AdapterMarketplace',
      'GlobalTranslationRegistry',
      'SchemaBridgeRegistry',
      'ExternalStandardPluginManager',
      'ProtocolTranslatorRuntime',
    ]);
    // The canonical profile is a frozen constant, not a catalogue entry.
    expect(Object.isFrozen(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1)).toBe(true);
  });

  it('BOUNDARY TEST 15 — implements no external-standard translation adapter', () => {
    // These strings appear only in prose explaining that the mappings are
    // deferred, so a comment-stripped scan must find none of them.
    expectAbsent([
      'W3C',
      'VerifiableCredential',
      'verifiableCredential',
      'DIDDocument',
      'did:',
      'C2PA',
      'SPDX',
      'CycloneDX',
      'schema.org',
      'JSON-LD',
      'jsonld',
      '@context',
      'OpenBadge',
      'XACML',
      'Rego',
      'Cedar',
      'toW3C',
      'mapTo',
      'translate',
      'Translator',
    ]);
  });
});

describe('SM-07 / no trust, no policy, no ownership, no data loss (BOUNDARY TESTS 16-19)', () => {
  it('BOUNDARY TEST 16 — introduces no trust, score or reputation semantics', () => {
    expectAbsent([
      'trustScore',
      'confidenceScore',
      'reputation',
      'authorityLevel',
      'credibility',
      'verifiedIssuer',
      'matchPercentage',
    ]);
  });

  it('BOUNDARY TEST 17 — introduces no policy decision or ownership semantics', () => {
    expectAbsent([
      'PolicyDecision',
      'evaluatePolicy',
      'authorize(',
      "'ALLOW'",
      "'DENY'",
      "'APPROVE'",
      "'REJECT'",
      'legalOwner',
      'ownership',
      'custodian',
      'transferredTo',
    ]);
    // The three statuses are semantic-consumption results, never verdicts.
    expect(INTEROPERABILITY_SOURCE).toContain("'partially-compatible'");
  });

  it('BOUNDARY TEST 18 — never mutates the bundle, descriptor or support declaration', () => {
    expectAbsent(['.push(bundle', 'delete ', 'Object.assign(', '.splice(', '.reverse('] );
    // Sorting always happens on a copy, never on a caller's array.
    expect(INTEROPERABILITY_SOURCE).not.toMatch(/\b(bundle|descriptor|consumerSupport|input)\.[A-Za-z.]*\.sort\(/);
  });

  it('BOUNDARY TEST 19 — offers no projection, downgrade or artifact-dropping operation', () => {
    expectAbsent([
      'stripUnsupportedArtifacts',
      'downgradeBundle',
      'convertToSupportedSubset',
      'bestEffortImport',
      'projectBundle',
      'dropUnsupported',
      'reduceBundle',
    ]);
  });
});

describe('SM-07 / the canonical inventory is untouched (BOUNDARY TEST 20)', () => {
  it('BOUNDARY TEST 20 — introduces no ninth mineral', () => {
    expect(SOVEREIGNTY_CAPABILITY_KEYS.length).toBe(8);
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
    // The vocabulary, the profile, the descriptor and the report are all
    // Interoperability *artifacts*, never new capabilities.
    expectAbsent([
      'AOC.COMPATIBILITY',
      'AOC.TRANSLATION',
      'AOC.SCHEMA',
      'AOC.SEMANTICS',
      'semantic_vocabulary',
      'SOVEREIGNTY_CAPABILITY_KEYS',
    ]);
  });

  it('does not modify the SM-06 bundle contract', () => {
    const bundleSource = readFileSync(join(PROTOCOL_SRC, 'portability', 'bundle.ts'), 'utf8');
    // The six-field invariant, asserted from the contract itself.
    expect(bundleSource).toContain(
      "['schemaVersion', 'canonicalizationProfile', 'subject', 'manifests', 'claims', 'standings']",
    );
    for (const field of [
      'readonly interop',
      'readonly profile',
      'readonly semanticProfile',
      'readonly supportedCapabilities',
      'readonly compatibility',
      'readonly mediaType',
      'readonly descriptor',
    ]) {
      expect(bundleSource).not.toContain(field);
    }

    const bundle = buildSovereigntyPortabilityBundleV1({
      subject: { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) },
    });
    expect(Object.keys(bundle).sort()).toEqual([
      'canonicalizationProfile',
      'claims',
      'manifests',
      'schemaVersion',
      'standings',
      'subject',
    ]);
  });
});

describe('SM-07 / the subject model stays open-world (OPEN-WORLD TESTS)', () => {
  const ISSUER = 'principal:sm07-open-world';
  const AT = '2026-04-01T09:00:00.000Z';

  const describeSubjectFrom = (namespace: string, externalId: string, locator: string) => {
    const id: SovereignAssetId = parseSovereignAssetId(mintSovereignAssetId());
    const subject: SovereignSubjectRef = {
      sovereignAssetId: id,
      externalReference: buildSovereignExternalReference({ namespace, id: externalId, locator }),
    };
    const origin = buildOriginClaim({
      id: 'claim:origin:1',
      sovereignAssetId: id,
      issuer: ISSUER,
      assertedOrigin: 'asserted-origin',
      assertedAt: AT,
    });
    const derivation = buildDerivationClaim({
      id: 'claim:derivation:1',
      sovereignAssetId: id,
      issuer: ISSUER,
      sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
      relation: 'DerivedFrom',
      issuedAt: AT,
    });

    return buildSovereigntyInteroperabilityDescriptorV1(
      buildSovereigntyPortabilityBundleV1({
        subject,
        manifests: [
          { kind: 'manifest', manifest: buildSovereignManifestV1({ sovereignAssetId: id, registrant: ISSUER }) },
        ],
        claims: [
          { kind: 'claim', claim: origin },
          { kind: 'claim', claim: derivation },
        ],
        standings: [
          { id: 'standing:1', claimRef: origin.id, status: StandingStatus.Contested, effectiveAt: AT },
        ],
      }),
    );
  };

  const SUBJECTS = [
    ['a system nobody has heard of', 'alien-system-v47', 'alien-resource-92817', 'future://p1/object/92817'],
    ['a physical property', 'land-registry-uk', 'TITLE-NGL-889321', 'registry://hmlr/title/NGL-889321'],
    ['an external token', 'external-token-system', 'collection-7/item-4412', 'chainless://tokens/7/4412'],
    ['an autonomous agent', 'agent-fabric', 'agent-instance-2291', 'fabric://agents/2291'],
    ['an API resource', 'partner-api', 'v3/resources/8812', 'https://example.invalid/v3/resources/8812'],
  ] as const;

  it.each(SUBJECTS)('describes %s through exactly the same architecture', (_label, namespace, externalId, locator) => {
    const descriptor = describeSubjectFrom(namespace, externalId, locator);

    // Same profile, same schemas, same feature architecture. Only the subject
    // data differs — there is no per-domain branch anywhere.
    expect(descriptor.profile).toEqual({
      id: 'aoc:interoperability-profile:sovereignty-portability',
      version: '1.0.0',
    });
    expect(descriptor.schemaVersion).toBe('aoc-sovereignty-interoperability-descriptor/1');
    expect(descriptor.mediaType).toBe('application/vnd.aoc.sovereignty-portability+json');
    expect([...descriptor.present.claimTypes]).toEqual(['Derivation', 'Origin']);
    expect([...descriptor.present.standingStatuses]).toEqual(['Contested']);
    expect(descriptor.subject.externalReference?.namespace).toBe(namespace);
    // The locator travels verbatim and is never dereferenced.
    expect(descriptor.subject.externalReference?.locator).toBe(locator);
  });

  it('produces structurally identical descriptors and reports for every subject kind', () => {
    const shapes = SUBJECTS.map(([, namespace, externalId, locator]) => {
      const descriptor = describeSubjectFrom(namespace, externalId, locator);
      const support = buildSovereigntyInteroperabilityConsumerSupportV1({
        profile: { id: descriptor.profile.id, acceptedVersions: [descriptor.profile.version] },
        mediaTypes: [descriptor.mediaType],
        representationSchemaVersions: [descriptor.representation.schemaVersion],
        canonicalizationProfiles: [descriptor.representation.canonicalizationProfile],
        artifactKinds: [...SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
        claimTypes: ['Origin'],
        standingStatuses: [...INTEROPERABLE_STANDING_STATUSES],
      });
      return canonicalizeJSON(assessSovereigntyInteroperabilityCompatibility(descriptor, support));
    });

    // Byte-identical reports: the compatibility answer depends on the declared
    // semantics, never on what kind of thing the subject is.
    expect(new Set(shapes).size).toBe(1);
    expect(shapes[0]).toContain('partially-compatible');
    expect(shapes[0]).toContain('Derivation');
  });

  it('branches on no subject namespace, asset type or business domain', () => {
    for (const domain of [
      "'file'", "'image'", "'music'", "'video'", "'document'", "'property'", "'nft'", "'agent'",
      'alien-system', 'property-registry', 'external-token-system', 'land-registry',
    ]) {
      expect(INTEROPERABILITY_SOURCE).not.toContain(domain);
    }
    expect(INTEROPERABILITY_SOURCE).not.toContain('namespace ===');
    expect(INTEROPERABILITY_SOURCE).not.toContain('.startsWith(');
    expect(INTEROPERABILITY_SOURCE).not.toContain('assetType');
    // The only `switch` a describing layer could need would be a domain branch.
    expect(INTEROPERABILITY_SOURCE).not.toMatch(/\bswitch\s*\(/);
  });

  it('reuses the one canonicalizer and defines no second serialization', () => {
    expectAbsent(['stableStringify', 'json-stable-stringify', 'canonicalize(', 'cbor', 'msgpack', 'protobuf']);
    const descriptor = describeSubjectFrom('alien-system-v47', 'a-1', 'future://p1/a-1');
    expect(canonicalizeJSON(JSON.parse(canonicalizeJSON(descriptor)))).toBe(canonicalizeJSON(descriptor));
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
    ]);
  });
});
