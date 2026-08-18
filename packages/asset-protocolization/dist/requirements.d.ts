import type { AttestationType, ClaimType, EvidenceType } from '@aoc/protocol/claims';
import type { AssetAttesterConstraint, AssetCredentialConstraint, AssetRegistryConstraint } from './constraints';
import type { AssetFreshnessConstraint } from './freshness';
import type { AssetRequirementConditionId, AssetRequirementId, AssetVerificationCheckId } from './identifiers';
import type { JurisdictionRef } from './jurisdiction';
import type { AssetProfileMetadata } from './metadata';
/**
 * What an asset profile *requires*. Never what is true.
 *
 * A requirement describes material a later slice must supply and check before a
 * `ProtocolizationCase` may be considered ready. It carries no evidence, no
 * claim, no attestation and no verification — those are Protocol records
 * (`CanonicalEvidence`, `CanonicalClaim`, `CanonicalAttestation`,
 * `CanonicalVerification`), and this package redefines none of them. The
 * distinction is the reuse map's line 26: evidence *requirement* is the
 * vertical's; evidence *representation* is Protocol's.
 */
/** The five families of requirement a profile can express. */
export declare const AssetRequirementKind: {
    /** Which identifying material the subject must carry. */
    readonly Identity: "Identity";
    /** Which declarations (Protocol claims) the applicant must supply. */
    readonly Declaration: "Declaration";
    /** Which supporting evidence must be supplied. */
    readonly Evidence: "Evidence";
    /** Which automated checks must have been performed. */
    readonly Verification: "Verification";
    /** Which professional/organizational attestation must be present. */
    readonly Attestation: "Attestation";
};
export type AssetRequirementKind = (typeof AssetRequirementKind)[keyof typeof AssetRequirementKind];
/**
 * How binding a requirement is.
 *
 * `NotRequired` is deliberately distinct from omitting the requirement
 * altogether: it lets a profile *state on the record* that, say, content
 * identity is not required for this asset category, which is a reviewable
 * decision, and it is what makes a contradictory profile mechanically
 * detectable.
 */
export declare const AssetRequirementObligation: {
    readonly Required: "Required";
    readonly Optional: "Optional";
    /** Applies only when the referenced condition holds. Requires `condition`. */
    readonly Conditional: "Conditional";
    /** Explicitly declared as not required for this profile. */
    readonly NotRequired: "NotRequired";
};
export type AssetRequirementObligation = (typeof AssetRequirementObligation)[keyof typeof AssetRequirementObligation];
/** Whether every listed alternative must hold, or any one of them suffices. */
export declare const AssetRequirementSatisfaction: {
    readonly All: "All";
    readonly Any: "Any";
};
export type AssetRequirementSatisfaction = (typeof AssetRequirementSatisfaction)[keyof typeof AssetRequirementSatisfaction];
/**
 * Kinds of identifying material, each of which names an existing Protocol
 * primitive. The framework never represents the material itself.
 */
export declare const AssetIdentityStrategy: {
    /** `ContentIdentity` (`@aoc/protocol/identity`) over the subject's bytes. */
    readonly ContentIdentity: "ContentIdentity";
    /** `SovereignExternalReference` naming the subject inside an external namespace. */
    readonly ExternalReference: "ExternalReference";
    /** `CanonicalRegistryEntryRef` naming the subject inside an external registry. */
    readonly RegistryEntry: "RegistryEntry";
};
export type AssetIdentityStrategy = (typeof AssetIdentityStrategy)[keyof typeof AssetIdentityStrategy];
/**
 * The condition under which a `Conditional` requirement applies.
 *
 * `conditionId` is an opaque, machine-readable token a later slice resolves to
 * an evaluator. It is never natural language — the explanation belongs in
 * `metadata.reason` — so that a condition can be evaluated, logged and audited
 * without parsing prose.
 */
export interface AssetRequirementCondition {
    readonly conditionId: AssetRequirementConditionId;
    /** Other requirements in the same profile this condition is expressed over. */
    readonly dependsOn?: readonly AssetRequirementId[];
}
interface AssetRequirementBase {
    readonly id: AssetRequirementId;
    readonly kind: AssetRequirementKind;
    readonly obligation: AssetRequirementObligation;
    /** Present if and only if `obligation` is `Conditional`. */
    readonly condition?: AssetRequirementCondition;
    /** Jurisdictions this requirement applies within. Absent means "wherever the profile applies". */
    readonly jurisdictions?: readonly JurisdictionRef[];
    readonly metadata?: AssetProfileMetadata;
}
/**
 * Which identifying material the subject must carry.
 *
 * `satisfaction: 'Any'` with several strategies is how "one of several identity
 * strategies is acceptable" is expressed. A profile for a subject with no byte
 * representation states `ContentIdentity` as `NotRequired` and requires an
 * external reference or registry entry instead — APV-00 §2.1/§2.2 established
 * that both shapes already fit the same generic Protocol model.
 */
export interface AssetIdentityRequirement extends AssetRequirementBase {
    readonly kind: typeof AssetRequirementKind.Identity;
    readonly acceptedStrategies: readonly AssetIdentityStrategy[];
    readonly satisfaction: AssetRequirementSatisfaction;
    /** Constrains the registry when `RegistryEntry` is among the accepted strategies. */
    readonly registry?: AssetRegistryConstraint;
    readonly freshness?: AssetFreshnessConstraint;
}
/**
 * Which declaration the applicant must make.
 *
 * A declaration is a `CanonicalClaim` of the named `ClaimType` — "the applicant
 * asserts X". It is never a fact, and requiring it never makes it one.
 * `claimSubtype` is a vertical token that narrows `ClaimType.Custom`, which is
 * why Protocol needs no new `ClaimType` member for any asset category.
 */
export interface AssetDeclarationRequirement extends AssetRequirementBase {
    readonly kind: typeof AssetRequirementKind.Declaration;
    readonly claimType: ClaimType;
    /** Required when `claimType` is `Custom`; an opaque vertical token otherwise. */
    readonly claimSubtype?: string;
    /** Minimum number of distinct claims. Positive integer; defaults to 1 when absent. */
    readonly minimumCount?: number;
}
/**
 * Which supporting evidence must be supplied.
 *
 * `acceptedTypes` names `EvidenceType` members; `acceptedSubtypes` narrows them
 * with opaque vertical tokens (mandatory when `Custom` is accepted, since
 * `Custom` alone constrains nothing checkable).
 */
export interface AssetEvidenceRequirement extends AssetRequirementBase {
    readonly kind: typeof AssetRequirementKind.Evidence;
    readonly acceptedTypes: readonly EvidenceType[];
    readonly acceptedSubtypes?: readonly string[];
    readonly minimumCount?: number;
    readonly registry?: AssetRegistryConstraint;
    readonly credential?: AssetCredentialConstraint;
    readonly freshness?: AssetFreshnessConstraint;
}
/**
 * Which automated checks must have been performed.
 *
 * `checkIds` are vertical identifiers only. APV-03 neither defines the check
 * catalogue nor executes anything, and it introduces no check-outcome
 * vocabulary: Protocol's `VerificationStatus` is the status of a
 * `CanonicalVerification` record and is left untouched (APV-00 F-2). A future
 * slice can attach checks and outcomes without changing Protocol or this type.
 */
export interface AssetVerificationRequirement extends AssetRequirementBase {
    readonly kind: typeof AssetRequirementKind.Verification;
    readonly checkIds: readonly AssetVerificationCheckId[];
    readonly satisfaction: AssetRequirementSatisfaction;
    readonly freshness?: AssetFreshnessConstraint;
}
/**
 * Which attestation must be present.
 *
 * "Not required" is `obligation: 'NotRequired'` (or simply no attestation
 * requirement); "conditionally required" is `obligation: 'Conditional'` with a
 * condition. An empty attestation requirement set must never be read as
 * "attested" — the same asymmetry APV-02 I-9 froze for the result envelope.
 */
export interface AssetAttestationRequirement extends AssetRequirementBase {
    readonly kind: typeof AssetRequirementKind.Attestation;
    readonly acceptedTypes: readonly AttestationType[];
    readonly attester?: AssetAttesterConstraint;
    readonly minimumCount?: number;
    readonly freshness?: AssetFreshnessConstraint;
}
export type AssetRequirement = AssetIdentityRequirement | AssetDeclarationRequirement | AssetEvidenceRequirement | AssetVerificationRequirement | AssetAttestationRequirement;
export {};
//# sourceMappingURL=requirements.d.ts.map