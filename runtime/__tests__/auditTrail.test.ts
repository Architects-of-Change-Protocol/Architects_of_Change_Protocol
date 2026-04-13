import { InMemoryAuditService } from '../audit';
import {
  buildCapabilityAuthorizedEvent,
  buildCapabilityDeniedEvent,
  buildCapabilityIssuedEvent,
  buildCapabilityValidatedEvent,
  buildConsentEvaluatedEvent,
  type AuditEvent,
} from '../../protocol/audit';

const SUBJECT_A = 'did:aoc:subject:a';
const SUBJECT_B = 'did:aoc:subject:b';
const REQUESTER_A = 'did:aoc:requester:a';
const REQUESTER_B = 'did:aoc:requester:b';

describe('InMemoryAuditService', () => {
  function createEvent(event: Partial<AuditEvent> & Pick<AuditEvent, 'event_type'>): AuditEvent {
    const now = event.occurred_at ?? '2026-01-01T00:00:00.000Z';

    if (event.event_type === 'CONSENT_EVALUATED') {
      return buildConsentEvaluatedEvent({
        event_id: event.event_id ?? 'evt-consent',
        occurred_at: now,
        allowed: event.allowed,
        reason_code: event.reason_code,
        subject_id: event.subject_id,
        requester_id: event.requester_id,
        consent_id: event.consent_id,
        metadata: event.metadata,
      });
    }

    if (event.event_type === 'CAPABILITY_ISSUED') {
      return buildCapabilityIssuedEvent({
        event_id: event.event_id ?? 'evt-issued',
        occurred_at: now,
        subject_id: event.subject_id,
        requester_id: event.requester_id,
        capability_id: event.capability_id,
        reason_code: event.reason_code,
        metadata: event.metadata,
      });
    }

    if (event.event_type === 'CAPABILITY_AUTHORIZED') {
      return buildCapabilityAuthorizedEvent({
        event_id: event.event_id ?? 'evt-authorized',
        occurred_at: now,
        allowed: event.allowed,
        subject_id: event.subject_id,
        requester_id: event.requester_id,
        capability_id: event.capability_id,
        reason_code: event.reason_code,
        metadata: event.metadata,
      });
    }

    if (event.event_type === 'CAPABILITY_VALIDATED') {
      return buildCapabilityValidatedEvent({
        event_id: event.event_id ?? 'evt-validated',
        occurred_at: now,
        allowed: event.allowed,
        subject_id: event.subject_id,
        requester_id: event.requester_id,
        capability_id: event.capability_id,
        reason_code: event.reason_code,
        metadata: event.metadata,
      });
    }

    return buildCapabilityDeniedEvent({
      event_id: event.event_id ?? 'evt-denied',
      occurred_at: now,
      allowed: event.allowed,
      subject_id: event.subject_id,
      requester_id: event.requester_id,
      capability_id: event.capability_id,
      reason_code: event.reason_code,
      metadata: event.metadata,
    });
  }

  it('records and lists a consent evaluation allow event', () => {
    const service = new InMemoryAuditService();
    const event = createEvent({
      event_type: 'CONSENT_EVALUATED',
      event_id: 'evt-1',
      occurred_at: '2026-01-01T00:00:00.000Z',
      allowed: true,
      reason_code: 'CONSENT_ALLOW',
      subject_id: SUBJECT_A,
      requester_id: REQUESTER_A,
      consent_id: 'consent-1',
    });

    service.recordEvent(event);

    expect(service.listEvents()).toEqual([event]);
  });

  it('records and lists a consent evaluation deny event', () => {
    const service = new InMemoryAuditService();
    const event = createEvent({
      event_type: 'CONSENT_EVALUATED',
      event_id: 'evt-2',
      occurred_at: '2026-01-01T01:00:00.000Z',
      allowed: false,
      reason_code: 'CONSENT_DENY',
      subject_id: SUBJECT_A,
      requester_id: REQUESTER_B,
      consent_id: 'consent-2',
    });

    service.recordEvent(event);

    expect(service.listEvents()).toEqual([event]);
  });

  it('records capability issued event', () => {
    const service = new InMemoryAuditService();
    const event = createEvent({
      event_type: 'CAPABILITY_ISSUED',
      event_id: 'evt-3',
      occurred_at: '2026-01-01T02:00:00.000Z',
      subject_id: SUBJECT_A,
      requester_id: REQUESTER_A,
      capability_id: 'cap-1',
      reason_code: 'CAPABILITY_ISSUED_OK',
    });

    service.recordEvent(event);

    expect(service.listEvents()).toEqual([event]);
  });

  it('records capability authorized event', () => {
    const service = new InMemoryAuditService();
    const event = createEvent({
      event_type: 'CAPABILITY_AUTHORIZED',
      event_id: 'evt-4',
      occurred_at: '2026-01-01T03:00:00.000Z',
      allowed: true,
      subject_id: SUBJECT_B,
      requester_id: REQUESTER_A,
      capability_id: 'cap-2',
      reason_code: 'CAPABILITY_AUTHORIZED',
    });

    service.recordEvent(event);

    expect(service.listEvents()).toEqual([event]);
  });

  it('records capability denied event', () => {
    const service = new InMemoryAuditService();
    const event = createEvent({
      event_type: 'CAPABILITY_DENIED',
      event_id: 'evt-5',
      occurred_at: '2026-01-01T04:00:00.000Z',
      allowed: false,
      subject_id: SUBJECT_B,
      requester_id: REQUESTER_B,
      capability_id: 'cap-3',
      reason_code: 'CAPABILITY_NOT_ALLOWED',
    });

    service.recordEvent(event);

    expect(service.listEvents()).toEqual([event]);
  });

  it('filters by event_type', () => {
    const service = new InMemoryAuditService();
    const issued = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-6', capability_id: 'cap-6' });
    const denied = createEvent({ event_type: 'CAPABILITY_DENIED', event_id: 'evt-7', capability_id: 'cap-7' });

    service.recordEvent(issued);
    service.recordEvent(denied);

    expect(service.listEvents({ event_type: 'CAPABILITY_DENIED' })).toEqual([denied]);
  });

  it('filters by subject_id', () => {
    const service = new InMemoryAuditService();
    const a = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-8', subject_id: SUBJECT_A });
    const b = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-9', subject_id: SUBJECT_B });

    service.recordEvent(a);
    service.recordEvent(b);

    expect(service.listEvents({ subject_id: SUBJECT_A })).toEqual([a]);
  });

  it('filters by requester_id', () => {
    const service = new InMemoryAuditService();
    const a = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-10', requester_id: REQUESTER_A });
    const b = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-11', requester_id: REQUESTER_B });

    service.recordEvent(a);
    service.recordEvent(b);

    expect(service.listEvents({ requester_id: REQUESTER_B })).toEqual([b]);
  });

  it('filters by consent_id', () => {
    const service = new InMemoryAuditService();
    const a = createEvent({ event_type: 'CONSENT_EVALUATED', event_id: 'evt-12', consent_id: 'consent-a' });
    const b = createEvent({ event_type: 'CONSENT_EVALUATED', event_id: 'evt-13', consent_id: 'consent-b' });

    service.recordEvent(a);
    service.recordEvent(b);

    expect(service.listEvents({ consent_id: 'consent-a' })).toEqual([a]);
  });

  it('filters by capability_id', () => {
    const service = new InMemoryAuditService();
    const a = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-14', capability_id: 'cap-a' });
    const b = createEvent({ event_type: 'CAPABILITY_DENIED', event_id: 'evt-15', capability_id: 'cap-b' });

    service.recordEvent(a);
    service.recordEvent(b);

    expect(service.listEvents({ capability_id: 'cap-b' })).toEqual([b]);
  });

  it('filters by inclusive date range', () => {
    const service = new InMemoryAuditService();
    const start = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-16', occurred_at: '2026-01-02T00:00:00.000Z' });
    const middle = createEvent({ event_type: 'CAPABILITY_AUTHORIZED', event_id: 'evt-17', occurred_at: '2026-01-02T12:00:00.000Z' });
    const end = createEvent({ event_type: 'CAPABILITY_DENIED', event_id: 'evt-18', occurred_at: '2026-01-03T00:00:00.000Z' });

    service.recordEvent(start);
    service.recordEvent(middle);
    service.recordEvent(end);

    expect(
      service.listEvents({
        from: new Date('2026-01-02T00:00:00.000Z'),
        to: new Date('2026-01-03T00:00:00.000Z'),
      })
    ).toEqual([start, middle, end]);
  });

  it('returns empty when nothing matches', () => {
    const service = new InMemoryAuditService();
    service.recordEvent(createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-19', subject_id: SUBJECT_A }));

    expect(service.listEvents({ subject_id: 'did:aoc:subject:missing' })).toEqual([]);
  });

  it('handles metadata safely', () => {
    const service = new InMemoryAuditService();
    const metadata = { channel: 'api', cost: 10 };
    const event = createEvent({
      event_type: 'CAPABILITY_AUTHORIZED',
      event_id: 'evt-20',
      metadata,
    });

    service.recordEvent(event);
    metadata.channel = 'mutated';

    const listed = service.listEvents();
    expect(listed[0]?.metadata).toEqual({ channel: 'api', cost: 10 });

    const copy = listed[0]?.metadata as { channel: string };
    copy.channel = 'changed-again';

    expect(service.listEvents()[0]?.metadata).toEqual({ channel: 'api', cost: 10 });
  });

  it('preserves deterministic ordering', () => {
    const service = new InMemoryAuditService();
    const first = createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-21', occurred_at: '2026-01-04T03:00:00.000Z' });
    const second = createEvent({
      event_type: 'CAPABILITY_VALIDATED',
      event_id: 'evt-22',
      occurred_at: '2026-01-04T01:00:00.000Z',
    });
    const third = createEvent({ event_type: 'CAPABILITY_DENIED', event_id: 'evt-23', occurred_at: '2026-01-04T02:00:00.000Z' });

    service.recordEvent(first);
    service.recordEvent(second);
    service.recordEvent(third);

    expect(service.listEvents().map((event) => event.event_id)).toEqual(['evt-22', 'evt-23', 'evt-21']);
  });

  it('drops oldest events when max size is exceeded', () => {
    const service = new InMemoryAuditService(2);

    service.recordEvent(createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-24', occurred_at: '2026-01-05T01:00:00.000Z' }));
    service.recordEvent(createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-25', occurred_at: '2026-01-05T02:00:00.000Z' }));
    service.recordEvent(createEvent({ event_type: 'CAPABILITY_ISSUED', event_id: 'evt-26', occurred_at: '2026-01-05T03:00:00.000Z' }));

    expect(service.listEvents().map((event) => event.event_id)).toEqual(['evt-25', 'evt-26']);
  });
});
