"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAssetProfileMetadata = isValidAssetProfileMetadata;
const METADATA_KEYS = ['label', 'description', 'reason'];
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isValidAssetProfileMetadata(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    for (const key of Object.keys(candidate)) {
        if (!METADATA_KEYS.includes(key))
            return false;
    }
    for (const key of METADATA_KEYS) {
        if (!hasOwn(candidate, key))
            continue;
        const field = candidate[key];
        if (typeof field !== 'string' || field.trim() === '')
            return false;
    }
    return true;
}
