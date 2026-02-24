export interface RevocationRegistry {
  isRevoked(capabilityHash: string): boolean;
  revoke(capabilityHash: string): void;
}
