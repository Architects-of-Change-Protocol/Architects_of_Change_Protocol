import { isValidSovereignAssetId } from './sovereign-asset-id';
import type { SovereignAssetId } from './sovereign-asset-id';

/**
 * SovereignExternalReference — how some *other* namespace refers to the
 * sovereign subject. See `docs/architecture/sovereign-asset-core.md` §15.
 *
 * This is deliberately the smallest truthful generic reference, and it is
 * NOT an alternate identity:
 *
 *   SovereignAssetId != externalReference.namespace
 *   SovereignAssetId != externalReference.id
 *   SovereignAssetId != externalReference.locator
 *
 * `namespace` tells a consumer which external identifier namespace owns
 * `id`. `id` is opaque *inside* that namespace — Protocol never parses,
 * normalizes, or derives domain meaning from it. `locator` optionally
 * records where/how the thing may currently be addressed.
 *
 * The namespace set is open-world by design: there is no
 * `ExternalReferenceKind` enum and no per-domain branch anywhere in
 * Protocol, so a file catalog, an agent network, a token network, a
 * property registry, and a namespace nobody has invented yet are all
 * representable without a Protocol code change.
 *
 * Protocol deliberately does NOT:
 * - understand or register the namespace;
 * - parse domain semantics out of `id`;
 * - dereference, resolve, probe, or otherwise perform any I/O against
 *   `locator` (see §13 of the SM-02 brief — locators are passive signed
 *   metadata, which is also what keeps this contract free of SSRF and
 *   provider coupling);
 * - assert that the referenced external object exists;
 * - treat `locator` as authority or `id` as legal ownership (see
 *   `registrant` and `AuthorityClaim` for who acted and what was
 *   asserted);
 * - derive `SovereignAssetId` from any of these values.
 *
 * A signature over a manifest carrying an external reference proves the
 * signer signed *this binding* — nothing about the external object's
 * existence, reachability, ownership, or the external namespace's
 * agreement.
 */
export interface SovereignExternalReference {
  /** Which external identifier namespace owns `id`. Opaque, open-world, non-empty. */
  readonly namespace: string;
  /** The opaque identifier inside `namespace`. Never parsed or rewritten by Protocol. */
  readonly id: string;
  /** Optional passive addressing hint. Never dereferenced by Protocol. */
  readonly locator?: string;
}

/**
 * SovereignSubjectRef — the universal Protocol-level reference to a
 * sovereign subject: what it is in AOC sovereignty space
 * (`sovereignAssetId`), plus optionally how another namespace refers to it
 * (`externalReference`).
 *
 * Integrity is deliberately absent. `ContentIdentity` describes the
 * integrity state of *one content representation* of a subject, which is a
 * separate question from which subject this is — so a sovereign subject
 * reference must never require one. A subject with no byte representation
 * at all (an AI agent, an API resource, an external token, a building, an
 * object from a system that does not exist yet) is a first-class subject
 * here, not a special case.
 *
 * This is a general Protocol subject reference, not a manifest field
 * group: `SovereignManifestV1` (`@aoc/protocol/manifest`) extends it, and
 * later work packages that need to name a sovereign subject — capability
 * invocation, a governance bundle — reuse this same type without knowing
 * what kind of thing the subject is.
 */
export interface SovereignSubjectRef {
  readonly sovereignAssetId: SovereignAssetId;
  readonly externalReference?: SovereignExternalReference;
}

export interface SovereignExternalReferenceValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly string[];
}

export interface BuildSovereignExternalReferenceInput {
  readonly namespace: string;
  readonly id: string;
  readonly locator?: string;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * Non-empty after trimming, but never trimmed in place: an externally
 * meaningful identifier must survive Protocol untouched (leading/trailing
 * characters can be significant in a namespace we do not understand), so
 * this rejects blank values instead of silently rewriting them. The
 * `trim()`-based emptiness rule matches the existing repository precedent
 * in `capability/capabilityToken.ts` and `consent/consentObject.ts`.
 */
function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Deliberately minimal structural validation. Protocol validates *shape*,
 * never external semantics: no URL/URI syntax, no DID, no UUID, no
 * SHA-256, no CID, no blockchain-address form, no HTTP(S) scheme, no
 * known-provider list, and no known-namespace list is required or
 * checked. Unknown and future namespaces are valid by construction.
 *
 * An optional field that is present-but-`undefined` is reported as
 * invalid rather than accepted: `aoc-canonical-json/1`
 * (`@aoc/protocol/canonical`) refuses to serialize `undefined`, so an
 * absent optional field must be structurally omitted for the reference to
 * be signable at all.
 */
export function validateSovereignExternalReference(value: unknown): SovereignExternalReferenceValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, reasons: ['INVALID_EXTERNAL_REFERENCE_STRUCTURE'] };
  }

  const reasons: string[] = [];
  const candidate = value as Partial<SovereignExternalReference>;

  if (!isNonBlankString(candidate.namespace)) {
    reasons.push('INVALID_EXTERNAL_REFERENCE_NAMESPACE');
  }

  if (!isNonBlankString(candidate.id)) {
    reasons.push('INVALID_EXTERNAL_REFERENCE_ID');
  }

  if (hasOwn(candidate, 'locator') && !isNonBlankString(candidate.locator)) {
    reasons.push('INVALID_EXTERNAL_REFERENCE_LOCATOR');
  }

  return { valid: reasons.length === 0, reasons };
}

export function isValidSovereignExternalReference(value: unknown): value is SovereignExternalReference {
  return validateSovereignExternalReference(value).valid;
}

/**
 * Builds a validated external reference, omitting `locator` structurally
 * when it was not supplied (never emitting `locator: undefined`). Throws
 * rather than repairing malformed input — this is a construction helper,
 * not a lenient parser, and it never rewrites the values it accepts.
 */
export function buildSovereignExternalReference(
  input: BuildSovereignExternalReferenceInput,
): SovereignExternalReference {
  const reference: SovereignExternalReference = {
    namespace: input.namespace,
    id: input.id,
    ...(input.locator === undefined ? {} : { locator: input.locator }),
  };

  const validation = validateSovereignExternalReference(reference);
  if (!validation.valid) {
    throw new Error(`Invalid SovereignExternalReference: ${validation.reasons.join(', ')}`);
  }

  return reference;
}

/**
 * Structural check for a subject reference. A `SovereignAssetId` alone is
 * a complete, valid subject reference — `externalReference` is optional
 * and `ContentIdentity` is not part of this contract at all.
 */
export function isValidSovereignSubjectRef(value: unknown): value is SovereignSubjectRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<SovereignSubjectRef>;
  if (!isValidSovereignAssetId(candidate.sovereignAssetId)) {
    return false;
  }
  if (hasOwn(candidate, 'externalReference') && !isValidSovereignExternalReference(candidate.externalReference)) {
    return false;
  }
  return true;
}

/**
 * Exact structural equality of two external references. Two references
 * that share a namespace and id but differ in `locator` are NOT equal —
 * they are the same external thing at a different address, which is
 * precisely the distinction the sovereign model has to keep visible.
 * This compares references; it never decides that two references denote
 * the same real-world object.
 */
export function sovereignExternalReferencesEqual(
  a: SovereignExternalReference,
  b: SovereignExternalReference,
): boolean {
  return a.namespace === b.namespace && a.id === b.id && a.locator === b.locator;
}

/**
 * Narrows anything that already carries the canonical subject fields
 * (notably a `SovereignManifestV1`) to a bare `SovereignSubjectRef`, so a
 * consumer can pass "which sovereign subject this is" around without
 * carrying integrity material, claims, or manifest metadata with it.
 * `externalReference` is omitted structurally when absent, keeping the
 * result canonicalizable.
 */
export function toSovereignSubjectRef(subject: SovereignSubjectRef): SovereignSubjectRef {
  return {
    sovereignAssetId: subject.sovereignAssetId,
    ...(subject.externalReference === undefined ? {} : { externalReference: subject.externalReference }),
  };
}
