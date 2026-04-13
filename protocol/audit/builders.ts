import { randomUUID } from 'crypto';
import type { AuditEvent, AuditEventType } from './types';

type AuditEventBuilderInput = Omit<AuditEvent, 'event_type' | 'event_id' | 'occurred_at'> & {
  event_id?: string;
  occurred_at?: Date | string;
};

function normalizeOccurredAt(input?: Date | string): string {
  if (input === undefined) {
    return new Date().toISOString();
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function normalizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (metadata === undefined) {
    return undefined;
  }

  return { ...metadata };
}

function buildAuditEvent(eventType: AuditEventType, input: AuditEventBuilderInput): AuditEvent {
  return {
    ...input,
    event_id: input.event_id ?? randomUUID(),
    event_type: eventType,
    occurred_at: normalizeOccurredAt(input.occurred_at),
    metadata: normalizeMetadata(input.metadata),
  };
}

export function buildConsentEvaluatedEvent(input: AuditEventBuilderInput): AuditEvent {
  return buildAuditEvent('CONSENT_EVALUATED', input);
}

export function buildCapabilityIssuedEvent(input: AuditEventBuilderInput): AuditEvent {
  return buildAuditEvent('CAPABILITY_ISSUED', input);
}

export function buildCapabilityValidatedEvent(input: AuditEventBuilderInput): AuditEvent {
  return buildAuditEvent('CAPABILITY_VALIDATED', input);
}

export function buildCapabilityAuthorizedEvent(input: AuditEventBuilderInput): AuditEvent {
  return buildAuditEvent('CAPABILITY_AUTHORIZED', input);
}

export function buildCapabilityDeniedEvent(input: AuditEventBuilderInput): AuditEvent {
  return buildAuditEvent('CAPABILITY_DENIED', input);
}
