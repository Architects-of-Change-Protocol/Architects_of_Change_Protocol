import {
  CredentialStatus,
  CredentialType,
  PrincipalKind,
  RegistryAuthorityLevel,
  RegistryEntryType,
  RegistryType,
} from '@aoc/protocol/claims';

import { isValidAssetFreshnessConstraint } from './freshness';
import type { AssetFreshnessConstraint } from './freshness';
import { isValidJurisdictionRef } from './jurisdiction';
import type { JurisdictionRef } from './jurisdiction';

/**
 * Constraints a profile places on the *Protocol records* a later slice will
 * supply.
 *
 * Every constraint here is expressed in terms of an existing Protocol
 * vocabulary — `RegistryType`, `RegistryAuthorityLevel`, `RegistryEntryType`,
 * `CredentialType`, `CredentialStatus`, `PrincipalKind`. This package adds no
 * member to any of them and defines no parallel enum: an external national
 * registry is `RegistryType.Custom` + `RegistryAuthorityLevel.External`
 * (Gate A0 / U-2), and a licensed professional is
 * `CredentialType.ProfessionalCredential`. Jurisdiction- and profession-specific
 * values are supplied by later profiles as opaque tokens, never hard-coded here.
 */

function isNonEmptyUniqueMemberList<T extends string>(
  value: unknown,
  members: Readonly<Record<string, T>>,
): value is readonly T[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const allowed = new Set<string>(Object.values(members));
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string' || !allowed.has(entry)) return false;
    if (seen.has(entry)) return false;
    seen.add(entry);
  }
  return true;
}

function isNonEmptyUniqueTokenList(value: unknown): value is readonly string[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string' || entry.trim() === '') return false;
    if (seen.has(entry)) return false;
    seen.add(entry);
  }
  return true;
}

function isNonEmptyUniqueJurisdictionList(value: unknown): value is readonly JurisdictionRef[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const seen = new Set<string>();
  for (const entry of value) {
    if (!isValidJurisdictionRef(entry)) return false;
    if (seen.has(entry.code)) return false;
    seen.add(entry.code);
  }
  return true;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function hasOnlyKeys(value: object, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

/**
 * Which external registry a supplied `CanonicalRegistryRef` /
 * `CanonicalRegistryEntryRef` must belong to.
 *
 * `acceptedNamespaces` is an opaque allow-list of
 * `CanonicalRegistryRef.namespace` values. Like
 * `SovereignExternalReference.namespace`, it is never parsed, normalized,
 * dereferenced or recognized — an unknown or future registry namespace is
 * expressible without a code change here or in Protocol.
 */
export interface AssetRegistryConstraint {
  readonly acceptedTypes?: readonly RegistryType[];
  readonly acceptedAuthorityLevels?: readonly RegistryAuthorityLevel[];
  readonly acceptedEntryTypes?: readonly RegistryEntryType[];
  readonly acceptedNamespaces?: readonly string[];
}

const REGISTRY_CONSTRAINT_KEYS: readonly string[] = [
  'acceptedTypes',
  'acceptedAuthorityLevels',
  'acceptedEntryTypes',
  'acceptedNamespaces',
];

/**
 * Structural validation. A constraint that constrains nothing is rejected for
 * the same reason an empty freshness constraint is: it would read as a
 * restriction while imposing none.
 */
export function isValidAssetRegistryConstraint(value: unknown): value is AssetRegistryConstraint {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<AssetRegistryConstraint>;
  if (!hasOnlyKeys(candidate, REGISTRY_CONSTRAINT_KEYS)) return false;

  let constrained = false;
  if (hasOwn(candidate, 'acceptedTypes')) {
    if (!isNonEmptyUniqueMemberList(candidate.acceptedTypes, RegistryType)) return false;
    constrained = true;
  }
  if (hasOwn(candidate, 'acceptedAuthorityLevels')) {
    if (!isNonEmptyUniqueMemberList(candidate.acceptedAuthorityLevels, RegistryAuthorityLevel)) return false;
    constrained = true;
  }
  if (hasOwn(candidate, 'acceptedEntryTypes')) {
    if (!isNonEmptyUniqueMemberList(candidate.acceptedEntryTypes, RegistryEntryType)) return false;
    constrained = true;
  }
  if (hasOwn(candidate, 'acceptedNamespaces')) {
    if (!isNonEmptyUniqueTokenList(candidate.acceptedNamespaces)) return false;
    constrained = true;
  }
  return constrained;
}

/**
 * Which credential a supplied `CanonicalCredentialRef` must be.
 *
 * `CredentialType.ProfessionalCredential` is how "a licensed professional" is
 * expressed. Which profession, and which authority licenses it, is a later
 * profile's opaque configuration — this framework hard-codes no role and no
 * jurisdiction.
 */
export interface AssetCredentialConstraint {
  readonly acceptedTypes: readonly CredentialType[];
  readonly acceptedStatuses?: readonly CredentialStatus[];
  /** Opaque issuer namespaces. Never parsed, never resolved. */
  readonly acceptedIssuerNamespaces?: readonly string[];
  readonly freshness?: AssetFreshnessConstraint;
}

const CREDENTIAL_CONSTRAINT_KEYS: readonly string[] = [
  'acceptedTypes',
  'acceptedStatuses',
  'acceptedIssuerNamespaces',
  'freshness',
];

export function isValidAssetCredentialConstraint(value: unknown): value is AssetCredentialConstraint {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<AssetCredentialConstraint>;
  if (!hasOnlyKeys(candidate, CREDENTIAL_CONSTRAINT_KEYS)) return false;

  if (!isNonEmptyUniqueMemberList(candidate.acceptedTypes, CredentialType)) return false;
  if (hasOwn(candidate, 'acceptedStatuses') && !isNonEmptyUniqueMemberList(candidate.acceptedStatuses, CredentialStatus)) {
    return false;
  }
  if (hasOwn(candidate, 'acceptedIssuerNamespaces') && !isNonEmptyUniqueTokenList(candidate.acceptedIssuerNamespaces)) {
    return false;
  }
  if (hasOwn(candidate, 'freshness') && !isValidAssetFreshnessConstraint(candidate.freshness)) {
    return false;
  }
  return true;
}

/**
 * Which attester a supplied `CanonicalAttestation` must come from.
 *
 * `acceptedRoles` carries opaque vertical role tokens. It is deliberately not
 * an enum: `notary`, `lawyer`, `appraiser` and every other profession belong to
 * a later profile's configuration, and putting any of them here would make the
 * framework know what a notary is — the leak the ADR exists to prevent.
 *
 * `jurisdictions` records the jurisdictional context in which the attester's
 * standing must be recognized. It records the *requirement*; it establishes no
 * legal fact and resolves nothing.
 */
export interface AssetAttesterConstraint {
  readonly acceptedPrincipalKinds?: readonly PrincipalKind[];
  readonly credential?: AssetCredentialConstraint;
  readonly acceptedRoles?: readonly string[];
  readonly jurisdictions?: readonly JurisdictionRef[];
}

const ATTESTER_CONSTRAINT_KEYS: readonly string[] = [
  'acceptedPrincipalKinds',
  'credential',
  'acceptedRoles',
  'jurisdictions',
];

export function isValidAssetAttesterConstraint(value: unknown): value is AssetAttesterConstraint {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<AssetAttesterConstraint>;
  if (!hasOnlyKeys(candidate, ATTESTER_CONSTRAINT_KEYS)) return false;

  let constrained = false;
  if (hasOwn(candidate, 'acceptedPrincipalKinds')) {
    if (!isNonEmptyUniqueMemberList(candidate.acceptedPrincipalKinds, PrincipalKind)) return false;
    constrained = true;
  }
  if (hasOwn(candidate, 'credential')) {
    if (!isValidAssetCredentialConstraint(candidate.credential)) return false;
    constrained = true;
  }
  if (hasOwn(candidate, 'acceptedRoles')) {
    if (!isNonEmptyUniqueTokenList(candidate.acceptedRoles)) return false;
    constrained = true;
  }
  if (hasOwn(candidate, 'jurisdictions')) {
    if (!isNonEmptyUniqueJurisdictionList(candidate.jurisdictions)) return false;
    constrained = true;
  }
  return constrained;
}

export { isNonEmptyUniqueJurisdictionList, isNonEmptyUniqueMemberList, isNonEmptyUniqueTokenList };
