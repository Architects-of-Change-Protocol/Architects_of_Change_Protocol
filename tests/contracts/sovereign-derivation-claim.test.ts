import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { ClaimType } from '@aoc/protocol/claims';
import { computeContentIdentity, mintSovereignAssetId } from '@aoc/protocol/identity';
import type { SovereignAssetId } from '@aoc/protocol/identity';
import {
  DERIVATION_RELATION_KINDS,
  DerivationRelationKind,
  buildDerivationClaim,
  isValidDerivationClaim,
  validateDerivationClaim,
} from '@aoc/protocol/manifest';
import type { BuildDerivationClaimInput, DerivationClaim } from '@aoc/protocol/manifest';

const ISSUER = 'principal:sm05-issuer';
const ISSUED_AT = '2026-08-17T12:00:00.000Z';

const subject = (): SovereignAssetId => mintSovereignAssetId();

const derivationInput = (
  overrides: Partial<BuildDerivationClaimInput> = {},
): BuildDerivationClaimInput => ({
  id: 'claim:derivation:001',
  sovereignAssetId: subject(),
  issuer: ISSUER,
  sourceSovereignAssetIds: [subject()],
  relation: DerivationRelationKind.DerivedFrom,
  issuedAt: ISSUED_AT,
  ...overrides,
});

describe('SM-05 / canonical Derivation claim type (DERIVATION TESTS 1-2)', () => {
  it('TEST 1 — ClaimType.Derivation exists as a first-class canonical member', () => {
    expect(ClaimType.Derivation).toBe('Derivation');
  });

  it('TEST 2 — every pre-existing ClaimType value is unchanged', () => {
    // Adding a member is additive; renaming, removing or re-spelling one is not.
    expect(ClaimType.Identity).toBe('Identity');
    expect(ClaimType.Capability).toBe('Capability');
    expect(ClaimType.Authorization).toBe('Authorization');
    expect(ClaimType.Certification).toBe('Certification');
    expect(ClaimType.Role).toBe('Role');
    expect(ClaimType.Credential).toBe('Credential');
    expect(ClaimType.Governance).toBe('Governance');
    expect(ClaimType.Origin).toBe('Origin');
    expect(ClaimType.Authorship).toBe('Authorship');
    expect(ClaimType.Custom).toBe('Custom');
  });

  it('TEST 2b — derivation is a Provenance semantic, not a ninth mineral', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const capabilities = require('@aoc/protocol/sovereignty-capabilities') as {
      SOVEREIGNTY_CAPABILITY_KEYS: readonly string[];
    };
    expect(capabilities.SOVEREIGNTY_CAPABILITY_KEYS).toHaveLength(8);
    for (const absent of ['lineage', 'authorship', 'derivation', 'custody']) {
      expect(capabilities.SOVEREIGNTY_CAPABILITY_KEYS).not.toContain(absent);
    }
  });
});

describe('SM-05 / buildDerivationClaim shape and subject (DERIVATION TESTS 3-6)', () => {
  it('TEST 3 — produces a CanonicalClaim-compatible object', () => {
    const claim = buildDerivationClaim(derivationInput());

    expect(claim.type).toBe(ClaimType.Derivation);
    expect(typeof claim.id).toBe('string');
    expect(typeof claim.assertionRef).toBe('string');
    expect(claim.evidenceRefs).toEqual([]);
    expect(claim.attestationRefs).toEqual([]);
    expect(claim.issuedAt).toBe(ISSUED_AT);
    expect(claim.issuer).toBe(ISSUER);
    // Reuses the existing claim architecture rather than a parallel model.
    expect(Object.keys(claim).sort()).toEqual(
      ['assertionRef', 'attestationRefs', 'evidenceRefs', 'id', 'issuedAt', 'issuer', 'metadata', 'subject', 'type'],
    );
    expect(isValidDerivationClaim(claim)).toBe(true);
  });

  it('TEST 4 — claim.subject is the CHILD, and the sources are the parents', () => {
    const child = subject();
    const parent = subject();
    const claim = buildDerivationClaim(derivationInput({
      sovereignAssetId: child,
      sourceSovereignAssetIds: [parent],
    }));

    expect(claim.subject).toBe(child);
    expect(claim.metadata.sourceSovereignAssetIds).toEqual([parent]);
  });

  it('TEST 5 — a single source is accepted', () => {
    const claim = buildDerivationClaim(derivationInput());
    expect(claim.metadata.sourceSovereignAssetIds).toHaveLength(1);
  });

  it('TEST 6 — multiple sources are accepted, in the order asserted', () => {
    const a = subject();
    const b = subject();
    const c = subject();
    const claim = buildDerivationClaim(derivationInput({
      sourceSovereignAssetIds: [a, b, c],
      relation: DerivationRelationKind.CombinedFrom,
    }));

    expect(claim.metadata.sourceSovereignAssetIds).toEqual([a, b, c]);
    expect(claim.metadata.relation).toBe(DerivationRelationKind.CombinedFrom);
  });
});

describe('SM-05 / derivation source cardinality and identity (DERIVATION TESTS 7-10)', () => {
  it('TEST 7 — zero sources are rejected', () => {
    expect(() => buildDerivationClaim(derivationInput({ sourceSovereignAssetIds: [] }))).toThrow(
      /DERIVATION_SOURCES_REQUIRED/,
    );
    const result = validateDerivationClaim({
      ...buildDerivationClaim(derivationInput()),
      metadata: { sourceSovereignAssetIds: [], relation: DerivationRelationKind.DerivedFrom },
    });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('DERIVATION_SOURCES_REQUIRED');
  });

  it('TEST 8 — a malformed source id is rejected', () => {
    for (const malformed of ['not-a-sovereign-asset-id', '', 'aoc:sovereign-asset:nope', 42, null]) {
      expect(() =>
        buildDerivationClaim(derivationInput({ sourceSovereignAssetIds: [malformed as SovereignAssetId] })),
      ).toThrow(/INVALID_DERIVATION_SOURCE/);
    }
  });

  it('TEST 9 — a duplicated source is reported, never silently deduplicated', () => {
    const a = subject();
    const b = subject();
    expect(() => buildDerivationClaim(derivationInput({ sourceSovereignAssetIds: [a, a, b] }))).toThrow(
      /DUPLICATE_DERIVATION_SOURCE/,
    );
  });

  it('TEST 10 — direct self-derivation (A → A) is rejected', () => {
    const a = subject();
    expect(() =>
      buildDerivationClaim(derivationInput({ sovereignAssetId: a, sourceSovereignAssetIds: [a] })),
    ).toThrow(/DERIVATION_SELF_REFERENCE/);

    // Also rejected when the child is merely *among* several sources.
    expect(() =>
      buildDerivationClaim(derivationInput({ sovereignAssetId: a, sourceSovereignAssetIds: [subject(), a] })),
    ).toThrow(/DERIVATION_SELF_REFERENCE/);
  });

  it('TEST 10b — a single claim never asserts that the wider graph is acyclic', () => {
    // A → C and C → A are each individually valid assertions. Nothing at the
    // claim layer can rule that out, because the other claim is not in front
    // of it — global acyclicity is not knowable from one local assertion.
    const a = subject();
    const c = subject();
    expect(isValidDerivationClaim(
      buildDerivationClaim(derivationInput({ id: 'claim:1', sovereignAssetId: c, sourceSovereignAssetIds: [a] })),
    )).toBe(true);
    expect(isValidDerivationClaim(
      buildDerivationClaim(derivationInput({ id: 'claim:2', sovereignAssetId: a, sourceSovereignAssetIds: [c] })),
    )).toBe(true);
  });
});

describe('SM-05 / derivation relation vocabulary (DERIVATION TESTS 11-12)', () => {
  it('TEST 11 — every canonical relation is accepted', () => {
    expect(DERIVATION_RELATION_KINDS).toEqual([
      'DerivedFrom',
      'TransformedFrom',
      'CombinedFrom',
      'ExtractedFrom',
      'GeneratedFrom',
      'Custom',
    ]);
    for (const relation of DERIVATION_RELATION_KINDS) {
      expect(buildDerivationClaim(derivationInput({ relation })).metadata.relation).toBe(relation);
    }
  });

  it('TEST 12 — an unknown relation is rejected', () => {
    for (const relation of ['PlagiarizedFrom', 'Infringes', 'AuthorizedDerivative', 'IllegalCopy', '', 7]) {
      expect(() =>
        buildDerivationClaim(derivationInput({ relation: relation as DerivationRelationKind })),
      ).toThrow(/INVALID_DERIVATION_RELATION/);
    }
  });

  it('TEST 12b — the vocabulary embeds no legal conclusion and no domain taxonomy', () => {
    const serialized = JSON.stringify(DERIVATION_RELATION_KINDS);
    for (const forbidden of [
      'Plagiarized', 'Infring', 'Authorized', 'Illegal', 'Licensed', 'Owner',
      'Stem', 'Remix', 'Fork', 'Mint', 'Token', 'Prompt',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe('SM-05 / optional derivation metadata (DERIVATION TESTS 13-17)', () => {
  it('TEST 13 — an optional statement is preserved verbatim', () => {
    const statement = '  Composite derived artifact  ';
    const claim = buildDerivationClaim(derivationInput({ statement }));
    expect(claim.metadata.statement).toBe(statement);
  });

  it('TEST 14 — a present-but-blank statement is rejected; an absent one is omitted', () => {
    expect(() => buildDerivationClaim(derivationInput({ statement: '   ' }))).toThrow(
      /INVALID_DERIVATION_STATEMENT/,
    );
    const claim = buildDerivationClaim(derivationInput());
    expect('statement' in claim.metadata).toBe(false);
    // Structural absence, not `undefined`: canonical JSON refuses `undefined`.
    expect(canonicalizeJSON(claim)).not.toContain('statement');
  });

  it('TEST 15 — occurredAt is preserved when supplied and omitted when not', () => {
    const claim = buildDerivationClaim(derivationInput({ occurredAt: '2026-01-01T00:00:00.000Z' }));
    expect(claim.metadata.occurredAt).toBe('2026-01-01T00:00:00.000Z');
    expect('occurredAt' in buildDerivationClaim(derivationInput()).metadata).toBe(false);

    for (const bad of ['2026-01-01', '2026-01-01T00:00:00+02:00', 'yesterday', 17]) {
      expect(() =>
        buildDerivationClaim(derivationInput({ occurredAt: bad as string })),
      ).toThrow(/INVALID_DERIVATION_OCCURRED_AT/);
    }
  });

  it('TEST 16 — issuedAt and occurredAt are independent facts', () => {
    // "The transformation happened in January; I am recording it in August."
    const claim = buildDerivationClaim(derivationInput({
      occurredAt: '2026-01-01T00:00:00.000Z',
      issuedAt: '2026-08-17T12:00:00.000Z',
    }));
    expect(claim.metadata.occurredAt).toBe('2026-01-01T00:00:00.000Z');
    expect(claim.issuedAt).toBe('2026-08-17T12:00:00.000Z');
    expect(claim.issuedAt).not.toBe(claim.metadata.occurredAt);
  });

  it('TEST 17 — caller-supplied evidenceRefs are preserved, and none are fabricated', () => {
    const evidenceRefs = ['evidence:transformation-log-1', 'evidence:notarized-statement-2'];
    expect(buildDerivationClaim(derivationInput({ evidenceRefs })).evidenceRefs).toEqual(evidenceRefs);
    // With no real evidence the list is empty — never a digest, subject id or
    // statement dressed up as a CanonicalEvidenceId.
    expect(buildDerivationClaim(derivationInput()).evidenceRefs).toEqual([]);
  });
});

describe('SM-05 / claim construction does not mutate caller input (DERIVATION TEST 18)', () => {
  it('TEST 18 — the caller\'s source array is neither sorted, deduplicated nor frozen', () => {
    const sources = [subject(), subject(), subject()];
    const snapshot = [...sources];
    const claim = buildDerivationClaim(derivationInput({ sourceSovereignAssetIds: sources }));

    expect(sources).toEqual(snapshot);
    expect(Object.isFrozen(sources)).toBe(false);
    // The claim holds a copy, so mutating the caller's array later cannot
    // rewrite an already-issued assertion.
    expect(claim.metadata.sourceSovereignAssetIds).not.toBe(sources);
    sources.push(subject());
    expect(claim.metadata.sourceSovereignAssetIds).toEqual(snapshot);
  });
});

describe('SM-05 / lineage identity is subject identity (DERIVATION TESTS 19-20)', () => {
  it('TEST 19 — no locator, provider or external reference appears in the source list', () => {
    const parent = subject();
    const claim = buildDerivationClaim(derivationInput({ sourceSovereignAssetIds: [parent] }));
    const serialized = canonicalizeJSON(claim);

    for (const forbidden of ['future://provider', 'locator', 'namespace', 'externalReference', 'https://', 'provider']) {
      expect(serialized).not.toContain(forbidden);
    }
    // The edge survives a provider migration precisely because it names the
    // subject and not where the subject currently lives.
    expect(claim.metadata.sourceSovereignAssetIds).toEqual([parent]);
    expect(claim.metadata.sourceSovereignAssetIds[0].startsWith('aoc:sovereign-asset:')).toBe(true);
  });

  it('TEST 20 — no ContentIdentity or digest appears in the source list', () => {
    const contentIdentity = computeContentIdentity(new TextEncoder().encode('parent bytes'));
    const claim = buildDerivationClaim(derivationInput());
    const serialized = canonicalizeJSON(claim);

    expect(serialized).not.toContain(contentIdentity.digest);
    for (const forbidden of ['contentIdentity', 'manifestDigest', 'digest', 'sha256', 'algorithm']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

describe('SM-05 / structural validation of a derivation claim (DERIVATION TEST 29-adjacent)', () => {
  const valid = (): DerivationClaim => buildDerivationClaim(derivationInput());

  it('rejects a wrong claim type', () => {
    const result = validateDerivationClaim({ ...valid(), type: ClaimType.Origin });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain('INVALID_CLAIM_TYPE');
  });

  it('rejects a malformed child subject, claim id, issuer and issuedAt', () => {
    expect(validateDerivationClaim({ ...valid(), subject: 'not-sovereign' }).reasons)
      .toContain('INVALID_CLAIM_SUBJECT');
    expect(validateDerivationClaim({ ...valid(), id: '   ' }).reasons).toContain('INVALID_CLAIM_ID');
    expect(validateDerivationClaim({ ...valid(), issuer: { id: '', kind: 'System' } }).reasons)
      .toContain('INVALID_CLAIM_ISSUER');
    expect(validateDerivationClaim({ ...valid(), issuedAt: '2026-08-17' }).reasons)
      .toContain('INVALID_CLAIM_ISSUED_AT');
  });

  it('accepts a structured CanonicalPrincipalRef issuer', () => {
    const claim = buildDerivationClaim(derivationInput({
      issuer: { id: 'principal:studio-42', kind: 'Organization', displayName: 'Studio 42' },
    }));
    expect(isValidDerivationClaim(claim)).toBe(true);
  });

  it('rejects non-object and non-claim values without throwing', () => {
    for (const value of [null, undefined, 'claim', 42, [], {}]) {
      expect(isValidDerivationClaim(value)).toBe(false);
    }
  });

  it('rejects a claim missing required CanonicalClaim base fields', () => {
    // Reachable from any untyped or external caller, which is exactly who
    // these guards exist for: without this the object is returned as an
    // OriginClaim/AuthorityClaim/DerivationClaim it does not satisfy.
    const withoutAssertionRef = { ...valid() } as Record<string, unknown>;
    delete withoutAssertionRef.assertionRef;
    expect(validateDerivationClaim(withoutAssertionRef).reasons).toContain('INVALID_CLAIM_ASSERTION_REF');

    const withoutAttestationRefs = { ...valid() } as Record<string, unknown>;
    delete withoutAttestationRefs.attestationRefs;
    expect(validateDerivationClaim(withoutAttestationRefs).reasons).toContain('INVALID_CLAIM_ATTESTATION_REFS');
  });

  it('rejects an impossible calendar date that Date.parse would silently normalize', () => {
    // `2026-02-31` parses to 3 March. A timestamp that means a different
    // instant than it spells must not be preserved verbatim into a claim.
    for (const impossible of [
      '2026-02-31T12:00:00.000Z',
      '2026-02-29T12:00:00.000Z',
      '2026-13-01T12:00:00.000Z',
      '2026-00-10T12:00:00.000Z',
      '2026-08-00T12:00:00.000Z',
      '2026-08-17T24:00:00.000Z',
      '2026-08-17T12:60:00.000Z',
    ]) {
      expect(validateDerivationClaim({ ...valid(), issuedAt: impossible }).reasons)
        .toContain('INVALID_CLAIM_ISSUED_AT');
    }
    // Real leap days and sub-millisecond precision stay valid.
    expect(isValidDerivationClaim({ ...valid(), issuedAt: '2024-02-29T12:00:00.000Z' })).toBe(true);
    expect(isValidDerivationClaim({ ...valid(), issuedAt: '2026-08-17T12:00:00.123456Z' })).toBe(true);
  });

  it('rejects a sparse source array rather than letting a hole through', () => {
    // `Array.prototype.every` skips holes, so `new Array(1)` would otherwise
    // satisfy every check and carry a missing id into lineage output.
    const sparse = new Array(1) as unknown as SovereignAssetId[];
    const claim = { ...valid(), metadata: { ...valid().metadata, sourceSovereignAssetIds: sparse } };
    expect(validateDerivationClaim(claim).reasons).toContain('INVALID_DERIVATION_SOURCE');
    expect(isValidDerivationClaim(claim)).toBe(false);
  });

  it('performs no network or filesystem access while validating', () => {
    // A statement and an origin-looking source are inert data.
    const claim = buildDerivationClaim(derivationInput({
      statement: 'fetched from https://example.invalid/asset — do not resolve',
    }));
    expect(isValidDerivationClaim(claim)).toBe(true);
  });
});
