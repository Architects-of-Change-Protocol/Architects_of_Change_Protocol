import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '../canonical';
import { sovereignExternalReferencesEqual, type SovereignSubjectRef } from '../identity';
import {
  tryBuildSovereigntyInteroperabilityDescriptorV1,
  validateSovereigntyInteroperabilityDescriptorV1,
} from '../interoperability';
import {
  SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
  isValidSovereigntyPortabilityBundleV1,
  validateSovereigntyPortabilityBundleV1,
  type SovereigntyPortabilityBundleV1,
} from '../portability';
import {
  SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION,
  type SovereignGovernanceHandoffV1,
  type SovereignGovernanceHandoffValidationResult,
} from './handoff';
import {
  SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES,
  type SovereignGovernanceCompatibilityReasonCode,
} from './reason-codes';
import { SOVEREIGN_GOVERNED_RESOURCE_KIND } from './resource';

const codes = SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES;

const HANDOFF_KEYS = Object.freeze([
  'schemaVersion',
  'canonicalizationProfile',
  'subject',
  'resource',
  'representation',
  'semantics',
] as const);

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => hasOwn(value, key));
}

/**
 * Exact equality of two subject references, under SM-02 semantics.
 *
 * Two references naming the same `SovereignAssetId` under different external
 * references — or one with an external reference and one without — are not
 * equal, and that inequality is the point. A handoff that said "close enough"
 * would silently reconcile a reference change nobody asked it to reconcile,
 * and hand governance a subject that is not quite the one the representation
 * is about. SM-02's own `sovereignExternalReferencesEqual` is reused for the
 * reference half rather than restating its rules, so `namespace`, `id` and an
 * optional `locator` are all compared exactly once, in one place.
 */
export function sovereignGovernanceSubjectsEqual(a: SovereignSubjectRef, b: SovereignSubjectRef): boolean {
  if (a.sovereignAssetId !== b.sovereignAssetId) return false;
  if (a.externalReference === undefined || b.externalReference === undefined) {
    return a.externalReference === b.externalReference;
  }
  return sovereignExternalReferencesEqual(a.externalReference, b.externalReference);
}

/**
 * The canonical bundle-subject rules, applied without restating them.
 *
 * SM-06 already defines exactly what a canonical subject looks like inside a
 * sovereign representation — including that unrecognized properties are
 * rejected rather than dropped. Running that validator over a minimal,
 * artifact-free bundle reuses those rules verbatim, exactly as the SM-07
 * descriptor validator does, instead of creating a second definition of
 * "canonical subject" that is free to drift.
 */
function isCanonicalHandoffSubject(value: unknown): boolean {
  return isValidSovereigntyPortabilityBundleV1({
    schemaVersion: SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
    canonicalizationProfile: CANONICAL_JSON_PROFILE,
    subject: value,
    manifests: [],
    claims: [],
    standings: [],
  });
}

/**
 * Structural validity of the governance `ResourceRef` this document owns.
 *
 * The projection is fixed, so validation is the same statement read backwards:
 * the kind is the one generic sovereign kind, the id is the subject's
 * `SovereignAssetId`, a tenant is present only if it is a real one, and there
 * are no attributes. Nothing is repaired — a resource that points somewhere
 * else is reported, never rewritten to agree with the subject, because
 * rewriting it would silently re-target whatever policy is keyed to it.
 */
function collectResourceReasons(
  value: unknown,
  subject: SovereignSubjectRef | undefined,
  push: (code: SovereignGovernanceCompatibilityReasonCode) => void,
): void {
  if (!isPlainObject(value)) {
    push(codes.invalidResource);
    return;
  }
  if (hasOwn(value, 'attributes')) {
    push(codes.resourceAttributesNotSupported);
  }
  const expectedKeys = hasOwn(value, 'tenantId') ? ['kind', 'id', 'tenantId'] : ['kind', 'id'];
  if (!hasExactKeys(value, expectedKeys)) {
    // Covers a missing `kind`/`id` and any unrecognized extra field — an owner,
    // a scope, a classification, a risk score. Fails closed rather than
    // ignoring it: silently dropping a field somebody put on a governance
    // handle is worse than refusing the document.
    push(codes.invalidResource);
  }
  if (value.kind !== SOVEREIGN_GOVERNED_RESOURCE_KIND) {
    push(codes.resourceKindMismatch);
  }
  if (!isNonBlankString(value.id)) {
    push(codes.invalidResource);
  } else if (subject !== undefined && value.id !== subject.sovereignAssetId) {
    push(codes.resourceIdMismatch);
  }
  if (hasOwn(value, 'tenantId') && !isNonBlankString(value.tenantId)) {
    // Non-blank is the whole of it. The tenant is not looked up, membership is
    // not checked, and no Enterprise or registry is contacted: the Protocol has
    // no basis for knowing whether a tenant exists, and pretending to check
    // would be a governance claim.
    push(codes.invalidTenantId);
  }
}

/**
 * Structural validity for a complete governance handoff value, suitable for use
 * at an external trust boundary.
 *
 * ## What it proves
 *
 * A supported handoff schema and canonicalization profile; a canonical subject;
 * a structurally valid SM-06 representation, checked with SM-06's own
 * validator; a governance resource that projects from that subject; an SM-07
 * descriptor that is well-formed *and* is exactly the canonical descriptor of
 * the representation it travels with; and one subject shared by all three.
 *
 * ## What it deliberately does not prove
 *
 * It runs no cryptographic verification, no licensing evaluation, no provenance
 * adjudication, no identity minting and no content hashing, and it invokes no
 * other capability. A handoff carrying a tampered signature, a contested
 * standing or a permission and a restriction over the same action is
 * structurally valid — those are sovereign facts governance may need, not
 * defects. An external system may refuse such a handoff under policy; the
 * Protocol must not refuse it under structure.
 *
 * Pure, deterministic, and non-mutating: the candidate value is only read.
 */
export function validateSovereignGovernanceHandoffV1(
  value: unknown,
): SovereignGovernanceHandoffValidationResult {
  if (!isPlainObject(value)) {
    return { valid: false, reasons: [codes.invalidHandoff] };
  }
  if (!hasExactKeys(value, HANDOFF_KEYS)) {
    // A closed envelope. `policy`, `decision`, `grant`, `owner`, `authority`,
    // `status`, `approval` and `governanceReady` are all rejected here, by
    // rejecting *any* unknown top-level field rather than by maintaining a
    // denylist of the governance concepts somebody might try to add.
    return { valid: false, reasons: [codes.invalidHandoff] };
  }

  const seen = new Set<SovereignGovernanceCompatibilityReasonCode>();
  const push = (code: SovereignGovernanceCompatibilityReasonCode): void => {
    seen.add(code);
  };

  // An unknown *future* handoff version fails closed. A v1 reader pretending to
  // understand `.../2` is exactly the silent semantic drift a versioned wire
  // contract exists to prevent, and there is no fallback.
  if (value.schemaVersion !== SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION) {
    push(codes.unsupportedHandoffSchema);
  }
  if (value.canonicalizationProfile !== CANONICAL_JSON_PROFILE) {
    push(codes.unsupportedCanonicalizationProfile);
  }

  const subjectValid = isCanonicalHandoffSubject(value.subject);
  if (!subjectValid) push(codes.invalidSubject);
  const subject = subjectValid ? (value.subject as SovereignSubjectRef) : undefined;

  const representationValidation = validateSovereigntyPortabilityBundleV1(value.representation);
  if (!representationValidation.valid) push(codes.invalidRepresentation);
  const representation = representationValidation.valid
    ? (value.representation as SovereigntyPortabilityBundleV1)
    : undefined;

  collectResourceReasons(value.resource, subject, push);

  if (
    subject !== undefined
    && representation !== undefined
    && !sovereignGovernanceSubjectsEqual(subject, representation.subject)
  ) {
    push(codes.subjectMismatch);
  }

  const semanticsValid = validateSovereigntyInteroperabilityDescriptorV1(value.semantics).valid;
  if (!semanticsValid) push(codes.invalidSemantics);

  if (semanticsValid && subject !== undefined) {
    const semanticsSubject = (value.semantics as { readonly subject: SovereignSubjectRef }).subject;
    if (!sovereignGovernanceSubjectsEqual(subject, semanticsSubject)) {
      push(codes.subjectMismatch);
    }
  }

  // The load-bearing check: the descriptor must be *the* canonical descriptor
  // of this representation, not merely a valid descriptor about the same
  // subject. A document describing `Origin` only, travelling beside a
  // representation that also carries a derivation, contested standing and
  // license terms, would hand a governance engine a materially incomplete
  // picture of what it was given while looking entirely well-formed.
  //
  // The expected descriptor is derived with SM-07's own pure helper rather than
  // by a second semantic scanner living here, and compared under the one
  // canonical JSON profile so ordering and key ordering cannot disagree.
  if (semanticsValid && representation !== undefined) {
    const expected = tryBuildSovereigntyInteroperabilityDescriptorV1(representation);
    if (!expected.valid) {
      push(codes.invalidRepresentation);
    } else {
      try {
        if (canonicalizeJSON(expected.descriptor) !== canonicalizeJSON(value.semantics)) {
          push(codes.semanticsMismatch);
        }
      } catch {
        // A descriptor that passes shape validation but cannot be serialized
        // under `aoc-canonical-json/1` is not a document that can cross a wire.
        push(codes.invalidSemantics);
      }
    }
  }

  const reasons = [...seen];
  return { valid: reasons.length === 0, reasons };
}

export function isValidSovereignGovernanceHandoffV1(
  value: unknown,
): value is SovereignGovernanceHandoffV1 {
  return validateSovereignGovernanceHandoffV1(value).valid;
}
