export const capabilityAccessReasonCodes = {
  ACCESS_ALLOWED: 'ACCESS_ALLOWED',
  CAPABILITY_MISSING: 'CAPABILITY_MISSING',
  CAPABILITY_INVALID: 'CAPABILITY_INVALID',
  CAPABILITY_INACTIVE: 'CAPABILITY_INACTIVE',
  CAPABILITY_NOT_YET_VALID: 'CAPABILITY_NOT_YET_VALID',
  CAPABILITY_EXPIRED: 'CAPABILITY_EXPIRED',
  CONSENT_EXPIRED: 'CONSENT_EXPIRED',
  EXPIRATION_MISMATCH: 'EXPIRATION_MISMATCH',
  ACTION_MISSING: 'ACTION_MISSING',
  ACTION_NOT_ALLOWED: 'ACTION_NOT_ALLOWED',
  RESOURCE_MISSING: 'RESOURCE_MISSING',
  RESOURCE_NOT_ALLOWED: 'RESOURCE_NOT_ALLOWED',
  MARKET_MAKER_REQUIRED: 'MARKET_MAKER_REQUIRED',
  MARKET_MAKER_MISMATCH: 'MARKET_MAKER_MISMATCH',
  UNKNOWN_MARKET_MAKER: 'UNKNOWN_MARKET_MAKER',
  MARKET_MAKER_DEPRECATED: 'MARKET_MAKER_DEPRECATED',
  MARKET_MAKER_REVOKED: 'MARKET_MAKER_REVOKED',
  POLICY_DENIED: 'POLICY_DENIED',
  USAGE_DENIED: 'USAGE_DENIED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  CONSENT_INVALID: 'CONSENT_INVALID',
  CONSENT_MISMATCH: 'CONSENT_MISMATCH',
  INTERNAL_EVALUATION_ERROR: 'INTERNAL_EVALUATION_ERROR'
} as const;

export type CapabilityAccessReasonCode =
  (typeof capabilityAccessReasonCodes)[keyof typeof capabilityAccessReasonCodes];

export const capabilityReasonCodeTaxonomy = {
  authorization: [
    capabilityAccessReasonCodes.CAPABILITY_MISSING,
    capabilityAccessReasonCodes.CAPABILITY_INVALID,
    capabilityAccessReasonCodes.CAPABILITY_INACTIVE,
    capabilityAccessReasonCodes.CAPABILITY_NOT_YET_VALID,
    capabilityAccessReasonCodes.CAPABILITY_EXPIRED,
    capabilityAccessReasonCodes.CONSENT_EXPIRED,
    capabilityAccessReasonCodes.EXPIRATION_MISMATCH,
    capabilityAccessReasonCodes.ACTION_MISSING,
    capabilityAccessReasonCodes.ACTION_NOT_ALLOWED,
    capabilityAccessReasonCodes.RESOURCE_MISSING,
    capabilityAccessReasonCodes.RESOURCE_NOT_ALLOWED,
    capabilityAccessReasonCodes.CONSENT_INVALID,
    capabilityAccessReasonCodes.CONSENT_MISMATCH
  ] as const,
  runtime: [
    capabilityAccessReasonCodes.MARKET_MAKER_REQUIRED,
    capabilityAccessReasonCodes.MARKET_MAKER_MISMATCH,
    capabilityAccessReasonCodes.UNKNOWN_MARKET_MAKER,
    capabilityAccessReasonCodes.MARKET_MAKER_DEPRECATED,
    capabilityAccessReasonCodes.MARKET_MAKER_REVOKED,
    capabilityAccessReasonCodes.PAYMENT_REQUIRED
  ] as const,
  policy: [
    capabilityAccessReasonCodes.POLICY_DENIED,
    capabilityAccessReasonCodes.USAGE_DENIED,
    capabilityAccessReasonCodes.INTERNAL_EVALUATION_ERROR
  ] as const
} as const;
