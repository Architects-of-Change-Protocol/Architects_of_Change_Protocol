import {
  resolveMaterialActionDecision,
  isRevocationBlocking,
  verifiedNotRevokedStatus,
  revokedStatus,
  unavailableRevocationStatus,
  revocationLookupFailedStatus,
  revocationLookupTimeoutStatus,
  revocationPermissionDeniedStatus,
  revocationRecordMalformedStatus,
  revocationAuthorityMismatchStatus,
  revocationTrustDomainMismatchStatus,
  revocationSubjectMismatchStatus,
  revocationUnsupportedVersionStatus,
  mapRevocationStatusToHttpStatus,
} from '../revocation-policy';
import type { RevocationStatus } from '../revocation-types';

const SUBJECT = { subjectId: 'agent:aoc:test-1', subjectType: 'agent_identity' as const };

describe('resolveMaterialActionDecision — the single fail-closed gate', () => {
  it('allows only verified_not_revoked', () => {
    expect(resolveMaterialActionDecision(verifiedNotRevokedStatus(SUBJECT))).toBe('allow');
  });

  it('blocks revoked', () => {
    expect(
      resolveMaterialActionDecision(
        revokedStatus({ ...SUBJECT, revocationId: 'rev-1', reasonCode: 'REVOKED', revokedAt: '2026-01-01T00:00:00Z' })
      )
    ).toBe('block');
  });

  const unknownBuilders: Array<[string, () => RevocationStatus]> = [
    ['status unavailable (never checked)', () => unavailableRevocationStatus(SUBJECT)],
    ['lookup failed', () => revocationLookupFailedStatus(SUBJECT)],
    ['lookup timeout', () => revocationLookupTimeoutStatus(SUBJECT)],
    ['permission denied', () => revocationPermissionDeniedStatus(SUBJECT)],
    ['malformed record', () => revocationRecordMalformedStatus(SUBJECT)],
    ['authority mismatch', () => revocationAuthorityMismatchStatus(SUBJECT)],
    ['trust domain mismatch', () => revocationTrustDomainMismatchStatus(SUBJECT)],
    ['subject mismatch', () => revocationSubjectMismatchStatus(SUBJECT)],
    ['unsupported version', () => revocationUnsupportedVersionStatus(SUBJECT)],
  ];

  it.each(unknownBuilders)('blocks on %s — unknown is never treated as verified_not_revoked', (_label, build) => {
    const status = build();
    expect(status.status).toBe('unknown');
    expect(resolveMaterialActionDecision(status)).toBe('block');
    expect(isRevocationBlocking(status)).toBe(true);
  });

  it('FAIL-CLOSED REGRESSION: every unknown category is retryable-or-not but never allow', () => {
    // Exhaustiveness guard: if a new RevocationStatus variant is ever added without updating
    // resolveMaterialActionDecision, this switches to a compile error (see the `never` branch in
    // revocation-policy.ts). This test additionally asserts no unknown category can sneak into
    // "allow" through a status-string typo.
    const statuses = unknownBuilders.map(([, build]) => build());
    for (const status of statuses) {
      expect(resolveMaterialActionDecision(status)).not.toBe('allow');
    }
  });
});

describe('mapRevocationStatusToHttpStatus', () => {
  it('maps verified_not_revoked to 200', () => {
    expect(mapRevocationStatusToHttpStatus(verifiedNotRevokedStatus(SUBJECT))).toBe(200);
  });

  it('maps revoked to 403', () => {
    expect(
      mapRevocationStatusToHttpStatus(
        revokedStatus({ ...SUBJECT, revocationId: 'rev-1', reasonCode: 'REVOKED', revokedAt: '2026-01-01T00:00:00Z' })
      )
    ).toBe(403);
  });

  it('maps unavailable/lookup-failed/timeout to 503 (retry-safe)', () => {
    expect(mapRevocationStatusToHttpStatus(unavailableRevocationStatus(SUBJECT))).toBe(503);
    expect(mapRevocationStatusToHttpStatus(revocationLookupFailedStatus(SUBJECT))).toBe(503);
    expect(mapRevocationStatusToHttpStatus(revocationLookupTimeoutStatus(SUBJECT))).toBe(503);
  });

  it('maps mismatch categories to 403 (do not imply the source is broken)', () => {
    expect(mapRevocationStatusToHttpStatus(revocationAuthorityMismatchStatus(SUBJECT))).toBe(403);
    expect(mapRevocationStatusToHttpStatus(revocationTrustDomainMismatchStatus(SUBJECT))).toBe(403);
    expect(mapRevocationStatusToHttpStatus(revocationSubjectMismatchStatus(SUBJECT))).toBe(403);
    expect(mapRevocationStatusToHttpStatus(revocationPermissionDeniedStatus(SUBJECT))).toBe(403);
  });
});

describe('status builders carry stable, non-throwing shapes', () => {
  it('unavailableRevocationStatus is retryable: false (there is nothing to retry — no check was wired)', () => {
    expect(unavailableRevocationStatus(SUBJECT).retryable).toBe(false);
  });

  it('lookup failures and timeouts are retryable: true', () => {
    expect(revocationLookupFailedStatus(SUBJECT).retryable).toBe(true);
    expect(revocationLookupTimeoutStatus(SUBJECT).retryable).toBe(true);
  });

  it('mismatch and malformed categories are retryable: false (retrying will not fix a structural mismatch)', () => {
    expect(revocationAuthorityMismatchStatus(SUBJECT).retryable).toBe(false);
    expect(revocationTrustDomainMismatchStatus(SUBJECT).retryable).toBe(false);
    expect(revocationSubjectMismatchStatus(SUBJECT).retryable).toBe(false);
    expect(revocationRecordMalformedStatus(SUBJECT).retryable).toBe(false);
    expect(revocationUnsupportedVersionStatus(SUBJECT).retryable).toBe(false);
    expect(revocationPermissionDeniedStatus(SUBJECT).retryable).toBe(false);
  });
});
