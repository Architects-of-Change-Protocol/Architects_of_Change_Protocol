import type { ProtocolAuditEvent } from '../../protocol/audit';
import {
  createInMemoryDataAccessRepository,
  createInMemoryPayoutStateRepository,
  createInMemoryProtocolAuditRepository,
  createInMemoryTrustStateRepository,
  createInMemoryUsageRepository,
} from '../storage';

describe('repository contract parity invariants', () => {
  it('TrustStateRepository preserves latest-write wins and append-order audit visibility', () => {
    const repo = createInMemoryTrustStateRepository();
    repo.setIssuer({ issuer_id: 'i1', display_name: 'Issuer 1', active: true, supported_kyc_levels: ['basic'] });
    repo.setIssuer({ issuer_id: 'i1', display_name: 'Issuer 1 updated', active: true, supported_kyc_levels: ['basic', 'enhanced'] });
    expect(repo.getIssuer('i1')?.display_name).toBe('Issuer 1 updated');

    repo.appendAuditEvent({ event_type: 'VERIFICATION_PERFORMED', at: '2026-01-01T00:00:00Z', subject_hash: 's', reason_code: 'VERIFIED' });
    repo.appendAuditEvent({ event_type: 'CONSENT_GRANTED', at: '2026-01-01T00:00:01Z', subject_hash: 's', consumer_id: 'c', issuer_id: 'i1' });
    expect(repo.listAuditEvents().map((e) => e.event_type)).toEqual(['VERIFICATION_PERFORMED', 'CONSENT_GRANTED']);
  });

  it('DataAccessRepository enforces token uniqueness by key and append-only audit order', () => {
    const repo = createInMemoryDataAccessRepository();
    repo.setToken('t1', { token: 't1', audit_ref: 'a1', subject_hash: 's', consumer_id: 'c', dataset_id: 'd', purpose: 'p', requested_scope: [], issued_at: 'x', expires_at: 'y' });
    repo.setToken('t1', { token: 't1', audit_ref: 'a2', subject_hash: 's2', consumer_id: 'c2', dataset_id: 'd2', purpose: 'p2', requested_scope: [], issued_at: 'x2', expires_at: 'y2' });
    expect(repo.getToken('t1')?.audit_ref).toBe('a2');

    repo.appendAuditEvent({ event_type: 'DATA_ACCESS_REQUESTED', at: '2026-01-01T00:00:00Z', subject_hash: 's', consumer_id: 'c', dataset_id: 'd', reason_code: 'ACCESS_REQUEST_RECEIVED', audit_ref: 'r1' });
    repo.appendAuditEvent({ event_type: 'DATA_ACCESS_DENIED', at: '2026-01-01T00:00:01Z', subject_hash: 's', consumer_id: 'c', dataset_id: 'd', reason_code: 'ACCESS_DENIED_NOT_FOUND', audit_ref: 'r2' });
    expect(repo.listAuditEvents().map((e) => e.audit_ref)).toEqual(['r1', 'r2']);
  });

  it('PayoutStateRepository preserves idempotent key overwrite and append-only audit ordering', () => {
    const repo = createInMemoryPayoutStateRepository();
    repo.setIdempotentResult('w1', { allowed: false, reason_code: 'PAYOUT_BLOCKED_NOT_FOUND' });
    repo.setIdempotentResult('w1', { allowed: true, reason_code: 'PAYOUT_ALLOWED', payout_id: 'p1', provider_status: 'submitted' });
    expect(repo.getIdempotentResult('w1')?.allowed).toBe(true);

    repo.appendAuditEvent({ event_type: 'PAYOUT_EXECUTION_REQUESTED', at: '2026-01-01T00:00:00Z', withdrawal_id: 'w1', reason_code: 'PAYOUT_REQUEST_RECEIVED' });
    repo.appendAuditEvent({ event_type: 'PAYOUT_EXECUTION_RESULT', at: '2026-01-01T00:00:01Z', withdrawal_id: 'w1', reason_code: 'PAYOUT_ALLOWED', provider_status: 'submitted' });
    expect(repo.listAuditEvents().map((e) => e.event_type)).toEqual(['PAYOUT_EXECUTION_REQUESTED', 'PAYOUT_EXECUTION_RESULT']);
  });

  it('UsageRepository preserves append visibility for summary reducers', () => {
    const repo = createInMemoryUsageRepository();
    repo.appendUsageRecord({ consumer_id: 'c', endpoint: '/data/access', decision: 'allow', reason_code: 'OK', used_at: '2026-01-01T00:00:00Z' });
    repo.appendUsageRecord({ consumer_id: 'c', endpoint: '/data/access', decision: 'deny', reason_code: 'DENY', used_at: '2026-01-01T00:00:01Z' });
    const records = repo.listUsageRecords();
    expect(records).toHaveLength(2);
    expect(records[1].reason_code).toBe('DENY');
  });

  it('ProtocolAuditRepository enforces retention and sorted query results deterministically', () => {
    const repo = createInMemoryProtocolAuditRepository(2);
    const events: ProtocolAuditEvent[] = [
      { event_id: 'e1', event_type: 'access.granted', occurred_at: '2026-01-01T00:00:03Z', subject_id: 's', requester_id: 'r' },
      { event_id: 'e2', event_type: 'access.denied', occurred_at: '2026-01-01T00:00:01Z', subject_id: 's', requester_id: 'r' },
      { event_id: 'e3', event_type: 'access.granted', occurred_at: '2026-01-01T00:00:02Z', subject_id: 's', requester_id: 'r' },
    ];
    events.forEach((event) => repo.appendEvent(event));

    const listed = repo.listEvents();
    expect(listed.map((e) => e.event_id)).toEqual(['e2', 'e3']);
    expect(repo.listEvents({ event_type: 'access.granted' }).map((e) => e.event_id)).toEqual(['e3']);
  });
});
