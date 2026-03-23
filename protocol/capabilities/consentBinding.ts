import type { CapabilityTokenV1 } from '../../capability';
import type { ConsentObjectV1 } from '../../consent';

export function verifyCapabilityConsentBinding(
  token: CapabilityTokenV1,
  consent: ConsentObjectV1
): void {
  if (token.consent_ref !== consent.consent_hash) {
    throw new Error(
      'Capability consent_ref does not match parent consent consent_hash.'
    );
  }
  if (consent.action !== 'grant') {
    throw new Error('Parent consent action must be "grant".');
  }
  if (token.subject !== consent.subject) {
    throw new Error(
      'Capability subject does not match parent consent subject.'
    );
  }
  if (token.grantee !== consent.grantee) {
    throw new Error(
      'Capability grantee does not match parent consent grantee.'
    );
  }
  if (token.marketMakerId !== consent.marketMakerId) {
    throw new Error(
      'Capability marketMakerId does not match parent consent marketMakerId.'
    );
  }

  const consentScope = new Set(
    consent.scope.map((entry) => `${entry.type}:${entry.ref}`)
  );
  for (const entry of token.scope) {
    if (!consentScope.has(`${entry.type}:${entry.ref}`)) {
      throw new Error(
        'Scope escalation: token scope entry not found in parent consent scope.'
      );
    }
  }

  const consentPermissions = new Set(consent.permissions);
  for (const permission of token.permissions) {
    if (!consentPermissions.has(permission)) {
      throw new Error(
        'Permission escalation: token permission not found in parent consent permissions.'
      );
    }
  }

  if (token.issued_at < consent.issued_at) {
    throw new Error(
      'Capability issued_at must be at or after parent consent issued_at.'
    );
  }
  if (consent.expires_at !== null && token.expires_at > consent.expires_at) {
    throw new Error(
      'Capability expires_at must not exceed parent consent expires_at.'
    );
  }
  if (token.not_before !== null && token.not_before < consent.issued_at) {
    throw new Error(
      'Capability not_before must be at or after parent consent issued_at.'
    );
  }
}
