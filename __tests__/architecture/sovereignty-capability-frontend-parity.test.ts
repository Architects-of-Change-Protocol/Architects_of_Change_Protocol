import { listSovereigntyCapabilities } from '@aoc/protocol/sovereignty-capabilities';
import { CAPABILITY_FAMILIES } from '../../frontend/app/src/landing/protocol/content';
import { CAPABILITY_CRYSTALS } from '../../frontend/app/src/landing/protocol/capabilityDock/dockTokens';

/**
 * Before SM-01 the eight sovereignty minerals existed together only in the
 * frontend capability dock, which made the landing page an independent,
 * unguarded source of truth for which capabilities the Protocol has.
 *
 * `frontend/app` is a standalone npm project (its own package-lock.json, not a
 * member of the root workspaces) and does not resolve `@aoc/protocol`, so it
 * cannot import the canonical registry without a fragile build coupling. This
 * test is the automated guarantee instead: the frontend keeps its presentation
 * model, but it may not drift from Protocol in membership, order or canonical
 * name.
 */
describe('frontend capability dock parity with the Protocol registry', () => {
  const canonical = listSovereigntyCapabilities();

  it('renders exactly the canonical capabilities, in canonical order', () => {
    expect(CAPABILITY_FAMILIES.map((family) => family.protocolKey)).toEqual(
      canonical.map((capability) => capability.key),
    );
  });

  it('uses the canonical Protocol name for every capability', () => {
    expect(CAPABILITY_FAMILIES.map((family) => family.name)).toEqual(
      canonical.map((capability) => capability.name),
    );
  });

  it('binds every frontend presentation id to exactly one canonical capability', () => {
    const ids = CAPABILITY_FAMILIES.map((family) => family.id);
    expect(new Set(ids).size).toBe(canonical.length);
    expect(new Set(CAPABILITY_FAMILIES.map((family) => family.protocolKey)).size).toBe(canonical.length);
  });

  it('has crystal geometry for every canonical capability and no extras', () => {
    expect(Object.keys(CAPABILITY_CRYSTALS).sort()).toEqual(
      CAPABILITY_FAMILIES.map((family) => family.id).sort(),
    );
  });

  it('keeps presentation-only concerns out of the Protocol definitions', () => {
    for (const capability of canonical) {
      expect(capability).not.toHaveProperty('status');
      expect(capability).not.toHaveProperty('summary');
    }
    for (const family of CAPABILITY_FAMILIES) {
      expect(typeof family.status).toBe('string');
      expect(typeof family.summary).toBe('string');
    }
  });
});
