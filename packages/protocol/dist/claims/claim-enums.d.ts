export declare const ClaimType: {
    readonly Identity: "Identity";
    readonly Capability: "Capability";
    readonly Authorization: "Authorization";
    readonly Certification: "Certification";
    readonly Role: "Role";
    readonly Credential: "Credential";
    readonly Governance: "Governance";
    /**
     * A declaration of where/how a subject (typically a SovereignAssetId)
     * came to exist. Origin claims are epistemically honest by construction:
     * a valid signature proves the issuer asserted the claim, not that the
     * asserted origin is historically or legally true. See
     * `@aoc/protocol/manifest`'s `OriginClaim`.
     */
    readonly Origin: "Origin";
    /**
     * A declaration of authorship, rights, or other non-governance authority
     * over a subject (typically a SovereignAssetId) — e.g. "issuer asserts
     * they authored this asset" or "issuer asserts they hold distribution
     * rights". Distinct from `Authorization` (which is about permission to
     * perform an action) and from legal ownership, which this claim type
     * never establishes on its own. See `@aoc/protocol/manifest`'s
     * `AuthorityClaim` and `AuthorityClaimKind`.
     */
    readonly Authorship: "Authorship";
    /**
     * A declaration that one subject (typically a SovereignAssetId) was
     * derived, transformed, extracted, combined or generated from one or more
     * *other* sovereign subjects — e.g. "issuer asserts this asset was
     * combined from those two assets". The claim's `subject` is the child and
     * the asserted sources travel in the claim's metadata, so a subject may
     * carry zero, one or many derivation assertions, from one issuer or from
     * several disagreeing ones, without any of them being an identity field.
     *
     * Deliberately generic: it records the asserted *relationship*, never
     * whether the derivation was historically real, legally authorized, or
     * licensed, and never that rights, authority or authorship travel along
     * the edge. See `@aoc/protocol/manifest`'s `DerivationClaim` and
     * `DerivationRelationKind`.
     */
    readonly Derivation: "Derivation";
    readonly Custom: "Custom";
};
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];
export declare const EvidenceType: {
    readonly Document: "Document";
    readonly Contract: "Contract";
    readonly Certification: "Certification";
    readonly BoardResolution: "BoardResolution";
    readonly AuditRecord: "AuditRecord";
    readonly Attestation: "Attestation";
    readonly AIOutput: "AIOutput";
    readonly SystemRecord: "SystemRecord";
    readonly Custom: "Custom";
};
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];
export declare const AttestationType: {
    readonly Human: "Human";
    readonly Organization: "Organization";
    readonly System: "System";
    readonly AI: "AI";
    readonly Remote: "Remote";
    readonly Governance: "Governance";
};
export type AttestationType = (typeof AttestationType)[keyof typeof AttestationType];
export declare const VerificationStatus: {
    readonly Pending: "Pending";
    readonly Verified: "Verified";
    readonly Failed: "Failed";
};
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];
export declare const StandingStatus: {
    readonly Draft: "Draft";
    readonly Verified: "Verified";
    readonly Active: "Active";
    readonly Expired: "Expired";
    readonly Suspended: "Suspended";
    readonly Revoked: "Revoked";
    readonly Superseded: "Superseded";
    readonly Invalid: "Invalid";
    readonly NotYetActive: "NotYetActive";
    /**
     * A competing or challenging assertion exists against the referenced
     * claim. Contested standing preserves the claim and its evidence as
     * history — it neither deletes the claim nor picks a winner. Protocol
     * records the dispute; adjudication (legal or institutional) is external.
     */
    readonly Contested: "Contested";
};
export type StandingStatus = (typeof StandingStatus)[keyof typeof StandingStatus];
export declare const AuthorityStatus: {
    readonly Granted: "Granted";
    readonly Suspended: "Suspended";
    readonly Revoked: "Revoked";
    readonly Expired: "Expired";
};
export type AuthorityStatus = (typeof AuthorityStatus)[keyof typeof AuthorityStatus];
export declare const DecisionStatus: {
    readonly Proposed: "Proposed";
    readonly Approved: "Approved";
    readonly Rejected: "Rejected";
    readonly Executed: "Executed";
    readonly Cancelled: "Cancelled";
};
export type DecisionStatus = (typeof DecisionStatus)[keyof typeof DecisionStatus];
//# sourceMappingURL=claim-enums.d.ts.map