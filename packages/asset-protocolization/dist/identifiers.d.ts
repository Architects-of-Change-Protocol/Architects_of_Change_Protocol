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
 * Upper bound on every identifier in this package. Not a semantic rule — a
 * guard so that an identifier can be carried in an audit envelope, a log line
 * or a UI column without truncation surprises.
 */
export declare const ASSET_IDENTIFIER_MAX_LENGTH = 128;
/**
 * Exported for reuse *inside* this package only — it is not part of the package
 * facade. APV-05's evidence-intake category ids are dotted tokens under exactly
 * this grammar, and re-spelling the pattern in a second module would let the two
 * copies drift.
 */
export declare function isDottedToken(value: unknown): value is string;
export declare function isValidAssetProfileId(value: unknown): value is AssetProfileId;
export declare function isValidAssetRequirementId(value: unknown): value is AssetRequirementId;
export declare function isValidAssetCategoryId(value: unknown): value is AssetCategoryId;
export declare function isValidAssetVerificationCheckId(value: unknown): value is AssetVerificationCheckId;
export declare function isValidAssetRequirementConditionId(value: unknown): value is AssetRequirementConditionId;
export declare function isValidAssetProfileVersion(value: unknown): value is AssetProfileVersion;
/**
 * The key under which one immutable profile version is catalogued.
 *
 * Deterministic and total over valid identifiers: `profileId` may not contain
 * `@` (the dotted-token grammar forbids it) and `version` is three dot-separated
 * numeric fields, so the separator can never be ambiguous. Two distinct
 * (id, version) pairs therefore always produce two distinct keys.
 */
export declare function assetProfileVersionKey(profileId: AssetProfileId, version: AssetProfileVersion): string;
/**
 * Total ordering over profile versions: numeric field by numeric field, so
 * `2.0.0` sorts after `10.0.0` never happens and `1.10.0` sorts after `1.9.0`.
 * Ordering is for deterministic listing only — it confers no compatibility
 * meaning, and a later version never supersedes an earlier one implicitly
 * (see `profile.ts` on immutability).
 */
export declare function compareAssetProfileVersions(left: AssetProfileVersion, right: AssetProfileVersion): number;
//# sourceMappingURL=identifiers.d.ts.map