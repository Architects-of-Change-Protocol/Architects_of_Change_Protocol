"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterRegistry = void 0;
const errors_1 = require("./errors");
const types_1 = require("./types");
const now = () => new Date().toISOString();
const clock = () => globalThis.performance?.now() ?? Date.now();
const registryKey = (token) => `${token.id}@${token.contractVersion}`;
const implementationName = (adapter) => {
    if (typeof adapter === 'function' && adapter.name.length > 0)
        return adapter.name;
    if (typeof adapter === 'object' && adapter !== null) {
        const name = adapter.constructor?.name;
        if (name && name !== 'Object')
            return name;
    }
    return typeof adapter;
};
class AdapterRegistry {
    constructor(logger) {
        this.logger = logger;
        this.registrations = new Map();
    }
    register(token, adapter, metadata) {
        if (this.registrations.has(registryKey(token)))
            throw new errors_1.AdapterAlreadyRegisteredError(token);
        const registration = Object.freeze({
            token,
            adapter,
            implementation: metadata.implementation ?? implementationName(adapter),
            source: metadata.source,
            version: metadata.version,
            status: types_1.RegisteredAdapterStatus.Registered,
        });
        this.registrations.set(registryKey(token), registration);
        this.logger?.log({ type: types_1.AdapterRegistryEventType.AdapterRegistered, token, timestamp: now() });
        return registration;
    }
    resolve(token) {
        const registration = this.registrations.get(registryKey(token));
        if (registration === undefined)
            throw new errors_1.AdapterNotRegisteredError(token);
        return registration.adapter;
    }
    has(token) {
        return this.registrations.has(registryKey(token));
    }
    list() {
        return [...this.registrations.values()].sort((left, right) => left.token.id.localeCompare(right.token.id));
    }
    remove(token) {
        const removed = this.registrations.delete(registryKey(token));
        if (removed)
            this.logger?.log({ type: types_1.AdapterRegistryEventType.AdapterRemoved, token, timestamp: now() });
        return removed;
    }
    validate(required) {
        const startedAt = clock();
        const missing = required.filter((token) => !this.has(token));
        const result = Object.freeze({
            valid: missing.length === 0,
            required: [...required],
            registered: required.filter((token) => this.has(token)),
            missing,
            durationMs: clock() - startedAt,
        });
        this.logger?.log({ type: types_1.AdapterRegistryEventType.AdapterValidation, validation: result, timestamp: now() });
        for (const token of missing) {
            this.logger?.log({ type: types_1.AdapterRegistryEventType.AdapterMissing, token, validation: result, timestamp: now() });
        }
        return result;
    }
}
exports.AdapterRegistry = AdapterRegistry;
