export {
  mintCapabilityToken,
  validateCapabilityToken,
  verifyCapabilityToken,
  resetNonceRegistry
} from './capabilityToken';
export { buildCapabilityId } from './capabilityId';
export { canonicalizeCapabilityPayload } from './canonical';
export type { CapabilityPayload } from './canonical';
export { computeCapabilityHash } from './hash';
export {
  revokeCapabilityToken,
  isRevoked,
  resetRevocationRegistry
} from './revocation';
export type {
  CapabilityTokenV1,
  MintCapabilityOptions,
  ScopeEntry
} from './types';
