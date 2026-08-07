"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSovereignAssetVersion = resolveSovereignAssetVersion;
exports.resolveSovereignAsset = resolveSovereignAsset;
function resolveSovereignAssetVersion(sovereignAssetRegistry, sovereignAssetId, manifestVersion) {
    return sovereignAssetRegistry.resolveVersion(sovereignAssetId, manifestVersion);
}
/**
 * Resolves sovereign semantics only: given an id, return the signed
 * manifest currently on record for it (or `null`). This function must
 * never authorize access, issue grants, evaluate Enterprise policy, or
 * call Enterprise — it is a pure lookup.
 */
function resolveSovereignAsset(sovereignAssetRegistry, sovereignAssetId) {
    return sovereignAssetRegistry.resolve(sovereignAssetId);
}
