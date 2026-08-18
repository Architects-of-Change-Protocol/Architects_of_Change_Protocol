import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION } from '@aoc/protocol/portability';
import { SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION } from '@aoc/protocol/interoperability';
import {
  SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES,
  SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION,
  SOVEREIGN_GOVERNED_RESOURCE_KIND,
} from '@aoc/protocol/governance-compatibility';
import {
  GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  SOVEREIGNTY_CAPABILITIES,
  SOVEREIGNTY_CAPABILITY_KEYS,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-10 boundary proofs.
 *
 * Governance Compatibility is defined almost entirely by what it refuses to do,
 * and most of those refusals are only checkable by reading the production
 * source: a capsule that quietly evaluated a policy, emitted an allow/deny,
 * constructed an authority, issued a grant, derived a scope from a declared
 * permission, resolved contradictory terms or verified a signature would still
 * pass many behavioural tests while having stepped across the one boundary this
 * mineral exists to draw.
 */

const PROTOCOL_SRC = join(__dirname, '..', '..', 'packages', 'protocol', 'src');
const GOVERNANCE_DIR = join(PROTOCOL_SRC, 'governance-compatibility');
const CAPSULE_PATH = join(PROTOCOL_SRC, 'sovereignty-capabilities', 'capsules', 'governance-compatibility.ts');

/**
 * Prose that names a primitive in order to explain why it is deliberately NOT
 * called must not be mistaken for a call to it, so comments are stripped before
 * scanning — the same technique the SM-04 … SM-09 suites use. Long string
 * literals go too, for the same reason: an error message that spells out what a
 * malformed handoff is must not read as evidence of the behaviour it refuses.
 */
const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/'(?:[^'\\\n]|\\.){40,}'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.){40,}"/g, '""')
    .replace(/`(?:[^`\\]|\\.){40,}`/g, '``');

const governanceSources = (): readonly { file: string; source: string }[] => [
  ...readdirSync(GOVERNANCE_DIR)
    .filter((entry) => entry.endsWith('.ts'))
    .map((entry) => ({
      file: `governance-compatibility/${entry}`,
      source: stripComments(readFileSync(join(GOVERNANCE_DIR, entry), 'utf8')),
    })),
  {
    file: 'sovereignty-capabilities/capsules/governance-compatibility.ts',
    source: stripComments(readFileSync(CAPSULE_PATH, 'utf8')),
  },
];

const expectAbsent = (terms: readonly string[]): void => {
  for (const { file, source } of governanceSources()) {
    for (const term of terms) {
      expect({ file, term, present: source.includes(term) }).toEqual({ file, term, present: false });
    }
  }
};

describe('SM-10 / Governance Compatibility never becomes governance (BOUNDARY TESTS 1-9)', () => {
  it('BOUNDARY TESTS 1-2 — no PolicyDecision and no ScopedAccessRequest is constructed', () => {
    expectAbsent(['PolicyDecision', 'ScopedAccessRequest', 'requestedScope', 'principalId', 'requestedAt']);
  });

  it('BOUNDARY TESTS 3-6 — no token, grant, consent or delegation is constructed', () => {
    expectAbsent([
      'CapabilityToken',
      'CapabilityGrant',
      'ConsentGrant',
      'Delegation',
      'grantId',
      'grantor',
      'grantee',
      'legalBasis',
      'chainDepth',
      'allowedReDelegation',
      'bearer',
      'notBefore',
      'revocationRefs',
    ]);
  });

  it('BOUNDARY TESTS 7-9 — no CanonicalCapability, CanonicalAuthority or CanonicalDecision is constructed', () => {
    expectAbsent([
      'CanonicalCapability',
      'CanonicalAuthority',
      'CanonicalDecision',
      'capabilityRefs',
      'authorityRef',
      'decisionMaker',
      'decisionDate',
    ]);
  });
});

describe('SM-10 / no ownership or authority is ever inferred (BOUNDARY TESTS 10-15)', () => {
  it('BOUNDARY TESTS 10-13 — no owner is produced, and none is derived from a registrant or issuer', () => {
    expectAbsent([
      'ownerActorId',
      'ownerOrganizationId',
      'owner',
      'legalOwner',
      'titleHolder',
      'registeredOwner',
      'rightsHolder',
      'registrant',
      'issuer',
    ]);
  });

  it('BOUNDARY TESTS 14-15 — no authority is derived from an issuer or from a valid signature', () => {
    expectAbsent([
      'authority',
      'Authority',
      'authorize',
      'authorized',
      'signature',
      'verifySignedClaim',
      'verifySovereignManifest',
      'verifySovereignSignature',
      'signClaim',
      'signSovereignPayload',
    ]);
  });
});

describe('SM-10 / declared terms never become executable policy (BOUNDARY TESTS 16-23)', () => {
  it('BOUNDARY TESTS 16-18 — no Permission becomes a grant, no Restriction a deny, no Obligation a status', () => {
    expectAbsent([
      'Permission',
      'Restriction',
      'Obligation',
      'fulfilled',
      'violated',
      'waived',
      'pendingApproval',
      'compliance',
    ]);
  });

  it('BOUNDARY TESTS 19-21 — no policy evaluation, and no allow or deny is ever emitted', () => {
    expectAbsent([
      'evaluatePolicy',
      'PolicyEvaluationInput',
      'ScopedPermission',
      "'allow'",
      "'deny'",
      "'conditional'",
      'allowList',
      'denyList',
      'precedence',
      'resolvedTerms',
      'Rego',
      'Cedar',
      'XACML',
      'jsonLogic',
    ]);
  });

  it('BOUNDARY TESTS 22-23 — no approval workflow and no enforcement', () => {
    expectAbsent([
      'approver',
      'reviewer',
      'approvalState',
      'approvedBy',
      'rejectedBy',
      'escalation',
      'enforce',
      'signedUrl',
      'ACL',
      'apiKey',
      'credential',
      'revoke',
    ]);
  });

  it('no readiness or completeness claim exists anywhere in the surface', () => {
    expectAbsent([
      'governanceReady',
      'readyForPolicy',
      'readyForDecision',
      'isComplete',
      'governanceComplete',
      'allEvidencePresent',
      'completeRecord',
      'completeSovereignty',
      'sufficientForGovernance',
    ]);
  });

  it('no reason code names a governance outcome', () => {
    for (const code of Object.values(SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES)) {
      expect(code).toMatch(/^GOVERNANCE_COMPATIBILITY_[A-Z_]+$/);
      for (const forbidden of [
        'ACCESS_DENIED',
        'ACCESS_ALLOWED',
        'POLICY_FAILED',
        'AUTHORITY_MISSING',
        'APPROVAL_REQUIRED',
        'LICENSE_FORBIDS',
        'GRANT_REQUIRED',
      ]) {
        expect(code).not.toContain(forbidden);
      }
    }
  });
});

describe('SM-10 / no other mineral is executed (MINERAL TESTS 1-10)', () => {
  it('MINERAL TESTS 1-7, 10 — no capsule of any other mineral is constructed or invoked', () => {
    expectAbsent([
      'invokeSovereigntyCapability',
      'createIdentitySovereigntyCapabilityImplementation',
      'createIntegritySovereigntyCapabilityImplementation',
      'createProvenanceSovereigntyCapabilityImplementation',
      'createPortabilitySovereigntyCapabilityImplementation',
      'createInteroperabilitySovereigntyCapabilityImplementation',
      'createVerifiabilitySovereigntyCapabilityImplementation',
      'createLicensingTermsSovereigntyCapabilityImplementation',
      'buildSovereigntyCapabilityInvocation',
    ]);
  });

  it('MINERAL TEST 8 — the real SM-06 bundle validator is reused, not reimplemented', () => {
    const sources = governanceSources();
    const usesValidator = sources.some(({ source }) =>
      source.includes('validateSovereigntyPortabilityBundleV1'),
    );
    expect(usesValidator).toBe(true);
    // No second copy of the bundle rules: nothing here reasons about artifact
    // kinds, manifest versions, claim ids or dangling standing refs.
    expectAbsent([
      'danglingStandingClaimRef',
      'duplicateManifestVersion',
      'duplicateClaimId',
      'portableManifestOf',
      'portableClaimOf',
    ]);
  });

  it('MINERAL TEST 9 — the real SM-07 descriptor helper is reused, and no second scanner exists', () => {
    const sources = governanceSources();
    expect(
      sources.some(({ source }) => source.includes('tryBuildSovereigntyInteroperabilityDescriptorV1')),
    ).toBe(true);
    expect(
      sources.some(({ source }) => source.includes('validateSovereigntyInteroperabilityDescriptorV1')),
    ).toBe(true);
    // A second semantic scanner would have to read these.
    expectAbsent([
      'semanticRefs',
      'collectInteroperabilitySemanticRequirements',
      'claimTypes',
      'standingStatuses',
      'manifestArtifactKinds',
    ]);
  });

  it('no consumer-support assessment is duplicated from SM-07', () => {
    expectAbsent([
      'assessSovereigntyInteroperabilityCompatibility',
      'consumerSupport',
      'partially-compatible',
      'incompatible',
    ]);
  });

  it('no identity minting, content hashing, provenance or licensing creation happens here', () => {
    expectAbsent([
      'mintSovereignAssetId',
      'computeContentIdentity',
      'computeManifestDigest',
      'ContentIdentity',
      'buildSovereignManifestV1',
      'buildOriginClaim',
      'buildDerivationClaim',
      'buildLicenseTermsClaim',
      'contestClaim',
    ]);
  });
});

describe('SM-10 / purity (PURITY TESTS 1-12)', () => {
  it('PURITY TESTS 1-3 — no Enterprise, Asset Protocolization or legacy policy runtime import', () => {
    for (const { file, source } of governanceSources()) {
      const specifiers = [...source.matchAll(/(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/g)].map(
        (match) => match[1],
      );
      for (const specifier of specifiers) {
        for (const forbidden of [
          '@aoc/enterprise',
          '@aoc/asset-protocolization',
          '@aoc/scoped-access',
          '@aoc/capability-tokens',
          '@aoc/consent-engine',
          'pmfreak',
          '@aoc-runtime/',
          'protocol/policy',
          'protocol/enforcement',
          'protocol/execution',
          'runtime/policy',
        ]) {
          expect({ file, specifier, forbidden, hit: specifier.includes(forbidden) }).toEqual({
            file,
            specifier,
            forbidden,
            hit: false,
          });
        }
      }
    }
  });

  it('the surface imports only Protocol-internal contract modules', () => {
    const allowed =
      /^(\.\.\/(canonical|contracts|identity|interoperability|portability)|\.\/(builder|handoff|reason-codes|resource|validation)|\.\.\/\.\.\/(contracts|governance-compatibility|portability)|\.\.\/(capability-ref|implementation|invocation)|\.\/canonical-ref)$/;
    for (const { file, source } of governanceSources()) {
      const specifiers = [...source.matchAll(/(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/g)].map(
        (match) => match[1],
      );
      for (const specifier of specifiers) {
        expect({ file, specifier, allowed: allowed.test(specifier) }).toEqual({
          file,
          specifier,
          allowed: true,
        });
      }
    }
  });

  it('PURITY TESTS 4-8 — no network, filesystem, database, blockchain or provider SDK', () => {
    expectAbsent([
      'fetch(',
      'axios',
      'XMLHttpRequest',
      'WebSocket',
      'http',
      'node:fs',
      'readFileSync',
      'writeFileSync',
      'supabase',
      'postgres',
      'sqlite',
      'redis',
      'prisma',
      'ethers',
      'web3',
      'contractAddress',
      'tokenId',
      'S3Client',
      'storageProvider',
      'getSignedUrl',
    ]);
  });

  it('PURITY TEST 9 — the package still declares no runtime dependency', () => {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, '..', '..', 'packages', 'protocol', 'package.json'), 'utf8'),
    ) as { dependencies?: Record<string, string>; exports: Record<string, unknown> };
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(Object.keys(pkg.exports)).toContain('./governance-compatibility');
  });

  it('PURITY TESTS 10-12 — no import-time side effect, no randomness and no clock', () => {
    expectAbsent([
      'randomUUID',
      'Math.random',
      'crypto.',
      'Date.now',
      'new Date',
      'toISOString',
      'setTimeout',
      'setInterval',
      'process.env',
      'globalThis',
      'registerImplementation',
      'GovernanceEngineRegistry',
      'HandoffRegistry',
      'PolicyRegistry',
      'AuthorityRegistry',
    ]);
    // Nothing at module scope executes: every top-level statement is an import,
    // an export, a type/interface, or a `const` bound to a literal, a frozen
    // literal or a function.
    for (const { file, source } of governanceSources()) {
      const topLevel = source
        .split('\n')
        .filter((line) => line.length > 0 && !/^[\s})\];]/.test(line))
        .filter((line) => !/^(import|export|const|function|interface|type|declare|\/)/.test(line.trim()));
      expect({ file, topLevel }).toEqual({ file, topLevel: [] });
    }
  });

  it('nothing is persisted: the handoff is returned, never stored', () => {
    expectAbsent(['save', 'persist', 'store(', 'cache', 'insert', 'upsert']);
  });
});

describe('SM-10 / the canonical inventory stays exactly eight', () => {
  it('there are exactly eight canonical minerals, and Governance Compatibility is the eighth', () => {
    expect(SOVEREIGNTY_CAPABILITIES).toHaveLength(8);
    expect(listSovereigntyCapabilities()).toHaveLength(8);
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
    expect(SOVEREIGNTY_CAPABILITIES[7].key).toBe('governance_compatibility');
    expect(SOVEREIGNTY_CAPABILITIES[7].version).toBe('1.0.0');
  });

  it('no ninth mineral was added for policy, authority, grants, access or enforcement', () => {
    const keys = SOVEREIGNTY_CAPABILITIES.map((capability) => capability.key as string);
    for (const forbidden of [
      'governance',
      'policy',
      'authority',
      'grant',
      'access',
      'enforcement',
      'decision',
      'resource',
    ]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('the wire contracts SM-10 wraps are unchanged', () => {
    expect(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION).toBe('aoc-sovereignty-portability-bundle/1');
    expect(SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION).toBe(
      'aoc-sovereignty-interoperability-descriptor/1',
    );
    expect(SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION).toBe('aoc-sovereign-governance-handoff/1');
    expect(SOVEREIGN_GOVERNED_RESOURCE_KIND).toBe('aoc:sovereign-asset');
    expect([...GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS]).toHaveLength(2);
  });
});
