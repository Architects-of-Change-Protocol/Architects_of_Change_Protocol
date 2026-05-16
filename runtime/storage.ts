import type { ProtocolAuditEvent, AuditEventQuery } from '../protocol/audit';
import type { ApiKeyRecord } from './auth/apiKeys';
import type { AccessTokenRecord, DataAccessAuditEvent } from './access/types';
import type { AocIdentityConsentRecord, AocIdentityCredentialRecord, AocIdentityIssuerRecord, TrustAuditEvent } from './trust/types';
import type { PayoutAuditEvent, PayoutExecuteResult } from './payout/types';
import type { UsageRecord } from './usage';

export interface ApiKeyRepository {
  get(apiKey: string): ApiKeyRecord | undefined;
  add(record: ApiKeyRecord): void;
  list(): ApiKeyRecord[];
}

export interface TrustStateRepository {
  getIssuer(issuerId: string): AocIdentityIssuerRecord | undefined;
  setIssuer(record: AocIdentityIssuerRecord): void;
  listCredentials(): AocIdentityCredentialRecord[];
  setCredential(record: AocIdentityCredentialRecord): void;
  listConsents(): AocIdentityConsentRecord[];
  setConsent(record: AocIdentityConsentRecord): void;
  appendAuditEvent(event: TrustAuditEvent): void;
  listAuditEvents(): TrustAuditEvent[];
}

export interface DataAccessRepository {
  setToken(token: string, record: AccessTokenRecord): void;
  getToken(token: string): AccessTokenRecord | undefined;
  appendAuditEvent(event: DataAccessAuditEvent): void;
  listAuditEvents(): DataAccessAuditEvent[];
}

export interface PayoutStateRepository {
  getIdempotentResult(withdrawalId: string): PayoutExecuteResult | undefined;
  setIdempotentResult(withdrawalId: string, result: PayoutExecuteResult): void;
  appendAuditEvent(event: PayoutAuditEvent): void;
  listAuditEvents(): PayoutAuditEvent[];
}

export interface UsageRepository {
  appendUsageRecord(record: UsageRecord): void;
  listUsageRecords(): UsageRecord[];
}

export interface ProtocolAuditRepository {
  appendEvent(event: ProtocolAuditEvent): void;
  listEvents(query?: AuditEventQuery): ProtocolAuditEvent[];
}

export function createInMemoryTrustStateRepository(): TrustStateRepository {
  const issuers = new Map<string, AocIdentityIssuerRecord>();
  const credentials = new Map<string, AocIdentityCredentialRecord>();
  const consents = new Map<string, AocIdentityConsentRecord>();
  const auditEvents: TrustAuditEvent[] = [];
  return {
    getIssuer: (issuerId) => issuers.get(issuerId),
    setIssuer: (record) => { issuers.set(record.issuer_id, record); },
    listCredentials: () => [...credentials.values()],
    setCredential: (record) => { credentials.set(record.credential_ref, record); },
    listConsents: () => [...consents.values()],
    setConsent: (record) => { consents.set(record.consent_id, record); },
    appendAuditEvent: (event) => { auditEvents.push(event); },
    listAuditEvents: () => [...auditEvents],
  };
}

export function createInMemoryDataAccessRepository(): DataAccessRepository {
  const tokens = new Map<string, AccessTokenRecord>();
  const auditEvents: DataAccessAuditEvent[] = [];
  return {
    setToken: (token, record) => { tokens.set(token, record); },
    getToken: (token) => tokens.get(token),
    appendAuditEvent: (event) => { auditEvents.push(event); },
    listAuditEvents: () => [...auditEvents],
  };
}

export function createInMemoryPayoutStateRepository(): PayoutStateRepository {
  const idempotentResults = new Map<string, PayoutExecuteResult>();
  const auditEvents: PayoutAuditEvent[] = [];
  return {
    getIdempotentResult: (withdrawalId) => idempotentResults.get(withdrawalId),
    setIdempotentResult: (withdrawalId, result) => { idempotentResults.set(withdrawalId, result); },
    appendAuditEvent: (event) => { auditEvents.push(event); },
    listAuditEvents: () => [...auditEvents],
  };
}

export function createInMemoryUsageRepository(): UsageRepository {
  const records: UsageRecord[] = [];
  return {
    appendUsageRecord: (record) => { records.push(record); },
    listUsageRecords: () => [...records],
  };
}

export function createInMemoryProtocolAuditRepository(maxEvents: number): ProtocolAuditRepository {
  const events: ProtocolAuditEvent[] = [];
  return {
    appendEvent: (event) => {
      events.push({ ...event, metadata: event.metadata === undefined ? undefined : { ...event.metadata } });
      while (events.length > maxEvents) events.shift();
    },
    listEvents: (query = {}) =>
      events
        .filter((event) => {
          if (query.event_type !== undefined && event.event_type !== query.event_type) return false;
          if (query.subject_id !== undefined && event.subject_id !== query.subject_id) return false;
          if (query.requester_id !== undefined && event.requester_id !== query.requester_id) return false;
          if (query.consent_id !== undefined && event.consent_id !== query.consent_id) return false;
          if (query.capability_id !== undefined && event.capability_id !== query.capability_id) return false;
          const occurredAt = Date.parse(event.occurred_at);
          if (query.from !== undefined && occurredAt < query.from.getTime()) return false;
          if (query.to !== undefined && occurredAt > query.to.getTime()) return false;
          return true;
        })
        .slice()
        .sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at))
        .map((event) => ({ ...event, metadata: event.metadata === undefined ? undefined : { ...event.metadata } })),
  };
}
