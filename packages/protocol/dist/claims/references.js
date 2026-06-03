"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeKind = exports.ReferenceSourceKind = exports.PrincipalKind = void 0;
exports.PrincipalKind = {
    Human: 'Human',
    Organization: 'Organization',
    System: 'System',
    AI: 'AI',
    Runtime: 'Runtime',
    GovernanceBody: 'GovernanceBody',
    MarketMaker: 'MarketMaker',
    CredentialIssuer: 'CredentialIssuer',
    Unknown: 'Unknown',
};
exports.ReferenceSourceKind = {
    URI: 'URI',
    DID: 'DID',
    Wallet: 'Wallet',
    Email: 'Email',
    Domain: 'Domain',
    Registry: 'Registry',
    InternalId: 'InternalId',
    ExternalId: 'ExternalId',
    Document: 'Document',
    AuditTrace: 'AuditTrace',
    RuntimeTrace: 'RuntimeTrace',
    Unknown: 'Unknown',
};
exports.ScopeKind = {
    Global: 'Global',
    Organization: 'Organization',
    Workspace: 'Workspace',
    Project: 'Project',
    Resource: 'Resource',
    Action: 'Action',
    Policy: 'Policy',
    Market: 'Market',
    Custom: 'Custom',
};
