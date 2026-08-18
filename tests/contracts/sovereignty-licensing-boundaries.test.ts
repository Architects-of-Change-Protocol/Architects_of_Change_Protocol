import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
import {
  AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS,
  SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION,
} from '@aoc/protocol/interoperability';
import { SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION } from '@aoc/protocol/portability';
import {
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  LICENSING_TERMS_REASON_CODES,
} from '@aoc/protocol/licensing';
import {
  LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS,
  SOVEREIGNTY_CAPABILITIES,
  SOVEREIGNTY_CAPABILITY_KEYS,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-09 boundary proofs.
 *
 * Licensing & Terms is defined as much by what it refuses to do as by what it
 * does, and several of those refusals are only checkable by reading the
 * production source: a capsule that quietly evaluated a rule, emitted an
 * allow/deny verdict, issued a grant, signed a claim, calculated a royalty,
 * enforced a restriction or resolved a "current" licence would still pass many
 * behavioural tests while having absorbed a contract that is not its own.
 */

const PROTOCOL_SRC = join(__dirname, '..', '..', 'packages', 'protocol', 'src');
const LICENSING_DIR = join(PROTOCOL_SRC, 'licensing');
const CAPSULE_PATH = join(PROTOCOL_SRC, 'sovereignty-capabilities', 'capsules', 'licensing-terms.ts');

/**
 * Prose that names a primitive in order to explain why it is deliberately NOT
 * called must not be mistaken for a call to it, so comments are stripped before
 * scanning — the same technique the SM-04 … SM-08 suites use.
 *
 * SM-09 additionally strips *long* string literals. The licensing vocabulary's
 * public term descriptions are prose that deliberately says "grants no
 * capability, token, credential or access" and "computes no royalty", which is
 * exactly the boundary being asserted — and it must not read as evidence of the
 * behaviour it disclaims. Only literals over 40 characters go, so short
 * value-carrying literals like `'ALLOW'` and `'royaltyRate'` are still scanned.
 */
const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/'(?:[^'\\\n]|\\.){40,}'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.){40,}"/g, '""');

const licensingFiles = (): readonly { file: string; source: string }[] => [
  ...readdirSync(LICENSING_DIR)
    .filter((entry) => entry.endsWith('.ts'))
    .map((entry) => ({ file: `licensing/${entry}`, source: stripComments(readFileSync(join(LICENSING_DIR, entry), 'utf8')) })),
  { file: 'capsules/licensing-terms.ts', source: stripComments(readFileSync(CAPSULE_PATH, 'utf8')) },
];

const expectAbsent = (needles: readonly string[]): void => {
  for (const { file, source } of licensingFiles()) {
    for (const needle of needles) {
      expect({ file, needle, present: source.includes(needle) })
        .toEqual({ file, needle, present: false });
    }
  }
};

describe('SM-09 / enforcement boundary (REQUIRED TESTS)', () => {
  it('no evaluation or decision function exists anywhere in the licensing source', () => {
    expectAbsent([
      'isAllowed', 'isDenied', 'isPermitted', 'isRestricted', 'canUse', 'canDistribute',
      'canDerive', 'canAccess', 'authorize', 'authorise', 'enforce', 'evaluate',
      'checkObligation', 'evaluateLicense', 'evaluateTerms', 'permits(', 'denies(',
    ]);
  });

  it('no allow/deny verdict vocabulary exists', () => {
    expectAbsent(["'ALLOW'", "'DENY'", "'APPROVE'", "'REJECT'", "'GRANT'", "'BLOCK'", "'PERMIT'"]);
  });

  it('no grant, credential, token or ACL is issued', () => {
    expectAbsent([
      'CapabilityGrant', 'CapabilityToken', 'AccessGrant', 'AccessToken', 'signedUrl',
      'signedURL', 'apiKey', 'credential', 'Credential', 'ACL', 'accessControl',
    ]);
  });

  it('no condition DSL or policy/rule engine is present', () => {
    expectAbsent([
      'CEL', 'Rego', 'Cedar', 'JsonLogic', 'jsonLogic', 'XACML', 'ODRL', 'RightsML', 'SPDX',
      'CreativeCommons', 'policyEngine', 'ruleEngine', 'expression', 'operator',
      'greaterThan', 'lessThan', 'evaluateCondition',
    ]);
  });

  it('no economic model, royalty engine or settlement path exists', () => {
    expectAbsent([
      'royalt', 'Royalt', 'calculateRoyalty', 'settleRoyalty', 'accrueRoyalty', 'splitRevenue',
      'revenueShare', 'invoice', 'meterUsage', 'settlement', 'Settlement', 'paymentSchedule',
      'currency', 'walletAddress', 'billing', 'Billing', 'taxRate',
    ]);
  });

  it('no DRM, enforcement or content-control mechanism exists', () => {
    expectAbsent([
      'watermark', 'Watermark', 'encrypt', 'decrypt', 'killSwitch', 'remoteDisable',
      'playbackControl', 'copyPrevention', 'revokeUrl', 'disablePlayback',
    ]);
  });

  it('no ownership or title conclusion exists', () => {
    expectAbsent([
      'legalOwner', 'copyrightOwner', 'titleHolder', 'beneficialOwner', 'ownershipTransfer',
      'transferOwnership', 'assignTitle', 'conveyTitle', 'changeOwner', 'legallyValid',
      'enforceable', 'jurisdictionOf', 'choiceOfLaw',
    ]);
  });

  it('no precedence or current-terms resolution exists', () => {
    expectAbsent([
      'precedence', 'latestWins', 'resolveCurrentTerms', 'currentTerms', 'winningRule',
      'supersede', 'Supersede', 'overrides(', 'takesPrecedence',
    ]);
  });

  it('no wall-clock effectiveness evaluation exists', () => {
    expectAbsent([
      'isActive', 'isCurrentlyEffective', 'isExpiredNow', 'isNotYetEffective', 'Date.now',
      'new Date()', 'isInForce',
    ]);
    // The capsule reads time only through the injectable SM-03 clock.
    const capsule = licensingFiles().find((entry) => entry.file === 'capsules/licensing-terms.ts');
    expect(capsule?.source).toContain('SovereigntyCapabilityClock');
  });

  it('no StandingStatus other than Contested is ever produced', () => {
    expectAbsent([
      'StandingStatus.Active', 'StandingStatus.Expired', 'StandingStatus.Revoked',
      'StandingStatus.Superseded', 'StandingStatus.NotYetActive', 'StandingStatus.Invalid',
    ]);
    // `contestClaim` is the one standing primitive reached, and it is reused
    // rather than reimplemented.
    const capsule = licensingFiles().find((entry) => entry.file === 'capsules/licensing-terms.ts');
    expect(capsule?.source).toContain('contestClaim');
    expect(capsule?.source).not.toContain('StandingStatus.Contested');
  });
});

describe('SM-09 / cryptography and identity boundaries', () => {
  it('nothing signs, and no private key field exists in any spelling', () => {
    expectAbsent([
      'signClaim', 'signSovereignManifest', 'signSovereignPayload', 'generateSovereignKeyPair',
      'privateKey', 'privateKeyPem', 'secretKey', 'mnemonic', 'seedPhrase', 'kmsKey',
      'KMS', 'signingKey', 'SovereignProof', 'createSign',
    ]);
  });

  it('nothing verifies a signature — that is AOC.VERIFIABILITY\'s contract', () => {
    expectAbsent([
      'verifySignedClaim', 'verifySovereignManifest', 'verifySovereignSignature',
      'verifySignedSovereignClaim', 'createVerify', 'createHash',
    ]);
  });

  it('no identity is minted and no content is required', () => {
    expectAbsent([
      'mintSovereignAssetId', 'computeContentIdentity', 'computeManifestDigest',
      'ContentIdentity', 'contentBytes', 'manifestDigest', 'randomUUID',
    ]);
  });

  it('no provenance claim is created', () => {
    expectAbsent([
      'buildOriginClaim', 'buildDerivationClaim', 'OriginClaim', 'DerivationClaim',
      'sourceSovereignAssetIds', 'traceSovereignLineage',
    ]);
  });

  it('no terms inheritance or propagation exists', () => {
    expectAbsent([
      'inheritLicense', 'inheritTerms', 'copyTerms', 'propagateRestrictions',
      'propagateRights', 'propagateTerms', 'parentTerms', 'childTerms',
    ]);
  });
});

describe('SM-09 / dependency and reach boundaries', () => {
  it('no Enterprise, runtime, provider, vertical or legacy dependency is introduced', () => {
    expectAbsent([
      '@aoc/enterprise', '@aoc/asset-protocolization', 'pmfreak', '@aoc-runtime/',
      'provider', 'protocol/enforcement', 'protocol/execution', '../../runtime',
      '../../storage', '../../consent', '../../content',
    ]);
  });

  it('no filesystem, network, database, chain or resolver is reachable', () => {
    expectAbsent([
      'node:fs', 'node:http', 'node:https', 'node:net', 'node:dns', 'fetch(', 'XMLHttpRequest',
      'axios', 'require(', 'blockchain', 'ethers', 'web3', 'contractAddress', 'tokenURI',
      'database', 'prisma', 'sql', 'resolveTerm', 'dereference', 'lookupMembers',
    ]);
  });

  it('no capsule invokes another mineral', () => {
    expectAbsent(['invokeSovereigntyCapability', 'createIdentitySovereignty', 'createPortabilitySovereignty']);
  });

  it('no global registry or mutable module state is introduced', () => {
    expectAbsent(['globalThis', 'registerImplementation', 'getCapabilityImplementation', 'let cached']);
  });

  it('the licensing source imports only Protocol-internal contract modules', () => {
    const allowed =
      /^(\.\.\/claims\/(primitives|references|standing|timestamps|vocabulary)|\.\.\/identity(\/sovereign-asset-id)?|\.\.\/manifest(\/claims)?|\.\.\/\.\.\/(claims\/(primitives|standing|timestamps)|identity|licensing|manifest)|\.\.\/(capability-ref|implementation|invocation|time)|\.\/(canonical-ref|claim|reason-codes|terms|validation|vocabulary))$/;
    for (const { file, source } of licensingFiles()) {
      const specifiers = [...source.matchAll(/(?:import|export)[^'"]*from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const specifier of specifiers) {
        expect({ file, specifier, allowed: allowed.test(specifier) })
          .toEqual({ file, specifier, allowed: true });
      }
    }
  });
});

describe('SM-09 / claim-model boundaries', () => {
  it('no ClaimType.License was added and no parallel claim hierarchy exists', () => {
    expect(Object.values(ClaimType)).not.toContain('License');
    expectAbsent([
      'ClaimType.License', 'ClaimType.Authorization', 'LicenseClaimBase', 'TermsClaimBase',
      'PermissionClaimBase', 'RestrictionClaimBase', 'CanonicalLicenseClaim',
    ]);
  });

  it('the licensing claim reuses the existing AuthorityClaim builder', () => {
    const claim = licensingFiles().find((entry) => entry.file === 'licensing/claim.ts');
    expect(claim?.source).toContain('buildAuthorityClaim');
    expect(claim?.source).toContain('validateAuthorityClaim');
    expect(claim?.source).toContain('AuthorityClaimKind.License');
  });

  it('no second semantic framework is introduced', () => {
    expectAbsent(['LicenseTerm ', 'LicensingVocabulary', 'interface LicenseSemantic', 'JSON-LD', '@context']);
    const vocabulary = licensingFiles().find((entry) => entry.file === 'licensing/vocabulary.ts');
    expect(vocabulary?.source).toContain('CanonicalSemanticTerm');
    expect(vocabulary?.source).toContain('CanonicalSemanticCategory');
    expect(vocabulary?.source).toContain('CanonicalSemanticVocabulary');
  });
});

describe('SM-09 / canonical inventory and unchanged neighbours', () => {
  it('exactly eight canonical minerals remain, and no ninth appears', () => {
    expect(SOVEREIGNTY_CAPABILITIES).toHaveLength(8);
    expect(listSovereigntyCapabilities()).toHaveLength(8);
    expect([...SOVEREIGNTY_CAPABILITY_KEYS]).toEqual([
      'identity', 'integrity', 'provenance', 'portability',
      'interoperability', 'verifiability', 'licensing_terms', 'governance_compatibility',
    ]);
    for (const forbidden of ['license', 'rights', 'permission', 'restrictions', 'royalties', 'drm']) {
      expect(SOVEREIGNTY_CAPABILITY_KEYS as readonly string[]).not.toContain(forbidden);
    }
  });

  it('the licensing capability version is unchanged at 1.0.0', () => {
    const licensing = SOVEREIGNTY_CAPABILITIES.find((entry) => entry.key === 'licensing_terms');
    expect(licensing?.version).toBe('1.0.0');
    expect(licensing?.id).toBe('aoc:sovereignty-capability:licensing-terms');
    // Every capability still carries the same contract version.
    expect(new Set(SOVEREIGNTY_CAPABILITIES.map((entry) => entry.version))).toEqual(new Set(['1.0.0']));
  });

  it('Governance Compatibility remains the only mineral with no production capsule', () => {
    // SM-10 owns it; nothing here anticipates a governance handoff.
    expectAbsent([
      'SovereignGovernanceHandoff', 'governanceHandoff', 'ResourceRef', 'governanceReady',
      'GOVERNANCE_COMPATIBILITY', 'policyHandoff',
    ]);
  });

  it('the SM-07 core vocabulary and profile are untouched by SM-09', () => {
    expect(AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY.namespace).toBe('aoc.sovereignty');
    expect(AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY.namespace).not.toBe(AOC_LICENSING_SEMANTIC_NAMESPACE);
    const coreTermIds = AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY.categories
      .flatMap((category) => [...category.termRefs]);
    expect(coreTermIds.some((id) => id.startsWith('aoc.licensing'))).toBe(false);
    expect([...coreTermIds].sort()).toEqual([...Object.values(AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS)].sort());
    expect(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1.version).toBe('1.0.0');
  });

  it('the SM-06 bundle and SM-07 descriptor schema versions are unchanged', () => {
    expect(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION).toBe('aoc-sovereignty-portability-bundle/1');
    expect(SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION)
      .toBe('aoc-sovereignty-interoperability-descriptor/1');
  });
});

describe('SM-09 / operation and reason-code surface', () => {
  it('exposes exactly the three declared operations', () => {
    expect([...LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS]).toEqual([
      'declare-license-terms', 'validate-license-terms', 'contest-license-terms-claim',
    ]);
  });

  it('every reason code is stable, prefixed and screaming snake case', () => {
    for (const code of Object.values(LICENSING_TERMS_REASON_CODES)) {
      expect(code).toMatch(/^LICENSING_TERMS_[A-Z0-9_]+$/);
    }
    expect(new Set(Object.values(LICENSING_TERMS_REASON_CODES)).size)
      .toBe(Object.values(LICENSING_TERMS_REASON_CODES).length);
    expect(Object.isFrozen(LICENSING_TERMS_REASON_CODES)).toBe(true);
  });

  it('the reason-code set covers the documented SM-09 vocabulary', () => {
    const codes = new Set<string>(Object.values(LICENSING_TERMS_REASON_CODES));
    for (const required of [
      'LICENSING_TERMS_SUBJECT_REQUIRED', 'LICENSING_TERMS_INVALID_INPUT',
      'LICENSING_TERMS_UNSUPPORTED_OPERATION', 'LICENSING_TERMS_INVALID_CLAIM_ID',
      'LICENSING_TERMS_INVALID_ISSUER', 'LICENSING_TERMS_INVALID_STATEMENT',
      'LICENSING_TERMS_INVALID_AUDIENCE', 'LICENSING_TERMS_RULES_REQUIRED',
      'LICENSING_TERMS_INVALID_RULE', 'LICENSING_TERMS_DUPLICATE_RULE_ID',
      'LICENSING_TERMS_INVALID_RULE_EFFECT', 'LICENSING_TERMS_INVALID_ACTION_REF',
      'LICENSING_TERMS_UNKNOWN_AOC_ACTION', 'LICENSING_TERMS_INVALID_TIMESTAMP',
      'LICENSING_TERMS_INVALID_EVIDENCE_REFS', 'LICENSING_TERMS_INVALID_CLAIM',
      'LICENSING_TERMS_UNSUPPORTED_SCHEMA', 'LICENSING_TERMS_CLAIM_SUBJECT_MISMATCH',
      'LICENSING_TERMS_INVALID_CONTESTATION_REASON',
    ]) {
      expect(codes.has(required)).toBe(true);
    }
  });

  it('StandingStatus.Contested is the one standing outcome licensing can reach', () => {
    expect(StandingStatus.Contested).toBe('Contested');
  });
});
