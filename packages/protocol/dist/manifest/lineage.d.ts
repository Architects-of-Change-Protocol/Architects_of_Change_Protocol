import type { CanonicalClaimId } from '../claims/primitives';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import { type DerivationClaim, type DerivationRelationKind } from './claims';
/**
 * Lineage analysis over a *supplied set* of `DerivationClaim`s.
 *
 * ## Why the caller supplies the claims
 *
 * There is no `ProvenanceDatabase`, `LineageGraphService`, global asset graph
 * or graph-database dependency here, and no external graph library. Protocol
 * defines what a derivation relationship *means*; where claims are stored and
 * indexed is infrastructure's decision, and a Protocol that required a global
 * lineage database to answer "what did this come from?" would stop being
 * portable and provider-neutral. A trace is therefore a pure function over the
 * claims the caller chose to put in front of it — no network, no filesystem,
 * no registry, no I/O of any kind.
 *
 * The honest consequence is stated in the result rather than hidden: a trace
 * is complete *with respect to the supplied dataset* and says nothing about
 * claims it was never shown.
 *
 * ## Contested history is still history
 *
 * A trace analyses every derivation claim it is given. It does not consult,
 * require or filter by `CanonicalStanding`, so a contested claim still appears
 * in the lineage it asserts. Standing is a separate record precisely so that a
 * consumer can decide to show everything, only uncontested edges, or both
 * side by side; silently deleting contested edges here would make Protocol
 * quietly pick a winner in a dispute it is not entitled to resolve.
 */
export declare const SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION: "aoc-sovereign-lineage-trace/1";
export type SovereignLineageTraceSchemaVersion = typeof SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION;
/**
 * `ancestors` walks from the root towards what it derives from; `descendants`
 * walks towards what derives from it. Both directions are answered from the
 * same claim set — the reverse index is built in memory from the supplied
 * claims, so no separately maintained inverse index is required.
 */
export declare const SOVEREIGN_LINEAGE_DIRECTIONS: readonly ["ancestors", "descendants"];
export type SovereignLineageDirection = (typeof SOVEREIGN_LINEAGE_DIRECTIONS)[number];
/**
 * Safe default bound on traversal depth when the caller does not set one.
 *
 * Traversal input is entirely caller-controlled, so an unbounded default would
 * make an arbitrarily deep supplied graph an arbitrarily long walk. The
 * traversal is iterative and visited-set guarded, so this is a predictability
 * bound rather than the thing that stops a cycle — and when it bites, the
 * result says so through `truncated` instead of presenting a partial lineage
 * as a complete one.
 */
export declare const DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH = 64;
/**
 * One reached subject and how far from the root it was reached.
 *
 * `depth` is the *shortest* number of derivation steps from the root within
 * the supplied dataset — a subject reachable by both a short and a long path
 * appears once, at the short depth.
 */
export interface SovereignLineageNode {
    readonly sovereignAssetId: SovereignAssetId;
    readonly depth: number;
}
/**
 * One derivation edge, carrying enough identity to know *which assertion*
 * created it — a lineage a consumer cannot attribute back to a claim is a
 * lineage it cannot contest.
 *
 * Deliberately absent: the issuer payload, the statement, evidence refs and
 * every other part of the claim body. An edge is a reference into the claim
 * set the caller already holds, not a copy of it.
 */
export interface SovereignLineageEdge {
    readonly claimId: CanonicalClaimId;
    readonly childSovereignAssetId: SovereignAssetId;
    readonly sourceSovereignAssetIds: readonly SovereignAssetId[];
    readonly relation: DerivationRelationKind;
}
/**
 * The portable result of a lineage traversal. Every field is JSON-safe and
 * canonicalizes under `aoc-canonical-json/1`: no `Map`, no `Set`, no class
 * instance and no `undefined` reaches this shape, even though the traversal
 * uses maps and sets internally.
 *
 * `nodes` excludes `rootSovereignAssetId` — it holds what the root derives
 * from, or what derives from it, never the root restated.
 */
export interface SovereignLineageTrace {
    readonly schemaVersion: SovereignLineageTraceSchemaVersion;
    readonly rootSovereignAssetId: SovereignAssetId;
    readonly direction: SovereignLineageDirection;
    readonly nodes: readonly SovereignLineageNode[];
    readonly edges: readonly SovereignLineageEdge[];
    /**
     * The supplied claims contain a derivation path that leads back into itself
     * within the subgraph reachable from the root. This is a true back edge, not
     * merely a subject reached twice: multi-parent lineage routinely reaches the
     * same ancestor by several paths, and that is a diamond, not a loop.
     *
     * It is a *finding about the data*, not an execution failure — the traversal
     * terminated normally and performed the analysis that was requested, so the
     * invocation still succeeds. Scoped to the supplied dataset and independent
     * of `maxDepth`: `false` means "no cycle among these claims", never "this
     * subject's global lineage is acyclic".
     */
    readonly cycleDetected: boolean;
    /** `maxDepth` was reached with unexplored subjects still in the frontier. */
    readonly truncated: boolean;
    /** The bound actually applied, whether supplied or defaulted. */
    readonly maxDepth: number;
}
export interface TraceSovereignLineageInput {
    readonly rootSovereignAssetId: SovereignAssetId;
    readonly direction: SovereignLineageDirection;
    /** The claims to analyse. Never mutated, sorted or deduplicated in place. */
    readonly derivationClaims: readonly DerivationClaim[];
    /** Positive integer bound; defaults to `DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH`. */
    readonly maxDepth?: number;
}
export interface TraceSovereignLineageValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly string[];
}
export declare function isValidSovereignLineageMaxDepth(value: unknown): value is number;
/**
 * Validates a traversal request without performing it.
 *
 * Every supplied claim must be a structurally valid `DerivationClaim`: a
 * traversal over half-readable assertions would produce a lineage whose edges
 * nobody could trust, so this fails closed rather than skipping the bad ones.
 *
 * Two distinct claims sharing one `id` also fail closed. A claim id is the
 * handle a consumer uses to contest, resolve or de-duplicate an edge, so a
 * dataset in which one id means two different assertions is malformed —
 * picking either one silently would make the result depend on input order.
 */
export declare function validateTraceSovereignLineageInput(value: unknown): TraceSovereignLineageValidationResult;
export declare function isValidTraceSovereignLineageInput(value: unknown): value is TraceSovereignLineageInput;
/**
 * traceSovereignLineage — walks the derivation graph the caller supplied.
 *
 * ## Termination and safety
 *
 * The walk is breadth-first and iterative — never recursive — over an
 * explicit frontier, guarded by a visited set and bounded by `maxDepth`. A
 * subject is expanded at most once, so a cyclic dataset terminates on the
 * visited set rather than on the depth bound, and a deep or wide graph costs
 * one adjacency lookup per subject rather than a scan of every claim per step.
 *
 * ## Deterministic output
 *
 * Ordering is a published part of this contract, not an accident of `Set`
 * iteration or of the order the caller happened to pass claims in:
 *
 *   1. `nodes` is ordered by increasing depth;
 *   2. within one depth, by `sovereignAssetId` ascending;
 *   3. `edges` follows the traversal — expansion order of the subject the
 *      edge was reached from, and within one subject, `claimId` ascending —
 *      with each claim contributing at most one edge.
 *
 * The same semantic claim set therefore produces the same trace regardless of
 * input order.
 *
 * Throws on malformed input rather than returning an empty or partial lineage
 * that would read as a truthful "nothing found".
 */
export declare function traceSovereignLineage(input: TraceSovereignLineageInput): SovereignLineageTrace;
//# sourceMappingURL=lineage.d.ts.map