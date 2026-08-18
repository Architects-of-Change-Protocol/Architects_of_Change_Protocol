import { CredentialStatus, CredentialType, PrincipalKind, RegistryAuthorityLevel, RegistryEntryType, RegistryType } from '@aoc/protocol/claims';
import type { AssetFreshnessConstraint } from './freshness';
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
declare function isNonEmptyUniqueMemberList<T extends string>(value: unknown, members: Readonly<Record<string, T>>): value is readonly T[];
declare function isNonEmptyUniqueTokenList(value: unknown): value is readonly string[];
declare function isNonEmptyUniqueJurisdictionList(value: unknown): value is readonly JurisdictionRef[];
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
/**
 * Structural validation. A constraint that constrains nothing is rejected for
 * the same reason an empty freshness constraint is: it would read as a
 * restriction while imposing none.
 */
export declare function isValidAssetRegistryConstraint(value: unknown): value is AssetRegistryConstraint;
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
export declare function isValidAssetCredentialConstraint(value: unknown): value is AssetCredentialConstraint;
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
export declare function isValidAssetAttesterConstraint(value: unknown): value is AssetAttesterConstraint;
export { isNonEmptyUniqueJurisdictionList, isNonEmptyUniqueMemberList, isNonEmptyUniqueTokenList };
//# sourceMappingURL=constraints.d.ts.map