import type { AOCAdapterRecord, AdapterScopeType } from './adapter-types';

export function isAdapterUsable(adapter: AOCAdapterRecord): boolean {
  return adapter.status !== 'revoked';
}

export function isAdapterVerified(adapter: AOCAdapterRecord): boolean {
  return adapter.status === 'verified';
}

export function isAdapterOfficial(adapter: AOCAdapterRecord): boolean {
  return adapter.registry_source === 'official_aoc';
}

export function supportsOperation(adapter: AOCAdapterRecord, operation: string): boolean {
  return adapter.supported_operations.includes(operation);
}

export function supportsScopeType(adapter: AOCAdapterRecord, scopeType: AdapterScopeType): boolean {
  return adapter.supported_scope_types.includes(scopeType);
}
