import { AdapterAlreadyRegisteredError, AdapterNotRegisteredError } from './errors';
import {
  AdapterRegistryEventType,
  RegisteredAdapterStatus,
  type AdapterRegistryLogger,
  type AdapterRegistrationMetadata,
  type AdapterToken,
  type RegisteredAdapter,
  type RegistryValidationResult,
} from './types';

const now = (): string => new Date().toISOString();
const clock = (): number => globalThis.performance?.now() ?? Date.now();
const registryKey = (token: AdapterToken): string => `${token.id}@${token.contractVersion}`;

const implementationName = (adapter: unknown): string => {
  if (typeof adapter === 'function' && adapter.name.length > 0) return adapter.name;
  if (typeof adapter === 'object' && adapter !== null) {
    const name = adapter.constructor?.name;
    if (name && name !== 'Object') return name;
  }
  return typeof adapter;
};

export class AdapterRegistry {
  private readonly registrations = new Map<string, RegisteredAdapter>();

  constructor(private readonly logger?: AdapterRegistryLogger) {}

  register<TAdapter>(
    token: AdapterToken<TAdapter>,
    adapter: TAdapter,
    metadata: AdapterRegistrationMetadata,
  ): RegisteredAdapter<TAdapter> {
    if (this.registrations.has(registryKey(token))) throw new AdapterAlreadyRegisteredError(token);

    const registration: RegisteredAdapter<TAdapter> = Object.freeze({
      token,
      adapter,
      implementation: metadata.implementation ?? implementationName(adapter),
      source: metadata.source,
      version: metadata.version,
      status: RegisteredAdapterStatus.Registered,
    });
    this.registrations.set(registryKey(token), registration);
    this.logger?.log({ type: AdapterRegistryEventType.AdapterRegistered, token, timestamp: now() });
    return registration;
  }

  resolve<TAdapter>(token: AdapterToken<TAdapter>): TAdapter {
    const registration = this.registrations.get(registryKey(token));
    if (registration === undefined) throw new AdapterNotRegisteredError(token);
    return registration.adapter as TAdapter;
  }

  has(token: AdapterToken): boolean {
    return this.registrations.has(registryKey(token));
  }

  list(): readonly RegisteredAdapter[] {
    return [...this.registrations.values()].sort((left, right) => left.token.id.localeCompare(right.token.id));
  }

  remove(token: AdapterToken): boolean {
    const removed = this.registrations.delete(registryKey(token));
    if (removed) this.logger?.log({ type: AdapterRegistryEventType.AdapterRemoved, token, timestamp: now() });
    return removed;
  }

  validate(required: readonly AdapterToken[]): RegistryValidationResult {
    const startedAt = clock();
    const missing = required.filter((token) => !this.has(token));
    const result: RegistryValidationResult = Object.freeze({
      valid: missing.length === 0,
      required: [...required],
      registered: required.filter((token) => this.has(token)),
      missing,
      durationMs: clock() - startedAt,
    });

    this.logger?.log({ type: AdapterRegistryEventType.AdapterValidation, validation: result, timestamp: now() });
    for (const token of missing) {
      this.logger?.log({ type: AdapterRegistryEventType.AdapterMissing, token, validation: result, timestamp: now() });
    }
    return result;
  }
}
