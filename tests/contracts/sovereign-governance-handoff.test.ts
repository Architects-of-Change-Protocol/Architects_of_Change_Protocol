import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  computeContentIdentity,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  buildDerivationClaim,
  buildOriginClaim,
  buildSovereignManifestV1,
  computeManifestDigest,
} from '@aoc/protocol/manifest';
import {
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  buildSovereigntyPortabilityBundleV1,
} from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import { buildSovereigntyInteroperabilityDescriptorV1 } from '@aoc/protocol/interoperability';
import {
  SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES,
  SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION,
  SOVEREIGN_GOVERNED_RESOURCE_KIND,
  buildSovereignGovernanceHandoffV1,
  buildSovereignGovernanceResourceRef,
  isValidSovereignGovernanceHandoffV1,
  tryBuildSovereignGovernanceHandoffV1,
  validateSovereignGovernanceHandoffV1,
} from '@aoc/protocol/governance-compatibility';
import type { SovereignGovernanceHandoffV1 } from '@aoc/protocol/governance-compatibility';
import type { ResourceRef } from '@aoc/protocol/contracts';

const CODES = SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES;
const ISSUER = 'principal:sm10-issuer';
const REGISTRANT = 'principal:sm10-registrant';
const AT = '2026-08-18T09:00:00.000Z';

const newId = (): SovereignAssetId => parseSovereignAssetId(mintSovereignAssetId());

const subjectFor = (
  id: SovereignAssetId,
  reference?: { namespace: string; id: string; locator?: string },
): SovereignSubjectRef => ({
  sovereignAssetId: id,
  ...(reference === undefined
    ? {}
    : { externalReference: buildSovereignExternalReference(reference) }),
});

/**
 * The mandatory empirical representation: a manifest carrying real integrity
 * material, an Origin claim, a Derivation claim and a Contested standing.
 */
const bundleFor = (subject: SovereignSubjectRef): SovereigntyPortabilityBundleV1 => {
  const id = subject.sovereignAssetId;
  const origin = buildOriginClaim({
    id: 'claim:origin:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    assertedOrigin: 'sm10-origin',
    assertedAt: AT,
  });
  const derivation = buildDerivationClaim({
    id: 'claim:derivation:1',
    sovereignAssetId: id,
    issuer: ISSUER,
    sourceSovereignAssetIds: [newId()],
    relation: 'DerivedFrom',
    issuedAt: AT,
  });
  const standings: readonly CanonicalStanding[] = [
    { id: 'standing:1', claimRef: origin.id, status: StandingStatus.Contested, effectiveAt: AT },
  ];
  return buildSovereigntyPortabilityBundleV1({
    subject,
    manifests: [
      {
        kind: 'manifest',
        manifest: buildSovereignManifestV1({
          sovereignAssetId: id,
          registrant: REGISTRANT,
          contentIdentity: computeContentIdentity(new TextEncoder().encode('sm10 bytes')),
          ...(subject.externalReference === undefined
            ? {}
            : { externalReference: subject.externalReference }),
        }),
      },
    ],
    claims: [
      { kind: 'claim', claim: origin },
      { kind: 'claim', claim: derivation },
    ],
    standings,
  });
};

const handoffFor = (
  subject: SovereignSubjectRef,
  tenantId?: string,
): SovereignGovernanceHandoffV1 =>
  buildSovereignGovernanceHandoffV1({
    representation: bundleFor(subject),
    ...(tenantId === undefined ? {} : { tenantId }),
  });

/** A structurally valid, subject-only representation. */
const emptyBundleFor = (subject: SovereignSubjectRef): SovereigntyPortabilityBundleV1 =>
  buildSovereigntyPortabilityBundleV1({ subject });

describe('SM-10 / the canonical sovereign governance resource kind (RESOURCE TESTS 1-2)', () => {
  it('RESOURCE TEST 1 — the generic resource kind is exactly `aoc:sovereign-asset`', () => {
    expect(SOVEREIGN_GOVERNED_RESOURCE_KIND).toBe('aoc:sovereign-asset');
  });

  it('RESOURCE TEST 2 — the projection reuses the canonical ResourceRef, and defines no parallel type', () => {
    const subject = subjectFor(newId());
    // Assignable to the canonical Protocol contract with no cast and no adapter:
    // there is no `GovernedResourceRef`, `SovereignResource`, `PolicyResourceRef`
    // or `EnterpriseResourceRef` in this surface.
    const resource: ResourceRef = buildSovereignGovernanceResourceRef(subject);
    expect(Object.keys(resource).sort()).toEqual(['id', 'kind']);
  });
});

describe('SM-10 / the resource id is the sovereign identity and nothing else (RESOURCE TESTS 3-9)', () => {
  it('RESOURCE TEST 3 — resource.id is the SovereignAssetId', () => {
    const id = newId();
    expect(buildSovereignGovernanceResourceRef(subjectFor(id)).id).toBe(id);
  });

  it('RESOURCE TESTS 4-8 — no digest, content identity, external id, locator or provider id is ever used', () => {
    const id = newId();
    const subject = subjectFor(id, {
      namespace: 'provider-p1',
      id: 'provider-object-92817',
      locator: 'p1://bucket-eu-west/object/92817',
    });
    const contentIdentity = computeContentIdentity(new TextEncoder().encode('sm10 bytes'));
    const manifest = buildSovereignManifestV1({
      sovereignAssetId: id,
      registrant: REGISTRANT,
      contentIdentity,
      externalReference: subject.externalReference,
    });
    const manifestDigest = computeManifestDigest(manifest);

    const resource = buildSovereignGovernanceResourceRef(subject);

    // RESOURCE TEST 4 — manifest digest
    expect(resource.id).not.toBe(manifestDigest);
    // RESOURCE TEST 5 — content digest
    expect(resource.id).not.toBe(contentIdentity.digest);
    // RESOURCE TEST 6 — externalReference.id
    expect(resource.id).not.toBe(subject.externalReference?.id);
    // RESOURCE TEST 7 — locator
    expect(resource.id).not.toBe(subject.externalReference?.locator);
    // RESOURCE TEST 8 — provider id / namespace
    expect(resource.id).not.toBe(subject.externalReference?.namespace);

    expect(resource.id).toBe(id);
    const serialized = canonicalizeJSON(resource);
    for (const leaked of [
      manifestDigest,
      contentIdentity.digest,
      'provider-object-92817',
      'p1://bucket-eu-west/object/92817',
      'provider-p1',
    ]) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it('RESOURCE TEST 9 — attributes are structurally absent, not empty', () => {
    const resource = buildSovereignGovernanceResourceRef(subjectFor(newId()), { tenantId: 'tenant-alpha' });
    expect(Object.prototype.hasOwnProperty.call(resource, 'attributes')).toBe(false);
    expect(Object.keys(resource).sort()).toEqual(['id', 'kind', 'tenantId']);
  });
});

describe('SM-10 / tenancy is explicit, optional and never inferred (RESOURCE TESTS 10-13)', () => {
  it('RESOURCE TEST 10 — a tenant is optional', () => {
    expect(() => buildSovereignGovernanceResourceRef(subjectFor(newId()))).not.toThrow();
  });

  it('RESOURCE TEST 11 — a supplied tenant is preserved exactly, never trimmed or normalized', () => {
    for (const tenantId of ['tenant-alpha', 'Tenant-ALPHA', '  padded-tenant  ', 'tenant/with/slashes']) {
      expect(buildSovereignGovernanceResourceRef(subjectFor(newId()), { tenantId }).tenantId).toBe(tenantId);
    }
  });

  it('RESOURCE TEST 12 — a blank tenant is refused, not silently dropped', () => {
    for (const tenantId of ['', '   ', '\t\n']) {
      expect(() => buildSovereignGovernanceResourceRef(subjectFor(newId()), { tenantId })).toThrow();
    }
  });

  it('RESOURCE TEST 13 — an absent tenant produces no key at all, and no default', () => {
    const resource = buildSovereignGovernanceResourceRef(subjectFor(newId()));
    expect(Object.prototype.hasOwnProperty.call(resource, 'tenantId')).toBe(false);
    expect(resource.tenantId).toBeUndefined();
    const serialized = canonicalizeJSON(resource);
    for (const leaked of ['tenantId', 'default', 'public']) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it('rejects a malformed subject rather than repairing it', () => {
    expect(() => buildSovereignGovernanceResourceRef({ sovereignAssetId: 'not-an-id' } as never)).toThrow();
  });
});

describe('SM-10 / the governance resource is stable across representation change (RESOURCE TESTS 14-16)', () => {
  it('RESOURCE TEST 14 — the same subject under a changed locator projects the same resource id', () => {
    const id = newId();
    const before = buildSovereignGovernanceResourceRef(
      subjectFor(id, { namespace: 'provider-p1', id: 'o-1', locator: 'p1://old/object/1' }),
    );
    const after = buildSovereignGovernanceResourceRef(
      subjectFor(id, { namespace: 'provider-p2', id: 'o-1', locator: 'p2://new/object/1' }),
    );
    expect(after.id).toBe(before.id);
    expect(after.kind).toBe(before.kind);
    expect(after).toEqual(before);
  });

  it('RESOURCE TEST 15 — a changed ContentIdentity does not move the governance resource', () => {
    const id = newId();
    const subject = subjectFor(id);
    const v1 = buildSovereigntyPortabilityBundleV1({
      subject,
      manifests: [
        {
          kind: 'manifest',
          manifest: buildSovereignManifestV1({
            sovereignAssetId: id,
            registrant: REGISTRANT,
            contentIdentity: computeContentIdentity(new TextEncoder().encode('version one')),
          }),
        },
      ],
    });
    const v2 = buildSovereigntyPortabilityBundleV1({
      subject,
      manifests: [
        {
          kind: 'manifest',
          manifest: buildSovereignManifestV1({
            sovereignAssetId: id,
            registrant: REGISTRANT,
            manifestVersion: 2,
            contentIdentity: computeContentIdentity(new TextEncoder().encode('version two — different bytes')),
          }),
        },
      ],
    });

    const first = buildSovereignGovernanceHandoffV1({ representation: v1 });
    const second = buildSovereignGovernanceHandoffV1({ representation: v2 });

    expect(second.resource).toEqual(first.resource);
    expect(second.resource.id).toBe(id);
    // The representation genuinely changed; only the governance handle did not.
    expect(canonicalizeJSON(second.representation)).not.toBe(canonicalizeJSON(first.representation));
  });

  it('RESOURCE TEST 16 — different subjects project different resource ids, with no inheritance', () => {
    const parent = newId();
    const child = newId();
    const parentResource = buildSovereignGovernanceResourceRef(subjectFor(parent));
    const childResource = buildSovereignGovernanceResourceRef(subjectFor(child));

    expect(parentResource.id).toBe(parent);
    expect(childResource.id).toBe(child);
    expect(childResource.id).not.toBe(parentResource.id);
    expect(childResource.kind).toBe(parentResource.kind);
  });
});

describe('SM-10 / the handoff contract (HANDOFF TESTS 1-15)', () => {
  const subject = subjectFor(newId(), { namespace: 'alien-system-v47', id: 'alien-92817' });
  const handoff = handoffFor(subject);

  it('HANDOFF TEST 1 — the schema version is exactly `aoc-sovereign-governance-handoff/1`', () => {
    expect(SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION).toBe('aoc-sovereign-governance-handoff/1');
    expect(handoff.schemaVersion).toBe('aoc-sovereign-governance-handoff/1');
  });

  it('HANDOFF TEST 2 — the canonicalization profile is the one canonical profile', () => {
    expect(handoff.canonicalizationProfile).toBe(CANONICAL_JSON_PROFILE);
    expect(handoff.canonicalizationProfile).toBe('aoc-canonical-json/1');
  });

  it('HANDOFF TEST 3 — exactly six top-level fields', () => {
    expect(Object.keys(handoff).sort()).toEqual([
      'canonicalizationProfile',
      'representation',
      'resource',
      'schemaVersion',
      'semantics',
      'subject',
    ]);
  });

  it('HANDOFF TESTS 4-7 — no handoff id, timestamp, digest or signature', () => {
    const keys = Object.keys(handoff);
    for (const forbidden of [
      // HANDOFF TEST 4 — identity
      'handoffId',
      'governanceId',
      'governanceHandoffId',
      'requestId',
      // HANDOFF TEST 5 — time
      'generatedAt',
      'createdAt',
      'preparedAt',
      'governanceAt',
      // HANDOFF TEST 6 — integrity
      'handoffDigest',
      'handoffHash',
      'digest',
      'hash',
      // HANDOFF TEST 7 — verifiability
      'signature',
      'proof',
      'handoffSignature',
    ]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('HANDOFF TEST 8 — the subject is the representation subject, by reference', () => {
    expect(handoff.subject).toBe(handoff.representation.subject);
    expect(handoff.subject).toEqual(subject);
  });

  it('HANDOFF TEST 9 — the resource is exactly the projection of that subject', () => {
    expect(handoff.resource).toEqual({
      kind: SOVEREIGN_GOVERNED_RESOURCE_KIND,
      id: subject.sovereignAssetId,
    });
  });

  it('HANDOFF TEST 10 — the representation is the caller bundle, unchanged and by reference', () => {
    const representation = bundleFor(subject);
    const built = buildSovereignGovernanceHandoffV1({ representation });
    expect(built.representation).toBe(representation);
    expect(built.representation).toEqual(representation);
    expect(built.representation.schemaVersion).toBe(SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION);
  });

  it('HANDOFF TEST 11 — the semantics are exactly the canonical SM-07 descriptor of that representation', () => {
    expect(handoff.semantics).toEqual(
      buildSovereigntyInteroperabilityDescriptorV1(handoff.representation),
    );
    expect(handoff.semantics.subject).toBe(handoff.subject);
  });

  it('HANDOFF TESTS 12-13 — the handoff is JSON-safe and canonicalizable', () => {
    expect(() => JSON.stringify(handoff)).not.toThrow();
    expect(() => canonicalizeJSON(handoff)).not.toThrow();
    expect(JSON.parse(JSON.stringify(handoff))).toEqual(handoff);
    // No Map, Set, Buffer, Date, Error, class instance or function survives a
    // JSON round trip; equality after one proves none is present.
    expect(canonicalizeJSON(JSON.parse(JSON.stringify(handoff)))).toBe(canonicalizeJSON(handoff));
  });

  it('HANDOFF TESTS 14-15 — the same inputs produce a byte-identical canonical handoff', () => {
    const representation = bundleFor(subjectFor(newId()));
    const first = buildSovereignGovernanceHandoffV1({ representation, tenantId: 'tenant-alpha' });
    const second = buildSovereignGovernanceHandoffV1({ representation, tenantId: 'tenant-alpha' });
    expect(canonicalizeJSON(second)).toBe(canonicalizeJSON(first));
    expect(second).toEqual(first);
  });
});

describe('SM-10 / the empirical positive handoff', () => {
  it('projects exactly the documented shape, with no extra field', () => {
    const id = newId();
    const representation = emptyBundleFor(subjectFor(id));
    const handoff = buildSovereignGovernanceHandoffV1({ representation });

    expect(JSON.parse(JSON.stringify(handoff))).toEqual({
      schemaVersion: 'aoc-sovereign-governance-handoff/1',
      canonicalizationProfile: 'aoc-canonical-json/1',
      subject: { sovereignAssetId: id },
      resource: { kind: 'aoc:sovereign-asset', id },
      representation: JSON.parse(JSON.stringify(representation)),
      semantics: JSON.parse(JSON.stringify(buildSovereigntyInteroperabilityDescriptorV1(representation))),
    });
  });

  it('carries an explicit tenant onto the resource and nowhere else', () => {
    const id = newId();
    const handoff = buildSovereignGovernanceHandoffV1({
      representation: emptyBundleFor(subjectFor(id)),
      tenantId: 'tenant-alpha',
    });
    expect(handoff.resource).toEqual({ kind: 'aoc:sovereign-asset', id, tenantId: 'tenant-alpha' });
    // The tenant appears exactly once in the whole document — on the resource.
    expect(canonicalizeJSON(handoff).split('tenant-alpha').length - 1).toBe(1);
  });

  it('omits the tenant key entirely when none is supplied', () => {
    const handoff = buildSovereignGovernanceHandoffV1({ representation: emptyBundleFor(subjectFor(newId())) });
    expect(Object.prototype.hasOwnProperty.call(handoff.resource, 'tenantId')).toBe(false);
    expect(canonicalizeJSON(handoff)).not.toContain('tenantId');
  });
});

describe('SM-10 / handoff validation (VALIDATION TESTS 1-15)', () => {
  const subject = subjectFor(newId());
  const valid = handoffFor(subject);

  const tampered = (mutate: (draft: Record<string, unknown>) => void): unknown => {
    const draft = JSON.parse(JSON.stringify(valid)) as Record<string, unknown>;
    mutate(draft);
    return draft;
  };

  it('VALIDATION TEST 1 — a valid handoff validates', () => {
    expect(validateSovereignGovernanceHandoffV1(valid)).toEqual({ valid: true, reasons: [] });
    expect(isValidSovereignGovernanceHandoffV1(valid)).toBe(true);
    // Survives a canonical round trip: validity is a property of the document,
    // not of the object identity it happened to be built with.
    expect(isValidSovereignGovernanceHandoffV1(JSON.parse(JSON.stringify(valid)))).toBe(true);
  });

  it('VALIDATION TEST 2 — `{}` and other non-handoffs are invalid, never thrown on', () => {
    for (const candidate of [{}, null, undefined, 'handoff', 42, [], [valid], new Date()]) {
      const result = validateSovereignGovernanceHandoffV1(candidate);
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain(CODES.invalidHandoff);
    }
  });

  it('VALIDATION TEST 3 — an unknown top-level field is invalid, and governance words are not special-cased', () => {
    for (const extra of [
      'policy',
      'decision',
      'grant',
      'owner',
      'authority',
      'status',
      'approval',
      'governanceReady',
      'somethingHarmless',
    ]) {
      const result = validateSovereignGovernanceHandoffV1(tampered((draft) => {
        draft[extra] = 'anything';
      }));
      expect({ extra, valid: result.valid }).toEqual({ extra, valid: false });
      expect(result.reasons).toEqual([CODES.invalidHandoff]);
    }
    // A missing field fails closed for the same reason.
    expect(validateSovereignGovernanceHandoffV1(tampered((draft) => {
      delete draft.semantics;
    })).reasons).toEqual([CODES.invalidHandoff]);
  });

  it('VALIDATION TEST 4 — a future handoff schema is invalid, with no fallback', () => {
    const result = validateSovereignGovernanceHandoffV1(tampered((draft) => {
      draft.schemaVersion = 'aoc-sovereign-governance-handoff/2';
    }));
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.unsupportedHandoffSchema);
  });

  it('VALIDATION TEST 5 — a foreign canonicalization profile is invalid', () => {
    const result = validateSovereignGovernanceHandoffV1(tampered((draft) => {
      draft.canonicalizationProfile = 'jcs/1';
    }));
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.unsupportedCanonicalizationProfile);
  });

  it('VALIDATION TEST 6 — an invalid representation is invalid', () => {
    const result = validateSovereignGovernanceHandoffV1(tampered((draft) => {
      (draft.representation as Record<string, unknown>).standings = [{ id: 'standing:x' }];
    }));
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.invalidRepresentation);
  });

  it('VALIDATION TEST 7 — a structurally invalid descriptor is invalid', () => {
    const result = validateSovereignGovernanceHandoffV1(tampered((draft) => {
      delete (draft.semantics as Record<string, unknown>).present;
    }));
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.invalidSemantics);
  });

  it('VALIDATION TEST 8 — a valid descriptor for a *different* representation is invalid', () => {
    // Individually well-formed, about the same subject, and still wrong: it
    // describes a representation that carries no claims at all.
    const otherDescriptor = buildSovereigntyInteroperabilityDescriptorV1(emptyBundleFor(subject));
    expect(validateSovereignGovernanceHandoffV1({ ...valid, semantics: otherDescriptor })).toEqual({
      valid: false,
      reasons: [CODES.semanticsMismatch],
    });
  });

  it('VALIDATION TEST 9 — a top-level subject that differs from the representation is invalid', () => {
    const result = validateSovereignGovernanceHandoffV1({ ...valid, subject: subjectFor(newId()) });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.subjectMismatch);
    // Nothing is repaired: the returned reasons describe the document as given.
    expect(valid.subject).toBe(valid.representation.subject);
  });

  it('VALIDATION TEST 10 — a descriptor about a different subject is invalid', () => {
    const foreign = buildSovereigntyInteroperabilityDescriptorV1(bundleFor(subjectFor(newId())));
    const result = validateSovereignGovernanceHandoffV1({ ...valid, semantics: foreign });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.subjectMismatch);
    expect(result.reasons).toContain(CODES.semanticsMismatch);
  });

  it('VALIDATION TEST 11 — a resource id that is not the subject is invalid, whatever it points at', () => {
    for (const id of [
      newId(),
      computeContentIdentity(new TextEncoder().encode('sm10 bytes')).digest,
      'provider-object-92817',
    ]) {
      const result = validateSovereignGovernanceHandoffV1({
        ...valid,
        resource: { ...valid.resource, id },
      });
      expect({ id, valid: result.valid }).toEqual({ id, valid: false });
      expect(result.reasons).toContain(CODES.resourceIdMismatch);
    }
  });

  it('VALIDATION TEST 12 — a resource kind that leaks a taxonomy is invalid', () => {
    for (const kind of ['real-estate', 'music', 'token', 'api', 'agent', 'aoc:sovereign-asset:v2']) {
      const result = validateSovereignGovernanceHandoffV1({
        ...valid,
        resource: { ...valid.resource, kind },
      });
      expect({ kind, valid: result.valid }).toEqual({ kind, valid: false });
      expect(result.reasons).toContain(CODES.resourceKindMismatch);
    }
  });

  it('VALIDATION TEST 13 — resource attributes are unsupported in v1, even when empty', () => {
    for (const attributes of [{}, { assetType: 'painting' }, { jurisdiction: 'ES' }, { owner: 'principal:x' }]) {
      const result = validateSovereignGovernanceHandoffV1({
        ...valid,
        resource: { ...valid.resource, attributes },
      });
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain(CODES.resourceAttributesNotSupported);
    }
  });

  it('VALIDATION TEST 14 — a blank tenant on the resource is invalid', () => {
    for (const tenantId of ['', '   ']) {
      const result = validateSovereignGovernanceHandoffV1({
        ...valid,
        resource: { ...valid.resource, tenantId },
      });
      expect(result.valid).toBe(false);
      expect(result.reasons).toContain(CODES.invalidTenantId);
    }
    expect(
      validateSovereignGovernanceHandoffV1({
        ...valid,
        resource: { ...valid.resource, tenantId: 'tenant-alpha' },
      }),
    ).toEqual({ valid: true, reasons: [] });
  });

  it('VALIDATION TEST 15 — validation mutates nothing it is given', () => {
    const candidate = JSON.parse(JSON.stringify(valid));
    const before = canonicalizeJSON(candidate);
    validateSovereignGovernanceHandoffV1(candidate);
    validateSovereignGovernanceHandoffV1({ ...candidate, resource: { kind: 'wrong', id: 'wrong' } });
    expect(canonicalizeJSON(candidate)).toBe(before);

    const representation = bundleFor(subjectFor(newId()));
    const representationBefore = canonicalizeJSON(representation);
    buildSovereignGovernanceHandoffV1({ representation });
    expect(canonicalizeJSON(representation)).toBe(representationBefore);
  });

  it('an unrecognized field on the resource fails closed', () => {
    const result = validateSovereignGovernanceHandoffV1({
      ...valid,
      resource: { ...valid.resource, ownerActorId: 'principal:x' } as never,
    });
    expect(result.valid).toBe(false);
    expect(result.reasons).toContain(CODES.invalidResource);
  });
});

describe('SM-10 / the builder reports, never throws, on an ordinary bad input', () => {
  it('returns a typed negative result for a malformed representation', () => {
    expect(tryBuildSovereignGovernanceHandoffV1({ representation: {} as never })).toEqual({
      valid: false,
      reasons: [CODES.invalidRepresentation],
    });
    expect(tryBuildSovereignGovernanceHandoffV1(undefined as never)).toEqual({
      valid: false,
      reasons: [CODES.invalidInput],
    });
  });

  it('returns a typed negative result for a blank tenant', () => {
    expect(
      tryBuildSovereignGovernanceHandoffV1({
        representation: emptyBundleFor(subjectFor(newId())),
        tenantId: '  ',
      }),
    ).toEqual({ valid: false, reasons: [CODES.invalidTenantId] });
  });
});

describe('SM-10 / structural validity is not policy sufficiency', () => {
  it('a subject-only representation with no manifests, claims or standings is handoff-capable', () => {
    const representation = emptyBundleFor(subjectFor(newId()));
    expect(representation.manifests).toEqual([]);
    expect(representation.claims).toEqual([]);
    expect(representation.standings).toEqual([]);

    const handoff = buildSovereignGovernanceHandoffV1({ representation });
    expect(isValidSovereignGovernanceHandoffV1(handoff)).toBe(true);
    expect(handoff.semantics.present.claimTypes).toEqual([]);
  });

  it('a Contested standing survives the projection untouched, with no verdict attached', () => {
    const subject = subjectFor(newId());
    const handoff = handoffFor(subject);
    expect(handoff.representation.standings).toHaveLength(1);
    expect(handoff.representation.standings[0].status).toBe(StandingStatus.Contested);
    expect(handoff.semantics.present.standingStatuses).toContain(StandingStatus.Contested);
    expect(canonicalizeJSON(handoff)).not.toMatch(/"(allow|deny|verdict|resolved|winner|precedence)"/);
  });
});

describe('SM-10 / the same architecture for every kind of subject (open world)', () => {
  const OPEN_WORLD = [
    ['a byte document', { namespace: 'filesystem', id: 'doc-1', locator: 'file:///docs/1.pdf' }],
    ['a physical painting', { namespace: 'museum-registry', id: 'painting-1874-impression' }],
    ['a plot of land', { namespace: 'land-registry', id: 'ES-28-0114-77', locator: 'cadastre://es/28/0114/77' }],
    ['an external token', { namespace: 'ethereum', id: '0xabc/17', locator: 'eip155:1/erc721:0xabc/17' }],
    ['an AI agent', { namespace: 'agent-fleet', id: 'agent-alpha-9' }],
    ['an API resource', { namespace: 'openapi', id: 'svc/orders/v3', locator: 'https://api.example/orders/v3' }],
    ['an alien-system object', { namespace: 'alien-system-v47', id: 'alien-92817', locator: 'future://p1/92817' }],
  ] as const;

  it.each(OPEN_WORLD)('%s projects through exactly the same architecture', (_label, reference) => {
    const id = newId();
    const handoff = handoffFor(subjectFor(id, reference));

    expect(Object.keys(handoff).sort()).toEqual([
      'canonicalizationProfile',
      'representation',
      'resource',
      'schemaVersion',
      'semantics',
      'subject',
    ]);
    expect(handoff.resource.kind).toBe(SOVEREIGN_GOVERNED_RESOURCE_KIND);
    expect(handoff.resource.id).toBe(id);
    expect(isValidSovereignGovernanceHandoffV1(handoff)).toBe(true);
  });

  it('every subject kind gets the identical resource kind and the identical key set', () => {
    const handoffs = OPEN_WORLD.map(([, reference]) => handoffFor(subjectFor(newId(), reference)));
    const kinds = new Set(handoffs.map((handoff) => handoff.resource.kind));
    expect([...kinds]).toEqual([SOVEREIGN_GOVERNED_RESOURCE_KIND]);

    const shapes = new Set(handoffs.map((handoff) => Object.keys(handoff).sort().join(',')));
    expect(shapes.size).toBe(1);

    const resourceShapes = new Set(handoffs.map((handoff) => Object.keys(handoff.resource).sort().join(',')));
    expect([...resourceShapes]).toEqual(['id,kind']);
  });

  it('the namespace is opaque — no branch reads it, so an unknown one behaves identically', () => {
    const known = handoffFor(subjectFor(newId(), { namespace: 'land-registry', id: 'x-1' }));
    const unknown = handoffFor(subjectFor(newId(), { namespace: 'namespace-nobody-has-written-yet', id: 'x-1' }));
    // Normalizes the two values that legitimately differ between any two
    // separately built representations — the minted id and the manifest's own
    // `createdAt` — plus the namespace string under test. Everything left is a
    // structural decision, and none of them may depend on the namespace.
    const shapeOf = (handoff: SovereignGovernanceHandoffV1, namespace: string): string =>
      canonicalizeJSON(handoff)
        .replace(/aoc:sovereign-asset:[0-9a-f-]{36}/g, '<id>')
        .replace(/"createdAt":"[^"]+"/g, '"createdAt":"<at>"')
        .split(namespace)
        .join('<namespace>');
    expect(shapeOf(unknown, 'namespace-nobody-has-written-yet')).toBe(shapeOf(known, 'land-registry'));
  });
});
