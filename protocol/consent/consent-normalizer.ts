import type { ProtocolConsent, ScopeEntry } from './consent-types';
import { parseConsent } from './consent-object';

function normalizeString(value: string): string {
  return value.trim();
}

function normalizeScope(scope: ScopeEntry[]): ScopeEntry[] {
  return [...scope]
    .map((entry) => ({
      type: entry.type,
      ref: normalizeString(entry.ref).toLowerCase(),
    }))
    .sort((a, b) => {
      const typeCmp = a.type.localeCompare(b.type);
      if (typeCmp !== 0) return typeCmp;
      return a.ref.localeCompare(b.ref);
    });
}

export function normalizeConsent(input: unknown): ProtocolConsent {
  const consent = parseConsent(input);

  return {
    ...consent,
    version: normalizeString(consent.version),
    subject: normalizeString(consent.subject),
    grantee: normalizeString(consent.grantee),
    action: consent.action,
    scope: normalizeScope(consent.scope),
    permissions: [...consent.permissions]
      .map((permission) => normalizeString(permission).toLowerCase())
      .sort(),
    issued_at: normalizeString(consent.issued_at),
    expires_at: consent.expires_at === null ? null : normalizeString(consent.expires_at),
    prior_consent:
      consent.prior_consent === null ? null : normalizeString(consent.prior_consent).toLowerCase(),
    consent_hash: normalizeString(consent.consent_hash).toLowerCase(),
    ...(consent.marketMakerId !== undefined
      ? { marketMakerId: normalizeString(consent.marketMakerId) }
      : {}),
    ...(consent.revoke_target !== undefined
      ? {
        revoke_target: {
          capability_hash: normalizeString(consent.revoke_target.capability_hash).toLowerCase(),
        },
      }
      : {}),
  };
}
