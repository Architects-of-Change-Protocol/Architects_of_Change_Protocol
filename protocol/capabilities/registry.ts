import {
  ProtocolCapabilityDefinition,
  CapabilityAccessLevel,
  CapabilityResourceType,
  CapabilitySensitivityLevel
} from './types';

const CAPABILITY_ID_PATTERN =
  /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*){2,}$/;

const VALID_RESOURCE_TYPES: ReadonlySet<CapabilityResourceType> = new Set([
  'wallet',
  'portfolio',
  'insight'
]);
const VALID_ACCESS_LEVELS: ReadonlySet<CapabilityAccessLevel> = new Set([
  'read',
  'write'
]);
const VALID_SENSITIVITY_LEVELS: ReadonlySet<CapabilitySensitivityLevel> = new Set([
  'low',
  'medium',
  'high'
]);

export function validateProtocolCapabilityDefinition(
  capability: ProtocolCapabilityDefinition
): void {
  if (typeof capability.id !== 'string' || !CAPABILITY_ID_PATTERN.test(capability.id)) {
    throw new Error(
      'Capability definition id must be a lowercase dot-separated canonical identifier.'
    );
  }

  if (typeof capability.description !== 'string' || capability.description.trim() === '') {
    throw new Error(`Capability definition ${capability.id} must include a non-empty description.`);
  }

  if (!VALID_RESOURCE_TYPES.has(capability.resource_type)) {
    throw new Error(
      `Capability definition ${capability.id} has unsupported resource_type "${capability.resource_type}".`
    );
  }

  if (!VALID_ACCESS_LEVELS.has(capability.access_level)) {
    throw new Error(
      `Capability definition ${capability.id} has unsupported access_level "${capability.access_level}".`
    );
  }

  if (!VALID_SENSITIVITY_LEVELS.has(capability.sensitivity_level)) {
    throw new Error(
      `Capability definition ${capability.id} has unsupported sensitivity_level "${capability.sensitivity_level}".`
    );
  }

  if (typeof capability.requires_user_consent !== 'boolean') {
    throw new Error(
      `Capability definition ${capability.id} must declare requires_user_consent as a boolean.`
    );
  }
}

export function defineCapabilityRegistry<const T extends readonly ProtocolCapabilityDefinition[]>(
  capabilities: T
): T {
  const seen = new Set<string>();

  for (const capability of capabilities) {
    validateProtocolCapabilityDefinition(capability);

    if (seen.has(capability.id)) {
      throw new Error(`Duplicate capability definition id: ${capability.id}`);
    }

    seen.add(capability.id);
  }

  return Object.freeze([...capabilities]) as T;
}

export function indexCapabilitiesById<T extends readonly ProtocolCapabilityDefinition[]>(
  capabilities: T
): Readonly<Record<T[number]['id'], T[number]>> {
  return Object.freeze(
    capabilities.reduce<Record<string, T[number]>>((acc, capability) => {
      acc[capability.id] = capability;
      return acc;
    }, {})
  ) as Readonly<Record<T[number]['id'], T[number]>>;
}
