import crypto from 'crypto';
import type { AccessLedgerEntry, LedgerEventType } from '../temporal/types';

// ---------------------------------------------------------------------------
// In-Memory Access Ledger
// ---------------------------------------------------------------------------

/**
 * The Access Ledger is an append-only log of protocol-significant events.
 * Each entry is immutable: entries are never modified or removed after creation.
 *
 * Scope of events logged:
 *  - ACCESS_GRANTED  — successful vault access
 *  - ACCESS_DENIED   — rejected vault access (with reason code)
 *  - EXPIRED         — token rejected due to expiration
 *  - REVOKED         — token revoked before natural expiration
 *  - RENEWED         — consent renewed; new generation issued
 *  - AFFILIATION_REVOKED — institutional affiliation credential invalidated
 */

let ledger: AccessLedgerEntry[] = [];

function generateEntryId(): string {
  return crypto.randomBytes(32).toString('hex');
}

function nowISO(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Appends a new entry to the Access Ledger.
 */
export function appendLedgerEntry(
  event_type: LedgerEventType,
  capability_hash: string,
  consent_hash: string,
  subject: string,
  grantee: string,
  reason_code: string | null = null,
  metadata: Record<string, string> | null = null,
  now?: Date
): AccessLedgerEntry {
  const entry: AccessLedgerEntry = {
    entry_id: generateEntryId(),
    event_type,
    capability_hash,
    consent_hash,
    subject,
    grantee,
    timestamp: now
      ? now.toISOString().replace(/\.\d{3}Z$/, 'Z')
      : nowISO(),
    reason_code,
    metadata,
  };

  ledger.push(entry);
  return entry;
}

/**
 * Returns a read-only snapshot of all ledger entries.
 */
export function getLedger(): ReadonlyArray<AccessLedgerEntry> {
  return [...ledger];
}

/**
 * Returns entries filtered by event type.
 */
export function getLedgerByEventType(
  event_type: LedgerEventType
): ReadonlyArray<AccessLedgerEntry> {
  return ledger.filter(e => e.event_type === event_type);
}

/**
 * Returns entries for a specific consent hash.
 */
export function getLedgerByConsentHash(
  consent_hash: string
): ReadonlyArray<AccessLedgerEntry> {
  return ledger.filter(e => e.consent_hash === consent_hash);
}

/**
 * Returns entries for a specific capability hash.
 */
export function getLedgerByCapabilityHash(
  capability_hash: string
): ReadonlyArray<AccessLedgerEntry> {
  return ledger.filter(e => e.capability_hash === capability_hash);
}

/**
 * Resets the ledger. Intended for testing only.
 */
export function resetAccessLedger(): void {
  ledger = [];
}
