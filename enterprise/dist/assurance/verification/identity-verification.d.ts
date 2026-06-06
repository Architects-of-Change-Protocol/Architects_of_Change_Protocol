import type { AocIdentityConsentRecord, AocIdentityCredentialRecord, AocIdentityIssuerRecord, IdentityVerificationResult } from '../trust/types';
export interface VerifyIdentityInput {
    subject_hash: string;
    consumer_id?: string;
    issuer_id?: string;
    now?: Date;
}
export interface IdentityVerificationState {
    readonly issuers: ReadonlyMap<string, AocIdentityIssuerRecord>;
    readonly credentials: Iterable<AocIdentityCredentialRecord>;
    readonly consents: Iterable<AocIdentityConsentRecord>;
}
export interface IdentityVerificationEvaluation {
    readonly result: IdentityVerificationResult;
    readonly credential?: AocIdentityCredentialRecord;
}
export declare class IdentityVerificationEngine {
    verify(input: VerifyIdentityInput, state: IdentityVerificationState): IdentityVerificationEvaluation;
}
//# sourceMappingURL=identity-verification.d.ts.map