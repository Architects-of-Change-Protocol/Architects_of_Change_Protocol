import type { CanonicalId } from '../contracts';
import type { CanonicalMetadata } from './primitives';
export declare const PrincipalKind: {
    readonly Human: "Human";
    readonly Organization: "Organization";
    readonly System: "System";
    readonly AI: "AI";
    readonly Runtime: "Runtime";
    readonly GovernanceBody: "GovernanceBody";
    readonly MarketMaker: "MarketMaker";
    readonly CredentialIssuer: "CredentialIssuer";
    readonly Unknown: "Unknown";
};
export type PrincipalKind = (typeof PrincipalKind)[keyof typeof PrincipalKind];
export declare const ReferenceSourceKind: {
    readonly URI: "URI";
    readonly DID: "DID";
    readonly Wallet: "Wallet";
    readonly Email: "Email";
    readonly Domain: "Domain";
    readonly Registry: "Registry";
    readonly InternalId: "InternalId";
    readonly ExternalId: "ExternalId";
    readonly Document: "Document";
    readonly AuditTrace: "AuditTrace";
    readonly RuntimeTrace: "RuntimeTrace";
    readonly Unknown: "Unknown";
};
export type ReferenceSourceKind = (typeof ReferenceSourceKind)[keyof typeof ReferenceSourceKind];
export declare const ScopeKind: {
    readonly Global: "Global";
    readonly Organization: "Organization";
    readonly Workspace: "Workspace";
    readonly Project: "Project";
    readonly Resource: "Resource";
    readonly Action: "Action";
    readonly Policy: "Policy";
    readonly Market: "Market";
    readonly Custom: "Custom";
};
export type ScopeKind = (typeof ScopeKind)[keyof typeof ScopeKind];
/**
 * Identifies the source namespace or locator used for a canonical reference.
 * This is not verification and does not imply authority over the referenced value.
 */
export interface CanonicalReferenceSource {
    readonly kind: ReferenceSourceKind;
    readonly value: string;
    readonly label?: string;
    readonly metadata?: CanonicalMetadata;
}
/**
 * Identifies or describes a referenced principal without proving identity,
 * standing, or authority.
 */
export interface CanonicalPrincipalRef {
    readonly id: CanonicalId;
    readonly kind: PrincipalKind;
    readonly displayName?: string;
    readonly source?: CanonicalReferenceSource;
    readonly metadata?: CanonicalMetadata;
}
/**
 * Identifies a scope boundary for authority without resolving policies,
 * resources, or runtime permissions.
 */
export interface CanonicalScopeRef {
    readonly kind: ScopeKind;
    readonly value: string;
    readonly description?: string;
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=references.d.ts.map