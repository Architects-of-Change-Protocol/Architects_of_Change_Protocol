"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeSovereigntyPortabilityBundle = exports.parseSovereigntyPortabilityBundle = exports.validateSovereigntyPortabilityBundleV1 = exports.tryBuildSovereigntyPortabilityBundleV1 = exports.portableManifestOf = exports.portableClaimOf = exports.isValidSovereigntyPortabilityBundleV1 = exports.isPortableSovereignManifestArtifact = exports.isPortableSovereignClaimArtifact = exports.buildSovereigntyPortabilityBundleV1 = exports.SOVEREIGNTY_PORTABILITY_REASON_CODES = exports.SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION = exports.PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS = exports.PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS = void 0;
/**
 * `@aoc/protocol/portability` — the canonical sovereign portability bundle.
 *
 * The portable *data contract* lives here; the production AOC.PORTABILITY
 * capsule that executes export/import through the common SM-03 invocation and
 * evidence spine lives in `@aoc/protocol/sovereignty-capabilities`. This mirrors
 * the existing split between the identity/manifest/claim primitives and the
 * capsules that consume them, so the bundle stays usable on its own and no
 * contract is defined twice across two surfaces.
 *
 * Importing this module has no side effects: nothing is minted, no file is
 * read, no connection is opened, no handler is registered, no clock is read and
 * nothing is written.
 */
var bundle_1 = require("./bundle");
Object.defineProperty(exports, "PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS", { enumerable: true, get: function () { return bundle_1.PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS; } });
Object.defineProperty(exports, "PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS", { enumerable: true, get: function () { return bundle_1.PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS; } });
Object.defineProperty(exports, "SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION", { enumerable: true, get: function () { return bundle_1.SOVEREIGNTY_PORTABILITY_BUNDLE_SCHEMA_VERSION; } });
Object.defineProperty(exports, "SOVEREIGNTY_PORTABILITY_REASON_CODES", { enumerable: true, get: function () { return bundle_1.SOVEREIGNTY_PORTABILITY_REASON_CODES; } });
Object.defineProperty(exports, "buildSovereigntyPortabilityBundleV1", { enumerable: true, get: function () { return bundle_1.buildSovereigntyPortabilityBundleV1; } });
Object.defineProperty(exports, "isPortableSovereignClaimArtifact", { enumerable: true, get: function () { return bundle_1.isPortableSovereignClaimArtifact; } });
Object.defineProperty(exports, "isPortableSovereignManifestArtifact", { enumerable: true, get: function () { return bundle_1.isPortableSovereignManifestArtifact; } });
Object.defineProperty(exports, "isValidSovereigntyPortabilityBundleV1", { enumerable: true, get: function () { return bundle_1.isValidSovereigntyPortabilityBundleV1; } });
Object.defineProperty(exports, "portableClaimOf", { enumerable: true, get: function () { return bundle_1.portableClaimOf; } });
Object.defineProperty(exports, "portableManifestOf", { enumerable: true, get: function () { return bundle_1.portableManifestOf; } });
Object.defineProperty(exports, "tryBuildSovereigntyPortabilityBundleV1", { enumerable: true, get: function () { return bundle_1.tryBuildSovereigntyPortabilityBundleV1; } });
Object.defineProperty(exports, "validateSovereigntyPortabilityBundleV1", { enumerable: true, get: function () { return bundle_1.validateSovereigntyPortabilityBundleV1; } });
var serialization_1 = require("./serialization");
Object.defineProperty(exports, "parseSovereigntyPortabilityBundle", { enumerable: true, get: function () { return serialization_1.parseSovereigntyPortabilityBundle; } });
Object.defineProperty(exports, "serializeSovereigntyPortabilityBundle", { enumerable: true, get: function () { return serialization_1.serializeSovereigntyPortabilityBundle; } });
