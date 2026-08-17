import type { CanonicalClaimId } from '../claims/primitives';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import { isValidSovereignAssetId } from '../identity/sovereign-asset-id';
import { isValidDerivationClaim, type DerivationClaim, type DerivationRelationKind } from './claims';

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

export const SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION = 'aoc-sovereign-lineage-trace/1' as const;

export type SovereignLineageTraceSchemaVersion = typeof SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION;

/**
 * `ancestors` walks from the root towards what it derives from; `descendants`
 * walks towards what derives from it. Both directions are answered from the
 * same claim set — the reverse index is built in memory from the supplied
 * claims, so no separately maintained inverse index is required.
 */
export const SOVEREIGN_LINEAGE_DIRECTIONS = Object.freeze(['ancestors', 'descendants'] as const);

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
export const DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH = 64;

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

function hasOwnProperty(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function isValidSovereignLineageMaxDepth(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1;
}

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
export function validateTraceSovereignLineageInput(value: unknown): TraceSovereignLineageValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, reasons: ['INVALID_LINEAGE_INPUT_STRUCTURE'] };
  }

  const reasons: string[] = [];
  const candidate = value as Partial<TraceSovereignLineageInput>;

  if (!isValidSovereignAssetId(candidate.rootSovereignAssetId)) {
    reasons.push('INVALID_LINEAGE_ROOT_SUBJECT');
  }

  if (!(SOVEREIGN_LINEAGE_DIRECTIONS as readonly string[]).includes(candidate.direction as string)) {
    reasons.push('INVALID_LINEAGE_DIRECTION');
  }

  const claims = candidate.derivationClaims;
  if (!Array.isArray(claims)) {
    reasons.push('INVALID_LINEAGE_CLAIMS');
  } else {
    if (!claims.every((claim) => isValidDerivationClaim(claim))) {
      reasons.push('INVALID_LINEAGE_DERIVATION_CLAIM');
    }
    const ids = claims.map((claim) => (claim as DerivationClaim | undefined)?.id);
    if (new Set(ids).size !== ids.length) {
      reasons.push('DUPLICATE_LINEAGE_CLAIM_ID');
    }
  }

  if (hasOwnProperty(candidate, 'maxDepth') && !isValidSovereignLineageMaxDepth(candidate.maxDepth)) {
    reasons.push('INVALID_LINEAGE_MAX_DEPTH');
  }

  return { valid: reasons.length === 0, reasons };
}

export function isValidTraceSovereignLineageInput(value: unknown): value is TraceSovereignLineageInput {
  return validateTraceSovereignLineageInput(value).valid;
}

/**
 * Builds the adjacency used for one direction, keyed by the subject a step
 * starts from.
 *
 * For `ancestors` a claim is reachable from its child; for `descendants` the
 * same claim is reachable from each of its sources — which is how the inverse
 * relationship is obtained without any externally maintained index. Both
 * indexes are plain `Map`s built per call from the caller's array, so nothing
 * is cached across calls and the caller's array is only ever read.
 */
function buildAdjacency(
  claims: readonly DerivationClaim[],
  direction: SovereignLineageDirection,
): ReadonlyMap<SovereignAssetId, readonly DerivationClaim[]> {
  const adjacency = new Map<SovereignAssetId, DerivationClaim[]>();

  const add = (key: SovereignAssetId, claim: DerivationClaim): void => {
    const existing = adjacency.get(key);
    if (existing === undefined) {
      adjacency.set(key, [claim]);
    } else {
      existing.push(claim);
    }
  };

  for (const claim of claims) {
    if (direction === 'ancestors') {
      add(claim.subject as SovereignAssetId, claim);
    } else {
      for (const source of claim.metadata.sourceSovereignAssetIds) {
        add(source, claim);
      }
    }
  }

  return adjacency;
}

/** The subjects one derivation step away, in the requested direction. */
function stepTargets(claim: DerivationClaim, direction: SovereignLineageDirection): readonly SovereignAssetId[] {
  return direction === 'ancestors'
    ? claim.metadata.sourceSovereignAssetIds
    : [claim.subject as SovereignAssetId];
}

/**
 * Reports whether the subgraph reachable from `root` contains a cycle.
 *
 * This is a genuine back-edge search, not a "have I seen this subject before"
 * check, because those are not the same question. A diamond —
 * `A → B`, `A → C`, `B → D`, `C → D` — reaches `A` by two distinct paths and
 * is a perfectly ordinary acyclic history; reporting it as a cycle because a
 * breadth-first walk arrived at `A` twice would flag a large share of real
 * multi-parent lineage as malformed. A cycle is specifically an edge back to
 * a subject still open on the current path.
 *
 * Iterative depth-first with an explicit stack and three-colour marking
 * (unseen / on the current path / finished), so it terminates on any input,
 * never recurses, and visits each subject and edge of the supplied dataset at
 * most once.
 *
 * Deliberately not bounded by `maxDepth`: a depth bound is about how much
 * lineage the caller asked to see, while a cycle is a property of the data
 * they supplied. Reporting "no cycle" only because the walk stopped early
 * would be the dishonest reading.
 */
function detectLineageCycle(
  root: SovereignAssetId,
  adjacency: ReadonlyMap<SovereignAssetId, readonly DerivationClaim[]>,
  direction: SovereignLineageDirection,
): boolean {
  const ON_PATH = 1;
  const FINISHED = 2;

  const state = new Map<SovereignAssetId, number>();

  const targetsOf = (subject: SovereignAssetId): readonly SovereignAssetId[] => {
    const targets: SovereignAssetId[] = [];
    for (const claim of adjacency.get(subject) ?? []) {
      targets.push(...stepTargets(claim, direction));
    }
    return targets;
  };

  const stack: Array<{ subject: SovereignAssetId; targets: readonly SovereignAssetId[]; index: number }> = [];
  state.set(root, ON_PATH);
  stack.push({ subject: root, targets: targetsOf(root), index: 0 });

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    if (frame.index >= frame.targets.length) {
      state.set(frame.subject, FINISHED);
      stack.pop();
      continue;
    }

    const target = frame.targets[frame.index];
    frame.index += 1;

    const marking = state.get(target);
    if (marking === ON_PATH) return true;
    if (marking === FINISHED) continue;

    state.set(target, ON_PATH);
    stack.push({ subject: target, targets: targetsOf(target), index: 0 });
  }

  return false;
}

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
export function traceSovereignLineage(input: TraceSovereignLineageInput): SovereignLineageTrace {
  const validation = validateTraceSovereignLineageInput(input);
  if (!validation.valid) {
    throw new Error(`Invalid lineage trace input: ${validation.reasons.join(', ')}`);
  }

  const maxDepth = input.maxDepth ?? DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH;
  const adjacency = buildAdjacency(input.derivationClaims, input.direction);

  const nodes: SovereignLineageNode[] = [];
  const edges: SovereignLineageEdge[] = [];
  const emittedClaimIds = new Set<CanonicalClaimId>();

  // The root is visited from the start, so it is never restated as its own
  // ancestor or descendant even when the data loops back to it.
  const visited = new Set<SovereignAssetId>([input.rootSovereignAssetId]);
  let frontier: readonly SovereignAssetId[] = [input.rootSovereignAssetId];
  let truncated = false;
  let depth = 0;

  while (frontier.length > 0) {
    if (depth >= maxDepth) {
      // Something was still reachable and deliberately not explored. Saying so
      // is the difference between a bounded answer and a false complete one.
      truncated = frontier.some((subject) =>
        (adjacency.get(subject) ?? []).some((claim) =>
          stepTargets(claim, input.direction).some((target) => !visited.has(target)),
        ),
      );
      break;
    }

    const nextDepth = depth + 1;
    const discovered: SovereignAssetId[] = [];

    for (const subject of frontier) {
      const claims = [...(adjacency.get(subject) ?? [])].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

      for (const claim of claims) {
        if (!emittedClaimIds.has(claim.id)) {
          emittedClaimIds.add(claim.id);
          edges.push(
            Object.freeze({
              claimId: claim.id,
              childSovereignAssetId: claim.subject as SovereignAssetId,
              sourceSovereignAssetIds: Object.freeze([...claim.metadata.sourceSovereignAssetIds]),
              relation: claim.metadata.relation,
            }),
          );
        }

        for (const target of stepTargets(claim, input.direction)) {
          if (visited.has(target)) continue;
          visited.add(target);
          discovered.push(target);
        }
      }
    }

    if (discovered.length === 0) break;

    discovered.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const sovereignAssetId of discovered) {
      nodes.push(Object.freeze({ sovereignAssetId, depth: nextDepth }));
    }

    frontier = discovered;
    depth = nextDepth;
  }

  const cycleDetected = detectLineageCycle(input.rootSovereignAssetId, adjacency, input.direction);

  return Object.freeze({
    schemaVersion: SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION,
    rootSovereignAssetId: input.rootSovereignAssetId,
    direction: input.direction,
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
    cycleDetected,
    truncated,
    maxDepth,
  });
}
