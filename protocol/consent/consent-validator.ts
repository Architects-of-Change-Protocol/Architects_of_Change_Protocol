import type { ProtocolConsent, ConsentValidationResult } from './consent-types';
import { parseConsent } from './consent-object';

const VERSION_PATTERN = /^[0-9]+\.[0-9]+$/;
const DID_PATTERN = /^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$/;
const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;
const ISO8601_UTC_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
const PERMISSION_PATTERN = /^[a-z0-9-]+$/;
const VALID_SCOPE_TYPES = new Set(['field', 'content', 'pack']);
const VALID_ACTIONS = new Set(['grant', 'revoke']);
const MAX_SCOPE_ENTRIES = 10000;
const MAX_PERMISSIONS = 100;

export function validateConsent(consent: ProtocolConsent): ConsentValidationResult {
  const errors: string[] = [];

  try {
    parseConsent(consent);
  } catch (error) {
    return { valid: false, errors: [error instanceof Error ? error.message : 'Invalid consent.'] };
  }

  if (!VERSION_PATTERN.test(consent.version)) {
    errors.push('Consent version must match MAJOR.MINOR.');
  }
  if (!DID_PATTERN.test(consent.subject)) {
    errors.push('Consent subject must be a valid DID.');
  }
  if (!DID_PATTERN.test(consent.grantee)) {
    errors.push('Consent grantee must be a valid DID.');
  }
  if (!VALID_ACTIONS.has(consent.action)) {
    errors.push('Consent action must be grant or revoke.');
  }
  if (!ISO8601_UTC_PATTERN.test(consent.issued_at)) {
    errors.push('Consent issued_at must be ISO8601 UTC with second precision.');
  }
  if (!HASH_HEX_PATTERN.test(consent.consent_hash)) {
    errors.push('Consent consent_hash must be 64 lowercase hex.');
  }

  if (consent.scope.length > MAX_SCOPE_ENTRIES) {
    errors.push(`Consent scope must not exceed ${MAX_SCOPE_ENTRIES} entries.`);
  }
  const seenScope = new Set<string>();
  for (let i = 0; i < consent.scope.length; i++) {
    const entry = consent.scope[i];
    if (!VALID_SCOPE_TYPES.has(entry.type)) {
      errors.push(`Consent scope entry ${i} has invalid type.`);
    }
    if (!HASH_HEX_PATTERN.test(entry.ref)) {
      errors.push(`Consent scope entry ${i} ref must be 64 lowercase hex.`);
    }
    const key = `${entry.type}:${entry.ref}`;
    if (seenScope.has(key)) {
      errors.push(`Consent scope entry ${i} is duplicated.`);
    }
    seenScope.add(key);
  }

  if (consent.permissions.length > MAX_PERMISSIONS) {
    errors.push(`Consent permissions must not exceed ${MAX_PERMISSIONS} entries.`);
  }
  const seenPermissions = new Set<string>();
  for (let i = 0; i < consent.permissions.length; i++) {
    const permission = consent.permissions[i];
    if (!PERMISSION_PATTERN.test(permission)) {
      errors.push(`Consent permission ${i} must be lowercase alphanumeric with hyphens.`);
    }
    if (seenPermissions.has(permission)) {
      errors.push(`Consent permission ${i} is duplicated.`);
    }
    seenPermissions.add(permission);
  }

  if (consent.expires_at !== null) {
    if (!ISO8601_UTC_PATTERN.test(consent.expires_at)) {
      errors.push('Consent expires_at must be ISO8601 UTC or null.');
    } else if (consent.expires_at <= consent.issued_at) {
      errors.push('Consent expires_at must be greater than issued_at.');
    }
  }

  if (consent.prior_consent !== null && !HASH_HEX_PATTERN.test(consent.prior_consent)) {
    errors.push('Consent prior_consent must be 64 lowercase hex or null.');
  }

  if (consent.action === 'grant') {
    if (consent.revoke_target !== undefined) {
      errors.push('Consent revoke_target is only valid for revoke actions.');
    }
  } else if (consent.action === 'revoke') {
    if (
      consent.revoke_target === undefined ||
      !HASH_HEX_PATTERN.test(consent.revoke_target.capability_hash)
    ) {
      errors.push('Consent revoke_target.capability_hash must be 64 lowercase hex.');
    }
    if (consent.expires_at !== null) {
      errors.push('Consent revoke action must have expires_at = null.');
    }
  }

  return { valid: errors.length === 0, errors };
}
