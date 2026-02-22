export { createInMemoryVault } from './vault';
export type {
  Vault,
  VaultStore,
  VaultError,
  VaultErrorCode,
  VaultAccessRequest,
  VaultAccessRequestV2,
  VaultAccessResult,
  VaultPolicyDecision,
  VaultOptions,
  ResolvedField,
  UnresolvedField,
  RenewalRequest,
  RenewalResponse,
  AccessLedgerEntry,
} from './types';
export {
  appendLedgerEntry,
  getLedger,
  getLedgerByEventType,
  getLedgerByConsentHash,
  getLedgerByCapabilityHash,
  resetAccessLedger,
} from './accessLedger';
export { processRenewalRequest, revokeByAffiliationCredential } from './renewal';
