"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepFreeze = deepFreeze;
/**
 * Internal. Not part of the package facade.
 *
 * Every case this package hands back is deeply frozen, so a caller cannot reach
 * past the aggregate operations by mutating a nested array or object on a case
 * it happens to hold — the same protection `createAssetProfileCatalog` gives a
 * catalogued profile, and for the same reason: `readonly` is erased at runtime,
 * so a compile-time modifier alone protects nothing a plain JavaScript consumer
 * (or a `JSON.parse` round trip) can do.
 */
function deepFreeze(value) {
    if (typeof value !== 'object' || value === null)
        return value;
    for (const entry of Object.values(value)) {
        deepFreeze(entry);
    }
    return Object.freeze(value);
}
