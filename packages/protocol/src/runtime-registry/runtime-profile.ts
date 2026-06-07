import type { AdapterToken } from './types';

/** Stable, auditable identifier for a runtime startup profile. */
export type RuntimeProfileId = string;

export const RuntimeProfileValidationMode = {
  Strict: 'strict',
  Profile: 'profile',
  Permissive: 'permissive',
} as const;

export type RuntimeProfileValidationMode =
  (typeof RuntimeProfileValidationMode)[keyof typeof RuntimeProfileValidationMode];

/** Implementation-free declaration of the adapters needed by a runtime profile. */
export interface RuntimeProfile {
  readonly id: RuntimeProfileId;
  readonly name: string;
  readonly description?: string;
  readonly requiredTokens: readonly AdapterToken[];
  readonly optionalTokens?: readonly AdapterToken[];
  readonly allowDefaults: boolean;
  readonly validationMode: RuntimeProfileValidationMode;
}
