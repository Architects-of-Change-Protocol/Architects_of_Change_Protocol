/**
 * Stable, machine-readable reason codes the Governance Compatibility contract
 * and its production capsule can report.
 *
 * One map, shared by the resource projection, the handoff builder, the handoff
 * validator and the AOC.GOVERNANCE_COMPATIBILITY capsule, so a consumer sees
 * the same code for the same defect no matter which surface reported it.
 *
 * ## Every code here is structural
 *
 * These describe defects in a *representation of a governance handoff* — a
 * missing field, an unsupported schema, a resource that does not project from
 * its subject, a descriptor that does not describe the representation it
 * travels with. None of them is a governance outcome.
 *
 * There is deliberately no `ACCESS_DENIED`, `ACCESS_ALLOWED`, `POLICY_FAILED`,
 * `AUTHORITY_MISSING`, `APPROVAL_REQUIRED`, `LICENSE_FORBIDS` or
 * `GRANT_REQUIRED`. Those are answers an external governance system reaches
 * after reading a handoff; emitting one here would make the Protocol the
 * governance system this mineral exists to hand off *to*. A handoff that is
 * structurally valid and that a policy would nevertheless refuse is a perfectly
 * ordinary state, and it has no reason code because nothing about it is wrong.
 */
export declare const SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES: Readonly<{
    readonly invalidInput: "GOVERNANCE_COMPATIBILITY_INVALID_INPUT";
    readonly unsupportedOperation: "GOVERNANCE_COMPATIBILITY_UNSUPPORTED_OPERATION";
    readonly subjectMismatch: "GOVERNANCE_COMPATIBILITY_SUBJECT_MISMATCH";
    readonly invalidRepresentation: "GOVERNANCE_COMPATIBILITY_INVALID_REPRESENTATION";
    readonly invalidHandoff: "GOVERNANCE_COMPATIBILITY_INVALID_HANDOFF";
    readonly unsupportedHandoffSchema: "GOVERNANCE_COMPATIBILITY_UNSUPPORTED_HANDOFF_SCHEMA";
    readonly unsupportedCanonicalizationProfile: "GOVERNANCE_COMPATIBILITY_UNSUPPORTED_CANONICALIZATION_PROFILE";
    readonly invalidSubject: "GOVERNANCE_COMPATIBILITY_INVALID_SUBJECT";
    readonly invalidResource: "GOVERNANCE_COMPATIBILITY_INVALID_RESOURCE";
    readonly resourceKindMismatch: "GOVERNANCE_COMPATIBILITY_RESOURCE_KIND_MISMATCH";
    readonly resourceIdMismatch: "GOVERNANCE_COMPATIBILITY_RESOURCE_ID_MISMATCH";
    readonly resourceAttributesNotSupported: "GOVERNANCE_COMPATIBILITY_RESOURCE_ATTRIBUTES_NOT_SUPPORTED";
    readonly invalidTenantId: "GOVERNANCE_COMPATIBILITY_INVALID_TENANT_ID";
    readonly invalidSemantics: "GOVERNANCE_COMPATIBILITY_INVALID_SEMANTICS";
    readonly semanticsMismatch: "GOVERNANCE_COMPATIBILITY_SEMANTICS_MISMATCH";
}>;
export type SovereignGovernanceCompatibilityReasonCode = (typeof SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES)[keyof typeof SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES];
//# sourceMappingURL=reason-codes.d.ts.map