"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionStatus = exports.AuthorityStatus = exports.StandingStatus = exports.VerificationStatus = exports.AttestationType = exports.EvidenceType = exports.ClaimType = void 0;
exports.ClaimType = {
    Identity: 'Identity',
    Capability: 'Capability',
    Authorization: 'Authorization',
    Certification: 'Certification',
    Role: 'Role',
    Credential: 'Credential',
    Governance: 'Governance',
    /**
     * A declaration of where/how a subject (typically a SovereignAssetId)
     * came to exist. Origin claims are epistemically honest by construction:
     * a valid signature proves the issuer asserted the claim, not that the
     * asserted origin is historically or legally true. See
     * `@aoc/protocol/manifest`'s `OriginClaim`.
     */
    Origin: 'Origin',
    /**
     * A declaration of authorship, rights, or other non-governance authority
     * over a subject (typically a SovereignAssetId) — e.g. "issuer asserts
     * they authored this asset" or "issuer asserts they hold distribution
     * rights". Distinct from `Authorization` (which is about permission to
     * perform an action) and from legal ownership, which this claim type
     * never establishes on its own. See `@aoc/protocol/manifest`'s
     * `AuthorityClaim` and `AuthorityClaimKind`.
     */
    Authorship: 'Authorship',
    Custom: 'Custom',
};
exports.EvidenceType = {
    Document: 'Document',
    Contract: 'Contract',
    Certification: 'Certification',
    BoardResolution: 'BoardResolution',
    AuditRecord: 'AuditRecord',
    Attestation: 'Attestation',
    AIOutput: 'AIOutput',
    SystemRecord: 'SystemRecord',
    Custom: 'Custom',
};
exports.AttestationType = {
    Human: 'Human',
    Organization: 'Organization',
    System: 'System',
    AI: 'AI',
    Remote: 'Remote',
    Governance: 'Governance',
};
exports.VerificationStatus = {
    Pending: 'Pending',
    Verified: 'Verified',
    Failed: 'Failed',
};
exports.StandingStatus = {
    Draft: 'Draft',
    Verified: 'Verified',
    Active: 'Active',
    Expired: 'Expired',
    Suspended: 'Suspended',
    Revoked: 'Revoked',
    Superseded: 'Superseded',
    Invalid: 'Invalid',
    NotYetActive: 'NotYetActive',
    /**
     * A competing or challenging assertion exists against the referenced
     * claim. Contested standing preserves the claim and its evidence as
     * history — it neither deletes the claim nor picks a winner. Protocol
     * records the dispute; adjudication (legal or institutional) is external.
     */
    Contested: 'Contested',
};
exports.AuthorityStatus = {
    Granted: 'Granted',
    Suspended: 'Suspended',
    Revoked: 'Revoked',
    Expired: 'Expired',
};
exports.DecisionStatus = {
    Proposed: 'Proposed',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Executed: 'Executed',
    Cancelled: 'Cancelled',
};
