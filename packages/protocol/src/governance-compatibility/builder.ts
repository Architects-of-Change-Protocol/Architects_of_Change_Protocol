import { CANONICAL_JSON_PROFILE } from '../canonical';
import { tryBuildSovereigntyInteroperabilityDescriptorV1 } from '../interoperability';
import {
  validateSovereigntyPortabilityBundleV1,
  type SovereigntyPortabilityBundleV1,
} from '../portability';
import {
  SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION,
  type BuildSovereignGovernanceHandoffInput,
  type SovereignGovernanceHandoffBuildResult,
  type SovereignGovernanceHandoffV1,
} from './handoff';
import { SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES } from './reason-codes';
import { buildSovereignGovernanceResourceRef } from './resource';
import { validateSovereignGovernanceHandoffV1 } from './validation';

const codes = SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES;

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
 * Non-throwing handoff construction, for callers sitting on a boundary where a
 * malformed representation is an expected outcome rather than a programming
 * fault — the production AOC.GOVERNANCE_COMPATIBILITY capsule is exactly such a
 * caller, and it turns these reasons into an ordinary failed capability
 * outcome.
 *
 * ## Procedure
 *
 *   1. validate the representation with SM-06's own canonical validator;
 *   2. take the subject *from* the representation — never from the caller;
 *   3. project the governance resource from that subject;
 *   4. derive the semantics with SM-07's pure descriptor helper;
 *   5. compose the exact six-field handoff;
 *   6. validate the composed document;
 *   7. return it.
 *
 * ## What does not happen here
 *
 * No capability is invoked. `invokeSovereigntyCapability` is not called for
 * Portability, Interoperability or anything else: the *contracts* of those
 * minerals are reused as pure libraries, which is why this produces no nested
 * evidence receipt and no second invocation the caller did not ask for.
 * Composing minerals stays the caller's decision, visible in the caller's own
 * evidence. In particular a caller may prepare a handoff directly from a valid
 * representation without having run Interoperability first.
 *
 * Nothing is verified, hashed, minted, declared or adjudicated. No clock is
 * read and no id is generated, so the same representation and the same tenant
 * produce a byte-identical canonical handoff every time.
 *
 * The representation is carried by reference, not rebuilt: its claims, proofs,
 * standings and semantic refs are the caller's own objects, untouched, so
 * nothing inside it can be silently reordered, repaired or dropped on the way
 * to governance.
 */
export function tryBuildSovereignGovernanceHandoffV1(
  input: BuildSovereignGovernanceHandoffInput,
): SovereignGovernanceHandoffBuildResult {
  if (!isPlainObject(input)) {
    return { valid: false, reasons: [codes.invalidInput] };
  }

  const representationValidation = validateSovereigntyPortabilityBundleV1(input.representation);
  if (!representationValidation.valid) {
    return { valid: false, reasons: [codes.invalidRepresentation] };
  }
  const representation = input.representation as SovereigntyPortabilityBundleV1;

  // An explicitly supplied tenant is preserved exactly: not trimmed, not
  // lower-cased, not normalized. An absent one stays absent — there is no
  // `'default'`, no `'public'`, and no inference from the subject, the
  // registrant, the issuer or the environment.
  if (hasOwn(input, 'tenantId') && !isNonBlankString(input.tenantId)) {
    return { valid: false, reasons: [codes.invalidTenantId] };
  }
  const tenantId = input.tenantId;

  const resource = buildSovereignGovernanceResourceRef(
    representation.subject,
    tenantId === undefined ? undefined : { tenantId },
  );

  const described = tryBuildSovereigntyInteroperabilityDescriptorV1(representation);
  if (!described.valid) {
    return { valid: false, reasons: [codes.invalidRepresentation] };
  }

  const handoff: SovereignGovernanceHandoffV1 = Object.freeze({
    schemaVersion: SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION,
    canonicalizationProfile: CANONICAL_JSON_PROFILE,
    // The one subject, taken from the representation and shared by reference
    // with `representation.subject` and `semantics.subject`, so the three
    // cannot drift apart even in principle.
    subject: representation.subject,
    resource,
    representation,
    semantics: described.descriptor,
  });

  const validation = validateSovereignGovernanceHandoffV1(handoff);
  return validation.valid ? { valid: true, handoff } : { valid: false, reasons: validation.reasons };
}

/**
 * Builds a validated canonical governance handoff, throwing on a malformed
 * representation rather than projecting it partially — a construction helper,
 * not a lenient parser, matching `buildSovereigntyPortabilityBundleV1` and
 * `buildSovereigntyInteroperabilityDescriptorV1`.
 */
export function buildSovereignGovernanceHandoffV1(
  input: BuildSovereignGovernanceHandoffInput,
): SovereignGovernanceHandoffV1 {
  const result = tryBuildSovereignGovernanceHandoffV1(input);
  if (!result.valid) {
    throw new Error(`Invalid SovereignGovernanceHandoffV1 input: ${result.reasons.join(', ')}`);
  }
  return result.handoff;
}
