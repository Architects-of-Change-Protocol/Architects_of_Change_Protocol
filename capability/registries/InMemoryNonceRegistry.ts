import type { NonceRegistry } from './NonceRegistry';

export class InMemoryNonceRegistry implements NonceRegistry {
  private readonly seen = new Set<string>();

  hasSeen(tokenId: string, _now: Date): boolean {
    return this.seen.has(tokenId);
  }

  markSeen(tokenId: string, _expiresAt: string): void {
    this.seen.add(tokenId);
  }

  cleanup(_now: Date): void {
    // No-op to preserve current behavior (no TTL cleanup in v0.1)
  }

  reset(): void {
    this.seen.clear();
  }
}
