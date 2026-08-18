"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLicensingTermsSovereigntyCapabilityInput = exports.isValidLicensingTermsSovereigntyCapabilityInput = exports.createLicensingTermsSovereigntyCapabilityImplementation = exports.LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateVerifiabilitySovereigntyCapabilityInput = exports.isValidVerifiabilitySovereigntyCapabilityInput = exports.createVerifiabilitySovereigntyCapabilityImplementation = exports.VERIFIABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.VERIFIABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateInteroperabilitySovereigntyCapabilityInput = exports.isValidInteroperabilitySovereigntyCapabilityInput = exports.createInteroperabilitySovereigntyCapabilityImplementation = exports.INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validatePortabilitySovereigntyCapabilityInput = exports.isValidPortabilitySovereigntyCapabilityInput = exports.createPortabilitySovereigntyCapabilityImplementation = exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateProvenanceSovereigntyCapabilityInput = exports.isValidProvenanceSovereigntyCapabilityInput = exports.createProvenanceSovereigntyCapabilityImplementation = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateIntegritySovereigntyCapabilityInput = exports.isValidIntegritySovereigntyCapabilityInput = exports.createIntegritySovereigntyCapabilityImplementation = exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.INTEGRITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.validateIdentitySovereigntyCapabilityInput = exports.isValidIdentitySovereigntyCapabilityInput = exports.createIdentitySovereigntyCapabilityImplementation = exports.IDENTITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = void 0;
/**
 * The production Sovereignty Capability capsules.
 *
 * SM-04 shipped the first two of the canonical eight as real implementations
 * of the SM-03 socket — AOC.IDENTITY and AOC.INTEGRITY — SM-05 added the third,
 * AOC.PROVENANCE, SM-06 the fourth, AOC.PORTABILITY, SM-07 the fifth,
 * AOC.INTEROPERABILITY, SM-08 the sixth, AOC.VERIFIABILITY, and SM-09 adds the
 * seventh, AOC.LICENSING_TERMS. Governance Compatibility remains a canonical
 * descriptor with no production capsule.
 *
 * All seven are plain factories with no import-time side effects. None registers
 * itself anywhere: there is no global implementation registry, and a capsule is
 * passed explicitly to `invokeSovereigntyCapability`.
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
var portability_1 = require("./portability");
Object.defineProperty(exports, "PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS", { enumerable: true, get: function () { return portability_1.PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS; } });
Object.defineProperty(exports, "PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES", { enumerable: true, get: function () { return portability_1.PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES; } });
Object.defineProperty(exports, "createPortabilitySovereigntyCapabilityImplementation", { enumerable: true, get: function () { return portability_1.createPortabilitySovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidPortabilitySovereigntyCapabilityInput", { enumerable: true, get: function () { return portability_1.isValidPortabilitySovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validatePortabilitySovereigntyCapabilityInput", { enumerable: true, get: function () { return portability_1.validatePortabilitySovereigntyCapabilityInput; } });
var interoperability_1 = require("./interoperability");
Object.defineProperty(exports, "INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS", { enumerable: true, get: function () { return interoperability_1.INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS; } });
Object.defineProperty(exports, "INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES", { enumerable: true, get: function () { return interoperability_1.INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES; } });
Object.defineProperty(exports, "createInteroperabilitySovereigntyCapabilityImplementation", { enumerable: true, get: function () { return interoperability_1.createInteroperabilitySovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidInteroperabilitySovereigntyCapabilityInput", { enumerable: true, get: function () { return interoperability_1.isValidInteroperabilitySovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validateInteroperabilitySovereigntyCapabilityInput", { enumerable: true, get: function () { return interoperability_1.validateInteroperabilitySovereigntyCapabilityInput; } });
var verifiability_1 = require("./verifiability");
Object.defineProperty(exports, "VERIFIABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS", { enumerable: true, get: function () { return verifiability_1.VERIFIABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS; } });
Object.defineProperty(exports, "VERIFIABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES", { enumerable: true, get: function () { return verifiability_1.VERIFIABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES; } });
Object.defineProperty(exports, "createVerifiabilitySovereigntyCapabilityImplementation", { enumerable: true, get: function () { return verifiability_1.createVerifiabilitySovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidVerifiabilitySovereigntyCapabilityInput", { enumerable: true, get: function () { return verifiability_1.isValidVerifiabilitySovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validateVerifiabilitySovereigntyCapabilityInput", { enumerable: true, get: function () { return verifiability_1.validateVerifiabilitySovereigntyCapabilityInput; } });
var licensing_terms_1 = require("./licensing-terms");
Object.defineProperty(exports, "LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS", { enumerable: true, get: function () { return licensing_terms_1.LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS; } });
Object.defineProperty(exports, "createLicensingTermsSovereigntyCapabilityImplementation", { enumerable: true, get: function () { return licensing_terms_1.createLicensingTermsSovereigntyCapabilityImplementation; } });
Object.defineProperty(exports, "isValidLicensingTermsSovereigntyCapabilityInput", { enumerable: true, get: function () { return licensing_terms_1.isValidLicensingTermsSovereigntyCapabilityInput; } });
Object.defineProperty(exports, "validateLicensingTermsSovereigntyCapabilityInput", { enumerable: true, get: function () { return licensing_terms_1.validateLicensingTermsSovereigntyCapabilityInput; } });
