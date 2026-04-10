import { ConsentParseError } from './consent-errors';
import type { ProtocolConsent } from './consent-types';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ConsentParseError('Consent must be a non-null JSON object.');
  }

  return value as Record<string, unknown>;
}

function parseStringField(record: Record<string, unknown>, field: string): string {
  const value = record[field];

  if (typeof value !== 'string') {
    throw new ConsentParseError(`Consent field "${field}" must be a string.`);
  }

  return value;
}

function parseDateField(record: Record<string, unknown>, field: string): string {
  const value = parseStringField(record, field);
  if (!Number.isFinite(Date.parse(value))) {
    throw new ConsentParseError(`Consent field "${field}" must be a parseable ISO date string.`);
  }
  return value;
}

function parseScope(record: Record<string, unknown>): void {
  const scope = record.scope;
  if (!Array.isArray(scope) || scope.length === 0) {
    throw new ConsentParseError('Consent field "scope" must be a non-empty array.');
  }

  for (let i = 0; i < scope.length; i++) {
    const entry = scope[i];
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new ConsentParseError(`Consent scope entry ${i} must be a JSON object.`);
    }
    const entryRecord = entry as Record<string, unknown>;
    parseStringField(entryRecord, 'type');
    const ref = parseStringField(entryRecord, 'ref');
    if (ref.trim() === '') {
      throw new ConsentParseError(`Consent scope entry ${i} ref must be non-empty.`);
    }
  }
}

function parsePermissions(record: Record<string, unknown>): void {
  const permissions = record.permissions;
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new ConsentParseError('Consent field "permissions" must be a non-empty array.');
  }
  for (let i = 0; i < permissions.length; i++) {
    if (typeof permissions[i] !== 'string' || permissions[i].trim() === '') {
      throw new ConsentParseError(`Consent permission ${i} must be a non-empty string.`);
    }
  }
}

export function parseConsent(input: unknown): ProtocolConsent {
  const record = asRecord(input);

  const subject = parseStringField(record, 'subject');
  if (subject.trim() === '') {
    throw new ConsentParseError('Consent field "subject" must be non-empty.');
  }
  const grantee = parseStringField(record, 'grantee');
  if (grantee.trim() === '') {
    throw new ConsentParseError('Consent field "grantee" must be non-empty.');
  }
  const action = parseStringField(record, 'action');
  if (action !== 'grant' && action !== 'revoke') {
    throw new ConsentParseError('Consent field "action" must be one of: grant, revoke.');
  }

  parseScope(record);
  parsePermissions(record);
  parseDateField(record, 'issued_at');

  const consentHash = parseStringField(record, 'consent_hash');
  if (consentHash.trim() === '') {
    throw new ConsentParseError('Consent field "consent_hash" must be non-empty.');
  }

  return record as ProtocolConsent;
}
