import {
  type AocIdentityConsentRecord,
  type AocIdentityCredentialRecord,
  type AocIdentityIssuerRecord,
  type IdentityVerificationResult,
  type RlusdWithdrawalRequest,
  type TrustAuditEvent,
} from './types';

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

export type VerifyIdentityInput = {
  subject_hash: string;
  consumer_id?: string;
  issuer_id?: string;
  now?: Date;
};

export class InMemoryTrustService {
  private readonly issuers = new Map<string, AocIdentityIssuerRecord>();
  private readonly credentials = new Map<string, AocIdentityCredentialRecord>();
  private readonly consents = new Map<string, AocIdentityConsentRecord>();
  private readonly auditEvents: TrustAuditEvent[] = [];

  constructor(initialIssuers: readonly AocIdentityIssuerRecord[] = []) {
    for (const issuer of initialIssuers) {
      this.issuers.set(issuer.issuer_id, issuer);
    }
  }

  getAuditEvents(): readonly TrustAuditEvent[] {
    return [...this.auditEvents];
  }

  registerCredential(input: RegisterCredentialInput): AocIdentityCredentialRecord {
    const issuer = this.issuers.get(input.issuer_id);
    if (issuer === undefined || !issuer.active) {
      throw new Error(`Issuer is invalid or inactive: ${input.issuer_id}`);
    }
    if (!issuer.supported_kyc_levels.includes(input.kyc_level)) {
      throw new Error(`Issuer does not support KYC level: ${input.kyc_level}`);
    }

    const record: AocIdentityCredentialRecord = {
      credential_ref: input.credential_ref,
      subject_hash: input.subject_hash,
      issuer_id: input.issuer_id,
      credential_hash: input.credential_hash,
      kyc_level: input.kyc_level,
      metadata_hash: input.metadata_hash,
      wallet_address: input.wallet_address,
      issued_at: input.issued_at,
      expires_at: input.expires_at,
    };
    this.credentials.set(record.credential_ref, record);
    this.auditEvents.push({
      event_type: 'CREDENTIAL_REGISTERED',
      at: input.issued_at,
      subject_hash: input.subject_hash,
      issuer_id: input.issuer_id,
      credential_ref: input.credential_ref,
    });
    if (input.wallet_address !== undefined) {
      this.auditEvents.push({
        event_type: 'WALLET_LINKED',
        at: input.issued_at,
        subject_hash: input.subject_hash,
        issuer_id: input.issuer_id,
        credential_ref: input.credential_ref,
      });
    }
    return record;
  }

  grantConsent(input: GrantConsentInput): AocIdentityConsentRecord {
    const issuer = this.issuers.get(input.issuer_id);
    if (issuer === undefined || !issuer.active) {
      throw new Error(`Issuer is invalid or inactive: ${input.issuer_id}`);
    }
    const consent: AocIdentityConsentRecord = {
      consent_id: input.consent_id,
      subject_hash: input.subject_hash,
      consumer_id: input.consumer_id,
      issuer_id: input.issuer_id,
      granted_at: input.granted_at,
    };
    this.consents.set(input.consent_id, consent);
    this.auditEvents.push({
      event_type: 'CONSENT_GRANTED',
      at: input.granted_at,
      subject_hash: input.subject_hash,
      consumer_id: input.consumer_id,
      issuer_id: input.issuer_id,
    });
    return consent;
  }

  verifyIdentity(input: VerifyIdentityInput): IdentityVerificationResult {
    const now = input.now ?? new Date();
    const candidates = [...this.credentials.values()].filter(
      (credential) =>
        credential.subject_hash === input.subject_hash &&
        (input.issuer_id === undefined || credential.issuer_id === input.issuer_id)
    );
    if (candidates.length === 0) {
      const result: IdentityVerificationResult = { valid: false, reason_code: 'NOT_FOUND' };
      this.pushVerificationAudit(input, result);
      return result;
    }
    const latest = candidates.sort((a, b) => Date.parse(b.issued_at) - Date.parse(a.issued_at))[0];
    const issuer = this.issuers.get(latest.issuer_id);
    if (issuer === undefined || !issuer.active) {
      const result: IdentityVerificationResult = { valid: false, reason_code: 'ISSUER_INACTIVE' };
      this.pushVerificationAudit(input, result, latest);
      return result;
    }
    if (latest.revoked_at !== undefined) {
      const result: IdentityVerificationResult = { valid: false, reason_code: 'REVOKED' };
      this.pushVerificationAudit(input, result, latest);
      return result;
    }
    if (latest.expires_at !== undefined && Date.parse(latest.expires_at) <= now.getTime()) {
      const result: IdentityVerificationResult = { valid: false, reason_code: 'EXPIRED' };
      this.pushVerificationAudit(input, result, latest);
      return result;
    }
    if (input.consumer_id !== undefined) {
      const consentExists = [...this.consents.values()].some(
        (consent) =>
          consent.subject_hash === input.subject_hash &&
          consent.consumer_id === input.consumer_id &&
          consent.issuer_id === latest.issuer_id &&
          consent.revoked_at === undefined
      );
      if (!consentExists) {
        const result: IdentityVerificationResult = { valid: false, reason_code: 'CONSENT_REQUIRED' };
        this.pushVerificationAudit(input, result, latest);
        return result;
      }
    }

    const result: IdentityVerificationResult = {
      valid: true,
      issuer: latest.issuer_id,
      kyc_level: latest.kyc_level,
      reason_code: 'VERIFIED',
    };
    this.pushVerificationAudit(input, result, latest);
    return result;
  }

  enforcePayoutKyc(request: RlusdWithdrawalRequest, now: Date = new Date()): { allowed: boolean; reason_code: string } {
    const verification = this.verifyIdentity({
      subject_hash: request.subject_hash,
      consumer_id: request.consumer_id,
      issuer_id: request.identity_issuer,
      now,
    });
    if (!verification.valid) {
      this.auditEvents.push({
        event_type: 'PAYOUT_BLOCKED',
        at: now.toISOString(),
        subject_hash: request.subject_hash,
        consumer_id: request.consumer_id,
        issuer_id: request.identity_issuer,
        credential_ref: request.identity_ref,
        reason_code: verification.reason_code,
      });
      return { allowed: false, reason_code: `PAYOUT_BLOCKED_${verification.reason_code}` };
    }
    this.auditEvents.push({
      event_type: 'PAYOUT_ALLOWED',
      at: now.toISOString(),
      subject_hash: request.subject_hash,
      consumer_id: request.consumer_id,
      issuer_id: verification.issuer,
      credential_ref: request.identity_ref,
      reason_code: verification.reason_code,
    });
    return { allowed: true, reason_code: 'PAYOUT_ALLOWED' };
  }

  private pushVerificationAudit(
    input: VerifyIdentityInput,
    result: IdentityVerificationResult,
    credential?: AocIdentityCredentialRecord
  ): void {
    this.auditEvents.push({
      event_type: 'VERIFICATION_PERFORMED',
      at: (input.now ?? new Date()).toISOString(),
      subject_hash: input.subject_hash,
      consumer_id: input.consumer_id,
      issuer_id: credential?.issuer_id,
      credential_ref: credential?.credential_ref,
      reason_code: result.reason_code,
    });
  }
}

export const DEFAULT_TRUST_ISSUERS: readonly AocIdentityIssuerRecord[] = [
  {
    issuer_id: 'kyc-global-v1',
    display_name: 'KYC Global',
    active: true,
    supported_kyc_levels: ['basic', 'enhanced', 'institutional'],
  },
];
