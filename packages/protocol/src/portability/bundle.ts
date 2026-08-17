import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '../canonical';
import { isValidCanonicalStanding } from '../claims/standing';
import type { CanonicalStanding } from '../claims/standing';
import {
  buildSovereignExternalReference,
  isValidSovereignSubjectRef,
  type SovereignSubjectRef,
} from '../identity';
import {
  isValidAuthorityClaim,
  isValidDerivationClaim,
  isValidOriginClaim,
  validateSovereignManifestV1,
  type AuthorityClaim,
  type DerivationClaim,
  type OriginClaim,
  type SignedClaim,
  type SignedSovereignManifest,
  type SovereignManifestV1,
  type SovereignProof,
} from '../manifest';

/**
 * The canonical AOC sovereign portability bundle — the smallest Protocol-owned
 * representation by which a sovereign subject's supplied sovereign artifacts
 * can leave one application/runtime, travel as data, and be reconstructed
 * somewhere else as *the same* sovereign representation.
 *
 * ## What portability means here
 *
 *     APPLICATION A ─► sovereign subject + supplied sovereign artifacts
 *                          │
 *                          ▼
 *                   PORTABILITY BUNDLE  ──(canonical JSON)──►  transport
 *                                                                  │
 *                                                                  ▼
 *     APPLICATION B ◄─ same SovereignAssetId, same supplied artifacts
 *
 * No reminting, no source provider, no source storage backend, no database, no
 * Enterprise, and no rewriting of the artifacts that were handed over.
 *
 * ## What it deliberately is not
 *
 * - **Not storage migration.** The bundle carries the sovereign
 *   *representation*, never the underlying content bytes. Moving a 500 MB video
 *   between providers is application/storage work; the sovereign record that
 *   describes it is what travels here.
 * - **Not a backup.** It is not a database dump, a filesystem snapshot, a
 *   provider export or a tenant archive.
 * - **Not interoperability.** It establishes one canonical AOC wire
 *   representation. Whether some *other* ecosystem can understand, map,
 *   translate or negotiate those semantics is a different question, and no
 *   external-standard mapping exists here.
 * - **Not verifiability.** Supplied signed artifacts are preserved byte-exact
 *   and are never verified, re-signed, re-digested or re-timestamped. A bundle
 *   that transports structurally intact but cryptographically invalid proof
 *   material is doing its job correctly.
 * - **Not integrity.** There is deliberately no `digest`, `hash` or `checksum`
 *   field. Integrity over a bundle is explicit mineral composition: serialize
 *   it, then hand the bytes to AOC.INTEGRITY.
 * - **Not identity.** Nothing here mints a `SovereignAssetId`. An existing one
 *   is transported.
 * - **Not provenance.** Exporting and importing creates no origin, authorship,
 *   derivation or custody assertion. Transport history is not sovereign
 *   provenance unless somebody asserts it through AOC.PROVENANCE.
 * - **Not ownership.** Possessing a bundle is possessing data. It conveys no
 *   title, custody, rights or authority over the subject it describes.
 *
 * ## What a bundle claims
 *
 * Exactly this: *these are the sovereign artifacts supplied in this bundle for
 * this subject.* It does not claim to be every artifact that exists — Protocol
 * has no global registry of manifests, claims or standing records and could not
 * know that — so there is deliberately no `complete` flag and no
 * partial/complete/archive profile enum.
 */
export const SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION = 'aoc-sovereignty-portability-bundle/1' as const;

export type SovereigntyPortabilityBundleSchemaVersion =
  typeof SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION;

/**
 * Stable, machine-readable reason codes the portability contract can report.
 *
 * One map, shared by the bundle validator, the parser and the production
 * capsule, so a consumer sees the same code for the same defect no matter which
 * surface reported it. The capsule extends this map with its own
 * operation-level codes rather than restating any of these.
 */
export const SOVEREIGNTY_PORTABILITY_REASON_CODES = Object.freeze({
  invalidBundle: 'PORTABILITY_INVALID_BUNDLE',
  invalidJson: 'PORTABILITY_INVALID_JSON',
  unsupportedBundleSchema: 'PORTABILITY_UNSUPPORTED_BUNDLE_SCHEMA',
  unsupportedCanonicalizationProfile: 'PORTABILITY_UNSUPPORTED_CANONICALIZATION_PROFILE',
  invalidSubject: 'PORTABILITY_INVALID_SUBJECT',
  invalidManifestArtifact: 'PORTABILITY_INVALID_MANIFEST_ARTIFACT',
  manifestSubjectMismatch: 'PORTABILITY_MANIFEST_SUBJECT_MISMATCH',
  duplicateManifestVersion: 'PORTABILITY_DUPLICATE_MANIFEST_VERSION',
  invalidClaimArtifact: 'PORTABILITY_INVALID_CLAIM_ARTIFACT',
  claimSubjectMismatch: 'PORTABILITY_CLAIM_SUBJECT_MISMATCH',
  duplicateClaimId: 'PORTABILITY_DUPLICATE_CLAIM_ID',
  invalidStanding: 'PORTABILITY_INVALID_STANDING',
  duplicateStandingId: 'PORTABILITY_DUPLICATE_STANDING_ID',
  danglingStandingClaimRef: 'PORTABILITY_DANGLING_STANDING_CLAIM_REF',
  unsupportedArtifactKind: 'PORTABILITY_UNSUPPORTED_ARTIFACT_KIND',
  canonicalizationFailed: 'PORTABILITY_CANONICALIZATION_FAILED',
} as const);

export type SovereigntyPortabilityReasonCode =
  (typeof SOVEREIGNTY_PORTABILITY_REASON_CODES)[keyof typeof SOVEREIGNTY_PORTABILITY_REASON_CODES];

/** The manifest artifact wrapper kinds this bundle version understands. */
export const PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS = Object.freeze([
  'manifest',
  'signed-manifest',
] as const);

export type PortableSovereignManifestArtifactKind =
  (typeof PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS)[number];

/** The claim artifact wrapper kinds this bundle version understands. */
export const PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS = Object.freeze(['claim', 'signed-claim'] as const);

export type PortableSovereignClaimArtifactKind =
  (typeof PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS)[number];

export interface PortableUnsignedSovereignManifestArtifact {
  readonly kind: 'manifest';
  readonly manifest: SovereignManifestV1;
}

/**
 * A signed manifest travels whole: `manifest`, `manifestDigest` and `proof` are
 * preserved exactly as supplied and are never flattened into the envelope,
 * recomputed, re-signed or re-timestamped. Flattening would destroy the very
 * thing a later verifier needs.
 */
export interface PortableSignedSovereignManifestArtifact {
  readonly kind: 'signed-manifest';
  readonly signedManifest: SignedSovereignManifest;
}

/**
 * Both canonical manifest states are portable, and neither is forced.
 * AOC.IDENTITY produces *unsigned* `SovereignManifestV1` records, while the
 * lower-level manifest primitives can produce signed ones — a transport that
 * demanded either would make an entire legitimate half of the Protocol
 * unportable.
 */
export type PortableSovereignManifestArtifact =
  | PortableUnsignedSovereignManifestArtifact
  | PortableSignedSovereignManifestArtifact;

/**
 * The sovereignty-facing claim union v1 transports: exactly the claim types
 * that participate in the production mineral architecture today.
 *
 * Deliberately not `CanonicalClaim` in general. There is no canonical runtime
 * validator for every current and future `CanonicalClaim` variant, so accepting
 * an arbitrary one at an external trust boundary would mean advertising an
 * understanding of semantics Protocol does not have. `ClaimType.Custom` is not
 * used as an escape hatch for that gap. A future additive bundle version can
 * widen this union once the validators exist.
 */
export type PortableSovereignClaim = OriginClaim | AuthorityClaim | DerivationClaim;

export interface PortableUnsignedSovereignClaimArtifact {
  readonly kind: 'claim';
  readonly claim: PortableSovereignClaim;
}

export interface PortableSignedSovereignClaimArtifact {
  readonly kind: 'signed-claim';
  readonly signedClaim: SignedClaim<PortableSovereignClaim>;
}

export type PortableSovereignClaimArtifact =
  | PortableUnsignedSovereignClaimArtifact
  | PortableSignedSovereignClaimArtifact;

/**
 * SovereigntyPortabilityBundleV1 — the canonical portable representation.
 *
 * Fields that are deliberately absent, and why:
 *
 * - **`bundleId`** — the bundle represents existing sovereign artifacts; it is
 *   not a new sovereign object. The subject's identity is already
 *   `SovereignAssetId`, and minting a second persistent identity layer for the
 *   envelope would create an id with no owner and no lifecycle.
 * - **`exportedAt`** — an automatic timestamp would make the same sovereign
 *   state serialize differently every time it left the building. *When* an
 *   export happened is recorded truthfully in the SM-03 invocation evidence;
 *   *what* was exported is this bundle, and it stays deterministic.
 * - **`digest` / `hash` / `bundleSignature`** — see the Integrity and
 *   Verifiability notes above.
 * - **`provider` / `storageUri` / `bucket` / `CID` / `region` / `tenantId` /
 *   `sourceApplication` / `destinationApplication`** — a bundle that named where
 *   it came from would be transport-history dependent and provider-coupled,
 *   which is the exact lock-in portability exists to remove. The one nested
 *   locator that does survive is `subject.externalReference.locator`, because it
 *   belongs to the canonical SM-02 subject model: it is preserved verbatim and
 *   never dereferenced, required, or treated as identity or transport.
 * - **`contentBytes`** — a building, an API resource, an agent or an external
 *   token may have no byte payload at all. Where bytes exist, `ContentIdentity`
 *   inside a supplied manifest already carries the integrity commitment.
 * - **`complete` / `containsFullHistory`** — see the bundle-claim note above.
 * - **`license` / `terms` / `policy` / `governanceContext` / ownership** — those
 *   are other minerals' contracts, not envelope metadata.
 */
export interface SovereigntyPortabilityBundleV1 {
  readonly schemaVersion: SovereigntyPortabilityBundleSchemaVersion;
  readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
  /**
   * The single identity anchor every artifact in the bundle is scoped to. This
   * is the canonical SM-02 `SovereignSubjectRef` itself — there is no parallel
   * "portable subject" model, because a second subject type is exactly how two
   * representations of one subject start to disagree.
   */
  readonly subject: SovereignSubjectRef;
  readonly manifests: readonly PortableSovereignManifestArtifact[];
  readonly claims: readonly PortableSovereignClaimArtifact[];
  readonly standings: readonly CanonicalStanding[];
}

export interface BuildSovereigntyPortabilityBundleV1Input {
  readonly subject: SovereignSubjectRef;
  readonly manifests?: readonly PortableSovereignManifestArtifact[];
  readonly claims?: readonly PortableSovereignClaimArtifact[];
  readonly standings?: readonly CanonicalStanding[];
}

/**
 * The result of checking *structural portability validity*.
 *
 * The field is `valid`, never `verified`. Nothing cryptographic happens in this
 * module, and a result that said "verified" would be claiming a property only
 * AOC.VERIFIABILITY can establish.
 */
export interface SovereigntyPortabilityBundleValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly SovereigntyPortabilityReasonCode[];
}

export type SovereigntyPortabilityBundleBuildResult =
  | { readonly valid: true; readonly bundle: SovereigntyPortabilityBundleV1 }
  | { readonly valid: false; readonly reasons: readonly SovereigntyPortabilityReasonCode[] };

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Exactly these keys, no more and no fewer.
 *
 * Applied only to the structures SM-06 itself owns and rebuilds — the bundle
 * envelope, the artifact wrappers, and the subject reference. Rejecting an
 * unrecognized field there is the honest alternative to silently dropping it
 * during envelope reconstruction, and silent loss is worse than a failed import
 * for a sovereignty transport.
 *
 * It is deliberately *not* applied to the nested artifacts — manifests, claims,
 * signed wrappers and standings belong to other layers, are carried by
 * reference and are never rebuilt, so nothing about them can be dropped and
 * their own validators' tolerance stays exactly as those layers defined it.
 */
function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => hasOwn(value, key));
}

/**
 * Structural shape of a `SovereignProof`, and nothing more.
 *
 * No digest is recomputed, no signature is checked, no key is resolved and no
 * timestamp is compared: doing any of that would pull AOC.INTEGRITY and
 * AOC.VERIFIABILITY inside AOC.PORTABILITY. This confirms only that the proof
 * material is *representable*, so that it can be carried across the boundary
 * intact and judged later by whoever is entitled to judge it.
 */
function isStructurallyRepresentableProof(value: unknown): value is SovereignProof {
  if (!isPlainObject(value)) return false;
  return (
    isNonBlankString(value.algorithm)
    && isNonBlankString(value.canonicalizationProfile)
    && isNonBlankString(value.keyId)
    && isNonBlankString(value.publicKey)
    && isNonBlankString(value.signature)
    && isNonBlankString(value.signedAt)
    && isNonBlankString(value.payloadHash)
  );
}

function isPortableSovereignClaimValue(value: unknown): value is PortableSovereignClaim {
  return isValidOriginClaim(value) || isValidAuthorityClaim(value) || isValidDerivationClaim(value);
}

/** The manifest a manifest artifact carries, whichever wrapper kind it uses. */
export function portableManifestOf(artifact: PortableSovereignManifestArtifact): SovereignManifestV1 {
  return artifact.kind === 'manifest' ? artifact.manifest : artifact.signedManifest.manifest;
}

/** The claim a claim artifact carries, whichever wrapper kind it uses. */
export function portableClaimOf(artifact: PortableSovereignClaimArtifact): PortableSovereignClaim {
  return artifact.kind === 'claim' ? artifact.claim : artifact.signedClaim.claim;
}

export function isPortableSovereignManifestArtifact(
  value: unknown,
): value is PortableSovereignManifestArtifact {
  if (!isPlainObject(value)) return false;
  if (value.kind === 'manifest') {
    return (
      hasExactKeys(value, ['kind', 'manifest'])
      && isPlainObject(value.manifest)
      && validateSovereignManifestV1(value.manifest as unknown as SovereignManifestV1).valid
    );
  }
  if (value.kind === 'signed-manifest') {
    if (!hasExactKeys(value, ['kind', 'signedManifest']) || !isPlainObject(value.signedManifest)) {
      return false;
    }
    const signed = value.signedManifest;
    return (
      isPlainObject(signed.manifest)
      && validateSovereignManifestV1(signed.manifest as unknown as SovereignManifestV1).valid
      && isNonBlankString(signed.manifestDigest)
      && isStructurallyRepresentableProof(signed.proof)
    );
  }
  return false;
}

export function isPortableSovereignClaimArtifact(value: unknown): value is PortableSovereignClaimArtifact {
  if (!isPlainObject(value)) return false;
  if (value.kind === 'claim') {
    return hasExactKeys(value, ['kind', 'claim']) && isPortableSovereignClaimValue(value.claim);
  }
  if (value.kind === 'signed-claim') {
    if (!hasExactKeys(value, ['kind', 'signedClaim']) || !isPlainObject(value.signedClaim)) {
      return false;
    }
    const signed = value.signedClaim;
    return (
      isPortableSovereignClaimValue(signed.claim)
      && isNonBlankString(signed.digest)
      && isStructurallyRepresentableProof(signed.proof)
    );
  }
  return false;
}

function isKnownManifestArtifactKind(value: unknown): boolean {
  return (
    isPlainObject(value)
    && (PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS as readonly unknown[]).includes(value.kind)
  );
}

function isKnownClaimArtifactKind(value: unknown): boolean {
  return (
    isPlainObject(value)
    && (PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS as readonly unknown[]).includes(value.kind)
  );
}

/**
 * The canonical subject reference, rebuilt through the SM-02 builders.
 *
 * The three opaque external-reference strings (`namespace`, `id`, `locator`) are
 * copied verbatim — never trimmed, normalized, lower-cased, URL-parsed,
 * scheme-checked or resolved. Rebuilding exists solely so a caller cannot hang
 * extra, non-canonicalizable properties off a reference and have them become
 * part of the wire representation; anything unrecognized was already rejected by
 * validation rather than dropped here.
 */
function toBundleSubject(subject: SovereignSubjectRef): SovereignSubjectRef {
  return Object.freeze({
    sovereignAssetId: subject.sovereignAssetId,
    ...(subject.externalReference === undefined
      ? {}
      : { externalReference: Object.freeze(buildSovereignExternalReference(subject.externalReference)) }),
  });
}

function isCanonicalBundleSubject(value: unknown): boolean {
  if (!isPlainObject(value) || !isValidSovereignSubjectRef(value)) return false;
  if (
    !hasExactKeys(value, hasOwn(value, 'externalReference') ? ['sovereignAssetId', 'externalReference'] : ['sovereignAssetId'])
  ) {
    return false;
  }
  const reference = value.externalReference;
  if (reference === undefined) return true;
  const referenceKeys = isPlainObject(reference) && hasOwn(reference, 'locator')
    ? ['namespace', 'id', 'locator']
    : ['namespace', 'id'];
  return isPlainObject(reference) && hasExactKeys(reference, referenceKeys);
}

/**
 * Lexicographic order under the runtime's own string comparison — the same
 * UTF-16 code-unit ordering `aoc-canonical-json/1` uses for object keys, so the
 * envelope's array ordering and its key ordering cannot disagree about what
 * "sorted" means. No locale-aware collation is involved: a locale-dependent
 * bundle would serialize differently on differently configured hosts.
 */
function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function collectDuplicates<T>(values: readonly T[]): boolean {
  return new Set(values).size !== values.length;
}

/**
 * Structural portability validity for a complete bundle value, suitable for use
 * at an external trust boundary.
 *
 * A structurally valid bundle means: a supported bundle schema and
 * canonicalization profile, a valid subject, recognized artifact kinds, valid
 * nested canonical structures, artifact/subject consistency, unique manifest
 * versions, unique claim ids, unique and valid standings whose `claimRef`
 * resolves inside the bundle, and a value `aoc-canonical-json/1` can serialize.
 *
 * It emphatically does **not** mean: signatures verified, claims historically
 * true, content bytes matching a `ContentIdentity`, evidence refs resolvable,
 * the bundle globally complete, the issuer's identity established, or ownership
 * proven. Every one of those is a different property owned by a different
 * mineral or by nobody at all.
 */
export function validateSovereigntyPortabilityBundleV1(
  value: unknown,
): SovereigntyPortabilityBundleValidationResult {
  const codes = SOVEREIGNTY_PORTABILITY_REASON_CODES;

  if (!isPlainObject(value)) {
    return { valid: false, reasons: [codes.invalidBundle] };
  }
  if (!hasExactKeys(value, ['schemaVersion', 'canonicalizationProfile', 'subject', 'manifests', 'claims', 'standings'])) {
    return { valid: false, reasons: [codes.invalidBundle] };
  }

  const reasons: SovereigntyPortabilityReasonCode[] = [];

  // An unknown *future* bundle version fails closed with an explicit reason. A
  // v1 importer pretending to understand `…/2` would be exactly the silent
  // semantic drift a versioned wire contract exists to prevent.
  if (value.schemaVersion !== SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION) {
    reasons.push(codes.unsupportedBundleSchema);
  }
  if (value.canonicalizationProfile !== CANONICAL_JSON_PROFILE) {
    reasons.push(codes.unsupportedCanonicalizationProfile);
  }
  if (!isCanonicalBundleSubject(value.subject)) {
    reasons.push(codes.invalidSubject);
  }

  const subjectId = isPlainObject(value.subject) ? value.subject.sovereignAssetId : undefined;

  const manifests = value.manifests;
  if (!Array.isArray(manifests)) {
    reasons.push(codes.invalidManifestArtifact);
  } else {
    const versions: number[] = [];
    for (const artifact of Array.from(manifests)) {
      if (!isKnownManifestArtifactKind(artifact)) {
        // A wrapper kind this version does not know is rejected outright rather
        // than skipped: silently ignoring an artifact loses sovereign material
        // without telling anyone it happened.
        reasons.push(codes.unsupportedArtifactKind);
        continue;
      }
      if (!isPortableSovereignManifestArtifact(artifact)) {
        reasons.push(codes.invalidManifestArtifact);
        continue;
      }
      const manifest = portableManifestOf(artifact);
      // Fails closed on mismatch; the manifest's own subject is never rewritten
      // to agree with the bundle.
      if (manifest.sovereignAssetId !== subjectId) {
        reasons.push(codes.manifestSubjectMismatch);
      }
      versions.push(manifest.manifestVersion);
    }
    // Across wrapper kinds: a signed wrapper already contains its manifest, so
    // the same version must not appear twice under two wrappers.
    if (collectDuplicates(versions)) {
      reasons.push(codes.duplicateManifestVersion);
    }
  }

  const claimIds: string[] = [];
  const claims = value.claims;
  if (!Array.isArray(claims)) {
    reasons.push(codes.invalidClaimArtifact);
  } else {
    for (const artifact of Array.from(claims)) {
      if (!isKnownClaimArtifactKind(artifact)) {
        reasons.push(codes.unsupportedArtifactKind);
        continue;
      }
      if (!isPortableSovereignClaimArtifact(artifact)) {
        reasons.push(codes.invalidClaimArtifact);
        continue;
      }
      const claim = portableClaimOf(artifact);
      if (claim.subject !== subjectId) {
        reasons.push(codes.claimSubjectMismatch);
      }
      claimIds.push(claim.id);
    }
    if (collectDuplicates(claimIds)) {
      reasons.push(codes.duplicateClaimId);
    }
  }

  const standings = value.standings;
  if (!Array.isArray(standings)) {
    reasons.push(codes.invalidStanding);
  } else {
    const standingIds: string[] = [];
    const includedClaimIds = new Set(claimIds);
    for (const standing of Array.from(standings)) {
      if (!isValidCanonicalStanding(standing)) {
        reasons.push(codes.invalidStanding);
        continue;
      }
      standingIds.push(standing.id);
      // A standing whose claim is not in the bundle is not self-contained
      // sovereign standing. Nothing is fetched to resolve it and nothing is
      // silently dropped — it is reported.
      if (!includedClaimIds.has(standing.claimRef)) {
        reasons.push(codes.danglingStandingClaimRef);
      }
    }
    if (collectDuplicates(standingIds)) {
      reasons.push(codes.duplicateStandingId);
    }
  }

  if (reasons.length === 0) {
    // The bundle has to be serializable under the one canonical profile. Caller
    // metadata carrying a `Date`, a `BigInt`, a function or an `undefined` fails
    // honestly here rather than being converted into some invented
    // representation that no other implementation would reproduce.
    try {
      canonicalizeJSON(value);
    } catch {
      reasons.push(codes.canonicalizationFailed);
    }
  }

  return { valid: reasons.length === 0, reasons };
}

export function isValidSovereigntyPortabilityBundleV1(
  value: unknown,
): value is SovereigntyPortabilityBundleV1 {
  return validateSovereigntyPortabilityBundleV1(value).valid;
}

/**
 * Assembles the canonical envelope: caller arrays are copied, never mutated,
 * and the copies are sorted into the canonical order.
 *
 * Ordering is deterministic and documented, so an equivalent artifact set
 * supplied in any input order produces one canonical serialization:
 *
 *   - `manifests`  by `manifestVersion` ascending
 *   - `claims`     by the underlying claim `id`, lexicographically
 *   - `standings`  by `id`, lexicographically
 *
 * Duplicates on all three keys are rejected by validation, so the order is
 * total and no arbitrary secondary key is invented to break ties.
 *
 * This normalizes the *envelope* and nothing inside it. Nested artifacts are
 * carried by reference: `evidenceRefs` are not sorted, `authorityClaims` inside
 * a historical manifest are not reordered, statements are not rewritten,
 * locators are not touched and proof timestamps are not changed. Portability
 * canonicalizes what it owns and preserves what it does not.
 */
function assembleBundle(input: BuildSovereigntyPortabilityBundleV1Input): SovereigntyPortabilityBundleV1 {
  const manifests = [...(input.manifests ?? [])].sort(
    (a, b) => portableManifestOf(a).manifestVersion - portableManifestOf(b).manifestVersion,
  );
  const claims = [...(input.claims ?? [])].sort((a, b) =>
    compareStrings(portableClaimOf(a).id, portableClaimOf(b).id),
  );
  const standings = [...(input.standings ?? [])].sort((a, b) => compareStrings(a.id, b.id));

  return Object.freeze({
    schemaVersion: SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
    canonicalizationProfile: CANONICAL_JSON_PROFILE,
    subject: toBundleSubject(input.subject),
    manifests: Object.freeze(manifests),
    claims: Object.freeze(claims),
    standings: Object.freeze(standings),
  });
}

/**
 * Non-throwing bundle construction, for callers sitting on a boundary where a
 * malformed artifact set is an expected outcome rather than a programming
 * fault — the production AOC.PORTABILITY capsule is exactly such a caller, and
 * it turns these reasons into an ordinary failed capability outcome.
 *
 * The input's own arrays are never mutated, and no nested artifact is ever
 * rewritten, re-signed, re-digested or repaired.
 */
export function tryBuildSovereigntyPortabilityBundleV1(
  input: BuildSovereigntyPortabilityBundleV1Input,
): SovereigntyPortabilityBundleBuildResult {
  const codes = SOVEREIGNTY_PORTABILITY_REASON_CODES;

  if (!isPlainObject(input)) {
    return { valid: false, reasons: [codes.invalidBundle] };
  }
  // The subject is checked before assembly because `toBundleSubject` rebuilds it
  // through a builder that throws on malformed input, and a bad subject must be
  // reported as a reason rather than as an exception.
  if (!isCanonicalBundleSubject(input.subject)) {
    return { valid: false, reasons: [codes.invalidSubject] };
  }
  for (const [artifacts, code] of [
    [input.manifests, codes.invalidManifestArtifact],
    [input.claims, codes.invalidClaimArtifact],
    [input.standings, codes.invalidStanding],
  ] as const) {
    if (artifacts !== undefined && !Array.isArray(artifacts)) {
      return { valid: false, reasons: [code] };
    }
  }
  // Assembly sorts by fields that only exist on well-formed artifacts, so the
  // artifact shapes are confirmed before anything is read off them.
  for (const artifact of Array.from(input.manifests ?? [])) {
    if (!isKnownManifestArtifactKind(artifact)) return { valid: false, reasons: [codes.unsupportedArtifactKind] };
    if (!isPortableSovereignManifestArtifact(artifact)) {
      return { valid: false, reasons: [codes.invalidManifestArtifact] };
    }
  }
  for (const artifact of Array.from(input.claims ?? [])) {
    if (!isKnownClaimArtifactKind(artifact)) return { valid: false, reasons: [codes.unsupportedArtifactKind] };
    if (!isPortableSovereignClaimArtifact(artifact)) {
      return { valid: false, reasons: [codes.invalidClaimArtifact] };
    }
  }
  for (const standing of Array.from(input.standings ?? [])) {
    if (!isValidCanonicalStanding(standing)) return { valid: false, reasons: [codes.invalidStanding] };
  }

  const bundle = assembleBundle(input);
  const validation = validateSovereigntyPortabilityBundleV1(bundle);
  return validation.valid ? { valid: true, bundle } : { valid: false, reasons: validation.reasons };
}

/**
 * Builds a validated canonical portability bundle, throwing on a malformed
 * artifact set rather than repairing it — a construction helper, not a lenient
 * parser, matching `buildSovereignManifestV1` and `buildDerivationClaim`.
 */
export function buildSovereigntyPortabilityBundleV1(
  input: BuildSovereigntyPortabilityBundleV1Input,
): SovereigntyPortabilityBundleV1 {
  const result = tryBuildSovereigntyPortabilityBundleV1(input);
  if (!result.valid) {
    throw new Error(`Invalid SovereigntyPortabilityBundleV1: ${result.reasons.join(', ')}`);
  }
  return result.bundle;
}
