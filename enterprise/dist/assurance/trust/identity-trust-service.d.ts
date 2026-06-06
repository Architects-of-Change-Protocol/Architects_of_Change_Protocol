import { IdentityVerificationEngine, type VerifyIdentityInput } from '../verification/identity-verification';
import type { AocIdentityConsentRecord, AocIdentityCredentialRecord, AocIdentityIssuerRecord, IdentityVerificationResult, RlusdWithdrawalRequest, TrustAuditEvent } from './types';
export type RegisterCredentialInput = {
    credential_ref: string;
    subject_hash: string;
    issuer_id: string;
    credential_hash: string;
    metadata_hash: string;
    kyc_level: AocIdentityCredentialRecord['kyc_level'];
    wallet_address?: string;
    issued_at: string;
    expires_at?: string;
};
export type GrantConsentInput = {
    consent_id: string;
    subject_hash: string;
    consumer_id: string;
    issuer_id: string;
    granted_at: string;
};
export type { VerifyIdentityInput } from '../verification/identity-verification';
export declare class InMemoryTrustService {
    private readonly verificationEngine;
    private readonly issuers;
    private readonly credentials;
    private readonly consents;
    private readonly auditEvents;
    constructor(initialIssuers?: readonly AocIdentityIssuerRecord[], verificationEngine?: IdentityVerificationEngine);
    getAuditEvents(): readonly TrustAuditEvent[];
    registerCredential(input: RegisterCredentialInput): AocIdentityCredentialRecord;
    grantConsent(input: GrantConsentInput): AocIdentityConsentRecord;
    verifyIdentity(input: VerifyIdentityInput): IdentityVerificationResult;
    enforcePayoutKyc(request: RlusdWithdrawalRequest, now?: Date): {
        allowed: boolean;
        reason_code: string;
    };
    private pushVerificationAudit;
}
export declare const DEFAULT_TRUST_ISSUERS: readonly AocIdentityIssuerRecord[];
//# sourceMappingURL=identity-trust-service.d.ts.map