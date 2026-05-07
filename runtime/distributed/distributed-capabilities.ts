import { resolveRuntimeFederation } from './runtime-federation';
import { DistributedCapabilityReference } from './types';

const distributedCapabilities = new Map<string, DistributedCapabilityReference>();

export function createDistributedCapabilityReference(input: DistributedCapabilityReference): DistributedCapabilityReference {
  distributedCapabilities.set(input.capabilityId, input);
  return input;
}

export function validateDistributedCapabilityReference(input: DistributedCapabilityReference): boolean {
  if (input.remoteValidationRequired && !input.federationRef) return false;
  if (input.federationRef) {
    const federation = resolveRuntimeFederation(input.federationRef);
    if (!federation || federation.revokedAt || federation.suspendedAt) return false;
    if (!federation.allowedCapabilities.includes(input.capabilityId)) return false;
  }
  return true;
}

export function requiresRemoteCapabilityValidation(input: DistributedCapabilityReference): boolean {
  return input.remoteValidationRequired || Boolean(input.federationRef);
}

export function resolveDistributedCapabilityReference(capabilityId: string): DistributedCapabilityReference | undefined {
  return distributedCapabilities.get(capabilityId);
}

export function clearDistributedCapabilities(): void {
  distributedCapabilities.clear();
}
