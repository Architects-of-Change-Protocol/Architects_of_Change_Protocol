"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION = void 0;
exports.validateSovereigntyInteroperabilityConsumerSupportV1 = validateSovereigntyInteroperabilityConsumerSupportV1;
exports.isValidSovereigntyInteroperabilityConsumerSupportV1 = isValidSovereigntyInteroperabilityConsumerSupportV1;
exports.buildSovereigntyInteroperabilityConsumerSupportV1 = buildSovereigntyInteroperabilityConsumerSupportV1;
const features_1 = require("./features");
const reason_codes_1 = require("./reason-codes");
exports.SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION = 'aoc-sovereignty-interoperability-support/1';
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
const compareStrings = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/**
 * Validates a consumer support declaration.
 *
 * ## Fails closed, and never cleans
 *
 * A support declaration is a machine-readable contract about understanding, and
 * a malformed one is not quietly repaired. Nothing here trims a blank entry,
 * drops an unrecognised artifact kind, coerces a value or deduplicates a
 * repeated one. Silently cleaning a dirty declaration would mean assessing
 * compatibility against a document the consumer never actually wrote, and
 * reporting the result as if it had.
 *
 * ## Duplicates are rejected, deliberately
 *
 * A list that says `['claim', 'claim']` is ambiguous input, not emphasis: it
 * usually means two sources of truth were concatenated, and the reader has no
 * way to know whether the duplication is harmless or evidence that one of the
 * two lists was the wrong one. Rejecting it is the fail-closed reading and
 * matches the SM-06 bundle's treatment of duplicate manifest versions, claim
 * ids and standing ids. Callers wanting normalization can build the declaration
 * with `buildSovereigntyInteroperabilityConsumerSupportV1`, which sorts and
 * deduplicates *their own* input before it becomes a contract.
 *
 * Sparse arrays fall out of the same rules rather than needing a special case:
 * a hole reads as `undefined`, which is not a valid entry of any of these
 * lists, and `aoc-canonical-json/1` would refuse it in any case.
 */
function validateSovereigntyInteroperabilityConsumerSupportV1(value) {
    const codes = reason_codes_1.SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
    const invalid = { valid: false, reasons: [codes.invalidConsumerSupport] };
    if (!isPlainObject(value))
        return invalid;
    if (!hasExactKeys(value, [
        'schemaVersion',
        'profile',
        'mediaTypes',
        'representationSchemaVersions',
        'canonicalizationProfiles',
        'artifactKinds',
        'claimTypes',
        'standingStatuses',
        'semanticTerms',
    ])) {
        return invalid;
    }
    if (value.schemaVersion !== exports.SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION)
        return invalid;
    const profile = value.profile;
    if (!isPlainObject(profile) || !hasExactKeys(profile, ['id', 'acceptedVersions']))
        return invalid;
    if (!isNonBlankString(profile.id))
        return invalid;
    if (!Array.isArray(profile.acceptedVersions))
        return invalid;
    const acceptedVersions = Array.from(profile.acceptedVersions);
    if (acceptedVersions.length === 0)
        return invalid;
    if (acceptedVersions.some((entry) => !isNonBlankString(entry)))
        return invalid;
    if (new Set(acceptedVersions).size !== acceptedVersions.length)
        return invalid;
    for (const key of ['mediaTypes', 'representationSchemaVersions', 'canonicalizationProfiles']) {
        const entries = value[key];
        if (!Array.isArray(entries))
            return invalid;
        const listed = Array.from(entries);
        if (listed.some((entry) => !isNonBlankString(entry)))
            return invalid;
        if (new Set(listed).size !== listed.length)
            return invalid;
    }
    for (const [key, isKnown] of [
        ['artifactKinds', features_1.isSovereigntyInteroperabilityArtifactKind],
        ['claimTypes', features_1.isInteroperableClaimType],
        ['standingStatuses', features_1.isInteroperableStandingStatus],
    ]) {
        const entries = value[key];
        if (!Array.isArray(entries))
            return invalid;
        const listed = Array.from(entries);
        // An unknown entry is rejected rather than ignored: a declaration naming a
        // feature this profile version has no meaning for is a declaration whose
        // author and reader disagree about the vocabulary, and continuing would
        // mean assessing against a vocabulary neither of them holds.
        if (listed.some((entry) => !isKnown(entry)))
            return invalid;
        if (new Set(listed).size !== listed.length)
            return invalid;
    }
    const semanticTerms = value.semanticTerms;
    if (!Array.isArray(semanticTerms))
        return invalid;
    const listedTerms = Array.from(semanticTerms);
    if (listedTerms.some((entry) => !(0, features_1.isValidInteroperabilitySemanticRequirement)(entry)))
        return invalid;
    const termKeys = listedTerms.map((entry) => (0, features_1.interoperabilitySemanticRequirementKey)(entry));
    if (new Set(termKeys).size !== termKeys.length)
        return invalid;
    return { valid: true, reasons: [] };
}
function isValidSovereigntyInteroperabilityConsumerSupportV1(value) {
    return validateSovereigntyInteroperabilityConsumerSupportV1(value).valid;
}
/**
 * Assembles a consumer support declaration from a caller's own lists.
 *
 * Copies, sorts and deduplicates the caller's arrays before freezing them, so
 * a declaration assembled from several sources becomes a single canonical
 * document instead of failing validation for duplication. This is normalization
 * of a caller's *input*, at the moment the caller chooses to normalize it —
 * quite different from a validator silently cleaning a finished contract that
 * arrived from somewhere else. The caller's arrays are never mutated.
 */
function buildSovereigntyInteroperabilityConsumerSupportV1(input) {
    const uniqueSorted = (values) => Object.freeze([...new Set(values)].sort(compareStrings));
    const semanticTerms = new Map();
    for (const requirement of input.semanticTerms ?? []) {
        semanticTerms.set((0, features_1.interoperabilitySemanticRequirementKey)(requirement), {
            namespace: requirement.namespace,
            termRef: requirement.termRef,
        });
    }
    const support = Object.freeze({
        schemaVersion: exports.SOVEREIGNTY_INTEROPERABILITY_SUPPORT_SCHEMA_VERSION,
        profile: Object.freeze({
            id: input.profile.id,
            acceptedVersions: uniqueSorted(input.profile.acceptedVersions),
        }),
        mediaTypes: uniqueSorted(input.mediaTypes),
        representationSchemaVersions: uniqueSorted(input.representationSchemaVersions),
        canonicalizationProfiles: uniqueSorted(input.canonicalizationProfiles),
        artifactKinds: uniqueSorted(input.artifactKinds),
        claimTypes: uniqueSorted(input.claimTypes),
        standingStatuses: uniqueSorted(input.standingStatuses),
        semanticTerms: Object.freeze([...semanticTerms.values()].sort(features_1.compareInteroperabilitySemanticRequirements)),
    });
    const validation = validateSovereigntyInteroperabilityConsumerSupportV1(support);
    if (!validation.valid) {
        throw new Error(`Invalid SovereigntyInteroperabilityConsumerSupportV1: ${validation.reasons.join(', ')}`);
    }
    return support;
}
