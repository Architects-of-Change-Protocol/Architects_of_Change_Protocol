import { StandingStatus } from './claim-enums';
import type {
  CanonicalClaimId,
  CanonicalStandingId,
  CanonicalTimestamp,
} from './primitives';
import { isCanonicalTimestamp } from './timestamps';

export interface CanonicalStanding {
  readonly id: CanonicalStandingId;
  readonly claimRef: CanonicalClaimId;
  readonly status: StandingStatus;
  readonly reason?: string;
  readonly effectiveAt: CanonicalTimestamp;
  readonly expiresAt?: CanonicalTimestamp;
}

export interface CanonicalStandingValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly string[];
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Smallest structural validation for a `CanonicalStanding`.
 *
 * Introduced by SM-06 because a portability bundle carries standing records
 * across an external trust boundary and had no canonical runtime validator to
 * check them with. It lives here, beside the type it validates, rather than in
 * `@aoc/protocol/portability`: a second copy of the standing rules inside a
 * transport contract is exactly the kind of drift the claims layer owns this
 * type to prevent.
 *
 * It validates *shape*, and deliberately nothing else. It does not decide
 * whether the referenced claim exists, whether the standing is currently in
 * force at some instant, whether `expiresAt` is after `effectiveAt`, whether
 * the issuer of the standing had authority to record it, or who is right in the
 * dispute a `Contested` standing describes. Protocol records standing; it does
 * not adjudicate it, and a validator that started ordering timestamps would be
 * quietly deciding that a backdated correction is malformed.
 *
 * A present-but-`undefined` optional is reported as invalid rather than treated
 * as absent, matching the rest of the canonical contracts: `aoc-canonical-json/1`
 * refuses `undefined`, so such a record could never be canonicalized or signed.
 */
export function validateCanonicalStanding(value: unknown): CanonicalStandingValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, reasons: ['INVALID_STANDING_STRUCTURE'] };
  }

  const reasons: string[] = [];
  const candidate = value as Partial<CanonicalStanding>;

  if (!isNonBlankString(candidate.id)) reasons.push('INVALID_STANDING_ID');
  if (!isNonBlankString(candidate.claimRef)) reasons.push('INVALID_STANDING_CLAIM_REF');
  if (!Object.values(StandingStatus).includes(candidate.status as StandingStatus)) {
    reasons.push('INVALID_STANDING_STATUS');
  }
  if (!isCanonicalTimestamp(candidate.effectiveAt)) reasons.push('INVALID_STANDING_EFFECTIVE_AT');
  if (hasOwn(candidate, 'reason') && !isNonBlankString(candidate.reason)) {
    reasons.push('INVALID_STANDING_REASON');
  }
  if (hasOwn(candidate, 'expiresAt') && !isCanonicalTimestamp(candidate.expiresAt)) {
    reasons.push('INVALID_STANDING_EXPIRES_AT');
  }

  return { valid: reasons.length === 0, reasons };
}

export function isValidCanonicalStanding(value: unknown): value is CanonicalStanding {
  return validateCanonicalStanding(value).valid;
}
