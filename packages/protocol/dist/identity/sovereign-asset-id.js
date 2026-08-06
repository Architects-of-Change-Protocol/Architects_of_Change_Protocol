"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintSovereignAssetId = mintSovereignAssetId;
exports.isValidSovereignAssetId = isValidSovereignAssetId;
exports.assertValidSovereignAssetId = assertValidSovereignAssetId;
const node_crypto_1 = require("node:crypto");
const SOVEREIGN_ASSET_ID_PREFIX = 'aoc:sovereign-asset:';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SOVEREIGN_ASSET_ID_PATTERN = new RegExp(`^${SOVEREIGN_ASSET_ID_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${UUID_PATTERN.source.slice(1, -1)}$`);
/**
 * Mints a brand new, independent SovereignAssetId. Never call this more
 * than once for the same asset — a fresh id always means a fresh asset.
 */
function mintSovereignAssetId() {
    return `${SOVEREIGN_ASSET_ID_PREFIX}${(0, node_crypto_1.randomUUID)()}`;
}
/**
 * Structural validation only — confirms the value is well-formed. It does
 * not confirm the id is registered, resolvable, or was minted by this
 * runtime.
 */
function isValidSovereignAssetId(value) {
    return typeof value === 'string' && SOVEREIGN_ASSET_ID_PATTERN.test(value);
}
function assertValidSovereignAssetId(value) {
    if (!isValidSovereignAssetId(value)) {
        throw new Error(`Malformed SovereignAssetId: ${JSON.stringify(value)}`);
    }
}
