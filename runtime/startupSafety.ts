import { DEFAULT_API_KEYS, type ApiKeyRecord } from './auth/apiKeys';
import type { EnforcementMode } from './enforcement';

export type RuntimeEnvironment = 'production' | 'staging' | 'development' | 'test' | 'unknown';

export type StartupSafetyInput = {
  nodeEnv?: string;
  runtimeEnvironment?: string;
  capabilitySecret?: string;
  enforcementMode: EnforcementMode;
  apiKeySeededWithDefaults: boolean;
  apiKeys: ReadonlyArray<ApiKeyRecord>;
};

export type StartupSafetyResult = {
  environment: RuntimeEnvironment;
  strictMode: boolean;
  warnings: string[];
};

const DEFAULT_CAPABILITY_SECRET = 'aoc_runtime_capability_secret';
const DEFAULT_API_KEY_VALUES = new Set(DEFAULT_API_KEYS.map((record) => record.apiKey));

function classifyEnvironment(nodeEnv?: string, runtimeEnvironment?: string): RuntimeEnvironment {
  const value = (runtimeEnvironment ?? nodeEnv ?? '').trim().toLowerCase();
  if (value === 'production' || value === 'prod') return 'production';
  if (value === 'staging' || value === 'stage') return 'staging';
  if (value === 'development' || value === 'dev' || value === 'local') return 'development';
  if (value === 'test' || value === 'ci') return 'test';
  return 'unknown';
}

function validateCapabilitySecret(environment: RuntimeEnvironment, capabilitySecret: string): string[] {
  const errors: string[] = [];
  if (environment === 'production' || environment === 'staging') {
    if (capabilitySecret === DEFAULT_CAPABILITY_SECRET) {
      errors.push('AOC_CAPABILITY_SECRET cannot use the default value in production/staging.');
    }
    if (capabilitySecret.length < 24) {
      errors.push('AOC_CAPABILITY_SECRET must be at least 24 characters in production/staging.');
    }
  }
  return errors;
}

function validateApiKeys(environment: RuntimeEnvironment, input: StartupSafetyInput): string[] {
  const errors: string[] = [];
  const usesDefaultValue = input.apiKeys.some((record) => DEFAULT_API_KEY_VALUES.has(record.apiKey));
  if ((environment === 'production' || environment === 'staging') && (input.apiKeySeededWithDefaults || usesDefaultValue)) {
    errors.push('Default development API keys are forbidden in production/staging runtime startup.');
  }
  return errors;
}

export function assertRuntimeStartupSafety(input: StartupSafetyInput): StartupSafetyResult {
  const environment = classifyEnvironment(input.nodeEnv, input.runtimeEnvironment);
  const strictMode = environment === 'production' || environment === 'staging';
  const warnings: string[] = [];

  if (environment === 'unknown') {
    warnings.push('Runtime environment is unknown; defaulting to development safety posture.');
  }

  if (!strictMode && input.enforcementMode === 'soft') {
    warnings.push('Capability enforcement is running in soft mode; authorization denials may not block requests.');
  }

  const errors = [
    ...validateCapabilitySecret(environment, input.capabilitySecret ?? DEFAULT_CAPABILITY_SECRET),
    ...validateApiKeys(environment, input),
  ];

  if (strictMode && input.enforcementMode !== 'strict') {
    errors.push('ENFORCEMENT_MODE must be strict in production/staging.');
  }

  if (errors.length > 0) {
    throw new Error(`Runtime startup safety assertion failed: ${errors.join(' ')}`);
  }

  return { environment, strictMode, warnings };
}
