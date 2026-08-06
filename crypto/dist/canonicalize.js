"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANONICAL_JSON_PROFILE = exports.canonicalizeJSON = void 0;
/**
 * Thin re-export. The authoritative `aoc-canonical-json/1` implementation
 * now lives in `@aoc/protocol/canonical` (see that module's header comment
 * for the full contract and the AOC Protocol Slice 1 rationale for this
 * relocation). This file exists so every existing `from './canonicalize'` /
 * `from '../canonicalize'` import in this package (and, transitively, the
 * root `canonicalize.ts` re-export used across `content/`, `pack/`,
 * `field/`, `storage/`, `capability/`, `consent/`, and `aocId.ts`) keeps
 * working unchanged.
 */
var canonical_1 = require("@aoc/protocol/canonical");
Object.defineProperty(exports, "canonicalizeJSON", { enumerable: true, get: function () { return canonical_1.canonicalizeJSON; } });
Object.defineProperty(exports, "CANONICAL_JSON_PROFILE", { enumerable: true, get: function () { return canonical_1.CANONICAL_JSON_PROFILE; } });
