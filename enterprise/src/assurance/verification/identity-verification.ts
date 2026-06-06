import type {
  AocIdentityConsentRecord,
  AocIdentityCredentialRecord,
  AocIdentityIssuerRecord,
  IdentityVerificationResult,
} from '../trust/types';

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

export class IdentityVerificationEngine {
  verify(input: VerifyIdentityInput, state: IdentityVerificationState): IdentityVerificationEvaluation {
    const now = input.now ?? new Date();
    const candidates = [...state.credentials].filter(
      (credential) =>
        credential.subject_hash === input.subject_hash &&
        (input.issuer_id === undefined || credential.issuer_id === input.issuer_id),
    );
    if (candidates.length === 0) {
      return { result: { valid: false, reason_code: 'NOT_FOUND' } };
    }

    const latest = candidates.sort((a, b) => Date.parse(b.issued_at) - Date.parse(a.issued_at))[0];
    const issuer = state.issuers.get(latest.issuer_id);
    if (issuer === undefined || !issuer.active) {
      return { result: { valid: false, reason_code: 'ISSUER_INACTIVE' }, credential: latest };
    }
    if (latest.revoked_at !== undefined) {
      return { result: { valid: false, reason_code: 'REVOKED' }, credential: latest };
    }
    if (latest.expires_at !== undefined && Date.parse(latest.expires_at) <= now.getTime()) {
      return { result: { valid: false, reason_code: 'EXPIRED' }, credential: latest };
    }
    if (input.consumer_id !== undefined) {
      const consentExists = [...state.consents].some(
        (consent) =>
          consent.subject_hash === input.subject_hash &&
          consent.consumer_id === input.consumer_id &&
          consent.issuer_id === latest.issuer_id &&
          consent.revoked_at === undefined,
      );
      if (!consentExists) {
        return { result: { valid: false, reason_code: 'CONSENT_REQUIRED' }, credential: latest };
      }
    }

    return {
      result: {
        valid: true,
        issuer: latest.issuer_id,
        kyc_level: latest.kyc_level,
        reason_code: 'VERIFIED',
      },
      credential: latest,
    };
  }
}
