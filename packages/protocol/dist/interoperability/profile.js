"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1 = exports.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION = exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID = exports.SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION = void 0;
exports.isValidSovereigntyInteroperabilityProfileRef = isValidSovereigntyInteroperabilityProfileRef;
exports.isValidSovereigntyInteroperabilityProfileV1 = isValidSovereigntyInteroperabilityProfileV1;
const canonical_1 = require("../canonical");
const portability_1 = require("../portability");
const features_1 = require("./features");
const vocabulary_1 = require("./vocabulary");
/** Wire structure version of the interoperability *profile document* itself. */
exports.SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION = 'aoc-sovereignty-interoperability-profile/1';
/**
 * Stable identity of the canonical AOC representation profile.
 *
 * A profile id names a *family of semantics*, not a package and not a module.
 * `@aoc/protocol/interoperability#SovereigntyInteroperabilityProfileV1` is a
 * developer-facing fact about where the TypeScript lives; it is deliberately
 * not the wire identity, because a wire contract that depended on a module path
 * would break the moment the code was reorganised and would be meaningless to
 * a consumer that is not written in TypeScript.
 */
exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID = 'aoc:interoperability-profile:sovereignty-portability';
/**
 * Version of the canonical profile's *meaning*.
 *
 * Deliberately not the npm package version. The package version moves whenever
 * any part of `@aoc/protocol` changes; the semantics an external system
 * negotiates against must only move when those semantics do. Tying them
 * together would force every consumer to renegotiate after a documentation
 * release.
 */
exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION = '1.0.0';
/**
 * The media type by which the canonical AOC portability representation
 * identifies itself to another system.
 *
 * This is an **AOC Protocol media-type identifier**. It is not registered with
 * IANA, and this constant makes no claim that it is; if such a registration
 * ever exists it will be recorded where registrations are recorded, not
 * implied by a string here. Its purpose is to let a receiving system name the
 * representation it is holding during negotiation.
 *
 * It is descriptive metadata and nothing more. Protocol performs no HTTP
 * content negotiation, sets no header, reads no header and ships no server.
 */
exports.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE = 'application/vnd.aoc.sovereignty-portability+json';
/**
 * The one canonical AOC interoperability profile.
 *
 * A frozen constant rather than something a builder assembles per invocation:
 * the semantics of the representation family do not depend on who is asking,
 * when, or what is installed. There is no clock here, no environment
 * inspection, no capability discovery and no registry — and no
 * `registerProfile` / `findProfile` / profile marketplace either. SM-07 needs
 * exactly one profile; generalising to many before a second one exists would be
 * inventing a lookup problem the Protocol does not have.
 *
 * The representation constants are imported from SM-06 and SM-02's canonical
 * JSON profile rather than re-typed as literals, so the profile cannot describe
 * a bundle schema the bundle no longer uses.
 */
exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1 = Object.freeze({
    schemaVersion: exports.SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION,
    id: exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID,
    version: exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION,
    mediaType: exports.AOC_SOVEREIGNTY_PORTABILITY_MEDIA_TYPE,
    representation: Object.freeze({
        schemaVersion: portability_1.SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION,
        canonicalizationProfile: canonical_1.CANONICAL_JSON_PROFILE,
    }),
    artifactKinds: features_1.SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
    manifestArtifactKinds: portability_1.PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
    claimArtifactKinds: portability_1.PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
    claimTypes: features_1.INTEROPERABLE_CLAIM_TYPES,
    standingStatuses: features_1.INTEROPERABLE_STANDING_STATUSES,
    semanticVocabulary: vocabulary_1.AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY,
});
/** The canonical profile as a versioned reference. */
exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_REF = Object.freeze({
    id: exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_ID,
    version: exports.AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_VERSION,
});
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Structural check for a profile reference. Both halves are required, because a
 * bare id names a family of meanings across versions rather than one meaning.
 */
function isValidSovereigntyInteroperabilityProfileRef(value) {
    if (!isPlainObject(value))
        return false;
    const keys = Object.keys(value);
    return (keys.length === 2
        && isNonBlankString(value.id)
        && isNonBlankString(value.version));
}
/**
 * Structural check for a whole profile document.
 *
 * The canonical profile is a constant and needs no validation to be trusted;
 * this exists because a profile document may arrive from *outside* — quoted in
 * a support exchange, cached by an intermediary, or handed over by a system
 * claiming to speak this profile — and a `value as Profile` cast at that
 * boundary would let a malformed document become authoritative by assertion.
 *
 * It validates shape and the closed vocabularies, and deliberately does not
 * attempt to decide whether an unfamiliar profile is "close enough" to the
 * canonical one.
 */
function isValidSovereigntyInteroperabilityProfileV1(value) {
    if (!isPlainObject(value))
        return false;
    if (value.schemaVersion !== exports.SOVEREIGNTY_INTEROPERABILITY_PROFILE_SCHEMA_VERSION
        || !isNonBlankString(value.id)
        || !isNonBlankString(value.version)
        || !isNonBlankString(value.mediaType)) {
        return false;
    }
    const representation = value.representation;
    if (!isPlainObject(representation)
        || !isNonBlankString(representation.schemaVersion)
        || !isNonBlankString(representation.canonicalizationProfile)) {
        return false;
    }
    for (const key of [
        'artifactKinds',
        'manifestArtifactKinds',
        'claimArtifactKinds',
        'claimTypes',
        'standingStatuses',
    ]) {
        const entries = value[key];
        if (!Array.isArray(entries) || Array.from(entries).some((entry) => !isNonBlankString(entry))) {
            return false;
        }
    }
    const vocabulary = value.semanticVocabulary;
    return (isPlainObject(vocabulary)
        && isNonBlankString(vocabulary.id)
        && isNonBlankString(vocabulary.namespace)
        && Array.isArray(vocabulary.categories));
}
