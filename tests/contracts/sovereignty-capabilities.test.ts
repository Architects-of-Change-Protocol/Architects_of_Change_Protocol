import {
  SOVEREIGNTY_CAPABILITIES,
  SOVEREIGNTY_CAPABILITY_IDS,
  SOVEREIGNTY_CAPABILITY_KEYS,
  SOVEREIGNTY_CAPABILITY_NAMESPACE,
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  isSovereigntyCapabilityId,
  isSovereigntyCapabilityKey,
  isSovereigntyCapabilityVersion,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type { SovereigntyCapabilityDefinition } from '@aoc/protocol/sovereignty-capabilities';
import { isValidSovereignAssetId } from '@aoc/protocol/identity';
import { validateProtocolCapabilityDefinition } from '../../protocol/capabilities/registry';

const CANONICAL_KEYS = [
  'identity',
  'integrity',
  'provenance',
  'portability',
  'interoperability',
  'verifiability',
  'licensing_terms',
  'governance_compatibility',
];

describe('canonical Sovereignty Capability inventory', () => {
  it('defines exactly eight canonical capabilities', () => {
    expect(listSovereigntyCapabilities()).toHaveLength(8);
    expect(SOVEREIGNTY_CAPABILITIES).toHaveLength(8);
    expect(SOVEREIGNTY_CAPABILITY_KEYS).toHaveLength(8);
  });

  it('exposes exactly the canonical keys', () => {
    expect(listSovereigntyCapabilities().map((capability) => capability.key)).toEqual(CANONICAL_KEYS);
    expect([...SOVEREIGNTY_CAPABILITY_KEYS]).toEqual(CANONICAL_KEYS);
    expect(Object.keys(SOVEREIGNTY_CAPABILITY_IDS)).toEqual(CANONICAL_KEYS);
  });

  it('enumerates deterministically in canonical order, Identity first and Governance Compatibility eighth', () => {
    const names = listSovereigntyCapabilities().map((capability) => capability.name);
    expect(names).toEqual([
      'Identity',
      'Integrity',
      'Provenance',
      'Portability',
      'Interoperability',
      'Verifiability',
      'Licensing & Terms',
      'Governance Compatibility',
    ]);
    expect(names[0]).toBe('Identity');
    expect(names[7]).toBe('Governance Compatibility');
    // Repeated enumeration must not depend on incidental iteration behaviour.
    expect(listSovereigntyCapabilities().map((c) => c.id)).toEqual(listSovereigntyCapabilities().map((c) => c.id));
  });

  it('gives every capability a unique canonical id inside the sovereignty-capability namespace', () => {
    const ids = listSovereigntyCapabilities().map((capability) => capability.id);
    expect(new Set(ids).size).toBe(8);
    for (const capability of listSovereigntyCapabilities()) {
      expect(capability.namespace).toBe(SOVEREIGNTY_CAPABILITY_NAMESPACE);
      expect(capability.id.startsWith(`${SOVEREIGNTY_CAPABILITY_NAMESPACE}:`)).toBe(true);
      expect(capability.id).toBe(SOVEREIGNTY_CAPABILITY_IDS[capability.key]);
      expect(isSovereigntyCapabilityId(capability.id)).toBe(true);
    }
    expect(ids).toEqual([
      'aoc:sovereignty-capability:identity',
      'aoc:sovereignty-capability:integrity',
      'aoc:sovereignty-capability:provenance',
      'aoc:sovereignty-capability:portability',
      'aoc:sovereignty-capability:interoperability',
      'aoc:sovereignty-capability:verifiability',
      'aoc:sovereignty-capability:licensing-terms',
      'aoc:sovereignty-capability:governance-compatibility',
    ]);
  });

  it('gives every capability a unique stable key', () => {
    const keys = listSovereigntyCapabilities().map((capability) => capability.key);
    expect(new Set(keys).size).toBe(8);
    for (const key of keys) expect(isSovereigntyCapabilityKey(key)).toBe(true);
  });

  it('gives every capability an explicit, well-formed capability version', () => {
    for (const capability of listSovereigntyCapabilities()) {
      expect(capability.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(isSovereigntyCapabilityVersion(capability.version)).toBe(true);
      expect(capability.version).toBe('1.0.0');
    }
  });

  it('rejects version strings the template literal type alone would admit', () => {
    // `${number}.${number}.${number}` also matches negatives, exponent
    // notation and extra dotted segments, so the runtime guard — not the type
    // — is the authoritative rule for a capability version.
    for (const malformed of [
      '-1.2.3',
      '1e2.0.0',
      '1.2.3.4',
      '1.2',
      '1.2.3-rc.1',
      '1.2.3+build',
      'v1.2.3',
      '1.2.',
      ' 1.2.3',
      'x.y.z',
      '',
      null,
      undefined,
      100,
    ]) {
      expect(isSovereigntyCapabilityVersion(malformed)).toBe(false);
    }
    for (const wellFormed of ['0.0.0', '1.0.0', '12.34.567']) {
      expect(isSovereigntyCapabilityVersion(wellFormed)).toBe(true);
    }
  });

  it('gives every capability a non-empty canonical name and description', () => {
    for (const capability of listSovereigntyCapabilities()) {
      expect(capability.name.trim().length).toBeGreaterThan(0);
      expect(capability.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('carries only Protocol metadata — no presentation, commercial or provider fields', () => {
    for (const capability of listSovereigntyCapabilities()) {
      expect(Object.keys(capability).sort()).toEqual([
        'description',
        'id',
        'key',
        'name',
        'namespace',
        'version',
      ]);
    }
  });
});

describe('Sovereignty Capability lookup', () => {
  it('resolves a canonical id to that exact canonical definition', () => {
    const identity = getSovereigntyCapability('aoc:sovereignty-capability:identity');
    expect(identity).toBe(listSovereigntyCapabilities()[0]);
    expect(identity?.key).toBe('identity');
    expect(identity?.name).toBe('Identity');
    expect(identity?.version).toBe('1.0.0');

    const governance = getSovereigntyCapability('aoc:sovereignty-capability:governance-compatibility');
    expect(governance).toBe(listSovereigntyCapabilities()[7]);
    expect(governance?.key).toBe('governance_compatibility');
    expect(governance?.name).toBe('Governance Compatibility');
  });

  it('resolves by stable key', () => {
    for (const capability of listSovereigntyCapabilities()) {
      expect(getSovereigntyCapabilityByKey(capability.key)).toBe(capability);
    }
  });

  it('does not silently map an unknown identifier onto another capability', () => {
    const unknown = [
      'aoc:sovereignty-capability:revocation',
      'aoc:sovereignty-capability:wallet',
      'aoc:sovereignty-capability:',
      // A bare key is not an id, and a display name is neither.
      'identity',
      'Identity',
      'licensing-terms',
      'aoc:sovereign-asset:00000000-0000-4000-8000-000000000000',
      'my-company.special-capability',
      '',
      null,
      undefined,
      42,
      { id: 'aoc:sovereignty-capability:identity' },
    ];
    for (const value of unknown) {
      expect(getSovereigntyCapability(value)).toBeUndefined();
      expect(isSovereigntyCapabilityId(value)).toBe(false);
    }

    for (const value of ['licensing', 'governance-compatibility', 'Identity', 'wallet', '', null, undefined, 42]) {
      expect(getSovereigntyCapabilityByKey(value)).toBeUndefined();
      expect(isSovereigntyCapabilityKey(value)).toBe(false);
    }
  });
});

describe('Sovereignty Capability registry immutability', () => {
  it('exposes no registration, mutation or invocation API', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const surface = require('@aoc/protocol/sovereignty-capabilities') as Record<string, unknown>;
    for (const forbidden of [
      'register',
      'registerSovereigntyCapability',
      'defineSovereigntyCapability',
      'removeSovereigntyCapability',
      'invokeSovereigntyCapability',
      'applySovereigntyCapability',
      'executeSovereigntyCapability',
    ]) {
      expect(surface[forbidden]).toBeUndefined();
    }
  });

  it('freezes the canonical list and every canonical definition', () => {
    expect(Object.isFrozen(SOVEREIGNTY_CAPABILITIES)).toBe(true);
    expect(Object.isFrozen(SOVEREIGNTY_CAPABILITY_IDS)).toBe(true);
    expect(Object.isFrozen(SOVEREIGNTY_CAPABILITY_KEYS)).toBe(true);
    for (const capability of SOVEREIGNTY_CAPABILITIES) expect(Object.isFrozen(capability)).toBe(true);
  });

  it('rejects consumer mutation of a canonical definition and of registry state', () => {
    const identity = getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.identity) as SovereigntyCapabilityDefinition;
    expect(() => {
      (identity as { name: string }).name = 'Tampered';
    }).toThrow(TypeError);
    expect(identity.name).toBe('Identity');

    const listed = listSovereigntyCapabilities() as SovereigntyCapabilityDefinition[];
    expect(() => listed.push(identity)).toThrow(TypeError);
    expect(listSovereigntyCapabilities()).toHaveLength(8);
    expect(getSovereigntyCapability(SOVEREIGNTY_CAPABILITY_IDS.identity)?.name).toBe('Identity');
  });
});

describe('Sovereignty Capability separation from legacy capability models', () => {
  it('contains no permission grant, financial or Enterprise concern', () => {
    const keys = listSovereigntyCapabilities().map((capability) => capability.key) as string[];
    for (const excluded of [
      'wallet',
      'portfolio',
      'insight',
      'revocation',
      'consent',
      'access',
      'execution',
      'delegation',
      'marketplace',
      'payment',
    ]) {
      expect(keys).not.toContain(excluded);
      expect(getSovereigntyCapabilityByKey(excluded)).toBeUndefined();
    }
  });

  it('cannot be parsed as a legacy financial capability definition id', () => {
    for (const capability of listSovereigntyCapabilities()) {
      expect(() =>
        validateProtocolCapabilityDefinition({
          id: capability.id,
          description: capability.description,
          resource_type: 'wallet',
          access_level: 'read',
          sensitivity_level: 'low',
          requires_user_consent: false,
        }),
      ).toThrow(/canonical identifier/);
    }
  });

  it('cannot be confused with a SovereignAssetId', () => {
    for (const capability of listSovereigntyCapabilities()) {
      expect(isValidSovereignAssetId(capability.id)).toBe(false);
    }
    expect(isSovereigntyCapabilityId('aoc:sovereign-asset:11111111-1111-4111-8111-111111111111')).toBe(false);
  });
});
