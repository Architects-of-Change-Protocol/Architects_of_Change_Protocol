/**
 * Human-readable metadata for profiles and requirements.
 *
 * Presentation only. **No machine semantics in this package may depend on any
 * field here** — validation, lookup, readiness evaluation and catalogue
 * ordering all read identifiers and structural fields exclusively, so these
 * strings can be replaced by a localized rendering at any point without
 * changing behaviour.
 *
 * Localization *infrastructure* is deliberately out of scope for APV-03. The
 * only obligation this shape carries is not to foreclose it: the strings are
 * plain, unstructured, and never parsed.
 */
export interface AssetProfileMetadata {
  /** Short human-facing name. */
  readonly label?: string;
  /** Longer human-facing explanation of what is being described. */
  readonly description?: string;
  /**
   * Why the requirement exists, for display in a review or applicant UI.
   *
   * Never a legal conclusion: the vertical records what was declared, supplied,
   * checked and attested, and states no legal outcome (ADR §5).
   */
  readonly reason?: string;
}

const METADATA_KEYS: readonly string[] = ['label', 'description', 'reason'];

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function isValidAssetProfileMetadata(value: unknown): value is AssetProfileMetadata {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  for (const key of Object.keys(candidate)) {
    if (!METADATA_KEYS.includes(key)) return false;
  }
  for (const key of METADATA_KEYS) {
    if (!hasOwn(candidate, key)) continue;
    const field = candidate[key];
    if (typeof field !== 'string' || field.trim() === '') return false;
  }
  return true;
}
