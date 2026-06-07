"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryValidationError = exports.AdapterAlreadyRegisteredError = exports.AdapterNotRegisteredError = void 0;
class AdapterNotRegisteredError extends Error {
    constructor(token) {
        super(`No runtime adapter is registered for ${token.displayName} (${token.id}@${token.contractVersion}).`);
        this.token = token;
        this.name = 'AdapterNotRegisteredError';
    }
}
exports.AdapterNotRegisteredError = AdapterNotRegisteredError;
class AdapterAlreadyRegisteredError extends Error {
    constructor(token) {
        super(`A runtime adapter is already registered for ${token.displayName} (${token.id}@${token.contractVersion}).`);
        this.token = token;
        this.name = 'AdapterAlreadyRegisteredError';
    }
}
exports.AdapterAlreadyRegisteredError = AdapterAlreadyRegisteredError;
class RegistryValidationError extends Error {
    constructor(report) {
        const missing = report.validation.missing.map((token) => token.id).join(', ');
        super(`Runtime adapter registry validation failed. Missing required adapters: ${missing}.`);
        this.report = report;
        this.name = 'RegistryValidationError';
    }
}
exports.RegistryValidationError = RegistryValidationError;
