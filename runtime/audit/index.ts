/**
 * Compatibility bridge for the historical hosted audit runtime surface.
 *
 * @deprecated Use `@aoc/enterprise/assurance/audit` instead.
 * Migrate to Enterprise Assurance; this bridge is a retirement candidate.
 */
export { InMemoryAuditService, RuntimeAuditService } from './service';
export type { ListAuditEventsInput, RuntimeAuditEvent } from './service';
export type {
  HostedProtocolAuditEvent as ProtocolAuditEvent,
  HostedAuditEventQuery as AuditEventQuery,
  HostedProtocolAuditEventType as AuditEventType,
} from '../../enterprise/src/assurance/audit';
