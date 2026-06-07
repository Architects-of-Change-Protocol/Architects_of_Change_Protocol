import { AdapterRegistry } from './adapter-registry';
import { type AdapterRegistration, type AdapterRegistryLogger, type AdapterToken, type RegisteredAdapter, type RuntimeAdapterStartupReport } from './types';
import { type RuntimeProfile } from './runtime-profile';
export declare const RuntimeBootstrapStatus: {
    readonly Ready: "ready";
    readonly Degraded: "degraded";
};
export type RuntimeBootstrapStatus = (typeof RuntimeBootstrapStatus)[keyof typeof RuntimeBootstrapStatus];
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
/**
 * Owns registry bootstrap and validation flow only. Implementation construction remains
 * the responsibility of the calling composition root.
 */
export declare class RuntimeBootstrapEngine {
    bootstrap(options: RuntimeBootstrapOptions): RuntimeBootstrapResult;
}
//# sourceMappingURL=runtime-bootstrap-engine.d.ts.map