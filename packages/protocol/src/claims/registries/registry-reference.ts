import type { CanonicalMetadata, CanonicalSource } from '../primitives';
import type { RegistryAuthorityLevel, RegistryType } from './registry-enums';
import type { CanonicalRegistryId, CanonicalRegistryNamespace } from './registry-identifiers';

/**
 * Identifies a registry without connecting to, querying, or verifying it.
 */
export interface CanonicalRegistryRef {
  readonly id: CanonicalRegistryId;
  readonly type: RegistryType;
  readonly namespace: CanonicalRegistryNamespace;
  readonly authorityLevel: RegistryAuthorityLevel;
  readonly source?: CanonicalSource;
  readonly metadata?: CanonicalMetadata;
}
