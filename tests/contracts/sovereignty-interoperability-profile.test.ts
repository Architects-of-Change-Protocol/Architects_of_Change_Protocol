import { canonicalizeJSON, CANONICAL_JSON_PROFILE } from '@aoc/protocol/canonical';
import { ClaimType, StandingStatus } from '@aoc/protocol/claims';
import type {
  CanonicalSemanticCategory,
  CanonicalSemanticTerm,
  CanonicalSemanticVocabulary,
} from '@aoc/protocol/claims';
import {
  PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
  PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
} from '@aoc/protocol/portability';
import {
  AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION,
  AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
  AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES,
  AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS,
  AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE,
  AOC_SOVEREIGNTY_SEMANTIC_TERMS,
  AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS,
  INTEROPERABLE_CLAIM_TYPES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION,
  getAocSovereigntySemanticTerm,
  isValidSovereigntyInteroperabilityProfileRef,
  isValidSovereigntyInteroperabilityProfileV1,
} from '@aoc/protocol/interoperability';

const PROFILE = AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1;

/**
 * SM-07 / the canonical interoperability profile.
 *
 * The profile is the principal machine-readable output of this work package:
 * the document by which an AOC representation tells another system what family
 * of semantics it belongs to. Every constant it publishes is a wire contract,
 * so each is asserted exactly rather than by shape.
 */
describe('SM-07 / canonical interoperability profile identity (PROFILE TESTS 1-6)', () => {
  it('PROFILE TEST 1 — carries the exact profile schema version', () => {
    expect(SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION).toBe(
      'aoc-sovereignty-interoperability-profile/1',
    );
    expect(PROFILE.schemaVersion).toBe('aoc-sovereignty-interoperability-profile/1');
  });

  it('PROFILE TEST 2 — carries the exact, stable profile id', () => {
    expect(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID).toBe(
      'aoc:interoperability-profile:sovereignty-portability',
    );
    expect(PROFILE.id).toBe('aoc:interoperability-profile:sovereignty-portability');
  });

  it('PROFILE TEST 3 — carries the exact profile version, which is not the package version', () => {
    expect(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION).toBe('1.0.0');
    expect(PROFILE.version).toBe('1.0.0');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageVersion = require('../../packages/protocol/package.json').version;
    // They are equal by coincidence at 0.1.0? No — they must be independent
    // values, and today they are visibly different.
    expect(PROFILE.version).not.toBe(packageVersion);
  });

  it('PROFILE TEST 4 — carries the exact media type, claiming no IANA registration', () => {
    expect(AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE).toBe(
      'application/vnd.aoc.sovereignty-portability+json',
    );
    expect(PROFILE.mediaType).toBe('application/vnd.aoc.sovereignty-portability+json');
    // A vendor tree (`vnd.`) subtype is exactly what an unregistered,
    // organisation-owned media type looks like.
    expect(PROFILE.mediaType.startsWith('application/vnd.')).toBe(true);
  });

  it('PROFILE TEST 5 — takes its representation schema from the SM-06 constant, not a literal', () => {
    expect(PROFILE.representation.schemaVersion).toBe(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION);
    expect(PROFILE.representation.schemaVersion).toBe('aoc-sovereignty-portability-bundle/1');
  });

  it('PROFILE TEST 6 — takes its canonicalization profile from the canonical JSON constant', () => {
    expect(PROFILE.representation.canonicalizationProfile).toBe(CANONICAL_JSON_PROFILE);
    expect(PROFILE.representation.canonicalizationProfile).toBe('aoc-canonical-json/1');
  });

  it('exposes itself as a versioned reference an artifact can point at', () => {
    expect(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF).toEqual({
      id: 'aoc:interoperability-profile:sovereignty-portability',
      version: '1.0.0',
    });
    expect(isValidSovereigntyInteroperabilityProfileRef(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF))
      .toBe(true);
    // An unversioned profile name is not a usable reference.
    expect(isValidSovereigntyInteroperabilityProfileRef({ id: PROFILE.id })).toBe(false);
  });
});

describe('SM-07 / the profile publishes machine-readable artifact semantics (PROFILE TESTS 7-11)', () => {
  it('PROFILE TEST 7 — represents the current manifest artifact kinds, from SM-06 constants', () => {
    expect(PROFILE.manifestArtifactKinds).toEqual(PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS);
    expect([...PROFILE.manifestArtifactKinds]).toEqual(['manifest', 'signed-manifest']);
  });

  it('PROFILE TEST 8 — represents the current claim artifact kinds, from SM-06 constants', () => {
    expect(PROFILE.claimArtifactKinds).toEqual(PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS);
    expect([...PROFILE.claimArtifactKinds]).toEqual(['claim', 'signed-claim']);
  });

  it('PROFILE TEST 9 — represents Origin claim semantics', () => {
    expect(PROFILE.claimTypes).toContain(ClaimType.Origin);
  });

  it('PROFILE TEST 10 — represents Authorship claim semantics', () => {
    expect(PROFILE.claimTypes).toContain(ClaimType.Authorship);
  });

  it('PROFILE TEST 11 — represents Derivation claim semantics', () => {
    expect(PROFILE.claimTypes).toContain(ClaimType.Derivation);
  });

  it('claims support for exactly the three claim types the bundle can validate', () => {
    expect([...PROFILE.claimTypes]).toEqual(['Authorship', 'Derivation', 'Origin']);
    expect(PROFILE.claimTypes).toEqual(INTEROPERABLE_CLAIM_TYPES);
    // Never a blanket claim of support for every CanonicalClaim variant, and
    // never `Custom` used to disguise the ones without validators.
    expect(PROFILE.claimTypes).not.toContain(ClaimType.Custom);
    expect(PROFILE.claimTypes.length).toBeLessThan(Object.values(ClaimType).length);
  });

  it('publishes one artifact-kind vocabulary that unions the wrappers with standing', () => {
    expect([...PROFILE.artifactKinds]).toEqual([
      'claim',
      'manifest',
      'signed-claim',
      'signed-manifest',
      'standing',
    ]);
    expect(PROFILE.artifactKinds).toEqual(SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS);
    // No divergent spellings: every wrapper kind here is an SM-06 constant.
    for (const kind of [
      ...PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
      ...PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
    ]) {
      expect(PROFILE.artifactKinds).toContain(kind);
    }
  });

  it('publishes the full canonical standing vocabulary', () => {
    expect([...PROFILE.standingStatuses].sort()).toEqual(Object.values(StandingStatus).sort());
    expect(PROFILE.standingStatuses).toContain(StandingStatus.Contested);
  });

  it('lets a consumer read every negotiable fact without opening AOC source', () => {
    // Exactly the questions section 42 requires a receiving system to be able
    // to answer from the profile document alone.
    const asWire = JSON.parse(canonicalizeJSON(PROFILE)) as Record<string, unknown>;
    expect(Object.keys(asWire).sort()).toEqual([
      'artifactKinds',
      'claimArtifactKinds',
      'claimTypes',
      'id',
      'manifestArtifactKinds',
      'mediaType',
      'representation',
      'schemaVersion',
      'semanticVocabulary',
      'standingStatuses',
      'version',
    ]);
  });
});

describe('SM-07 / the AOC sovereignty semantic vocabulary (PROFILE TESTS 12-15)', () => {
  it('PROFILE TEST 12 — a core semantic vocabulary exists and is published on the profile', () => {
    expect(PROFILE.semanticVocabulary).toBe(AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY);
    expect(AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY.categories.length).toBeGreaterThan(0);
  });

  it('PROFILE TEST 13 — the vocabulary is a CanonicalSemanticVocabulary, not a parallel model', () => {
    const vocabulary: CanonicalSemanticVocabulary = AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY;
    expect(Object.keys(vocabulary).sort()).toEqual([
      'categories',
      'description',
      'id',
      'name',
      'namespace',
    ]);
    expect(vocabulary.namespace).toBe(AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE);
    expect(vocabulary.namespace).toBe('aoc.sovereignty');
  });

  it('PROFILE TEST 14 — every term is a CanonicalSemanticTerm', () => {
    for (const entry of AOC_SOVEREIGNTY_SEMANTIC_TERMS) {
      const term: CanonicalSemanticTerm = entry;
      expect(Object.keys(term).sort()).toEqual(['description', 'id', 'name', 'namespace']);
      expect(term.namespace).toBe('aoc.sovereignty');
      expect(term.description.length).toBeGreaterThan(40);
    }
  });

  it('PROFILE TEST 15 — every category is a CanonicalSemanticCategory', () => {
    for (const entry of AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES) {
      const category: CanonicalSemanticCategory = entry;
      expect(Object.keys(category).sort()).toEqual([
        'description',
        'id',
        'name',
        'namespace',
        'termRefs',
      ]);
      expect(category.namespace).toBe('aoc.sovereignty');
      expect(category.termRefs.length).toBeGreaterThan(0);
    }
  });

  it('covers the concepts needed to understand the first four production layers', () => {
    const ids = AOC_SOVEREIGNTY_SEMANTIC_TERMS.map((term) => term.id).sort();
    expect(ids).toEqual(
      [
        'aoc.sovereignty:authorship-assertion',
        'aoc.sovereignty:claim-standing',
        'aoc.sovereignty:content-identity',
        'aoc.sovereignty:derivation-assertion',
        'aoc.sovereignty:external-reference',
        'aoc.sovereignty:origin-assertion',
        'aoc.sovereignty:portable-sovereign-representation',
        'aoc.sovereignty:sovereign-asset-identity',
        'aoc.sovereignty:sovereign-manifest',
        'aoc.sovereignty:sovereign-subject',
      ],
    );
  });

  it('organizes those concepts under the four mineral categories, with no orphan term refs', () => {
    expect(AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES.map((category) => category.id)).toEqual([
      AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS.identity,
      AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS.integrity,
      AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS.provenance,
      AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS.portability,
    ]);

    const known = new Set(AOC_SOVEREIGNTY_SEMANTIC_TERMS.map((term) => term.id));
    const referenced = AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES.flatMap((category) => [...category.termRefs]);
    for (const ref of referenced) expect(known.has(ref)).toBe(true);
    // Every term is reachable through exactly one category.
    expect([...referenced].sort()).toEqual([...known].sort());
    expect(new Set(referenced).size).toBe(referenced.length);
  });

  it('states meanings a receiving system can act on, drawing no legal conclusions', () => {
    const derivation = getAocSovereigntySemanticTerm(AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS.derivationAssertion);
    expect(derivation?.name).toBe('Derivation Assertion');
    expect(derivation?.description).toContain('no legal authorization');

    const contentIdentity = getAocSovereigntySemanticTerm(AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS.contentIdentity);
    // The distinction SM-02 exists to make, stated in the vocabulary itself.
    expect(contentIdentity?.description).toContain('not the sovereign identity');

    const standing = getAocSovereigntySemanticTerm(AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS.claimStanding);
    expect(standing?.description).toContain('neither removes the claim nor');

    const portable = getAocSovereigntySemanticTerm(
      AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS.portableSovereignRepresentation,
    );
    expect(portable?.description).toContain('without reminting');

    // A lookup over a closed constant set, never a resolver that goes looking.
    expect(getAocSovereigntySemanticTerm('aoc.sovereignty:not-a-term')).toBeUndefined();
  });
});

describe('SM-07 / the profile is behaviour-free (PROFILE TESTS 16-18)', () => {
  const everyObject = (value: unknown, seen: object[] = []): readonly object[] => {
    if (typeof value !== 'object' || value === null) return seen;
    seen.push(value);
    for (const nested of Object.values(value)) everyObject(nested, seen);
    return seen;
  };

  const PROFILE_OBJECTS = everyObject(PROFILE);

  it('PROFILE TEST 16 — carries no behavioural field anywhere in the document', () => {
    for (const node of PROFILE_OBJECTS) {
      for (const [key, value] of Object.entries(node)) {
        expect(typeof value).not.toBe('function');
        expect(
          ['resolver', 'evaluate', 'execute', 'verify', 'handler', 'apply', 'run'].some((banned) =>
            key.toLowerCase().includes(banned),
          ),
        ).toBe(false);
      }
    }
  });

  it('PROFILE TEST 17 — carries no trust, confidence or reputation semantics', () => {
    for (const node of PROFILE_OBJECTS) {
      for (const key of Object.keys(node)) {
        expect(
          ['trust', 'score', 'confidence', 'reputation', 'credibility', 'authoritylevel'].some((banned) =>
            key.toLowerCase().includes(banned),
          ),
        ).toBe(false);
      }
    }
  });

  it('PROFILE TEST 18 — carries no policy, decision, ownership or presentation field', () => {
    for (const node of PROFILE_OBJECTS) {
      for (const key of Object.keys(node)) {
        expect(
          [
            'policy', 'decision', 'decide', 'allow', 'deny', 'enforce', 'grant',
            'owner', 'ownership', 'custody', 'license', 'licence', 'billing', 'tier',
            'label', 'icon', 'color', 'colour',
            'provider', 'tenant', 'region', 'endpoint', 'storage',
            'implementedcapabilit', 'availablecapabilit',
          ].some((banned) => key.toLowerCase().includes(banned)),
        ).toBe(false);
      }
    }
  });

  it('makes no runtime capability-availability claim', () => {
    const wire = canonicalizeJSON(PROFILE);
    for (const forbidden of [
      'createIdentitySovereigntyCapabilityImplementation',
      'aoc:sovereignty-capability:identity',
      'implementedCapabilities',
      'availableCapabilities',
    ]) {
      expect(wire).not.toContain(forbidden);
    }
  });

  it('defines no external-standard translation table', () => {
    const wire = canonicalizeJSON(PROFILE);
    for (const forbidden of ['mapTo', 'W3C', 'VerifiableCredential', 'C2PA', 'SPDX', 'JSON-LD', 'jsonld', 'did:']) {
      expect(wire).not.toContain(forbidden);
    }
  });
});

describe('SM-07 / the profile is deterministic and immutable (PROFILE TESTS 19-20)', () => {
  it('PROFILE TEST 19 — is the same value on every read, with no clock or generated id', () => {
    const first = canonicalizeJSON(PROFILE);
    const second = canonicalizeJSON(AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1);
    expect(first).toBe(second);

    // No timestamp and no random identifier anywhere in the document.
    expect(first).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    expect(first).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    for (const field of ['generatedAt', 'createdAt', 'describedAt', 'digest', 'signature']) {
      expect(first).not.toContain(`"${field}"`);
    }
  });

  it('PROFILE TEST 20 — is frozen at every level a consumer can reach', () => {
    expect(Object.isFrozen(PROFILE)).toBe(true);
    expect(Object.isFrozen(PROFILE.representation)).toBe(true);
    expect(Object.isFrozen(PROFILE.artifactKinds)).toBe(true);
    expect(Object.isFrozen(PROFILE.claimTypes)).toBe(true);
    expect(Object.isFrozen(PROFILE.standingStatuses)).toBe(true);
    expect(Object.isFrozen(PROFILE.semanticVocabulary)).toBe(true);
    expect(Object.isFrozen(PROFILE.semanticVocabulary.categories)).toBe(true);
    for (const category of PROFILE.semanticVocabulary.categories) {
      expect(Object.isFrozen(category)).toBe(true);
      expect(Object.isFrozen(category.termRefs)).toBe(true);
    }
    for (const term of AOC_SOVEREIGNTY_SEMANTIC_TERMS) expect(Object.isFrozen(term)).toBe(true);
    expect(Object.isFrozen(AOC_SOVEREIGNTY_SEMANTIC_TERMS)).toBe(true);
  });

  it('is JSON-safe and canonicalizes without a Map, Set, Date or undefined', () => {
    const wire = canonicalizeJSON(PROFILE);
    expect(JSON.parse(wire)).toEqual(JSON.parse(JSON.stringify(PROFILE)));
    expect(canonicalizeJSON(JSON.parse(wire))).toBe(wire);
  });

  it('accepts the canonical profile through the external-boundary validator', () => {
    expect(isValidSovereigntyInteroperabilityProfileV1(PROFILE)).toBe(true);
    expect(isValidSovereigntyInteroperabilityProfileV1({ ...PROFILE, schemaVersion: 'other/1' })).toBe(false);
    expect(isValidSovereigntyInteroperabilityProfileV1({ ...PROFILE, id: '  ' })).toBe(false);
    expect(isValidSovereigntyInteroperabilityProfileV1(null)).toBe(false);
  });
});
