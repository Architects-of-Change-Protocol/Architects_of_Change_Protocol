"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetIdentityStrategy = exports.AssetRequirementSatisfaction = exports.AssetRequirementObligation = exports.AssetRequirementKind = void 0;
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
exports.AssetRequirementKind = {
    /** Which identifying material the subject must carry. */
    Identity: 'Identity',
    /** Which declarations (Protocol claims) the applicant must supply. */
    Declaration: 'Declaration',
    /** Which supporting evidence must be supplied. */
    Evidence: 'Evidence',
    /** Which automated checks must have been performed. */
    Verification: 'Verification',
    /** Which professional/organizational attestation must be present. */
    Attestation: 'Attestation',
};
/**
 * How binding a requirement is.
 *
 * `NotRequired` is deliberately distinct from omitting the requirement
 * altogether: it lets a profile *state on the record* that, say, content
 * identity is not required for this asset category, which is a reviewable
 * decision, and it is what makes a contradictory profile mechanically
 * detectable.
 */
exports.AssetRequirementObligation = {
    Required: 'Required',
    Optional: 'Optional',
    /** Applies only when the referenced condition holds. Requires `condition`. */
    Conditional: 'Conditional',
    /** Explicitly declared as not required for this profile. */
    NotRequired: 'NotRequired',
};
/** Whether every listed alternative must hold, or any one of them suffices. */
exports.AssetRequirementSatisfaction = {
    All: 'All',
    Any: 'Any',
};
/**
 * Kinds of identifying material, each of which names an existing Protocol
 * primitive. The framework never represents the material itself.
 */
exports.AssetIdentityStrategy = {
    /** `ContentIdentity` (`@aoc/protocol/identity`) over the subject's bytes. */
    ContentIdentity: 'ContentIdentity',
    /** `SovereignExternalReference` naming the subject inside an external namespace. */
    ExternalReference: 'ExternalReference',
    /** `CanonicalRegistryEntryRef` naming the subject inside an external registry. */
    RegistryEntry: 'RegistryEntry',
};
