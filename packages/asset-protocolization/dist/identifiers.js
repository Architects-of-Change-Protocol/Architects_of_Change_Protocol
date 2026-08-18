"use strict";
/**
 * Identifier vocabulary for the Asset Protocolization Vertical's profile
 * framework.
 *
 * Everything here is a *vertical* identifier. None of it is minted by, known
 * to, or resolvable through AOC Protocol: `docs/architecture/adr-asset-
 * protocolization-vertical-boundary.md` §2.1/§2.2 places asset-class knowledge
 * exclusively in this layer, and a profile id crossing the boundary does so as
 * the opaque `{ profileId, profileVersion }` pair frozen by APV-02 §2.1.
 *
 * The validators follow the repository's established structural-validation
 * convention (`validateSovereignExternalReference`, `validateCanonicalStanding`,
 * `validateSovereignManifestV1`): shape only, stable SCREAMING_SNAKE reason
 * codes, no semantic interpretation, and a present-but-`undefined` optional
 * treated as invalid rather than absent.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSET_IDENTIFIER_MAX_LENGTH = void 0;
exports.isValidAssetProfileId = isValidAssetProfileId;
exports.isValidAssetRequirementId = isValidAssetRequirementId;
exports.isValidAssetCategoryId = isValidAssetCategoryId;
exports.isValidAssetVerificationCheckId = isValidAssetVerificationCheckId;
exports.isValidAssetRequirementConditionId = isValidAssetRequirementConditionId;
exports.isValidAssetProfileVersion = isValidAssetProfileVersion;
exports.assetProfileVersionKey = assetProfileVersionKey;
exports.compareAssetProfileVersions = compareAssetProfileVersions;
/**
 * Dotted lowercase token: one or more segments of `[a-z0-9]` separated by `.`,
 * with `-` permitted inside a segment. Chosen because it is the shape the
 * frozen artifacts already use for profile ids (`digital.artifact.v1`,
 * `realestate.cr.v1`) and requirement ids (`identity.content.required`), it is
 * case-unambiguous, and it round-trips through JSON, file names and URLs
 * without escaping.
 */
const DOTTED_TOKEN_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
/** Exactly the form APV-02 §2.1 froze. Deliberately not a full SemVer range grammar. */
const ASSET_PROFILE_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
/**
 * Upper bound on every identifier in this package. Not a semantic rule — a
 * guard so that an identifier can be carried in an audit envelope, a log line
 * or a UI column without truncation surprises.
 */
exports.ASSET_IDENTIFIER_MAX_LENGTH = 128;
function isDottedToken(value) {
    return (typeof value === 'string' &&
        value.length <= exports.ASSET_IDENTIFIER_MAX_LENGTH &&
        DOTTED_TOKEN_PATTERN.test(value));
}
function isValidAssetProfileId(value) {
    return isDottedToken(value);
}
function isValidAssetRequirementId(value) {
    return isDottedToken(value);
}
function isValidAssetCategoryId(value) {
    return isDottedToken(value);
}
function isValidAssetVerificationCheckId(value) {
    return isDottedToken(value);
}
function isValidAssetRequirementConditionId(value) {
    return isDottedToken(value);
}
function isValidAssetProfileVersion(value) {
    return (typeof value === 'string' &&
        value.length <= exports.ASSET_IDENTIFIER_MAX_LENGTH &&
        ASSET_PROFILE_VERSION_PATTERN.test(value));
}
/**
 * The key under which one immutable profile version is catalogued.
 *
 * Deterministic and total over valid identifiers: `profileId` may not contain
 * `@` (the dotted-token grammar forbids it) and `version` is three dot-separated
 * numeric fields, so the separator can never be ambiguous. Two distinct
 * (id, version) pairs therefore always produce two distinct keys.
 */
function assetProfileVersionKey(profileId, version) {
    return `${profileId}@${version}`;
}
/**
 * Total ordering over profile versions: numeric field by numeric field, so
 * `2.0.0` sorts after `10.0.0` never happens and `1.10.0` sorts after `1.9.0`.
 * Ordering is for deterministic listing only — it confers no compatibility
 * meaning, and a later version never supersedes an earlier one implicitly
 * (see `profile.ts` on immutability).
 */
function compareAssetProfileVersions(left, right) {
    const leftFields = left.split('.').map(Number);
    const rightFields = right.split('.').map(Number);
    for (let index = 0; index < 3; index += 1) {
        const difference = (leftFields[index] ?? 0) - (rightFields[index] ?? 0);
        if (difference !== 0)
            return difference < 0 ? -1 : 1;
    }
    return 0;
}
