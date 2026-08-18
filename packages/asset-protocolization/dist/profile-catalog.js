"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetProfileCatalog = createAssetProfileCatalog;
const errors_1 = require("./errors");
const identifiers_1 = require("./identifiers");
const profile_validation_1 = require("./profile-validation");
function deepFreeze(value) {
    if (typeof value !== 'object' || value === null)
        return value;
    for (const entry of Object.values(value)) {
        deepFreeze(entry);
    }
    return Object.freeze(value);
}
/**
 * Builds a catalogue, optionally pre-populated. Pre-population is ordinary
 * registration, so an invalid or duplicated profile fails at construction
 * rather than at first use.
 */
function createAssetProfileCatalog(profiles = []) {
    const entries = new Map();
    const catalog = {
        register(profile) {
            const validation = (0, profile_validation_1.validateAssetProfile)(profile);
            if (!validation.valid) {
                throw new errors_1.AssetProfileError(errors_1.ASSET_PROFILE_ERROR_CODES.invalidProfile, `Invalid AssetProfile: ${validation.reasons.join(', ')}`, {
                    reasonCodes: validation.reasons,
                    ...(typeof profile?.profileId === 'string' ? { profileId: profile.profileId } : {}),
                    ...(typeof profile?.version === 'string' ? { version: profile.version } : {}),
                });
            }
            const key = (0, identifiers_1.assetProfileVersionKey)(profile.profileId, profile.version);
            if (entries.has(key)) {
                throw new errors_1.AssetProfileError(errors_1.ASSET_PROFILE_ERROR_CODES.versionAlreadyRegistered, `AssetProfile ${key} is already registered`, {
                    reasonCodes: [errors_1.ASSET_PROFILE_ERROR_CODES.versionAlreadyRegistered],
                    profileId: profile.profileId,
                    version: profile.version,
                });
            }
            // A catalogued version is immutable from here on, so a holder of the
            // original reference cannot retroactively change the rules a case was
            // assessed under.
            entries.set(key, deepFreeze(profile));
        },
        get(profileId, version) {
            return entries.get((0, identifiers_1.assetProfileVersionKey)(profileId, version));
        },
        has(profileId, version) {
            return entries.has((0, identifiers_1.assetProfileVersionKey)(profileId, version));
        },
        list(filter = {}) {
            return [...entries.values()]
                .filter((profile) => {
                if (filter.profileId !== undefined && profile.profileId !== filter.profileId)
                    return false;
                if (filter.assetCategory !== undefined && profile.assetCategory !== filter.assetCategory) {
                    return false;
                }
                return true;
            })
                .sort((left, right) => left.profileId.localeCompare(right.profileId) ||
                (0, identifiers_1.compareAssetProfileVersions)(left.version, right.version));
        },
        versionsOf(profileId) {
            return catalog.list({ profileId }).map((profile) => profile.version);
        },
    };
    for (const profile of profiles) {
        catalog.register(profile);
    }
    return catalog;
}
