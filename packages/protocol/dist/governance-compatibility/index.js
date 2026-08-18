"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSovereignGovernanceHandoffV1 = exports.sovereignGovernanceSubjectsEqual = exports.isValidSovereignGovernanceHandoffV1 = exports.tryBuildSovereignGovernanceHandoffV1 = exports.buildSovereignGovernanceHandoffV1 = exports.SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION = exports.buildSovereignGovernanceResourceRef = exports.SOVEREIGN_GOVERNED_RESOURCE_KIND = exports.SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES = void 0;
/**
 * `@aoc/protocol/governance-compatibility` — the sovereign governance handoff:
 * the deterministic, provider-neutral boundary object an external governance
 * system receives, and the point at which AOC Protocol stops.
 *
 * SM-09 answered "what does the issuer declare about this subject?". This
 * subpath answers a different question: what does an external governance system
 * need in order to *address* and *interpret* a sovereign subject — and what
 * must the Protocol refuse to do on its behalf?
 *
 * ## The boundary this module exists to hold
 *
 *     governance compatible != governed
 *     handoff               != decision
 *     resource reference    != grant
 *     license terms         != policy
 *     claim                 != authority
 *     signature             != authority
 *     registrant            != owner
 *     issuer                != owner
 *     authority             != decision
 *     decision              != enforcement
 *
 * The Protocol creates that boundary. It must never cross it. There is no
 * policy evaluation here, no allow/deny, no authority resolution, no decision,
 * no obligation status, no grant, no consent, no delegation, no scope
 * derivation, no precedence between contradictory declarations, no approval
 * workflow, no provider enforcement, no revocation, no payment, no tokenization
 * and no legal or ownership conclusion. Every one of those is something an
 * external governance system — AOC Enterprise, an OPA or Cedar deployment, a
 * cloud IAM, a DAO, an engine nobody has written yet — may do *after* reading a
 * handoff, using its own authority.
 *
 * ## What travels, and where it comes from
 *
 *     subject         SM-02 SovereignSubjectRef, from the representation
 *     resource        canonical Protocol ResourceRef, projected from the subject
 *     representation  SM-06 SovereigntyPortabilityBundleV1, unchanged
 *     semantics       SM-07 SovereigntyInteroperabilityDescriptorV1, derived
 *
 * Nothing on this list is a new model. Governance Compatibility introduces
 * exactly one new document — the handoff envelope — plus one generic resource
 * kind, and reuses every other contract it needs.
 *
 * The handoff *data contracts* live here; the production
 * AOC.GOVERNANCE_COMPATIBILITY capsule that runs
 * `prepare-governance-handoff` and `validate-governance-handoff` through the
 * common SM-03 invocation and evidence spine lives in
 * `@aoc/protocol/sovereignty-capabilities`. This mirrors the existing split
 * between `@aoc/protocol/portability`, `@aoc/protocol/interoperability`,
 * `@aoc/protocol/licensing` and their capsules, so the projection, the builder
 * and the validators stay usable on their own and no contract is defined twice.
 *
 * Importing this module has no side effects: nothing is minted, no clock is
 * read, no file is opened, no connection is made, nothing is registered and
 * nothing is written.
 */
var reason_codes_1 = require("./reason-codes");
Object.defineProperty(exports, "SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES", { enumerable: true, get: function () { return reason_codes_1.SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES; } });
var resource_1 = require("./resource");
Object.defineProperty(exports, "SOVEREIGN_GOVERNED_RESOURCE_KIND", { enumerable: true, get: function () { return resource_1.SOVEREIGN_GOVERNED_RESOURCE_KIND; } });
Object.defineProperty(exports, "buildSovereignGovernanceResourceRef", { enumerable: true, get: function () { return resource_1.buildSovereignGovernanceResourceRef; } });
var handoff_1 = require("./handoff");
Object.defineProperty(exports, "SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION", { enumerable: true, get: function () { return handoff_1.SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION; } });
var builder_1 = require("./builder");
Object.defineProperty(exports, "buildSovereignGovernanceHandoffV1", { enumerable: true, get: function () { return builder_1.buildSovereignGovernanceHandoffV1; } });
Object.defineProperty(exports, "tryBuildSovereignGovernanceHandoffV1", { enumerable: true, get: function () { return builder_1.tryBuildSovereignGovernanceHandoffV1; } });
var validation_1 = require("./validation");
Object.defineProperty(exports, "isValidSovereignGovernanceHandoffV1", { enumerable: true, get: function () { return validation_1.isValidSovereignGovernanceHandoffV1; } });
Object.defineProperty(exports, "sovereignGovernanceSubjectsEqual", { enumerable: true, get: function () { return validation_1.sovereignGovernanceSubjectsEqual; } });
Object.defineProperty(exports, "validateSovereignGovernanceHandoffV1", { enumerable: true, get: function () { return validation_1.validateSovereignGovernanceHandoffV1; } });
