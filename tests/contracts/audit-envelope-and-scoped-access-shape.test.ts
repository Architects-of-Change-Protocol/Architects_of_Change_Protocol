import type { AuditEventEnvelope, ScopedAccessRequest } from '@aoc/protocol/contracts';

/**
 * Declaration-level shape tests for the two contracts stabilized in the
 * AOC Protocol / AOC Enterprise Public API Stabilization Sprint.
 * These assert compile-time facts about the real, published types — if the
 * shape regresses, `npm run typecheck` fails here before any consumer does.
 */

const scopedAccessRequestFixture: ScopedAccessRequest = {
  principalId: 'principal-1',
  resource: { kind: 'record', id: 'record-1' },
  requestedScope: ['record:read'],
  requestedAt: '2026-07-14T00:00:00.000Z',
};

// `scope`/`action` have never existed on ScopedAccessRequest — assigning either
// as a top-level property is a compile error, not a runtime behavior.
const _scopedAccessRequestRejectsLegacyScope: ScopedAccessRequest = {
  ...scopedAccessRequestFixture,
  // @ts-expect-error `scope` is not a field of ScopedAccessRequest — use `requestedScope`.
  scope: ['record:read'],
};

const _scopedAccessRequestRejectsLegacyAction: ScopedAccessRequest = {
  ...scopedAccessRequestFixture,
  // @ts-expect-error `action` is not a field of ScopedAccessRequest.
  action: 'read',
};

const minimalAuditEventEnvelopeFixture: AuditEventEnvelope = {
  eventId: 'audit-event-1',
  eventType: 'protocol.fixture.created',
  emittedAt: '2026-07-14T00:00:00.000Z',
  payload: {},
};

const extendedAuditEventEnvelopeFixture: AuditEventEnvelope = {
  ...minimalAuditEventEnvelopeFixture,
  occurredAt: '2026-07-13T23:59:00.000Z',
  actorId: 'principal-requester-1',
  subject: { kind: 'record', id: 'record-1', tenantId: 'tenant-1' },
  correlationId: 'operation-1',
  reasonCodes: ['ACCESS_GRANTED'],
  schemaVersion: '1.1.0',
};

describe('ScopedAccessRequest and AuditEventEnvelope shape stabilization', () => {
  it('accepts the canonical ScopedAccessRequest shape built only on requestedScope', () => {
    expect(scopedAccessRequestFixture.requestedScope).toEqual(['record:read']);
  });

  it('accepts AuditEventEnvelope with only the original required fields', () => {
    expect(minimalAuditEventEnvelopeFixture.payload).toEqual({});
  });

  it('accepts AuditEventEnvelope with every additive optional field populated', () => {
    expect(extendedAuditEventEnvelopeFixture.subject).toEqual({
      kind: 'record',
      id: 'record-1',
      tenantId: 'tenant-1',
    });
    expect(extendedAuditEventEnvelopeFixture.correlationId).toBe('operation-1');
    expect(extendedAuditEventEnvelopeFixture.reasonCodes).toEqual(['ACCESS_GRANTED']);
  });
});
