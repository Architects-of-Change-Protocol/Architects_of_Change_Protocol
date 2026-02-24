export interface NonceRegistry {
  hasSeen(tokenId: string, now: Date): boolean;
  markSeen(tokenId: string, expiresAt: string): void;
  cleanup?(now: Date): void;
}
