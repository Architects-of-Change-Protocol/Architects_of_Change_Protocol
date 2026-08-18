"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION = void 0;
exports.tryBuildSovereigntyInteroperabilityDescriptorV1 = tryBuildSovereigntyInteroperabilityDescriptorV1;
exports.buildSovereigntyInteroperabilityDescriptorV1 = buildSovereigntyInteroperabilityDescriptorV1;
exports.validateSovereigntyInteroperabilityDescriptorV1 = validateSovereigntyInteroperabilityDescriptorV1;
exports.isValidSovereigntyInteroperabilityDescriptorV1 = isValidSovereigntyInteroperabilityDescriptorV1;
exports.presentInteroperabilityArtifactKinds = presentInteroperabilityArtifactKinds;
const portability_1 = require("../portability");
const features_1 = require("./features");
const profile_1 = require("./profile");
const reason_codes_1 = require("./reason-codes");
exports.SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION = 'aoc-sovereignty-interoperability-descriptor/1';
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
const sortedUnique = (values) => Object.freeze([...new Set(values)].sort(compareStrings));
/**
 * The semantic refs an embedded manifest assertion carries.
 *
 * A `SovereignManifestV1` may embed an `originClaim` and `authorityClaims`, and
 * those are ordinary `CanonicalClaim`s that can carry `semanticRefs`. Their
 * concepts have to be understood for the manifest to be understood, so they are
 * counted here.
 *
 * They are counted as *semantic requirements only*. They are never promoted
 * into `claimTypes` or `claimArtifactKinds`: an embedded assertion is part of
 * the manifest it belongs to, not a separately presented claim artifact, and
 * hoisting it would make the descriptor report claim artifacts the bundle does
 * not actually carry. Nothing is extracted from, moved out of, or written back
 * into the manifest — this is read-only inspection.
 */
const embeddedManifestClaimsOf = (manifest) => {
    const embedded = [];
    const { originClaim, authorityClaims } = manifest;
    if (originClaim !== undefined && originClaim !== null)
        embedded.push(originClaim);
    if (Array.isArray(authorityClaims)) {
        for (const claim of Array.from(authorityClaims)) {
            if (claim !== undefined && claim !== null)
                embedded.push(claim);
        }
    }
    return embedded;
};
/**
 * Describes one canonical portability bundle.
 *
 * ## What it does
 *
 * Validates the bundle with SM-06's own validator, inspects it without
 * mutation, extracts only semantic *presence* metadata, sorts everything
 * deterministically, and returns the descriptor.
 *
 * ## What it does not do
 *
 * It does not reimplement bundle validation — `@aoc/protocol/portability`'s
 * validator is the single source of what a valid bundle is, and a second copy
 * of those rules inside a describing layer would be a drift source. It does not
 * parse: a serialized bundle is turned into a bundle by the Portability parser,
 * outside this function, so there is no second JSON entry point into the
 * representation.
 *
 * Reusing the Portability *contract* this way is not hidden capability
 * execution: no `invokeSovereigntyCapability` call is made, the AOC.PORTABILITY
 * capsule is not constructed, and no evidence is produced here. Composing
 * minerals stays the caller's decision.
 *
 * The bundle is never mutated. Arrays are copied before sorting, nested
 * artifacts are only read, and the caller's `semanticRefs` are left exactly as
 * they are.
 */
function tryBuildSovereigntyInteroperabilityDescriptorV1(bundle) {
    const codes = reason_codes_1.SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
    const validation = (0, portability_1.validateSovereigntyPortabilityBundleV1)(bundle);
    if (!validation.valid) {
        return { valid: false, reasons: [codes.invalidBundle] };
    }
    const manifestArtifactKinds = [];
    const manifestVersions = [];
    const claimArtifactKinds = [];
    const claimTypes = [];
    const standingStatuses = [];
    const requirements = new Map();
    for (const artifact of bundle.manifests) {
        manifestArtifactKinds.push(artifact.kind);
        const manifest = (0, portability_1.portableManifestOf)(artifact);
        manifestVersions.push(manifest.manifestVersion);
        for (const embedded of embeddedManifestClaimsOf(manifest)) {
            (0, features_1.collectInteroperabilitySemanticRequirements)(embedded.semanticRefs, requirements);
        }
    }
    for (const artifact of bundle.claims) {
        claimArtifactKinds.push(artifact.kind);
        // The *underlying* claim, whether or not it arrived inside a signed
        // wrapper. Reading the claim's declared semantic type is not inspecting,
        // trusting or checking the proof that may sit beside it.
        const claim = (0, portability_1.portableClaimOf)(artifact);
        if ((0, features_1.isInteroperableClaimType)(claim.type))
            claimTypes.push(claim.type);
        (0, features_1.collectInteroperabilitySemanticRequirements)(claim.semanticRefs, requirements);
    }
    for (const standing of bundle.standings) {
        // Reported verbatim. A `Contested` standing is reported as contested; it is
        // not reinterpreted, weighted, or resolved in favour of anybody.
        if ((0, features_1.isInteroperableStandingStatus)(standing.status))
            standingStatuses.push(standing.status);
    }
    const descriptor = Object.freeze({
        schemaVersion: exports.SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION,
        profile: profile_1.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF,
        mediaType: profile_1.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
        subject: bundle.subject,
        representation: Object.freeze({
            schemaVersion: bundle.schemaVersion,
            canonicalizationProfile: bundle.canonicalizationProfile,
        }),
        present: Object.freeze({
            manifestArtifactKinds: sortedUnique(manifestArtifactKinds),
            manifestVersions: Object.freeze([...new Set(manifestVersions)].sort((a, b) => a - b)),
            claimArtifactKinds: sortedUnique(claimArtifactKinds),
            claimTypes: sortedUnique(claimTypes),
            standingStatuses: sortedUnique(standingStatuses),
            semanticRequirements: Object.freeze([...requirements.values()].sort(features_1.compareInteroperabilitySemanticRequirements)),
        }),
    });
    return { valid: true, descriptor };
}
/**
 * Describes a bundle, throwing on an invalid one rather than describing it
 * partially — a construction helper, not a lenient parser, matching
 * `buildSovereigntyPortabilityBundleV1`.
 */
function buildSovereigntyInteroperabilityDescriptorV1(bundle) {
    const result = tryBuildSovereigntyInteroperabilityDescriptorV1(bundle);
    if (!result.valid) {
        throw new Error(`Invalid SovereigntyPortabilityBundleV1: ${result.reasons.join(', ')}`);
    }
    return result.descriptor;
}
/**
 * Structural validation for a descriptor.
 *
 * A descriptor is produced deterministically here, but it is also exactly the
 * kind of document that crosses an external trust boundary: it is the thing a
 * receiving system is handed, may store, and may later feed back in to ask for
 * a compatibility assessment. Accepting `value as Descriptor` at that boundary
 * would let a malformed document become authoritative by assertion, which is
 * the same failure the SM-06 parser exists to prevent.
 */
function validateSovereigntyInteroperabilityDescriptorV1(value) {
    const codes = reason_codes_1.SOVEREIGNTY_INTEROPERABILITY_REASON_CODES;
    const invalid = { valid: false, reasons: [codes.invalidDescriptor] };
    if (!isPlainObject(value))
        return invalid;
    if (!hasExactKeys(value, ['schemaVersion', 'profile', 'mediaType', 'subject', 'representation', 'present'])) {
        return invalid;
    }
    // A future descriptor schema fails closed. A v1 reader pretending to
    // understand `.../2` is the silent semantic drift a versioned wire contract
    // exists to prevent.
    if (value.schemaVersion !== exports.SOVEREIGNTY_INTEROPERABILITY_DESCRIPTOR_SCHEMA_VERSION)
        return invalid;
    if (!(0, profile_1.isValidSovereigntyInteroperabilityProfileRef)(value.profile))
        return invalid;
    if (!isNonBlankString(value.mediaType))
        return invalid;
    // The subject is validated through SM-06's own bundle-subject rules by way of
    // a minimal, artifact-free bundle, so there is no second definition here of
    // what a canonical bundle subject is.
    if (!(0, portability_1.isValidSovereigntyPortabilityBundleV1)({
        schemaVersion: value.representation?.schemaVersion,
        canonicalizationProfile: value.representation
            ?.canonicalizationProfile,
        subject: value.subject,
        manifests: [],
        claims: [],
        standings: [],
    })) {
        return invalid;
    }
    const present = value.present;
    if (!isPlainObject(present))
        return invalid;
    if (!hasExactKeys(present, [
        'manifestArtifactKinds',
        'manifestVersions',
        'claimArtifactKinds',
        'claimTypes',
        'standingStatuses',
        'semanticRequirements',
    ])) {
        return invalid;
    }
    for (const [key, isKnown] of [
        ['manifestArtifactKinds', features_1.isSovereigntyInteroperabilityArtifactKind],
        ['claimArtifactKinds', features_1.isSovereigntyInteroperabilityArtifactKind],
        ['claimTypes', features_1.isInteroperableClaimType],
        ['standingStatuses', features_1.isInteroperableStandingStatus],
    ]) {
        const entries = present[key];
        if (!Array.isArray(entries))
            return invalid;
        const listed = Array.from(entries);
        if (listed.some((entry) => !isKnown(entry)))
            return invalid;
        if (new Set(listed).size !== listed.length)
            return invalid;
    }
    const versions = present.manifestVersions;
    if (!Array.isArray(versions))
        return invalid;
    const listedVersions = Array.from(versions);
    if (listedVersions.some((entry) => typeof entry !== 'number' || !Number.isInteger(entry)))
        return invalid;
    if (new Set(listedVersions).size !== listedVersions.length)
        return invalid;
    const semanticRequirements = present.semanticRequirements;
    if (!Array.isArray(semanticRequirements))
        return invalid;
    const listedRequirements = Array.from(semanticRequirements);
    if (listedRequirements.some((entry) => !(0, features_1.isValidInteroperabilitySemanticRequirement)(entry)))
        return invalid;
    const requirementKeys = listedRequirements.map((entry) => JSON.stringify([
        entry.namespace,
        entry.termRef,
    ]));
    if (new Set(requirementKeys).size !== requirementKeys.length)
        return invalid;
    return { valid: true, reasons: [] };
}
function isValidSovereigntyInteroperabilityDescriptorV1(value) {
    return validateSovereigntyInteroperabilityDescriptorV1(value).valid;
}
/**
 * The complete set of artifact kinds a described representation presents.
 *
 * Derived rather than stored, so it cannot disagree with the three per-artifact
 * lists it is derived from. `standing` appears exactly when the representation
 * carries at least one standing record: a consumer that does not understand
 * standing records at all needs to be told that as an artifact-level gap, not
 * only as a list of statuses it did not recognise.
 */
function presentInteroperabilityArtifactKinds(descriptor) {
    const kinds = [
        ...descriptor.present.manifestArtifactKinds,
        ...descriptor.present.claimArtifactKinds,
    ];
    if (descriptor.present.standingStatuses.length > 0)
        kinds.push('standing');
    return sortedUnique(kinds);
}
