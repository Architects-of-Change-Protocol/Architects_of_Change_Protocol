import { isValidContentIdentity, isValidSovereignSubjectRef } from '@aoc/protocol/identity';
import type { ContentIdentity, SovereignSubjectRef } from '@aoc/protocol/identity';

/**
 * *Which subject* one case is about.
 *
 * This binds; it does not prove. Creating a case with a subject binding asserts
 * only that this attempt is about this subject — not that the subject exists,
 * is owned by the applicant, has been protocolized, or that any identifying
 * material has been checked. Establishing those is what the rest of the case is
 * for.
 *
 * Both fields are Protocol's. The vertical defines no identity type of its own
 * and redefines none: `SovereignSubjectRef` (`sovereignAssetId` plus an optional
 * `SovereignExternalReference`) is the reuse map's row 1 answer to "identify the
 * asset (APV-04)", and `ContentIdentity` is row 3's. This structure only says
 * which of them a case carries.
 *
 * ### Why a `SovereignAssetId` is required and a `ContentIdentity` is not
 *
 * A `SovereignAssetId` is minted, never derived — not from bytes, not from a
 * locator, not from a registry id — so having one commits to nothing about what
 * the subject *is*. It is the correlation key that lets inputs, requirements,
 * material and a future signed manifest all name the same thing, and APV-02 I-3
 * requires the eventual `record.manifest.sovereignAssetId` to be exactly this
 * value. Minting happens in the composition layer via Protocol's
 * `mintSovereignAssetId`; this package never mints.
 *
 * A `ContentIdentity` is the opposite: it exists only if the subject has a
 * canonical byte representation. A subject with no bytes at all is a first-class
 * subject here, not a special case, so content identity is optional and its
 * absence is not a deficiency — it is what a profile's identity requirements
 * decide, and only for the profile the case is pinned to.
 *
 * ### Why the binding stays small
 *
 * A case may legitimately begin before the material that will identify the
 * subject has been supplied. Everything that arrives later — a registry entry,
 * an external reference observed after intake, a content digest computed once
 * the file was uploaded — attaches as *material* correlated to an identity
 * requirement, never by rewriting this binding. The binding is immutable, so a
 * case can never quietly become a case about a different subject.
 */
export interface ProtocolizationCaseSubject {
  /** Protocol's subject reference. Carries the external reference when there is one. */
  readonly subjectRef: SovereignSubjectRef;
  /** Present only when the subject has a canonical byte representation. */
  readonly contentIdentity?: ContentIdentity;
}

const SUBJECT_KEYS: readonly string[] = ['subjectRef', 'contentIdentity'];

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * Structural validation only, delegated to Protocol's own validators for both
 * fields. A present-but-`undefined` `contentIdentity` is invalid rather than
 * absent, matching every other optional in this package and the canonical-JSON
 * rule it inherits from.
 */
export function isValidProtocolizationCaseSubject(value: unknown): value is ProtocolizationCaseSubject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<ProtocolizationCaseSubject>;
  for (const key of Object.keys(candidate)) {
    if (!SUBJECT_KEYS.includes(key)) return false;
  }
  if (!isValidSovereignSubjectRef(candidate.subjectRef)) return false;
  if (hasOwn(candidate, 'contentIdentity') && !isValidContentIdentity(candidate.contentIdentity)) {
    return false;
  }
  return true;
}
