import type { RevocationRegistry } from './RevocationRegistry';

export class InMemoryRevocationRegistry implements RevocationRegistry {
  private readonly revoked = new Set<string>();

  isRevoked(capabilityHash: string): boolean {
    return this.revoked.has(capabilityHash);
  }

  revoke(capabilityHash: string): void {
    this.revoked.add(capabilityHash);
  }

  reset(): void {
    this.revoked.clear();
  }
}
