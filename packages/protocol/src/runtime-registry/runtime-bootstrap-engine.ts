import { AdapterRegistry } from './adapter-registry';
import { RegistryValidationError } from './errors';
import { RuntimeAdapterBootstrap } from './runtime-adapter-bootstrap';
import { AllAdapterTokens } from './tokens';
import {
  RuntimeAdapterBootstrapStatus,
  type AdapterRegistration,
  type AdapterRegistryLogger,
  type AdapterToken,
  type RegisteredAdapter,
  type RuntimeAdapterStartupReport,
} from './types';
import {
  RuntimeProfileValidationMode,
  type RuntimeProfile,
} from './runtime-profile';

export const RuntimeBootstrapStatus = {
  Ready: 'ready',
  Degraded: 'degraded',
} as const;

export type RuntimeBootstrapStatus =
  (typeof RuntimeBootstrapStatus)[keyof typeof RuntimeBootstrapStatus];

export interface RuntimeBootstrapOptions {
  readonly profile: RuntimeProfile;
  readonly registrations?: readonly AdapterRegistration[];
  readonly registry?: AdapterRegistry;
  readonly logger?: AdapterRegistryLogger;
}

/** Normalized, profile-aware result emitted by the shared bootstrap flow. */
export interface RuntimeBootstrapResult {
  readonly profile: RuntimeProfile;
  readonly registry: AdapterRegistry;
  readonly startupReport: RuntimeAdapterStartupReport;
  readonly status: RuntimeBootstrapStatus;
  readonly validationMode: RuntimeProfile['validationMode'];
  readonly requiredAdapters: readonly AdapterToken[];
  readonly missingAdapters: readonly AdapterToken[];
  readonly registeredAdapters: readonly AdapterToken[];
  readonly warnings: readonly string[];
  readonly inventory: readonly RegisteredAdapter[];
  readonly durationMs: number;
}

const validationTokensFor = (profile: RuntimeProfile): readonly AdapterToken[] =>
  profile.validationMode === RuntimeProfileValidationMode.Strict
    ? AllAdapterTokens
    : profile.requiredTokens;

const missingWarning = (profile: RuntimeProfile, missing: readonly AdapterToken[]): string =>
  `Runtime profile "${profile.id}" is missing adapters: ${missing.map(({ id }) => id).join(', ')}`;

/**
 * Owns registry bootstrap and validation flow only. Implementation construction remains
 * the responsibility of the calling composition root.
 */
export class RuntimeBootstrapEngine {
  bootstrap(options: RuntimeBootstrapOptions): RuntimeBootstrapResult {
    const registry = options.registry ?? new AdapterRegistry(options.logger);
    const requiredAdapters = validationTokensFor(options.profile);
    const permissive = options.profile.validationMode === RuntimeProfileValidationMode.Permissive;
    let startupReport: RuntimeAdapterStartupReport;
    try {
      startupReport = new RuntimeAdapterBootstrap(
        registry,
        options.registrations ?? [],
        requiredAdapters,
        options.logger,
      ).bootstrap();
    } catch (error) {
      if (!permissive || !(error instanceof RegistryValidationError)) throw error;
      startupReport = error.report;
    }
    const missingAdapters = startupReport.validation.missing;
    const warnings = missingAdapters.length > 0
      ? Object.freeze([missingWarning(options.profile, missingAdapters)])
      : Object.freeze([] as string[]);

    return Object.freeze({
      profile: options.profile,
      registry,
      startupReport,
      status: startupReport.status === RuntimeAdapterBootstrapStatus.Ready
        ? RuntimeBootstrapStatus.Ready
        : RuntimeBootstrapStatus.Degraded,
      validationMode: options.profile.validationMode,
      requiredAdapters,
      missingAdapters,
      registeredAdapters: startupReport.inventory.map(({ token }) => token),
      warnings,
      inventory: startupReport.inventory,
      durationMs: startupReport.durationMs,
    });
  }
}
