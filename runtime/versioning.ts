export const PLATFORM_VERSION = '1.0.0' as const;
export const CONTRACTS_VERSION = '1.0.0' as const;
export const RUNTIME_TRANSPORT_VERSION = '1.0.0' as const;
export const MINIMUM_SUPPORTED_TRANSPORT_VERSION = '1.0.0' as const;
export const SDK_COMPATIBILITY_VERSION = '1.0.0' as const;
export const COMPATIBILITY_WINDOW = '^1.0.0' as const;

export type CompatibilityStatus = 'compatible' | 'warn' | 'incompatible';

function parseSemver(version: string): { major: number; minor: number; patch: number } | undefined {
  const normalized = version.trim().replace(/^v/, '');
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return undefined;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function classifyTransportCompatibility(runtimeTransportVersion: string): CompatibilityStatus {
  const runtime = parseSemver(runtimeTransportVersion);
  const sdk = parseSemver(RUNTIME_TRANSPORT_VERSION);
  const minimum = parseSemver(MINIMUM_SUPPORTED_TRANSPORT_VERSION);

  if (!runtime || !sdk || !minimum) return 'incompatible';
  if (runtime.major !== sdk.major) return 'incompatible';
  if (runtime.minor < minimum.minor) return 'incompatible';
  if (runtime.minor > sdk.minor) return 'warn';
  return 'compatible';
}

export function getReleaseCompatibilityMetadata() {
  return {
    platformVersion: PLATFORM_VERSION,
    contractsVersion: CONTRACTS_VERSION,
    runtimeTransportVersion: RUNTIME_TRANSPORT_VERSION,
    minimumSupportedTransportVersion: MINIMUM_SUPPORTED_TRANSPORT_VERSION,
    sdkCompatibilityVersion: SDK_COMPATIBILITY_VERSION,
    compatibilityWindow: COMPATIBILITY_WINDOW,
  };
}
