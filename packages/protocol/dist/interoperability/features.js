"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEROPERABLE_STANDING_STATUSES = exports.INTEROPERABLE_CLAIM_TYPES = exports.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS = void 0;
exports.isSovereigntyInteroperabilityArtifactKind = isSovereigntyInteroperabilityArtifactKind;
exports.isInteroperableClaimType = isInteroperableClaimType;
exports.isInteroperableStandingStatus = isInteroperableStandingStatus;
exports.isValidInteroperabilitySemanticRequirement = isValidInteroperabilitySemanticRequirement;
exports.compareInteroperabilitySemanticRequirements = compareInteroperabilitySemanticRequirements;
exports.interoperabilitySemanticRequirementKey = interoperabilitySemanticRequirementKey;
exports.collectInteroperabilitySemanticRequirements = collectInteroperabilitySemanticRequirements;
const claim_enums_1 = require("../claims/claim-enums");
const portability_1 = require("../portability");
exports.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS = Object.freeze([
    ...portability_1.PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
    ...portability_1.PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
    'standing',
].sort());
/**
 * The claim semantics the current representation profile can describe.
 *
 * Exactly the three `ClaimType` members `PortableSovereignClaim` transports, in
 * canonical (lexicographic) order. Deliberately not every `ClaimType`: the
 * bundle has no runtime validator for the other variants, so advertising them
 * would claim an understanding Protocol does not have — and `ClaimType.Custom`
 * is not used as a disguise for that gap. A future additive profile version can
 * widen this list once those validators exist.
 */
exports.INTEROPERABLE_CLAIM_TYPES = Object.freeze([
    claim_enums_1.ClaimType.Authorship,
    claim_enums_1.ClaimType.Derivation,
    claim_enums_1.ClaimType.Origin,
]);
/**
 * Every canonical `StandingStatus`, in canonical (lexicographic) order.
 *
 * The whole enum is interoperable because a standing record's status is an
 * ordinary closed vocabulary the SM-06 bundle validator already accepts in full
 * — unlike claims, there is no per-status validator gap to be honest about.
 */
exports.INTEROPERABLE_STANDING_STATUSES = Object.freeze([...Object.values(claim_enums_1.StandingStatus)].sort());
const ARTIFACT_KINDS = new Set(exports.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS);
const CLAIM_TYPES = new Set(exports.INTEROPERABLE_CLAIM_TYPES);
const STANDING_STATUSES = new Set(exports.INTEROPERABLE_STANDING_STATUSES);
function isSovereigntyInteroperabilityArtifactKind(value) {
    return typeof value === 'string' && ARTIFACT_KINDS.has(value);
}
function isInteroperableClaimType(value) {
    return typeof value === 'string' && CLAIM_TYPES.has(value);
}
function isInteroperableStandingStatus(value) {
    return typeof value === 'string' && STANDING_STATUSES.has(value);
}
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
function hasExactKeys(value, keys) {
    const actual = Object.keys(value);
    return actual.length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}
function isValidInteroperabilitySemanticRequirement(value) {
    return (isPlainObject(value)
        && hasExactKeys(value, ['namespace', 'termRef'])
        && isNonBlankString(value.namespace)
        && isNonBlankString(value.termRef));
}
/**
 * Total order over semantic requirements: namespace first, then term.
 *
 * Explicit rather than incidental. A `Set` insertion order or an object key
 * order would make the public output of a descriptor depend on the order a
 * caller happened to supply artifacts in, which is exactly the kind of
 * accidental non-determinism a wire contract cannot afford.
 */
function compareInteroperabilitySemanticRequirements(a, b) {
    if (a.namespace !== b.namespace)
        return a.namespace < b.namespace ? -1 : 1;
    if (a.termRef !== b.termRef)
        return a.termRef < b.termRef ? -1 : 1;
    return 0;
}
/** Stable key for concept identity, used only to deduplicate inside a builder. */
function interoperabilitySemanticRequirementKey(requirement) {
    return JSON.stringify([requirement.namespace, requirement.termRef]);
}
/**
 * Collects the distinct semantic *concepts* referenced by a set of refs.
 *
 * Read-only: the supplied refs are never sorted in place, rewritten or
 * resolved, and their `id` and `metadata` are deliberately dropped — carrying
 * an occurrence id into a compatibility requirement would make two consumers
 * that understand the very same concept disagree over an accident of labelling.
 *
 * A malformed ref is skipped rather than reported. Semantic refs are optional
 * decoration on artifacts the SM-06 validator has already accepted, and the
 * descriptor's job is to report the concepts a representation *does* require,
 * not to re-adjudicate the validity of artifacts Portability admitted.
 */
function collectInteroperabilitySemanticRequirements(refs, into) {
    if (!Array.isArray(refs))
        return;
    for (const ref of Array.from(refs)) {
        if (!isPlainObject(ref) || !isNonBlankString(ref.namespace) || !isNonBlankString(ref.termRef))
            continue;
        const requirement = {
            namespace: ref.namespace,
            termRef: ref.termRef,
        };
        into.set(interoperabilitySemanticRequirementKey(requirement), requirement);
    }
}
