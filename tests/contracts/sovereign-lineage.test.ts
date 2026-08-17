import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { mintSovereignAssetId } from '@aoc/protocol/identity';
import type { SovereignAssetId } from '@aoc/protocol/identity';
import {
  DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH,
  DerivationRelationKind,
  SOVEREIGN_LINEAGE_DIRECTIONS,
  SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION,
  buildDerivationClaim,
  isValidTraceSovereignLineageInput,
  traceSovereignLineage,
  validateTraceSovereignLineageInput,
} from '@aoc/protocol/manifest';
import type {
  DerivationClaim,
  DerivationRelationKind as DerivationRelationKindType,
  SovereignLineageDirection,
  SovereignLineageTrace,
} from '@aoc/protocol/manifest';

const ISSUED_AT = '2026-08-17T12:00:00.000Z';

/**
 * A small named graph helper. Subjects are real minted `SovereignAssetId`s, so
 * ordering assertions cannot accidentally rely on a friendly test name.
 */
class Graph {
  private readonly ids = new Map<string, SovereignAssetId>();
  private sequence = 0;

  id(name: string): SovereignAssetId {
    const existing = this.ids.get(name);
    if (existing !== undefined) return existing;
    const minted = mintSovereignAssetId();
    this.ids.set(name, minted);
    return minted;
  }

  name(id: SovereignAssetId): string {
    for (const [key, value] of this.ids) if (value === id) return key;
    return id;
  }

  /** `derives('C', ['A', 'B'])` — C is asserted to derive from A and B. */
  derives(
    child: string,
    sources: readonly string[],
    relation: DerivationRelationKindType = DerivationRelationKind.DerivedFrom,
  ): DerivationClaim {
    this.sequence += 1;
    return buildDerivationClaim({
      id: `claim:derivation:${String(this.sequence).padStart(3, '0')}`,
      sovereignAssetId: this.id(child),
      issuer: 'principal:sm05-issuer',
      sourceSovereignAssetIds: sources.map((source) => this.id(source)),
      relation,
      issuedAt: ISSUED_AT,
    });
  }

  /** Reached subject names, grouped by depth — the stable part of the contract. */
  namesByDepth(trace: SovereignLineageTrace): Record<number, string[]> {
    const byDepth: Record<number, string[]> = {};
    for (const node of trace.nodes) {
      (byDepth[node.depth] ??= []).push(this.name(node.sovereignAssetId));
    }
    for (const depth of Object.keys(byDepth)) byDepth[Number(depth)].sort();
    return byDepth;
  }

  names(trace: SovereignLineageTrace): string[] {
    return trace.nodes.map((node) => this.name(node.sovereignAssetId));
  }
}

const trace = (
  root: SovereignAssetId,
  direction: SovereignLineageDirection,
  derivationClaims: readonly DerivationClaim[],
  maxDepth?: number,
): SovereignLineageTrace =>
  traceSovereignLineage({
    rootSovereignAssetId: root,
    direction,
    derivationClaims,
    ...(maxDepth === undefined ? {} : { maxDepth }),
  });

describe('SM-05 / single-parent lineage (LINEAGE TESTS 1-2)', () => {
  it('TEST 1 — ancestor trace over one derivation', () => {
    const g = new Graph();
    const claims = [g.derives('B', ['A'])];
    const result = trace(g.id('B'), 'ancestors', claims);

    expect(g.names(result)).toEqual(['A']);
    expect(result.rootSovereignAssetId).toBe(g.id('B'));
    expect(result.direction).toBe('ancestors');
    expect(result.cycleDetected).toBe(false);
    expect(result.truncated).toBe(false);
  });

  it('TEST 2 — descendant trace over the same claim, with no inverse index supplied', () => {
    const g = new Graph();
    const claims = [g.derives('B', ['A'])];
    const result = trace(g.id('A'), 'descendants', claims);

    expect(g.names(result)).toEqual(['B']);
    expect(result.direction).toBe('descendants');
  });
});

describe('SM-05 / chained lineage (LINEAGE TESTS 3-4)', () => {
  it('TEST 3 — A→B→C: ancestors of C are B then A, in depth order', () => {
    const g = new Graph();
    const claims = [g.derives('B', ['A']), g.derives('C', ['B'])];
    const result = trace(g.id('C'), 'ancestors', claims);

    expect(g.names(result)).toEqual(['B', 'A']);
    expect(result.nodes.map((node) => node.depth)).toEqual([1, 2]);
  });

  it('TEST 4 — A→B→C: descendants of A are B then C, in depth order', () => {
    const g = new Graph();
    const claims = [g.derives('B', ['A']), g.derives('C', ['B'])];
    const result = trace(g.id('A'), 'descendants', claims);

    expect(g.names(result)).toEqual(['B', 'C']);
    expect(result.nodes.map((node) => node.depth)).toEqual([1, 2]);
  });
});

describe('SM-05 / multi-parent lineage (LINEAGE TESTS 5-6)', () => {
  it('TEST 5 — A+B→C: ancestors of C are both A and B, with no single-parent assumption', () => {
    const g = new Graph();
    const claims = [g.derives('C', ['A', 'B'], DerivationRelationKind.CombinedFrom)];
    const result = trace(g.id('C'), 'ancestors', claims);

    expect(g.namesByDepth(result)).toEqual({ 1: ['A', 'B'] });
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].sourceSovereignAssetIds).toEqual([g.id('A'), g.id('B')]);
  });

  it('TEST 6 — a deep multi-parent graph: C from A+B, E from C+D', () => {
    const g = new Graph();
    const claims = [
      g.derives('C', ['A', 'B'], DerivationRelationKind.CombinedFrom),
      g.derives('E', ['C', 'D'], DerivationRelationKind.CombinedFrom),
    ];
    const result = trace(g.id('E'), 'ancestors', claims);

    // C and D are one step away; A and B are two.
    expect(g.namesByDepth(result)).toEqual({ 1: ['C', 'D'], 2: ['A', 'B'] });
    expect(result.edges).toHaveLength(2);
    expect(result.cycleDetected).toBe(false);
  });

  it('TEST 6b — a diamond reaches one ancestor twice and is NOT a cycle', () => {
    // A→B, A→C, B→D, C→D. `D` reaches `A` by two distinct paths; a walk that
    // called that a cycle would flag ordinary multi-parent history as broken.
    const g = new Graph();
    const claims = [g.derives('B', ['A']), g.derives('C', ['A']), g.derives('D', ['B', 'C'])];
    const result = trace(g.id('D'), 'ancestors', claims);

    expect(result.cycleDetected).toBe(false);
    expect(g.namesByDepth(result)).toEqual({ 1: ['B', 'C'], 2: ['A'] });
    // A is reported once, at its shortest depth.
    expect(g.names(result).filter((name) => name === 'A')).toHaveLength(1);
  });
});

describe('SM-05 / deterministic lineage output (LINEAGE TEST 7)', () => {
  it('TEST 7 — the same semantic claim set in a different order produces an identical trace', () => {
    const g = new Graph();
    const claims = [
      g.derives('C', ['A', 'B'], DerivationRelationKind.CombinedFrom),
      g.derives('E', ['C', 'D'], DerivationRelationKind.CombinedFrom),
      g.derives('D', ['A']),
    ];

    const forward = trace(g.id('E'), 'ancestors', claims);
    const reversed = trace(g.id('E'), 'ancestors', [...claims].reverse());
    const rotated = trace(g.id('E'), 'ancestors', [claims[1], claims[2], claims[0]]);

    expect(canonicalizeJSON(reversed)).toBe(canonicalizeJSON(forward));
    expect(canonicalizeJSON(rotated)).toBe(canonicalizeJSON(forward));
  });

  it('TEST 7b — within one depth, subjects are ordered by SovereignAssetId, not by input accident', () => {
    const g = new Graph();
    const result = trace(g.id('C'), 'ancestors', [g.derives('C', ['A', 'B', 'D'])]);
    const reached = result.nodes.map((node) => node.sovereignAssetId);

    expect(reached).toEqual([...reached].sort());
  });
});

describe('SM-05 / cycle handling (LINEAGE TESTS 8-10)', () => {
  const cyclic = (): { graph: Graph; claims: DerivationClaim[] } => {
    const graph = new Graph();
    // A derives from C, C derives from B, B derives from A.
    const claims = [graph.derives('B', ['A']), graph.derives('C', ['B']), graph.derives('A', ['C'])];
    return { graph, claims };
  };

  it('TEST 8 — a cyclic dataset terminates rather than hanging or overflowing', () => {
    const { graph, claims } = cyclic();
    const result = trace(graph.id('A'), 'ancestors', claims);
    // Reaching this assertion at all is the test: the walk returned.
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(graph.namesByDepth(result)).toEqual({ 1: ['C'], 2: ['B'] });
  });

  it('TEST 9 — a cyclic dataset reports cycleDetected, in both directions', () => {
    const { graph, claims } = cyclic();
    expect(trace(graph.id('A'), 'ancestors', claims).cycleDetected).toBe(true);
    expect(trace(graph.id('A'), 'descendants', claims).cycleDetected).toBe(true);
  });

  it('TEST 9b — a cycle is an analysis result, so no edge is silently removed', () => {
    const { graph, claims } = cyclic();
    const result = trace(graph.id('A'), 'ancestors', claims);
    expect(result.edges).toHaveLength(claims.length);
    expect(result.edges.map((edge) => edge.claimId).sort()).toEqual(claims.map((claim) => claim.id).sort());
  });

  it('TEST 10 — an acyclic dataset reports cycleDetected false', () => {
    const g = new Graph();
    const result = trace(g.id('C'), 'ancestors', [g.derives('B', ['A']), g.derives('C', ['B'])]);
    expect(result.cycleDetected).toBe(false);
  });

  it('TEST 10b — cycleDetected is scoped to the supplied dataset, never a global claim', () => {
    const g = new Graph();
    // The same subject, traced over a dataset that simply does not contain the
    // other half of the loop, honestly reports no cycle *among these claims*.
    const partial = trace(g.id('C'), 'ancestors', [g.derives('C', ['B'])]);
    expect(partial.cycleDetected).toBe(false);

    const full = trace(g.id('C'), 'ancestors', [g.derives('C', ['B']), g.derives('B', ['C'])]);
    expect(full.cycleDetected).toBe(true);
  });
});

describe('SM-05 / traversal bounds (LINEAGE TESTS 11-13)', () => {
  const chain = (g: Graph, length: number): DerivationClaim[] => {
    const claims: DerivationClaim[] = [];
    for (let index = 1; index <= length; index += 1) {
      claims.push(g.derives(`N${index}`, [`N${index - 1}`]));
    }
    return claims;
  };

  it('TEST 11 — maxDepth truncates the walk', () => {
    const g = new Graph();
    const claims = chain(g, 5);
    const bounded = trace(g.id('N5'), 'ancestors', claims, 2);

    expect(bounded.nodes).toHaveLength(2);
    expect(bounded.maxDepth).toBe(2);
    expect(g.names(bounded)).toEqual(['N4', 'N3']);
  });

  it('TEST 12 — truncation is stated explicitly, and a complete walk is not marked truncated', () => {
    const g = new Graph();
    const claims = chain(g, 5);

    expect(trace(g.id('N5'), 'ancestors', claims, 2).truncated).toBe(true);
    expect(trace(g.id('N5'), 'ancestors', claims, 5).truncated).toBe(false);
    // A bound that exactly reaches the end is complete, not truncated.
    expect(trace(g.id('N5'), 'ancestors', claims, 99).truncated).toBe(false);
  });

  it('TEST 12b — an unbounded request applies the documented safe default', () => {
    const g = new Graph();
    const result = trace(g.id('N2'), 'ancestors', chain(g, 2));
    expect(result.maxDepth).toBe(DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH);
    expect(DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH).toBeGreaterThan(0);
    expect(Number.isInteger(DEFAULT_SOVEREIGN_LINEAGE_MAX_DEPTH)).toBe(true);
  });

  it('TEST 12c — a bound that hides an un-emitted edge is reported as truncated', () => {
    // A two-node cycle bounded to depth 1 reaches no new subject, but the
    // claim closing the cycle is never emitted. Reporting `truncated: false`
    // there would present a partial edge set as the whole history.
    const g = new Graph();
    const claims = [g.derives('A', ['B']), g.derives('B', ['A'])];
    const bounded = trace(g.id('A'), 'ancestors', claims, 1);

    expect(bounded.edges.length).toBeLessThan(claims.length);
    expect(bounded.truncated).toBe(true);

    // Unbounded, the same data is complete and must not be marked truncated.
    const complete = trace(g.id('A'), 'ancestors', claims);
    expect(complete.edges).toHaveLength(claims.length);
    expect(complete.truncated).toBe(false);
  });

  it('TEST 13 — an invalid maxDepth is rejected', () => {
    const g = new Graph();
    const claims = [g.derives('B', ['A'])];
    for (const maxDepth of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '3', null]) {
      expect(() => trace(g.id('B'), 'ancestors', claims, maxDepth as number)).toThrow(
        /INVALID_LINEAGE_MAX_DEPTH/,
      );
    }
  });
});

describe('SM-05 / malformed lineage input fails closed (LINEAGE TESTS 14-15)', () => {
  it('TEST 14 — two claims sharing one claim id are rejected rather than silently resolved', () => {
    const g = new Graph();
    const first = g.derives('B', ['A']);
    const collidingSecond: DerivationClaim = { ...g.derives('C', ['B']), id: first.id };

    const validation = validateTraceSovereignLineageInput({
      rootSovereignAssetId: g.id('C'),
      direction: 'ancestors',
      derivationClaims: [first, collidingSecond],
    });
    expect(validation.valid).toBe(false);
    expect(validation.reasons).toContain('DUPLICATE_LINEAGE_CLAIM_ID');
    expect(() => trace(g.id('C'), 'ancestors', [first, collidingSecond])).toThrow(/DUPLICATE_LINEAGE_CLAIM_ID/);
  });

  it('TEST 15 — a malformed DerivationClaim in the dataset is rejected, not skipped', () => {
    const g = new Graph();
    const good = g.derives('B', ['A']);
    const malformed = { ...good, id: 'claim:derivation:bad', metadata: { ...good.metadata, relation: 'Nonsense' } };

    expect(() => trace(g.id('B'), 'ancestors', [good, malformed as unknown as DerivationClaim])).toThrow(
      /INVALID_LINEAGE_DERIVATION_CLAIM/,
    );
    expect(isValidTraceSovereignLineageInput({
      rootSovereignAssetId: g.id('B'),
      direction: 'ancestors',
      derivationClaims: [good],
    })).toBe(true);
  });

  it('TEST 15b — a malformed root or direction is rejected', () => {
    const g = new Graph();
    expect(() => traceSovereignLineage({
      rootSovereignAssetId: 'not-a-subject',
      direction: 'ancestors',
      derivationClaims: [],
    })).toThrow(/INVALID_LINEAGE_ROOT_SUBJECT/);

    expect(() => traceSovereignLineage({
      rootSovereignAssetId: g.id('A'),
      direction: 'sideways' as SovereignLineageDirection,
      derivationClaims: [],
    })).toThrow(/INVALID_LINEAGE_DIRECTION/);

    expect(SOVEREIGN_LINEAGE_DIRECTIONS).toEqual(['ancestors', 'descendants']);
  });

  it('TEST 15c — a subject with no lineage in the dataset traces to an empty result', () => {
    const g = new Graph();
    const result = trace(g.id('Lonely'), 'ancestors', []);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.cycleDetected).toBe(false);
    expect(result.truncated).toBe(false);
  });
});

describe('SM-05 / traversal purity and safety (LINEAGE TESTS 16-18)', () => {
  it('TEST 16 — the caller\'s claim array and claims are not mutated', () => {
    const g = new Graph();
    const claims = [g.derives('C', ['A', 'B']), g.derives('E', ['C', 'D'])];
    const snapshot = JSON.stringify(claims);
    const order = [...claims];

    trace(g.id('E'), 'ancestors', claims);

    expect(JSON.stringify(claims)).toBe(snapshot);
    expect(claims).toEqual(order);
    expect(Object.isFrozen(claims)).toBe(false);
  });

  it('TEST 17 — the lineage module performs no network or filesystem access', () => {
    const source = readFileSync(
      join(__dirname, '..', '..', 'packages', 'protocol', 'src', 'manifest', 'lineage.ts'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

    for (const forbidden of [
      'fetch(', 'XMLHttpRequest', 'node:http', 'node:https', 'node:net', 'node:dns', 'node:fs',
      'require(', 'process.env',
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it('TEST 18 — traversal needs no registry, database, provider or graph library', () => {
    const source = readFileSync(
      join(__dirname, '..', '..', 'packages', 'protocol', 'src', 'manifest', 'lineage.ts'),
      'utf8',
    );
    // Comments are stripped for the name checks: prose that names a graph
    // database in order to say it is deliberately absent must not read as a
    // dependency on one.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
    for (const match of source.matchAll(/from\s+'([^']+)'/g)) {
      // Only relative Protocol siblings — no external dependency of any kind.
      expect(match[1].startsWith('.')).toBe(true);
    }
    for (const forbidden of ['neo4j', 'graphlib', 'ProvenanceDatabase', 'LineageGraphService', 'GlobalAssetGraph']) {
      expect(code).not.toContain(forbidden);
    }
  });

  it('TEST 18b — a wide, deep graph is analysed without recursion limits or quadratic blow-up', () => {
    const g = new Graph();
    const claims: DerivationClaim[] = [];
    for (let index = 1; index <= 2_000; index += 1) claims.push(g.derives(`N${index}`, [`N${index - 1}`]));

    const result = trace(g.id('N2000'), 'ancestors', claims, 2_000);
    expect(result.nodes).toHaveLength(2_000);
    expect(result.truncated).toBe(false);
    expect(result.cycleDetected).toBe(false);
  });
});

describe('SM-05 / lineage edges and portability (LINEAGE TESTS 19-20)', () => {
  it('TEST 19 — each edge keeps the claim id that created it', () => {
    const g = new Graph();
    const claim = g.derives('C', ['A', 'B'], DerivationRelationKind.CombinedFrom);
    const result = trace(g.id('C'), 'ancestors', [claim]);

    expect(result.edges[0].claimId).toBe(claim.id);
    expect(result.edges[0].childSovereignAssetId).toBe(g.id('C'));
    expect(result.edges[0].sourceSovereignAssetIds).toEqual([g.id('A'), g.id('B')]);
  });

  it('TEST 20 — each edge keeps its relation, and carries no evidence payload', () => {
    const g = new Graph();
    const claim = buildDerivationClaim({
      id: 'claim:derivation:evidence',
      sovereignAssetId: g.id('C'),
      issuer: { id: 'principal:studio', kind: 'Organization', displayName: 'Studio' },
      sourceSovereignAssetIds: [g.id('A')],
      relation: DerivationRelationKind.TransformedFrom,
      statement: 'upscaled and re-encoded',
      issuedAt: ISSUED_AT,
      evidenceRefs: ['evidence:transformation-log'],
    });
    const result = trace(g.id('C'), 'ancestors', [claim]);

    expect(result.edges[0].relation).toBe(DerivationRelationKind.TransformedFrom);
    const serialized = canonicalizeJSON(result);
    for (const leak of ['evidence:transformation-log', 'upscaled', 'Studio', 'principal:studio', 'issuer']) {
      expect(serialized).not.toContain(leak);
    }
  });

  it('TEST 20b — the trace result is JSON-safe, versioned and canonicalizable', () => {
    const g = new Graph();
    const result = trace(g.id('C'), 'ancestors', [g.derives('C', ['A', 'B'])]);

    expect(result.schemaVersion).toBe(SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION);
    expect(SOVEREIGN_LINEAGE_TRACE_SCHEMA_VERSION).toBe('aoc-sovereign-lineage-trace/1');
    // No Map, no Set, no undefined survives into the portable result.
    const roundTripped = JSON.parse(JSON.stringify(result));
    expect(canonicalizeJSON(roundTripped)).toBe(canonicalizeJSON(result));
  });
});
