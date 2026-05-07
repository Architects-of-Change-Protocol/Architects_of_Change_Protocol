import { TrustDomain } from './types';

const trustDomains = new Map<string, TrustDomain>();

export function registerTrustDomain(domain: TrustDomain): TrustDomain {
  if (trustDomains.has(domain.domainId)) {
    throw new Error(`Trust domain already exists: ${domain.domainId}`);
  }
  trustDomains.set(domain.domainId, { ...domain });
  return domain;
}

export function updateTrustDomain(domainId: string, patch: Partial<Omit<TrustDomain, 'domainId'>>): TrustDomain {
  const existing = trustDomains.get(domainId);
  if (!existing) {
    throw new Error(`Unknown trust domain: ${domainId}`);
  }
  const updated = { ...existing, ...patch, domainId };
  trustDomains.set(domainId, updated);
  return updated;
}

export function suspendTrustDomain(domainId: string, suspendedAt = new Date().toISOString()): TrustDomain {
  return updateTrustDomain(domainId, { suspendedAt });
}

export function resolveTrustDomain(domainId: string): TrustDomain | undefined {
  return trustDomains.get(domainId);
}

export function listTrustDomains(): TrustDomain[] {
  return [...trustDomains.values()];
}

export function clearTrustDomains(): void {
  trustDomains.clear();
}
