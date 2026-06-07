"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeAdapterBootstrap = void 0;
const errors_1 = require("./errors");
const types_1 = require("./types");
const clock = () => globalThis.performance?.now() ?? Date.now();
class RuntimeAdapterBootstrap {
    constructor(registry, registrations, required, logger) {
        this.registry = registry;
        this.registrations = registrations;
        this.required = required;
        this.logger = logger;
    }
    bootstrap() {
        const startedAt = clock();
        for (const registration of this.registrations) {
            this.registry.register(registration.token, registration.adapter, registration.metadata);
        }
        const validation = this.registry.validate(this.required);
        const report = Object.freeze({
            status: validation.valid ? types_1.RuntimeAdapterBootstrapStatus.Ready : types_1.RuntimeAdapterBootstrapStatus.Failed,
            validation,
            inventory: this.registry.list(),
            durationMs: clock() - startedAt,
        });
        this.logger?.log({
            type: validation.valid ? types_1.AdapterRegistryEventType.RegistryReady : types_1.AdapterRegistryEventType.RegistryFailed,
            validation,
            timestamp: new Date().toISOString(),
        });
        if (!validation.valid)
            throw new errors_1.RegistryValidationError(report);
        return report;
    }
}
exports.RuntimeAdapterBootstrap = RuntimeAdapterBootstrap;
