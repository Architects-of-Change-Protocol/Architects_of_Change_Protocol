import type { AdapterToken, RuntimeAdapterStartupReport } from './types';

export class AdapterNotRegisteredError extends Error {
  constructor(readonly token: AdapterToken) {
    super(`No runtime adapter is registered for ${token.displayName} (${token.id}@${token.contractVersion}).`);
    this.name = 'AdapterNotRegisteredError';
  }
}

export class AdapterAlreadyRegisteredError extends Error {
  constructor(readonly token: AdapterToken) {
    super(`A runtime adapter is already registered for ${token.displayName} (${token.id}@${token.contractVersion}).`);
    this.name = 'AdapterAlreadyRegisteredError';
  }
}

export class RegistryValidationError extends Error {
  constructor(readonly report: RuntimeAdapterStartupReport) {
    const missing = report.validation.missing.map((token) => token.id).join(', ');
    super(`Runtime adapter registry validation failed. Missing required adapters: ${missing}.`);
    this.name = 'RegistryValidationError';
  }
}
