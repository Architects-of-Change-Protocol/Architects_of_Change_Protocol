import { capabilityAccessReasonCodes, type CapabilityAccessReasonCode } from './reasonCodes';

export type CapabilityAccessInputErrorCode =
  | typeof capabilityAccessReasonCodes.CAPABILITY_MISSING
  | typeof capabilityAccessReasonCodes.CAPABILITY_INVALID
  | typeof capabilityAccessReasonCodes.ACTION_MISSING
  | typeof capabilityAccessReasonCodes.RESOURCE_MISSING
  | typeof capabilityAccessReasonCodes.CONSENT_INVALID
  | typeof capabilityAccessReasonCodes.UNKNOWN_MARKET_MAKER;

export class CapabilityAccessInputError extends Error {
  readonly code: CapabilityAccessInputErrorCode;

  constructor(code: CapabilityAccessInputErrorCode, message: string) {
    super(message);
    this.name = 'CapabilityAccessInputError';
    this.code = code;
  }
}

export function isCapabilityAccessInputError(
  error: unknown
): error is CapabilityAccessInputError {
  return error instanceof CapabilityAccessInputError;
}

export function toCapabilityAccessInputError(
  code: CapabilityAccessReasonCode,
  message: string
): CapabilityAccessInputError {
  return new CapabilityAccessInputError(
    code as CapabilityAccessInputErrorCode,
    message
  );
}
