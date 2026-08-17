'use strict';

const { ClaimType } = require('@aoc/protocol/claims');
const { AdapterRegistry, AdapterTokens } = require('@aoc/protocol/runtime-registry');
const root = require('@aoc/protocol');
const contracts = require('@aoc/protocol/contracts');
const errors = require('@aoc/protocol/errors');
const adapters = require('@aoc/protocol/adapters');
const sovereigntyCapabilities = require('@aoc/protocol/sovereignty-capabilities');

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(typeof root === 'object' && root !== null, 'root import must resolve to a module object');
assert(typeof contracts === 'object' && contracts !== null, './contracts import must resolve');
assert(typeof errors === 'object' && errors !== null, './errors import must resolve');
assert(typeof adapters === 'object' && adapters !== null, './adapters import must resolve');
assert(ClaimType.Identity === 'Identity', 'ClaimType.Identity runtime value mismatch');
assert(typeof AdapterRegistry === 'function', 'AdapterRegistry must be a class/constructor');
assert(typeof AdapterTokens.AuditEventSink === 'object', 'AdapterTokens.AuditEventSink must resolve');

const capabilities = sovereigntyCapabilities.listSovereigntyCapabilities();
assert(capabilities.length === 8, 'expected exactly 8 canonical sovereignty capabilities');
assert(
  capabilities.map((capability) => capability.key).join(',') ===
    'identity,integrity,provenance,portability,interoperability,verifiability,licensing_terms,governance_compatibility',
  'sovereignty capability enumeration is not in canonical order',
);
const identityCapability = sovereigntyCapabilities.getSovereigntyCapability('aoc:sovereignty-capability:identity');
assert(identityCapability && identityCapability.name === 'Identity', 'Identity lookup by canonical id failed');
assert(/^\d+\.\d+\.\d+$/.test(identityCapability.version), 'Identity has no explicit capability version');
const governanceCapability = sovereigntyCapabilities.getSovereigntyCapabilityByKey('governance_compatibility');
assert(
  governanceCapability && governanceCapability.id === 'aoc:sovereignty-capability:governance-compatibility',
  'Governance Compatibility lookup failed',
);
assert(
  sovereigntyCapabilities.getSovereigntyCapability('aoc:sovereignty-capability:wallet') === undefined,
  'unknown sovereignty capability id resolved',
);
assert(typeof sovereigntyCapabilities.registerSovereigntyCapability === 'undefined', 'registry must be read-only');

const registry = new AdapterRegistry();
registry.register(
  AdapterTokens.AuditEventSink,
  { recordAuditEvent: () => undefined },
  { implementation: 'noop', source: 'test-consumer', version: '0.0.0' },
);

console.log(
  `javascript-cjs consumer OK: claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${capabilities.length}`,
);
