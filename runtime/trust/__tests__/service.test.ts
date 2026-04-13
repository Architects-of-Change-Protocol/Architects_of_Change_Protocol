import { DEFAULT_TRUST_ISSUERS, InMemoryTrustService } from '../service';
import type { RlusdWithdrawalRequest } from '../types';

const SUBJECT_HASH = '0xsubjecthash01';
const CONSUMER = 'hrkey-v1';

function buildWithdrawalRequest(overrides: Partial<RlusdWithdrawalRequest> = {}): RlusdWithdrawalRequest {
  return {
    withdrawal_id: 'wd_1',
    subject_hash: SUBJECT_HASH,
    consumer_id: CONSUMER,
    amount: '100.00',
    wallet_address: '0xabc123',
    ...overrides,
  };
}

describe('InMemoryTrustService', () => {
  it('registers credential with non-sensitive hashed metadata only', () => {
    const trust = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const credential = trust.registerCredential({
      credential_ref: 'cred_1',
      subject_hash: SUBJECT_HASH,
      issuer_id: 'kyc-global-v1',
      credential_hash: '0xcredentialhash',
      metadata_hash: '0xmetadatahash',
      kyc_level: 'enhanced',
      wallet_address: '0xabc123',
      issued_at: '2026-01-01T00:00:00Z',
    });

    expect(credential.credential_hash).toBe('0xcredentialhash');
    expect(credential.metadata_hash).toBe('0xmetadatahash');
    expect((credential as Record<string, unknown>).pii).toBeUndefined();
  });

  it('verifies identity only with granted consent', () => {
    const trust = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    trust.registerCredential({
      credential_ref: 'cred_1',
      subject_hash: SUBJECT_HASH,
      issuer_id: 'kyc-global-v1',
      credential_hash: '0xcredentialhash',
      metadata_hash: '0xmetadatahash',
      kyc_level: 'basic',
      issued_at: '2026-01-01T00:00:00Z',
      expires_at: '2027-01-01T00:00:00Z',
    });

    const withoutConsent = trust.verifyIdentity({
      subject_hash: SUBJECT_HASH,
      consumer_id: CONSUMER,
      now: new Date('2026-02-01T00:00:00Z'),
    });
    expect(withoutConsent.valid).toBe(false);
    expect(withoutConsent.reason_code).toBe('CONSENT_REQUIRED');

    trust.grantConsent({
      consent_id: 'consent_1',
      subject_hash: SUBJECT_HASH,
      consumer_id: CONSUMER,
      issuer_id: 'kyc-global-v1',
      granted_at: '2026-02-01T00:00:00Z',
    });

    const withConsent = trust.verifyIdentity({
      subject_hash: SUBJECT_HASH,
      consumer_id: CONSUMER,
      now: new Date('2026-02-01T00:00:00Z'),
    });
    expect(withConsent.valid).toBe(true);
    expect(withConsent.issuer).toBe('kyc-global-v1');
    expect(withConsent.kyc_level).toBe('basic');
  });

  it('blocks payout when valid KYC is missing', () => {
    const trust = new InMemoryTrustService(DEFAULT_TRUST_ISSUERS);
    const blocked = trust.enforcePayoutKyc(buildWithdrawalRequest(), new Date('2026-02-01T00:00:00Z'));

    expect(blocked.allowed).toBe(false);
    expect(blocked.reason_code).toBe('PAYOUT_BLOCKED_NOT_FOUND');
  });
});
