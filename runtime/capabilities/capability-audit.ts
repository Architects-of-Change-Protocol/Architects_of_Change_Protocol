import type { CapabilityAuditEventType, CapabilityAuditHook } from './types';

export function emitCapabilityAuditEvent(
  auditHook: CapabilityAuditHook | undefined,
  eventType: CapabilityAuditEventType,
  payload: Record<string, unknown>
): void {
  auditHook?.(eventType, payload);
}
