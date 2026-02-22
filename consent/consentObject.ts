import { canonicalizeConsentPayload, canonicalizeConsentV2Payload } from './canonical';
import { computeConsentHash } from './hash';
import {
  AffiliationBinding,
  BuildConsentOptions,
  BuildConsentV2Options,
  ConsentObjectV1,
  ConsentObjectV2,
  ScopeEntry,
} from './types';
import { computeAccessScopeHash, verifyAccessScopeHash } from '../temporal/scopeHash';

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

// ---------------------------------------------------------------------------
// Consent Object V2 — Temporal Consent Control
// ---------------------------------------------------------------------------

const VALID_CONSENT_MODES: ReadonlyArray<string> = [
  'standard',
  'institutional-affiliation',
];
const VALID_AFFILIATION_TYPES: ReadonlyArray<string> = [
  'membership',
  'employment',
  'enrollment',
];
const VERSION_V2 = '2.0';

function validateAccessTimestamps(
  access_start_timestamp: string,
  access_expiration_timestamp: string,
  issued_at: string
): void {
  if (
    typeof access_start_timestamp !== 'string' ||
    !ISO8601_UTC_PATTERN.test(access_start_timestamp)
  ) {
    throw new Error(
      'Consent access_start_timestamp must be ISO 8601 UTC format.'
    );
  }
  if (
    typeof access_expiration_timestamp !== 'string' ||
    !ISO8601_UTC_PATTERN.test(access_expiration_timestamp)
  ) {
    throw new Error(
      'Consent access_expiration_timestamp must be ISO 8601 UTC format.'
    );
  }
  if (access_start_timestamp < issued_at) {
    throw new Error(
      'Consent access_start_timestamp must be at or after issued_at.'
    );
  }
  if (access_expiration_timestamp <= access_start_timestamp) {
    throw new Error(
      'Consent access_expiration_timestamp must be after access_start_timestamp.'
    );
  }
}

function validateRenewalFields(
  renewable: boolean,
  max_renewals: number | null,
  renewal_count: number
): void {
  if (typeof renewable !== 'boolean') {
    throw new Error('Consent renewable must be a boolean.');
  }
  if (max_renewals !== null) {
    if (!Number.isInteger(max_renewals) || max_renewals < 0) {
      throw new Error(
        'Consent max_renewals must be a non-negative integer or null.'
      );
    }
    if (!renewable) {
      throw new Error(
        'Consent max_renewals must be null when renewable is false.'
      );
    }
  }
  if (!Number.isInteger(renewal_count) || renewal_count < 0) {
    throw new Error(
      'Consent renewal_count must be a non-negative integer.'
    );
  }
  if (!renewable && renewal_count > 0) {
    throw new Error(
      'Consent renewal_count must be 0 when renewable is false.'
    );
  }
  if (
    renewable &&
    max_renewals !== null &&
    renewal_count > max_renewals
  ) {
    throw new Error(
      'Consent renewal_count exceeds max_renewals.'
    );
  }
}

function validateConsentMode(
  consent_mode: string,
  affiliation: AffiliationBinding | null
): void {
  if (!VALID_CONSENT_MODES.includes(consent_mode)) {
    throw new Error(
      `Consent consent_mode must be one of: ${VALID_CONSENT_MODES.join(', ')}.`
    );
  }
  if (consent_mode === 'institutional-affiliation') {
    if (affiliation === null) {
      throw new Error(
        'Consent affiliation must be non-null when consent_mode is "institutional-affiliation".'
      );
    }
    validateAffiliationBinding(affiliation);
  }
  if (consent_mode === 'standard' && affiliation !== null) {
    throw new Error(
      'Consent affiliation must be null when consent_mode is "standard".'
    );
  }
}

function validateAffiliationBinding(aff: AffiliationBinding): void {
  if (
    typeof aff.institution_did !== 'string' ||
    !DID_PATTERN.test(aff.institution_did) ||
    aff.institution_did.length < MIN_DID_LENGTH ||
    aff.institution_did.length > MAX_DID_LENGTH
  ) {
    throw new Error(
      'AffiliationBinding institution_did must be a valid DID.'
    );
  }
  if (!VALID_AFFILIATION_TYPES.includes(aff.affiliation_type)) {
    throw new Error(
      `AffiliationBinding affiliation_type must be one of: ${VALID_AFFILIATION_TYPES.join(', ')}.`
    );
  }
  if (
    typeof aff.affiliation_credential_ref !== 'string' ||
    !HASH_HEX_PATTERN.test(aff.affiliation_credential_ref)
  ) {
    throw new Error(
      'AffiliationBinding affiliation_credential_ref must be 64 lowercase hex characters.'
    );
  }
  if (typeof aff.auto_expires_on_affiliation_change !== 'boolean') {
    throw new Error(
      'AffiliationBinding auto_expires_on_affiliation_change must be a boolean.'
    );
  }
}

/**
 * Builds a ConsentObjectV2 with cryptographically bound temporal access control.
 *
 * The access_scope_hash is computed from (scope, access_start_timestamp,
 * access_expiration_timestamp) and included in the canonical hash payload,
 * making time constraints tamper-evident and hash-bound to the Consent Object.
 */
export function buildConsentObjectV2(
  subject: string,
  grantee: string,
  action: 'grant' | 'revoke',
  scope: ScopeEntry[],
  permissions: string[],
  access_expiration_timestamp: string,
  opts: BuildConsentV2Options = {}
): ConsentObjectV2 {
  const version = VERSION_V2;
  const issued_at = (opts.now ?? new Date())
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');

  const access_start_timestamp = opts.access_start_timestamp ?? issued_at;
  const expires_at = access_expiration_timestamp;
  const prior_consent = opts.prior_consent ?? null;
  const renewable = opts.renewable ?? false;
  const max_renewals = opts.max_renewals ?? null;
  const renewal_count = opts.renewal_count ?? 0;
  const consent_mode = opts.consent_mode ?? 'standard';
  const affiliation = opts.affiliation ?? null;

  // Structural validation (re-uses V1 validators for shared fields)
  validateVersion(version);
  validateDID(subject, 'subject');
  validateDID(grantee, 'grantee');
  validateAction(action);
  validateScope(scope);
  validatePermissions(permissions);
  validateIssuedAt(issued_at);
  validateAccessTimestamps(access_start_timestamp, access_expiration_timestamp, issued_at);
  validateExpiresAt(expires_at, issued_at);
  validatePriorConsent(prior_consent, action);
  validateRenewalFields(renewable, max_renewals, renewal_count);
  validateConsentMode(consent_mode, affiliation);

  // Compute the scope+time cryptographic commitment
  const access_scope_hash = computeAccessScopeHash({
    scope,
    access_start_timestamp,
    access_expiration_timestamp,
  });

  // Compute consent_hash over the full V2 canonical payload
  const payloadBytes = canonicalizeConsentV2Payload({
    version,
    subject,
    grantee,
    action,
    scope,
    permissions,
    issued_at,
    expires_at,
    prior_consent,
    access_start_timestamp,
    access_expiration_timestamp,
    renewable,
    max_renewals,
    renewal_count,
    access_scope_hash,
    consent_mode,
    affiliation,
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
    consent_hash,
    access_start_timestamp,
    access_expiration_timestamp,
    renewable,
    max_renewals,
    renewal_count,
    access_scope_hash,
    consent_mode,
    affiliation,
  };
}

/**
 * Validates structural and semantic integrity of a ConsentObjectV2.
 * Also verifies access_scope_hash against recomputed value to detect tampering.
 */
export function validateConsentObjectV2(consent: ConsentObjectV2): void {
  validateVersion(consent.version);
  if (consent.version !== VERSION_V2) {
    throw new Error(`ConsentObjectV2 must have version "${VERSION_V2}".`);
  }

  validateDID(consent.subject, 'subject');
  validateDID(consent.grantee, 'grantee');
  validateAction(consent.action);
  validateScope(consent.scope);
  validatePermissions(consent.permissions);
  validateIssuedAt(consent.issued_at);
  validateAccessTimestamps(
    consent.access_start_timestamp,
    consent.access_expiration_timestamp,
    consent.issued_at
  );
  validateExpiresAt(consent.expires_at, consent.issued_at);

  if (consent.expires_at !== consent.access_expiration_timestamp) {
    throw new Error(
      'Consent expires_at must equal access_expiration_timestamp in V2.'
    );
  }

  validatePriorConsent(consent.prior_consent, consent.action);
  validateRenewalFields(consent.renewable, consent.max_renewals, consent.renewal_count);
  validateConsentMode(consent.consent_mode, consent.affiliation);

  // Verify access_scope_hash cryptographic binding
  verifyAccessScopeHash(consent.access_scope_hash, {
    scope: consent.scope,
    access_start_timestamp: consent.access_start_timestamp,
    access_expiration_timestamp: consent.access_expiration_timestamp,
  });

  // Verify consent_hash covers full V2 payload
  if (
    typeof consent.consent_hash !== 'string' ||
    !HASH_HEX_PATTERN.test(consent.consent_hash)
  ) {
    throw new Error(
      'Consent consent_hash must be 64 lowercase hex characters.'
    );
  }

  const payloadBytes = canonicalizeConsentV2Payload({
    version: consent.version,
    subject: consent.subject,
    grantee: consent.grantee,
    action: consent.action,
    scope: consent.scope,
    permissions: consent.permissions,
    issued_at: consent.issued_at,
    expires_at: consent.expires_at,
    prior_consent: consent.prior_consent,
    access_start_timestamp: consent.access_start_timestamp,
    access_expiration_timestamp: consent.access_expiration_timestamp,
    renewable: consent.renewable,
    max_renewals: consent.max_renewals,
    renewal_count: consent.renewal_count,
    access_scope_hash: consent.access_scope_hash,
    consent_mode: consent.consent_mode,
    affiliation: consent.affiliation,
  });

  const expectedHash = computeConsentHash(payloadBytes);
  if (consent.consent_hash !== expectedHash) {
    throw new Error(
      'Consent consent_hash does not match canonical V2 payload hash.'
    );
  }

  if (
    consent.prior_consent !== null &&
    consent.prior_consent === consent.consent_hash
  ) {
    throw new Error('Consent must not reference itself via prior_consent.');
  }
}
