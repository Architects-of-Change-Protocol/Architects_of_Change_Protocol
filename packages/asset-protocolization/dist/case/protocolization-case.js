"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_CASE_SCHEMA_VERSION = void 0;
/**
 * `ProtocolizationCase` — one tenant's attempt to protocolize one subject under
 * one frozen `AssetProfile` version.
 *
 * ### What it is
 *
 * The workflow aggregate. It records what is happening in this attempt: which
 * profile governs it, which subject it is about, what has been supplied, where
 * it is in its lifecycle, and when each of those became true.
 *
 * ### What it is not
 *
 * It is not the protocolized asset — that is a signed `SovereignManifestV1`
 * that does not exist yet. It is not a `ProtocolizationResultV1` — that envelope
 * (APV-02 §2.1) exists only for a case that finished, and deliberately carries
 * no case state. It is not an Enterprise governance object, not a tokenization
 * request, and not a transaction of any kind.
 *
 * ### Profile versus case
 *
 * An `AssetProfile` answers *what does this category of asset require?* — it is
 * system-level, versioned, reusable and shared. A case answers *what is
 * happening in this specific attempt?* — it is tenant-bound, instance-specific
 * and stateful. A case never alters the semantics of its profile: it does not
 * copy requirement definitions, restate obligations, or hold a mutable snapshot
 * that could drift from the catalogued document. It holds the pin and reads
 * through it.
 *
 * ### Shape
 *
 * A plain immutable object, matching every other type in this package and in
 * Protocol. Operations are pure functions that return a new case plus the event
 * the transition produced (`case-operations.ts`); there is no setter, no
 * method, and no in-place mutation anywhere.
 */
exports.PROTOCOLIZATION_CASE_SCHEMA_VERSION = 'aoc-protocolization-case/1';
