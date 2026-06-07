"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeBootstrapEngine = exports.RuntimeBootstrapStatus = void 0;
const adapter_registry_1 = require("./adapter-registry");
const errors_1 = require("./errors");
const runtime_adapter_bootstrap_1 = require("./runtime-adapter-bootstrap");
const tokens_1 = require("./tokens");
const types_1 = require("./types");
const runtime_profile_1 = require("./runtime-profile");
exports.RuntimeBootstrapStatus = {
    Ready: 'ready',
    Degraded: 'degraded',
};
const validationTokensFor = (profile) => profile.validationMode === runtime_profile_1.RuntimeProfileValidationMode.Strict
    ? tokens_1.AllAdapterTokens
    : profile.requiredTokens;
const missingWarning = (profile, missing) => `Runtime profile "${profile.id}" is missing adapters: ${missing.map(({ id }) => id).join(', ')}`;
/**
 * Owns registry bootstrap and validation flow only. Implementation construction remains
 * the responsibility of the calling composition root.
 */
class RuntimeBootstrapEngine {
    bootstrap(options) {
        const registry = options.registry ?? new adapter_registry_1.AdapterRegistry(options.logger);
        const requiredAdapters = validationTokensFor(options.profile);
        const permissive = options.profile.validationMode === runtime_profile_1.RuntimeProfileValidationMode.Permissive;
        let startupReport;
        try {
            startupReport = new runtime_adapter_bootstrap_1.RuntimeAdapterBootstrap(registry, options.registrations ?? [], requiredAdapters, options.logger).bootstrap();
        }
        catch (error) {
            if (!permissive || !(error instanceof errors_1.RegistryValidationError))
                throw error;
            startupReport = error.report;
        }
        const missingAdapters = startupReport.validation.missing;
        const warnings = missingAdapters.length > 0
            ? Object.freeze([missingWarning(options.profile, missingAdapters)])
            : Object.freeze([]);
        return Object.freeze({
            profile: options.profile,
            registry,
            startupReport,
            status: startupReport.status === types_1.RuntimeAdapterBootstrapStatus.Ready
                ? exports.RuntimeBootstrapStatus.Ready
                : exports.RuntimeBootstrapStatus.Degraded,
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
exports.RuntimeBootstrapEngine = RuntimeBootstrapEngine;
