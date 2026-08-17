"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSovereigntyCapabilities = listSovereigntyCapabilities;
exports.getSovereigntyCapability = getSovereigntyCapability;
exports.getSovereigntyCapabilityByKey = getSovereigntyCapabilityByKey;
const definitions_1 = require("./definitions");
const ids_1 = require("./ids");
/**
 * Canonical, read-only discovery surface for the Sovereignty Capabilities.
 *
 * This is a Protocol registry, not a plugin marketplace and not the runtime
 * `AdapterRegistry`: it borrows that registry's lessons (stable identity, an
 * explicit contract version, frozen registration records, deterministic
 * ordering of `list()`) but deliberately drops registration and removal. The
 * canonical inventory is fixed at Protocol authoring time, so a caller cannot
 * make `my-company.special-capability` a canonical AOC sovereignty mineral.
 *
 * SM-01 answers only "what capabilities exist, what are their identities and
 * versions, and how are they discovered" — never "how are they executed".
 * There is no invocation API here.
 */
const BY_ID = new Map(definitions_1.SOVEREIGNTY_CAPABILITIES.map((capability) => [capability.id, capability]));
const BY_KEY = new Map(definitions_1.SOVEREIGNTY_CAPABILITIES.map((capability) => [capability.key, capability]));
/**
 * Every canonical Sovereignty Capability, always in canonical order. The
 * returned array is the frozen canonical list — callers cannot reorder,
 * extend, or truncate the Protocol's inventory through it.
 */
function listSovereigntyCapabilities() {
    return definitions_1.SOVEREIGNTY_CAPABILITIES;
}
/**
 * Resolves a canonical definition by its canonical id. Unknown ids resolve to
 * `undefined` — they are never coerced onto a neighbouring capability.
 */
function getSovereigntyCapability(id) {
    return (0, ids_1.isSovereigntyCapabilityId)(id) ? BY_ID.get(id) : undefined;
}
/** Resolves a canonical definition by its stable programmatic key. */
function getSovereigntyCapabilityByKey(key) {
    return (0, ids_1.isSovereigntyCapabilityKey)(key) ? BY_KEY.get(key) : undefined;
}
