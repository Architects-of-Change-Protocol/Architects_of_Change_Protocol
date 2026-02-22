export { buildConsentObject, validateConsentObject } from './consentObject';
export { buildConsentObjectV2, validateConsentObjectV2 } from './consentObject';
export { buildConsentId } from './consentId';
export { canonicalizeConsentPayload, canonicalizeConsentV2Payload } from './canonical';
export type { ConsentPayload, ConsentV2Payload } from './canonical';
export { computeConsentHash } from './hash';
export type {
  AffiliationBinding,
  BuildConsentOptions,
  BuildConsentV2Options,
  ConsentMode,
  ConsentObjectV1,
  ConsentObjectV2,
  ScopeEntry,
} from './types';
