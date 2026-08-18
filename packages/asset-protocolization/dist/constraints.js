"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAssetRegistryConstraint = isValidAssetRegistryConstraint;
exports.isValidAssetCredentialConstraint = isValidAssetCredentialConstraint;
exports.isValidAssetAttesterConstraint = isValidAssetAttesterConstraint;
exports.isNonEmptyUniqueJurisdictionList = isNonEmptyUniqueJurisdictionList;
exports.isNonEmptyUniqueMemberList = isNonEmptyUniqueMemberList;
exports.isNonEmptyUniqueTokenList = isNonEmptyUniqueTokenList;
const claims_1 = require("@aoc/protocol/claims");
const freshness_1 = require("./freshness");
const jurisdiction_1 = require("./jurisdiction");
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
function isNonEmptyUniqueMemberList(value, members) {
    if (!Array.isArray(value) || value.length === 0)
        return false;
    const allowed = new Set(Object.values(members));
    const seen = new Set();
    for (const entry of value) {
        if (typeof entry !== 'string' || !allowed.has(entry))
            return false;
        if (seen.has(entry))
            return false;
        seen.add(entry);
    }
    return true;
}
function isNonEmptyUniqueTokenList(value) {
    if (!Array.isArray(value) || value.length === 0)
        return false;
    const seen = new Set();
    for (const entry of value) {
        if (typeof entry !== 'string' || entry.trim() === '')
            return false;
        if (seen.has(entry))
            return false;
        seen.add(entry);
    }
    return true;
}
function isNonEmptyUniqueJurisdictionList(value) {
    if (!Array.isArray(value) || value.length === 0)
        return false;
    const seen = new Set();
    for (const entry of value) {
        if (!(0, jurisdiction_1.isValidJurisdictionRef)(entry))
            return false;
        if (seen.has(entry.code))
            return false;
        seen.add(entry.code);
    }
    return true;
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function hasOnlyKeys(value, keys) {
    return Object.keys(value).every((key) => keys.includes(key));
}
const REGISTRY_CONSTRAINT_KEYS = [
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
function isValidAssetRegistryConstraint(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    if (!hasOnlyKeys(candidate, REGISTRY_CONSTRAINT_KEYS))
        return false;
    let constrained = false;
    if (hasOwn(candidate, 'acceptedTypes')) {
        if (!isNonEmptyUniqueMemberList(candidate.acceptedTypes, claims_1.RegistryType))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'acceptedAuthorityLevels')) {
        if (!isNonEmptyUniqueMemberList(candidate.acceptedAuthorityLevels, claims_1.RegistryAuthorityLevel))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'acceptedEntryTypes')) {
        if (!isNonEmptyUniqueMemberList(candidate.acceptedEntryTypes, claims_1.RegistryEntryType))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'acceptedNamespaces')) {
        if (!isNonEmptyUniqueTokenList(candidate.acceptedNamespaces))
            return false;
        constrained = true;
    }
    return constrained;
}
const CREDENTIAL_CONSTRAINT_KEYS = [
    'acceptedTypes',
    'acceptedStatuses',
    'acceptedIssuerNamespaces',
    'freshness',
];
function isValidAssetCredentialConstraint(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    if (!hasOnlyKeys(candidate, CREDENTIAL_CONSTRAINT_KEYS))
        return false;
    if (!isNonEmptyUniqueMemberList(candidate.acceptedTypes, claims_1.CredentialType))
        return false;
    if (hasOwn(candidate, 'acceptedStatuses') && !isNonEmptyUniqueMemberList(candidate.acceptedStatuses, claims_1.CredentialStatus)) {
        return false;
    }
    if (hasOwn(candidate, 'acceptedIssuerNamespaces') && !isNonEmptyUniqueTokenList(candidate.acceptedIssuerNamespaces)) {
        return false;
    }
    if (hasOwn(candidate, 'freshness') && !(0, freshness_1.isValidAssetFreshnessConstraint)(candidate.freshness)) {
        return false;
    }
    return true;
}
const ATTESTER_CONSTRAINT_KEYS = [
    'acceptedPrincipalKinds',
    'credential',
    'acceptedRoles',
    'jurisdictions',
];
function isValidAssetAttesterConstraint(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    if (!hasOnlyKeys(candidate, ATTESTER_CONSTRAINT_KEYS))
        return false;
    let constrained = false;
    if (hasOwn(candidate, 'acceptedPrincipalKinds')) {
        if (!isNonEmptyUniqueMemberList(candidate.acceptedPrincipalKinds, claims_1.PrincipalKind))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'credential')) {
        if (!isValidAssetCredentialConstraint(candidate.credential))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'acceptedRoles')) {
        if (!isNonEmptyUniqueTokenList(candidate.acceptedRoles))
            return false;
        constrained = true;
    }
    if (hasOwn(candidate, 'jurisdictions')) {
        if (!isNonEmptyUniqueJurisdictionList(candidate.jurisdictions))
            return false;
        constrained = true;
    }
    return constrained;
}
