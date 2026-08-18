import type { ProtocolError } from '@aoc/protocol/errors';

import type { AssetProfileId, AssetProfileVersion } from './identifiers';

/**
 * The closed set of ways an asset-profile operation can fail as an operation.
 *
 * There is deliberately no independent error framework here: the repository
 * already has one shape for this — a real `Error` that structurally satisfies
 * `ProtocolError` (`code` + `message` + `details`), exactly as
 * `SovereigntyCapabilityInvocationError` does — and this reuses it.
 */
export const ASSET_PROFILE_ERROR_CODES = Object.freeze({
  /** The profile document failed `validateAssetProfile`. */
  invalidProfile: 'ASSET_PROFILE_INVALID',
  /** A profile with this (profileId, version) pair is already catalogued. */
  versionAlreadyRegistered: 'ASSET_PROFILE_VERSION_ALREADY_REGISTERED',
} as const);

export type AssetProfileErrorCode =
  (typeof ASSET_PROFILE_ERROR_CODES)[keyof typeof ASSET_PROFILE_ERROR_CODES];

/**
 * Declared as a type alias rather than an interface so TypeScript infers the
 * implicit index signature `ProtocolError.details`
 * (`Readonly<Record<string, unknown>>`) requires — the same reason
 * `SovereigntyCapabilityInvocationErrorDetails` is one.
 */
export type AssetProfileErrorDetails = {
  readonly reasonCodes: readonly string[];
  readonly profileId?: AssetProfileId;
  readonly version?: AssetProfileVersion;
};

/**
 * The `message` and the JS stack are runtime debugging aids. `code` and
 * `details.reasonCodes` are the stable, reportable surface.
 */
export class AssetProfileError extends Error implements ProtocolError {
  readonly code: AssetProfileErrorCode;

  readonly details: AssetProfileErrorDetails;

  constructor(code: AssetProfileErrorCode, message: string, details: AssetProfileErrorDetails) {
    super(message);
    this.name = 'AssetProfileError';
    this.code = code;
    this.details = details;
  }
}
