import { canonicalizeJSON } from '../../canonicalize';
import { sha256Hex } from '../../storage/hash';
import { CapabilityParseError } from './capability-errors';
import type { ProtocolCapability } from './capability-types';
import type { ScopeEntry } from '../consent/consent-types';

const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;
const ISO8601_UTC_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
const DID_PATTERN = /^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$/;
const PERMISSION_PATTERN = /^[a-z0-9-]+$/;
const VALID_SCOPE_TYPES = new Set(['field', 'content', 'pack']);

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CapabilityParseError('Capability must be a non-null JSON object.');
  }

  return value as Record<string, unknown>;
}

function parseStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== 'string') {
    throw new CapabilityParseError(`Capability field "${field}" must be a string.`);
  }

  return value;
}

function parseDateField(record: Record<string, unknown>, field: string): string {
  const value = parseStringField(record, field);
  if (!ISO8601_UTC_PATTERN.test(value)) {
    throw new CapabilityParseError(`Capability field "${field}" must be ISO8601 UTC with second precision.`);
  }

  return value;
}

function parseScope(record: Record<string, unknown>): ScopeEntry[] {
  const scope = record.scope;
  if (!Array.isArray(scope) || scope.length === 0) {
    throw new CapabilityParseError('Capability field "scope" must be a non-empty array.');
  }

  return scope.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new CapabilityParseError(`Capability scope entry ${index} must be a JSON object.`);
    }

    const entryRecord = entry as Record<string, unknown>;
    const type = parseStringField(entryRecord, 'type');
    const ref = parseStringField(entryRecord, 'ref').trim().toLowerCase();

    if (!VALID_SCOPE_TYPES.has(type)) {
      throw new CapabilityParseError(`Capability scope entry ${index} has invalid type.`);
    }

    if (!HASH_HEX_PATTERN.test(ref)) {
      throw new CapabilityParseError(`Capability scope entry ${index} ref must be 64 lowercase hex.`);
    }

    return {
      type: type as ScopeEntry['type'],
      ref,
    };
  });
}

function parsePermissions(record: Record<string, unknown>): string[] {
  const permissions = record.permissions;
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new CapabilityParseError('Capability field "permissions" must be a non-empty array.');
  }

  return permissions.map((permission, index) => {
    if (typeof permission !== 'string') {
      throw new CapabilityParseError(`Capability permission ${index} must be a string.`);
    }

    const normalized = permission.trim().toLowerCase();
    if (!PERMISSION_PATTERN.test(normalized)) {
      throw new CapabilityParseError(
        `Capability permission ${index} must be lowercase alphanumeric with hyphens.`
      );
    }

    return normalized;
  });
}

function normalizeScope(scope: ScopeEntry[]): ScopeEntry[] {
  return [...scope].sort((a, b) => {
    const typeCmp = a.type.localeCompare(b.type);
    if (typeCmp !== 0) {
      return typeCmp;
    }

    return a.ref.localeCompare(b.ref);
  });
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export function parseCapability(input: unknown): ProtocolCapability {
  const record = asRecord(input);

  const capability_hash = parseStringField(record, 'capability_hash').trim().toLowerCase();
  const parent_consent_hash = parseStringField(record, 'parent_consent_hash').trim().toLowerCase();
  const subject = parseStringField(record, 'subject').trim();
  const grantee = parseStringField(record, 'grantee').trim();
  const issued_at = parseDateField(record, 'issued_at');
  const expires_at = parseDateField(record, 'expires_at');
  const notBeforeRaw = record.not_before;

  if (!HASH_HEX_PATTERN.test(capability_hash)) {
    throw new CapabilityParseError('Capability capability_hash must be 64 lowercase hex.');
  }
  if (!HASH_HEX_PATTERN.test(parent_consent_hash)) {
    throw new CapabilityParseError('Capability parent_consent_hash must be 64 lowercase hex.');
  }
  if (!DID_PATTERN.test(subject)) {
    throw new CapabilityParseError('Capability subject must be a valid DID.');
  }
  if (!DID_PATTERN.test(grantee)) {
    throw new CapabilityParseError('Capability grantee must be a valid DID.');
  }

  const scope = normalizeScope(parseScope(record));
  const permissions = uniqueStrings(parsePermissions(record)).sort();

  const normalized: ProtocolCapability = {
    capability_hash,
    parent_consent_hash,
    subject,
    grantee,
    scope,
    permissions,
    issued_at,
    expires_at,
  };

  if (notBeforeRaw !== undefined) {
    if (typeof notBeforeRaw !== 'string' || !ISO8601_UTC_PATTERN.test(notBeforeRaw)) {
      throw new CapabilityParseError('Capability not_before must be ISO8601 UTC with second precision.');
    }
    normalized.not_before = notBeforeRaw;
  }

  if (record.marketMakerId !== undefined) {
    if (typeof record.marketMakerId !== 'string' || record.marketMakerId.trim() === '') {
      throw new CapabilityParseError('Capability marketMakerId must be a non-empty string when provided.');
    }
    normalized.marketMakerId = record.marketMakerId.trim();
  }

  if (record.metadata !== undefined) {
    if (typeof record.metadata !== 'object' || record.metadata === null || Array.isArray(record.metadata)) {
      throw new CapabilityParseError('Capability metadata must be a JSON object when provided.');
    }
    normalized.metadata = record.metadata as Record<string, unknown>;
  }

  return normalized;
}

export function toCanonicalCapabilityHashPayload(capability: Omit<ProtocolCapability, 'capability_hash' | 'metadata'>): {
  parent_consent_hash: string;
  subject: string;
  grantee: string;
  scope: ScopeEntry[];
  permissions: string[];
  issued_at: string;
  expires_at: string;
  not_before: string | null;
  marketMakerId: string | null;
} {
  return {
    parent_consent_hash: capability.parent_consent_hash,
    subject: capability.subject,
    grantee: capability.grantee,
    scope: normalizeScope(capability.scope).map((entry) => ({ type: entry.type, ref: entry.ref })),
    permissions: [...capability.permissions].sort(),
    issued_at: capability.issued_at,
    expires_at: capability.expires_at,
    not_before: capability.not_before ?? null,
    marketMakerId: capability.marketMakerId ?? null,
  };
}

export function computeCapabilityDeterministicHash(
  capability: Omit<ProtocolCapability, 'capability_hash' | 'metadata'>
): string {
  const canonicalPayload = toCanonicalCapabilityHashPayload(capability);
  const canonical = canonicalizeJSON(canonicalPayload);
  return sha256Hex(new TextEncoder().encode(canonical));
}
