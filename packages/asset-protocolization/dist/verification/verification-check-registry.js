"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVerificationCheckRegistry = createVerificationCheckRegistry;
const identifiers_1 = require("../identifiers");
const verification_errors_1 = require("./verification-errors");
function failRegistration(message, checkId) {
    throw new verification_errors_1.VerificationError(verification_errors_1.VERIFICATION_ERROR_CODES.checkRegistrationInvalid, message, {
        reasonCodes: [verification_errors_1.VERIFICATION_ERROR_CODES.checkRegistrationInvalid],
        ...(checkId === undefined ? {} : { checkId }),
    });
}
/**
 * Builds a registry, optionally pre-populated.
 *
 * Pre-population is ordinary registration, so a malformed or duplicated check
 * fails at construction rather than at first execution — the same choice
 * `createAssetProfileCatalog` makes, for the same reason: a deployment that
 * cannot perform the checks its profiles declare should not start.
 */
function createVerificationCheckRegistry(checks = []) {
    const entries = new Map();
    const registry = {
        register(check) {
            if (typeof check !== 'object' || check === null) {
                failRegistration('A verification check implementation is required');
            }
            if (!(0, identifiers_1.isValidAssetVerificationCheckId)(check.checkId)) {
                failRegistration('A verification check must carry a well-formed AssetVerificationCheckId');
            }
            if (typeof check.execute !== 'function') {
                failRegistration(`Verification check ${check.checkId} does not implement execute()`, check.checkId);
            }
            if (entries.has(check.checkId)) {
                failRegistration(`A verification check is already registered for ${check.checkId}`, check.checkId);
            }
            entries.set(check.checkId, Object.freeze(check));
        },
        get(checkId) {
            // Exact match against the map's own keys. `Map.get` performs no coercion,
            // so a non-string key can never accidentally resolve to a registration.
            return typeof checkId === 'string' ? entries.get(checkId) : undefined;
        },
        has(checkId) {
            return typeof checkId === 'string' && entries.has(checkId);
        },
        registeredCheckIds() {
            return [...entries.keys()].sort();
        },
    };
    for (const check of checks)
        registry.register(check);
    return registry;
}
