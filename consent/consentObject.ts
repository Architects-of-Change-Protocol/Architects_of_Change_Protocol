import { canonicalizeConsentPayload } from './canonical';
import { computeConsentHash } from './hash';
import { BuildConsentOptions, ConsentObjectV1, ScopeEntry } from './types';

const VERSION_PATTERN = /^[0-9]+\.[0-9]+$/;
const DID_PATTERN = /^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$/;
const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;
const ISO8601_UTC_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
const PERMISSION_PATTERN = /^[a-z][a-z0-9-]*$/;

const VALID_ACTIONS: ReadonlyArray<string> = ['grant', 'revoke'];
const VALID_SCOPE_TYPES: ReadonlyArray<string> = ['field', 'content', 'pack'];

const MIN_DID_LENGTH = 8;
const MAX_DID_LENGTH = 2048;
const MAX_SCOPE_ENTRIES = 10000;
const MAX_PERMISSIONS = 100;

function validateVersion(version: string): void {
  if (typeof version !== 'string' || !VERSION_PATTERN.test(version)) {
    throw new Error(
      'Consent version must match pattern MAJOR.MINOR (e.g., "1.0").'
    );
  }
}

function validateDID(value: string, fieldName: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Consent ${fieldName} must be non-empty.`);
  }
  if (value.length < MIN_DID_LENGTH) {
    throw new Error(
      `Consent ${fieldName} must be at least ${MIN_DID_LENGTH} characters.`
    );
  }
  if (value.length > MAX_DID_LENGTH) {
    throw new Error(
      `Consent ${fieldName} must be at most ${MAX_DID_LENGTH} characters.`
    );
  }
  if (!DID_PATTERN.test(value)) {
    throw new Error(`Consent ${fieldName} must be a valid DID.`);
  }
}

function validateAction(action: string): void {
  if (!VALID_ACTIONS.includes(action)) {
    throw new Error('Consent action must be "grant" or "revoke".');
  }
}

function validateScopeEntry(entry: ScopeEntry, index: number): void {
  if (!VALID_SCOPE_TYPES.includes(entry.type)) {
    throw new Error(
      `Scope entry ${index}: type must be "field", "content", or "pack".`
    );
  }
  if (typeof entry.ref !== 'string' || !HASH_HEX_PATTERN.test(entry.ref)) {
    throw new Error(
      `Scope entry ${index}: ref must be 64 lowercase hex characters.`
    );
  }
}

function validateScope(scope: ScopeEntry[]): void {
  if (!Array.isArray(scope) || scope.length === 0) {
    throw new Error('Consent scope must be a non-empty array.');
  }
  if (scope.length > MAX_SCOPE_ENTRIES) {
    throw new Error(
      `Consent scope must not exceed ${MAX_SCOPE_ENTRIES} entries.`
    );
  }

  const seen = new Set<string>();
  for (let i = 0; i < scope.length; i++) {
    validateScopeEntry(scope[i], i);
    const key = `${scope[i].type}:${scope[i].ref}`;
    if (seen.has(key)) {
      throw new Error(
        `Consent scope contains duplicate entry: (${scope[i].type}, ${scope[i].ref}).`
      );
    }
    seen.add(key);
  }
}

function validatePermissions(permissions: string[]): void {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw new Error('Consent permissions must be a non-empty array.');
  }
  if (permissions.length > MAX_PERMISSIONS) {
    throw new Error(
      `Consent permissions must not exceed ${MAX_PERMISSIONS} entries.`
    );
  }

  const seen = new Set<string>();
  for (let i = 0; i < permissions.length; i++) {
    if (
      typeof permissions[i] !== 'string' ||
      !PERMISSION_PATTERN.test(permissions[i])
    ) {
      throw new Error(
        `Consent permission ${i}: must be lowercase alphanumeric with hyphens.`
      );
    }
    if (seen.has(permissions[i])) {
      throw new Error(
        `Consent permissions contain duplicate: "${permissions[i]}".`
      );
    }
    seen.add(permissions[i]);
  }
}

function validateIssuedAt(issued_at: string): void {
  if (
    typeof issued_at !== 'string' ||
    !ISO8601_UTC_PATTERN.test(issued_at)
  ) {
    throw new Error(
      'Consent issued_at must be ISO 8601 UTC format (e.g., "2025-01-15T14:30:00Z").'
    );
  }
}

function validateExpiresAt(
  expires_at: string | null,
  issued_at: string
): void {
  if (expires_at === null) return;
  if (
    typeof expires_at !== 'string' ||
    !ISO8601_UTC_PATTERN.test(expires_at)
  ) {
    throw new Error(
      'Consent expires_at must be ISO 8601 UTC format or null.'
    );
  }
  if (expires_at <= issued_at) {
    throw new Error('Consent expires_at must be after issued_at.');
  }
}

function validatePriorConsent(
  prior_consent: string | null,
  action: string
): void {
  if (action === 'revoke' && prior_consent === null) {
    throw new Error(
      'Consent prior_consent must be non-null for revoke actions.'
    );
  }
  if (prior_consent !== null) {
    if (
      typeof prior_consent !== 'string' ||
      !HASH_HEX_PATTERN.test(prior_consent)
    ) {
      throw new Error(
        'Consent prior_consent must be 64 lowercase hex characters or null.'
      );
    }
  }
}

export function buildConsentObject(
  subject: string,
  grantee: string,
  action: 'grant' | 'revoke',
  scope: ScopeEntry[],
  permissions: string[],
  opts: BuildConsentOptions = {}
): ConsentObjectV1 {
  const version = '1.0';
  const issued_at = (opts.now ?? new Date())
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');
  const expires_at = opts.expires_at ?? null;
  const prior_consent = opts.prior_consent ?? null;

  validateVersion(version);
  validateDID(subject, 'subject');
  validateDID(grantee, 'grantee');
  validateAction(action);
  validateScope(scope);
  validatePermissions(permissions);
  validateIssuedAt(issued_at);
  validateExpiresAt(expires_at, issued_at);
  validatePriorConsent(prior_consent, action);

  const payloadBytes = canonicalizeConsentPayload({
    version,
    subject,
    grantee,
    action,
    scope,
    permissions,
    issued_at,
    expires_at,
    prior_consent
  });

  const consent_hash = computeConsentHash(payloadBytes);

  if (prior_consent !== null && prior_consent === consent_hash) {
    throw new Error('Consent must not reference itself via prior_consent.');
  }

  return {
    version,
    subject,
    grantee,
    action,
    scope,
    permissions,
    issued_at,
    expires_at,
    prior_consent,
    consent_hash
  };
}

export function validateConsentObject(consent: ConsentObjectV1): void {
  validateVersion(consent.version);
  validateDID(consent.subject, 'subject');
  validateDID(consent.grantee, 'grantee');
  validateAction(consent.action);
  validateScope(consent.scope);
  validatePermissions(consent.permissions);
  validateIssuedAt(consent.issued_at);
  validateExpiresAt(consent.expires_at, consent.issued_at);
  validatePriorConsent(consent.prior_consent, consent.action);

  if (
    typeof consent.consent_hash !== 'string' ||
    !HASH_HEX_PATTERN.test(consent.consent_hash)
  ) {
    throw new Error(
      'Consent consent_hash must be 64 lowercase hex characters.'
    );
  }

  const payloadBytes = canonicalizeConsentPayload({
    version: consent.version,
    subject: consent.subject,
    grantee: consent.grantee,
    action: consent.action,
    scope: consent.scope,
    permissions: consent.permissions,
    issued_at: consent.issued_at,
    expires_at: consent.expires_at,
    prior_consent: consent.prior_consent
  });

  const expectedHash = computeConsentHash(payloadBytes);
  if (consent.consent_hash !== expectedHash) {
    throw new Error(
      'Consent consent_hash does not match canonical payload hash.'
    );
  }

  if (
    consent.prior_consent !== null &&
    consent.prior_consent === consent.consent_hash
  ) {
    throw new Error('Consent must not reference itself via prior_consent.');
  }
}
