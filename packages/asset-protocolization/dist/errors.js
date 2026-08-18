"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetProfileError = exports.ASSET_PROFILE_ERROR_CODES = void 0;
/**
 * The closed set of ways an asset-profile operation can fail as an operation.
 *
 * There is deliberately no independent error framework here: the repository
 * already has one shape for this — a real `Error` that structurally satisfies
 * `ProtocolError` (`code` + `message` + `details`), exactly as
 * `SovereigntyCapabilityInvocationError` does — and this reuses it.
 */
exports.ASSET_PROFILE_ERROR_CODES = Object.freeze({
    /** The profile document failed `validateAssetProfile`. */
    invalidProfile: 'ASSET_PROFILE_INVALID',
    /** A profile with this (profileId, version) pair is already catalogued. */
    versionAlreadyRegistered: 'ASSET_PROFILE_VERSION_ALREADY_REGISTERED',
});
/**
 * The `message` and the JS stack are runtime debugging aids. `code` and
 * `details.reasonCodes` are the stable, reportable surface.
 */
class AssetProfileError extends Error {
    constructor(code, message, details) {
        super(message);
        this.name = 'AssetProfileError';
        this.code = code;
        this.details = details;
    }
}
exports.AssetProfileError = AssetProfileError;
