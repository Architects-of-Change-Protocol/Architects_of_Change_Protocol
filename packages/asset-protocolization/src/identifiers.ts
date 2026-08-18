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

/**
 * Stable identity of a profile *line*, e.g. `digital.artifact.v1`. Dotted,
 * lowercase, opaque. Never parsed for meaning — the trailing `v1`-style segment
 * that later product profiles are expected to carry is a naming convention of
 * the vertical, not a field this framework interprets.
 */
export type AssetProfileId = string;

/**
 * Semantic version of one profile line. Constrained to exactly the form APV-02
 * §2.1 froze for `ProtocolizationProfileRef.profileVersion` (`/^\d+\.\d+\.\d+$/`),
 * so a profile that validates here can always be named in a
 * `ProtocolizationResultV1` without re-spelling.
 */
export type AssetProfileVersion = string;

/**
 * Stable, machine-readable identity of one requirement inside a profile, e.g.
 * `identity.content.required`. Used for deterministic lookup, readiness
 * evaluation, reporting, audit correlation and future UI rendering, so it must
 * never carry a natural-language legal conclusion.
 */
export type AssetRequirementId = string;

/**
 * The category of subject a profile applies to, e.g. `digital.content`. An
 * opaque vertical token by construction: there is deliberately no enum of asset
 * kinds anywhere in this package and none in Protocol (APV-00 §6, V-3).
 */
export type AssetCategoryId = string;

/**
 * Identifier of an automated check a later slice (APV-07) will execute.
 *
 * Opaque here. This framework declares *which* checks a profile requires and
 * never executes one, never defines an outcome vocabulary, and never widens
 * Protocol's `VerificationStatus` (`Pending`/`Verified`/`Failed`), which
 * describes a `CanonicalVerification` record rather than a check outcome
 * (APV-00 F-2).
 */
export type AssetVerificationCheckId = string;

/**
 * Identifier of a condition a later slice evaluates to decide whether a
 * conditional requirement applies. Opaque and machine-readable; the
 * human-readable explanation belongs in requirement metadata.
 */
export type AssetRequirementConditionId = string;

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
export const ASSET_IDENTIFIER_MAX_LENGTH = 128;

function isDottedToken(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= ASSET_IDENTIFIER_MAX_LENGTH &&
    DOTTED_TOKEN_PATTERN.test(value)
  );
}

export function isValidAssetProfileId(value: unknown): value is AssetProfileId {
  return isDottedToken(value);
}

export function isValidAssetRequirementId(value: unknown): value is AssetRequirementId {
  return isDottedToken(value);
}

export function isValidAssetCategoryId(value: unknown): value is AssetCategoryId {
  return isDottedToken(value);
}

export function isValidAssetVerificationCheckId(value: unknown): value is AssetVerificationCheckId {
  return isDottedToken(value);
}

export function isValidAssetRequirementConditionId(
  value: unknown,
): value is AssetRequirementConditionId {
  return isDottedToken(value);
}

export function isValidAssetProfileVersion(value: unknown): value is AssetProfileVersion {
  return (
    typeof value === 'string' &&
    value.length <= ASSET_IDENTIFIER_MAX_LENGTH &&
    ASSET_PROFILE_VERSION_PATTERN.test(value)
  );
}

/**
 * The key under which one immutable profile version is catalogued.
 *
 * Deterministic and total over valid identifiers: `profileId` may not contain
 * `@` (the dotted-token grammar forbids it) and `version` is three dot-separated
 * numeric fields, so the separator can never be ambiguous. Two distinct
 * (id, version) pairs therefore always produce two distinct keys.
 */
export function assetProfileVersionKey(
  profileId: AssetProfileId,
  version: AssetProfileVersion,
): string {
  return `${profileId}@${version}`;
}

/**
 * Total ordering over profile versions: numeric field by numeric field, so
 * `2.0.0` sorts after `10.0.0` never happens and `1.10.0` sorts after `1.9.0`.
 * Ordering is for deterministic listing only — it confers no compatibility
 * meaning, and a later version never supersedes an earlier one implicitly
 * (see `profile.ts` on immutability).
 */
export function compareAssetProfileVersions(
  left: AssetProfileVersion,
  right: AssetProfileVersion,
): number {
  const leftFields = left.split('.').map(Number);
  const rightFields = right.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftFields[index] ?? 0) - (rightFields[index] ?? 0);
    if (difference !== 0) return difference < 0 ? -1 : 1;
  }
  return 0;
}
