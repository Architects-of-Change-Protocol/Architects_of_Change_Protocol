"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProvenanceSovereigntyCapabilityInput = exports.isValidProvenanceSovereigntyCapabilityInput = exports.createProvenanceSovereigntyCapabilityImplementation = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateIntegritySovereigntyCapabilityInput = exports.isValidIntegritySovereigntyCapabilityInput = exports.createIntegritySovereigntyCapabilityImplementation = exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateIdentitySovereigntyCapabilityInput = exports.isValidIdentitySovereigntyCapabilityInput = exports.createIdentitySovereigntyCapabilityImplementation = exports.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = void 0;
/**
 * The production Sovereignty Capability capsules.
 *
 * SM-04 shipped the first two of the canonical eight as real implementations
 * of the SM-03 socket — AOC.IDENTITY and AOC.INTEGRITY — and SM-05 adds the
 * third, AOC.PROVENANCE. Portability, Interoperability, Verifiability,
 * Licensing & Terms and Governance Compatibility remain canonical descriptors
 * with no production capsule.
 *
 * All three are plain factories with no import-time side effects. None
 * registers itself anywhere: there is no global implementation registry, and a
 * capsule is passed explicitly to `invokeSovereigntyCapability`.
 */
var identity_1 = require("./identity");
Object.defineProperty(exports, "IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES", { enumerable: true, get: function () { return identity_1.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES; } });
Object.defineProperty(exports, "createIdentitySovereigntyCapabilityImplementation", { enumerable: true, get: function () { return identity_1.createIdentitySovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidIdentitySovereigntyCapabilityInput", { enumerable: true, get: function () { return identity_1.isValidIdentitySovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validateIdentitySovereigntyCapabilityInput", { enumerable: true, get: function () { return identity_1.validateIdentitySovereigntyCapabilityInput; } });
var integrity_1 = require("./integrity");
Object.defineProperty(exports, "INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS", { enumerable: true, get: function () { return integrity_1.INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS; } });
Object.defineProperty(exports, "INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES", { enumerable: true, get: function () { return integrity_1.INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES; } });
Object.defineProperty(exports, "createIntegritySovereigntyCapabilityImplementation", { enumerable: true, get: function () { return integrity_1.createIntegritySovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidIntegritySovereigntyCapabilityInput", { enumerable: true, get: function () { return integrity_1.isValidIntegritySovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validateIntegritySovereigntyCapabilityInput", { enumerable: true, get: function () { return integrity_1.validateIntegritySovereigntyCapabilityInput; } });
var provenance_1 = require("./provenance");
Object.defineProperty(exports, "PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS", { enumerable: true, get: function () { return provenance_1.PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS; } });
Object.defineProperty(exports, "PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES", { enumerable: true, get: function () { return provenance_1.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES; } });
Object.defineProperty(exports, "createProvenanceSovereigntyCapabilityImplementation", { enumerable: true, get: function () { return provenance_1.createProvenanceSovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidProvenanceSovereigntyCapabilityInput", { enumerable: true, get: function () { return provenance_1.isValidProvenanceSovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validateProvenanceSovereigntyCapabilityInput", { enumerable: true, get: function () { return provenance_1.validateProvenanceSovereigntyCapabilityInput; } });
