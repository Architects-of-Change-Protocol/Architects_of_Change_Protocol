"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSovereigntyCapabilityRef = toSovereigntyCapabilityRef;
exports.getSovereigntyCapabilityRef = getSovereigntyCapabilityRef;
exports.getSovereigntyCapabilityRefByKey = getSovereigntyCapabilityRefByKey;
exports.isValidSovereigntyCapabilityRef = isValidSovereigntyCapabilityRef;
exports.sovereigntyCapabilityRefsEqual = sovereigntyCapabilityRefsEqual;
const ids_1 = require("./ids");
const registry_1 = require("./registry");
const version_1 = require("./version");
/**
 * Derives a ref from a canonical definition. Preferred over writing an
 * `{ id, version }` literal anywhere in production code: the registry stays
 * the single source of both values, so a capability version bump cannot
 * leave a stale hard-coded pair behind.
 */
function toSovereigntyCapabilityRef(definition) {
    return Object.freeze({ id: definition.id, version: definition.version });
}
/**
 * Resolves the ref for a canonical id at the version the registry currently
 * defines. Mirrors `getSovereigntyCapability`: an unknown id resolves to
 * `undefined` and is never coerced onto a neighbouring capability.
 */
function getSovereigntyCapabilityRef(id) {
    const definition = (0, registry_1.getSovereigntyCapability)(id);
    return definition === undefined ? undefined : toSovereigntyCapabilityRef(definition);
}
/** Key-addressed twin of `getSovereigntyCapabilityRef`. */
function getSovereigntyCapabilityRefByKey(key) {
    const definition = (0, registry_1.getSovereigntyCapabilityByKey)(key);
    return definition === undefined ? undefined : toSovereigntyCapabilityRef(definition);
}
/**
 * Structural validity of a ref: the id must be one of the canonical eight
 * and the version must satisfy `isSovereigntyCapabilityVersion`.
 *
 * Deliberately NOT checked: that `version` equals the version the registry
 * currently defines. A ref naming a capability version this build has never
 * heard of is well-formed — it simply will not match any implementation,
 * which is the invoker's job to detect and report (see `invoke.ts`). Pinning
 * validity to the current registry version would make it impossible to
 * describe, persist, or replay an invocation of any other version, including
 * evidence produced by an older or newer Protocol build.
 */
function isValidSovereigntyCapabilityRef(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    return (0, ids_1.isSovereigntyCapabilityId)(candidate.id) && (0, version_1.isSovereigntyCapabilityVersion)(candidate.version);
}
/**
 * Exact equality of capability *and* version. Two refs naming the same
 * capability at different versions are not equal — that inequality is the
 * whole point of `version`, and silently treating them as interchangeable is
 * exactly the "latest wins" substitution the invocation contract forbids.
 */
function sovereigntyCapabilityRefsEqual(a, b) {
    return a.id === b.id && a.version === b.version;
}
