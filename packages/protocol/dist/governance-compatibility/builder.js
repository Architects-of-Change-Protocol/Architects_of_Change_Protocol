"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryBuildSovereignGovernanceHandoffV1 = tryBuildSovereignGovernanceHandoffV1;
exports.buildSovereignGovernanceHandoffV1 = buildSovereignGovernanceHandoffV1;
const canonical_1 = require("../canonical");
const interoperability_1 = require("../interoperability");
const portability_1 = require("../portability");
const handoff_1 = require("./handoff");
const reason_codes_1 = require("./reason-codes");
const resource_1 = require("./resource");
const validation_1 = require("./validation");
const codes = reason_codes_1.SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES;
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
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
function tryBuildSovereignGovernanceHandoffV1(input) {
    if (!isPlainObject(input)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const representationValidation = (0, portability_1.validateSovereigntyPortabilityBundleV1)(input.representation);
    if (!representationValidation.valid) {
        return { valid: false, reasons: [codes.invalidRepresentation] };
    }
    const representation = input.representation;
    // An explicitly supplied tenant is preserved exactly: not trimmed, not
    // lower-cased, not normalized. An absent one stays absent — there is no
    // `'default'`, no `'public'`, and no inference from the subject, the
    // registrant, the issuer or the environment.
    if (hasOwn(input, 'tenantId') && !isNonBlankString(input.tenantId)) {
        return { valid: false, reasons: [codes.invalidTenantId] };
    }
    const tenantId = input.tenantId;
    const resource = (0, resource_1.buildSovereignGovernanceResourceRef)(representation.subject, tenantId === undefined ? undefined : { tenantId });
    const described = (0, interoperability_1.tryBuildSovereigntyInteroperabilityDescriptorV1)(representation);
    if (!described.valid) {
        return { valid: false, reasons: [codes.invalidRepresentation] };
    }
    const handoff = Object.freeze({
        schemaVersion: handoff_1.SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION,
        canonicalizationProfile: canonical_1.CANONICAL_JSON_PROFILE,
        // The one subject, taken from the representation and shared by reference
        // with `representation.subject` and `semantics.subject`, so the three
        // cannot drift apart even in principle.
        subject: representation.subject,
        resource,
        representation,
        semantics: described.descriptor,
    });
    const validation = (0, validation_1.validateSovereignGovernanceHandoffV1)(handoff);
    return validation.valid ? { valid: true, handoff } : { valid: false, reasons: validation.reasons };
}
/**
 * Builds a validated canonical governance handoff, throwing on a malformed
 * representation rather than projecting it partially — a construction helper,
 * not a lenient parser, matching `buildSovereigntyPortabilityBundleV1` and
 * `buildSovereigntyInteroperabilityDescriptorV1`.
 */
function buildSovereignGovernanceHandoffV1(input) {
    const result = tryBuildSovereignGovernanceHandoffV1(input);
    if (!result.valid) {
        throw new Error(`Invalid SovereignGovernanceHandoffV1 input: ${result.reasons.join(', ')}`);
    }
    return result.handoff;
}
