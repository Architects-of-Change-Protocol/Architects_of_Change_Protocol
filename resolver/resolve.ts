import { FieldManifestV1 } from '../field/types';
import { SDLFieldRef, SDLPath } from '../sdl/types';

/** A successfully resolved SDL path → Field Manifest mapping. */
export type ResolvedField = {
  /** The SDL field reference (path + field_id). */
  ref: SDLFieldRef;
  /** The matched Field Manifest entry. */
  manifest: FieldManifestV1;
};

/** An unresolved SDL path with a deterministic error structure. */
export type UnresolvedField = {
  /** The SDL path that could not be resolved. */
  path: SDLPath;
  /** Machine-readable error code. */
  code: 'FIELD_NOT_FOUND';
  /** Human-readable error message. */
  message: string;
};

/** Result of resolving SDL paths against a Field Manifest index. */
export type SDLResolutionResult = {
  /** Fields that were successfully resolved, in deterministic order. */
  resolved_fields: ResolvedField[];
  /** Fields that could not be resolved, in deterministic order. */
  unresolved_fields: UnresolvedField[];
};

/**
 * Field Manifest index: maps field_id → FieldManifestV1.
 *
 * The convention is that field_id in a FieldManifest corresponds to the
 * SDL path's raw string (e.g. "person.name.legal.full"). The resolver
 * looks up each SDL path's raw value in this index.
 */
export type FieldManifestIndex = Map<string, FieldManifestV1>;

/**
 * Resolve an array of parsed SDL paths against a Field Manifest index.
 *
 * Resolution rules:
 * - Each SDLPath.raw is looked up as a key in the fieldIndex map
 * - If found: added to resolved_fields with an SDLFieldRef
 * - If not found: added to unresolved_fields with a deterministic error
 * - Output arrays are sorted alphabetically by SDLPath.raw for determinism
 *
 * @param paths - Array of parsed SDL paths to resolve
 * @param fieldIndex - Map of field_id → FieldManifestV1
 * @returns SDLResolutionResult with resolved and unresolved fields
 */
export function resolveSDLToFields(
  paths: SDLPath[],
  fieldIndex: FieldManifestIndex
): SDLResolutionResult {
  const resolved: ResolvedField[] = [];
  const unresolved: UnresolvedField[] = [];

  // Sort input paths alphabetically by raw string for deterministic ordering
  const sortedPaths = [...paths].sort((a, b) => a.raw.localeCompare(b.raw));

  for (const path of sortedPaths) {
    const manifest = fieldIndex.get(path.raw);

    if (manifest !== undefined) {
      resolved.push({
        ref: {
          path,
          field_id: manifest.field_id,
        },
        manifest,
      });
    } else {
      unresolved.push({
        path,
        code: 'FIELD_NOT_FOUND',
        message: `No field manifest found for SDL path "${path.raw}".`,
      });
    }
  }

  return { resolved_fields: resolved, unresolved_fields: unresolved };
}
