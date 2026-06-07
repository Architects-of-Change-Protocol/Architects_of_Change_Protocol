import { RegistryValidationError } from './errors';
import { AdapterRegistry } from './adapter-registry';
import {
  AdapterRegistryEventType,
  RuntimeAdapterBootstrapStatus,
  type AdapterRegistration,
  type AdapterRegistryLogger,
  type AdapterToken,
  type RuntimeAdapterStartupReport,
} from './types';

const clock = (): number => globalThis.performance?.now() ?? Date.now();

export class RuntimeAdapterBootstrap {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly registrations: readonly AdapterRegistration[],
    private readonly required: readonly AdapterToken[],
    private readonly logger?: AdapterRegistryLogger,
  ) {}

  bootstrap(): RuntimeAdapterStartupReport {
    const startedAt = clock();
    for (const registration of this.registrations) {
      this.registry.register(registration.token, registration.adapter, registration.metadata);
    }

    const validation = this.registry.validate(this.required);
    const report: RuntimeAdapterStartupReport = Object.freeze({
      status: validation.valid ? RuntimeAdapterBootstrapStatus.Ready : RuntimeAdapterBootstrapStatus.Failed,
      validation,
      inventory: this.registry.list(),
      durationMs: clock() - startedAt,
    });

    this.logger?.log({
      type: validation.valid ? AdapterRegistryEventType.RegistryReady : AdapterRegistryEventType.RegistryFailed,
      validation,
      timestamp: new Date().toISOString(),
    });
    if (!validation.valid) throw new RegistryValidationError(report);
    return report;
  }
}
