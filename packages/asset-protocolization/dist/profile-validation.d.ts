import type { AssetProfile } from './profile';
import { AssetRequirementKind } from './requirements';
import type { AssetRequirement } from './requirements';
/**
 * Structural and cross-field validation for an `AssetProfile`.
 *
 * Follows the repository's established validator contract — `{ valid, reasons }`
 * with stable SCREAMING_SNAKE codes, shape only, fail-closed, and a
 * present-but-`undefined` optional treated as invalid rather than absent
 * (`validateSovereignManifestV1`, `validateCanonicalStanding`,
 * `validateSovereignExternalReference`). `issues` is an additive projection that
 * pairs each reason with the path it was raised at, because a profile is a
 * composite document and a bare code cannot say *which* requirement is wrong.
 *
 * It validates a profile as a *document*. It never decides whether the
 * requirements it describes are legally sufficient, sensible for the asset
 * category, or satisfied by any particular case — the first two are a human
 * judgement made when a profile is authored, and the third belongs to APV-04.
 */
export declare const ASSET_PROFILE_VALIDATION_CODES: Readonly<{
    readonly invalidStructure: "INVALID_PROFILE_STRUCTURE";
    readonly unsupportedSchemaVersion: "UNSUPPORTED_PROFILE_SCHEMA_VERSION";
    readonly unknownProfileField: "UNKNOWN_PROFILE_FIELD";
    readonly invalidProfileId: "INVALID_PROFILE_ID";
    readonly invalidProfileVersion: "INVALID_PROFILE_VERSION";
    readonly invalidAssetCategory: "INVALID_ASSET_CATEGORY";
    readonly invalidProfileScope: "INVALID_PROFILE_SCOPE";
    readonly invalidProfileJurisdictions: "INVALID_PROFILE_JURISDICTIONS";
    readonly invalidProfileMetadata: "INVALID_PROFILE_METADATA";
    readonly emptyRequirementSet: "EMPTY_REQUIREMENT_SET";
    readonly invalidRequirementStructure: "INVALID_REQUIREMENT_STRUCTURE";
    readonly unknownRequirementField: "UNKNOWN_REQUIREMENT_FIELD";
    readonly invalidRequirementId: "INVALID_REQUIREMENT_ID";
    readonly duplicateRequirementId: "DUPLICATE_REQUIREMENT_ID";
    readonly unsupportedRequirementKind: "UNSUPPORTED_REQUIREMENT_KIND";
    readonly invalidRequirementObligation: "INVALID_REQUIREMENT_OBLIGATION";
    readonly missingRequirementCondition: "MISSING_REQUIREMENT_CONDITION";
    readonly unexpectedRequirementCondition: "UNEXPECTED_REQUIREMENT_CONDITION";
    readonly invalidRequirementCondition: "INVALID_REQUIREMENT_CONDITION";
    readonly unknownRequirementReference: "UNKNOWN_REQUIREMENT_REFERENCE";
    readonly selfReferentialCondition: "SELF_REFERENTIAL_REQUIREMENT_CONDITION";
    readonly invalidRequirementJurisdictions: "INVALID_REQUIREMENT_JURISDICTIONS";
    readonly jurisdictionOutsideProfileScope: "REQUIREMENT_JURISDICTION_OUTSIDE_PROFILE_SCOPE";
    readonly invalidRequirementMetadata: "INVALID_REQUIREMENT_METADATA";
    readonly invalidIdentityStrategies: "INVALID_IDENTITY_STRATEGIES";
    readonly invalidRequirementSatisfaction: "INVALID_REQUIREMENT_SATISFACTION";
    readonly invalidRegistryConstraint: "INVALID_REGISTRY_CONSTRAINT";
    readonly unexpectedRegistryConstraint: "UNEXPECTED_REGISTRY_CONSTRAINT";
    readonly invalidClaimType: "INVALID_CLAIM_TYPE";
    readonly missingClaimSubtype: "MISSING_CLAIM_SUBTYPE";
    readonly invalidClaimSubtype: "INVALID_CLAIM_SUBTYPE";
    readonly invalidMinimumCount: "INVALID_MINIMUM_COUNT";
    readonly invalidEvidenceTypes: "INVALID_EVIDENCE_TYPES";
    readonly invalidEvidenceSubtypes: "INVALID_EVIDENCE_SUBTYPES";
    readonly missingEvidenceSubtypes: "MISSING_EVIDENCE_SUBTYPES";
    readonly invalidCredentialConstraint: "INVALID_CREDENTIAL_CONSTRAINT";
    readonly invalidFreshnessConstraint: "INVALID_FRESHNESS_CONSTRAINT";
    readonly invalidVerificationCheckIds: "INVALID_VERIFICATION_CHECK_IDS";
    readonly invalidAttestationTypes: "INVALID_ATTESTATION_TYPES";
    readonly invalidAttesterConstraint: "INVALID_ATTESTER_CONSTRAINT";
    readonly contradictoryIdentityStrategy: "CONTRADICTORY_IDENTITY_STRATEGY";
    readonly contradictoryMinimumCount: "CONTRADICTORY_OBLIGATION_MINIMUM_COUNT";
    readonly contradictoryConditionDependency: "CONTRADICTORY_CONDITION_DEPENDENCY";
}>;
export type AssetProfileValidationCode = (typeof ASSET_PROFILE_VALIDATION_CODES)[keyof typeof ASSET_PROFILE_VALIDATION_CODES];
export interface AssetProfileValidationIssue {
    readonly code: AssetProfileValidationCode;
    /** Where in the profile document the issue was raised, e.g. `requirements[2].id`. */
    readonly path: string;
}
export interface AssetProfileValidationResult {
    readonly valid: boolean;
    /** Repository-standard reason projection — exactly `issues.map((issue) => issue.code)`. */
    readonly reasons: readonly string[];
    readonly issues: readonly AssetProfileValidationIssue[];
}
export declare function validateAssetProfile(value: unknown): AssetProfileValidationResult;
export declare function isValidAssetProfile(value: unknown): value is AssetProfile;
/** Narrowing helper for consumers that already hold a validated profile. */
export declare function isAssetRequirementOfKind<TKind extends AssetRequirementKind>(requirement: AssetRequirement, kind: TKind): requirement is Extract<AssetRequirement, {
    readonly kind: TKind;
}>;
//# sourceMappingURL=profile-validation.d.ts.map