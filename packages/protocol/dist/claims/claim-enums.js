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
