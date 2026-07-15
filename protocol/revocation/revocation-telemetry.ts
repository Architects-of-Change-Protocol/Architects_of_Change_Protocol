export const REVOCATION_TELEMETRY_EVENTS = {
  CHECK_STARTED: 'revocation.check.started',
  CHECK_NOT_REVOKED: 'revocation.check.not_revoked',
  CHECK_REVOKED: 'revocation.check.revoked',
  CHECK_UNKNOWN: 'revocation.check.unknown',
  CHECK_FAILED: 'revocation.check.failed',
  COMMAND_STARTED: 'revocation.command.started',
  COMMAND_COMPLETED: 'revocation.command.completed',
  COMMAND_FAILED: 'revocation.command.failed',
  CASCADE_STARTED: 'revocation.cascade.started',
  CASCADE_COMPLETED: 'revocation.cascade.completed',
  IDEMPOTENCY_REPLAYED: 'revocation.idempotency.replayed',
  IDEMPOTENCY_CONFLICT: 'revocation.idempotency.conflict',
  BILLING_OVERRIDE: 'revocation.billing_override',
} as const;

export type RevocationTelemetryEvent = (typeof REVOCATION_TELEMETRY_EVENTS)[keyof typeof REVOCATION_TELEMETRY_EVENTS];

/**
 * Fields that must never appear in a revocation telemetry payload: private keys, tokens, raw
 * credentials, full claims/passports, or anything shaped like a secret. Payload builders in this
 * module only ever include identifiers, reason codes, and counts, but this guard exists as a
 * defense-in-depth backstop for callers assembling their own payloads.
 */
const FORBIDDEN_PAYLOAD_KEY_PATTERN = /secret|private[_-]?key|password|token$|credential$|raw[_-]?claims|raw[_-]?passport/i;

export function redactRevocationTelemetryPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    redacted[key] = FORBIDDEN_PAYLOAD_KEY_PATTERN.test(key) ? '[redacted]' : value;
  }
  return redacted;
}

export type RevocationTelemetryHook = (event: RevocationTelemetryEvent, payload: Record<string, unknown>) => void;

export function emitRevocationTelemetry(
  hook: RevocationTelemetryHook | undefined,
  event: RevocationTelemetryEvent,
  payload: Record<string, unknown>
): void {
  hook?.(event, redactRevocationTelemetryPayload(payload));
}
