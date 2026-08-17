import {
  isSovereigntyCapabilityId,
  type SovereigntyCapabilityId,
  type SovereigntyCapabilityKey,
} from './ids';
import { getSovereigntyCapability, getSovereigntyCapabilityByKey } from './registry';
import type { SovereigntyCapabilityDefinition } from './types';
import { isSovereigntyCapabilityVersion, type SovereigntyCapabilityVersion } from './version';

/**
 * SovereigntyCapabilityRef — the smallest portable statement of *which*
 * Sovereignty Capability, at *which* semantic version, something refers to.
 *
 * A definition (`SovereigntyCapabilityDefinition`) is the Protocol's
 * description of a capability and belongs to the registry. A ref is the
 * two fields you can safely put inside an invocation, a result and a
 * portable evidence record: everything else — `key`, `namespace`, `name`,
 * `description` — is derivable from `id` through the registry and would
 * only be a second, driftable copy of it if embedded here.
 *
 *   ref != definition        (a ref carries no name/description)
 *   ref != CapabilityToken   (a ref grants nothing to nobody)
 *   ref != a locator         (nothing is resolved or dereferenced)
 *
 * `version` is the capability's own semantic contract version introduced by
 * SM-01 — never the `@aoc/protocol` package version, the manifest
 * `schemaVersion`, the canonicalization profile, or an adapter
 * `contractVersion`. Carrying it explicitly is what lets a later evidence
 * record state "Verifiability 1.0.0 was consumed" rather than "some
 * Verifiability was consumed, presumably the current one".
 */
export interface SovereigntyCapabilityRef {
  readonly id: SovereigntyCapabilityId;
  readonly version: SovereigntyCapabilityVersion;
}

/**
 * Derives a ref from a canonical definition. Preferred over writing an
 * `{ id, version }` literal anywhere in production code: the registry stays
 * the single source of both values, so a capability version bump cannot
 * leave a stale hard-coded pair behind.
 */
export function toSovereigntyCapabilityRef(
  definition: SovereigntyCapabilityDefinition,
): SovereigntyCapabilityRef {
  return Object.freeze({ id: definition.id, version: definition.version });
}

/**
 * Resolves the ref for a canonical id at the version the registry currently
 * defines. Mirrors `getSovereigntyCapability`: an unknown id resolves to
 * `undefined` and is never coerced onto a neighbouring capability.
 */
export function getSovereigntyCapabilityRef(id: unknown): SovereigntyCapabilityRef | undefined {
  const definition = getSovereigntyCapability(id);
  return definition === undefined ? undefined : toSovereigntyCapabilityRef(definition);
}

/** Key-addressed twin of `getSovereigntyCapabilityRef`. */
export function getSovereigntyCapabilityRefByKey(
  key: SovereigntyCapabilityKey | string,
): SovereigntyCapabilityRef | undefined {
  const definition = getSovereigntyCapabilityByKey(key);
  return definition === undefined ? undefined : toSovereigntyCapabilityRef(definition);
}

/**
 * Structural validity of a ref: the id must be one of the canonical eight
 * and the version must satisfy `isSovereigntyCapabilityVersion`.
 *
 * Deliberately NOT checked: that `version` equals the version the registry
 * currently defines. A ref naming a capability version this build has never
 * heard of is well-formed — it simply will not match any implementation,
 * which is the invoker's job to detect and report (see `invoke.ts`). Pinning
 * validity to the current registry version would make it impossible to
 * describe, persist, or replay an invocation of any other version, including
 * evidence produced by an older or newer Protocol build.
 */
export function isValidSovereigntyCapabilityRef(value: unknown): value is SovereigntyCapabilityRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<SovereigntyCapabilityRef>;
  return isSovereigntyCapabilityId(candidate.id) && isSovereigntyCapabilityVersion(candidate.version);
}

/**
 * Exact equality of capability *and* version. Two refs naming the same
 * capability at different versions are not equal — that inequality is the
 * whole point of `version`, and silently treating them as interchangeable is
 * exactly the "latest wins" substitution the invocation contract forbids.
 */
export function sovereigntyCapabilityRefsEqual(
  a: SovereigntyCapabilityRef,
  b: SovereigntyCapabilityRef,
): boolean {
  return a.id === b.id && a.version === b.version;
}
