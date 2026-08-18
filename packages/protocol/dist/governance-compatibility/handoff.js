"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION = void 0;
/**
 * The canonical sovereign governance handoff — the deterministic boundary
 * object AOC Protocol hands to an external governance system, and the last
 * thing the Protocol produces before governance begins.
 *
 * ## Where this sits
 *
 *     SOVEREIGN SUBJECT
 *            |
 *     CANONICAL SOVEREIGN REPRESENTATION      (AOC.PORTABILITY)
 *            |
 *     MACHINE-READABLE SEMANTICS              (AOC.INTEROPERABILITY)
 *            |
 *     STABLE GOVERNANCE RESOURCE HANDLE       (this module)
 *            |
 *     SOVEREIGN GOVERNANCE HANDOFF            (this document)
 *     ========================================== AOC PROTOCOL ENDS HERE
 *            |
 *     EXTERNAL GOVERNANCE / AOC ENTERPRISE
 *            |
 *     POLICY -> DECISION -> OBLIGATIONS -> GRANTS -> ENFORCEMENT
 *
 * ## What a valid handoff asserts
 *
 * Exactly this:
 *
 *     "This stable governance resource refers to this sovereign subject, and
 *      this is the sovereign representation supplied together with the
 *      canonical machine-readable description of the semantics present in it."
 *
 * Nothing further. Governance *compatible* is not governed, a handoff is not a
 * decision, a resource reference is not a grant, declared terms are not policy,
 * a claim is not authority, a signature is not authority, a registrant is not
 * an owner, authority is not a decision and a decision is not enforcement. This
 * document creates that boundary; it must never cross it.
 *
 * ## Structural validity is not policy sufficiency
 *
 * A structurally valid handoff may carry zero claims, zero license terms,
 * unsigned artifacts, contested standings, contradictory permissions and
 * restrictions over the same action, cryptographic proofs that do not hold, and
 * semantic requirements nobody in the receiving system has ever seen. It is
 * still valid, because every one of those is a legitimate sovereign state that
 * governance may need to see *in order to* decide. Whether a particular policy
 * has enough information is a governance question with a governance answer, and
 * the Protocol does not pre-empt it in either direction.
 *
 * ## Fields deliberately absent, and why
 *
 * - **`handoffId` / `governanceId` / `requestId`** — the handoff is a
 *   deterministic projection of an existing subject, not a new sovereign
 *   object, an access request, a workflow or a case. Minting an id for it would
 *   create an identity with no owner and no lifecycle, and would make the same
 *   sovereign state project differently every time. The *execution* already has
 *   an identity: the SM-03 `invocationId`.
 * - **`generatedAt` / `preparedAt`** — the same determinism requirement. Same
 *   inputs, byte-identical canonical handoff. *When* a projection happened is
 *   recorded truthfully in the SM-03 invocation evidence.
 * - **`handoffDigest` / `handoffHash`** — Integrity is a different mineral,
 *   reached by explicit composition: canonicalize this document, then hand the
 *   bytes to AOC.INTEGRITY. Absorbing it here would give the handoff a second,
 *   drifting integrity story.
 * - **`signature` / `proof`** — likewise Verifiability. A consumer that wants
 *   proof signs the canonical serialization with the existing
 *   `signSovereignPayload`. No private key belongs in this mineral.
 * - **`ready` / `governanceReady` / `sufficient` / `complete`** — the Protocol
 *   cannot know whether every possible claim exists, and cannot know what a
 *   policy it has never seen requires. The existence of a structurally valid
 *   handoff is the only statement made here.
 * - **`policy` / `decision` / `authority` / `grant` / `approval` / `owner` /
 *   `status` / `resolvedTerms`** — every one of these is on the far side of the
 *   boundary.
 * - **`consumerType` / `engine` / `vendor` / `governanceProvider`** — the
 *   handoff knows nothing about who consumes it. There is no consumer enum,
 *   because the set of governance systems is open.
 */
exports.SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION = 'aoc-sovereign-governance-handoff/1';
