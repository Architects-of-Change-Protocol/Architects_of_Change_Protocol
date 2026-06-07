export interface AdapterToken<TAdapter = unknown> {
    readonly id: string;
    readonly displayName: string;
    readonly contractVersion: string;
    /** Type-only marker. Adapter tokens remain plain serializable objects at runtime. */
    readonly __adapterType?: TAdapter;
}
export interface AdapterRegistrationMetadata {
    readonly implementation?: string;
    readonly source: string;
    readonly version: string;
}
export declare const RegisteredAdapterStatus: {
    readonly Registered: "registered";
};
export type RegisteredAdapterStatus = (typeof RegisteredAdapterStatus)[keyof typeof RegisteredAdapterStatus];
export interface RegisteredAdapter<TAdapter = unknown> extends AdapterRegistrationMetadata {
    readonly token: AdapterToken<TAdapter>;
    readonly adapter: TAdapter;
    readonly status: RegisteredAdapterStatus;
}
export interface AdapterRegistration<TAdapter = unknown> {
    readonly token: AdapterToken<TAdapter>;
    readonly adapter: TAdapter;
    readonly metadata: AdapterRegistrationMetadata;
}
export interface RegistryValidationResult {
    readonly valid: boolean;
    readonly required: readonly AdapterToken[];
    readonly registered: readonly AdapterToken[];
    readonly missing: readonly AdapterToken[];
    readonly durationMs: number;
}
export declare const RuntimeAdapterBootstrapStatus: {
    readonly Ready: "ready";
    readonly Failed: "failed";
};
export type RuntimeAdapterBootstrapStatus = (typeof RuntimeAdapterBootstrapStatus)[keyof typeof RuntimeAdapterBootstrapStatus];
export interface RuntimeAdapterStartupReport {
    readonly status: RuntimeAdapterBootstrapStatus;
    readonly validation: RegistryValidationResult;
    readonly inventory: readonly RegisteredAdapter[];
    readonly durationMs: number;
}
export declare const AdapterRegistryEventType: {
    readonly AdapterRegistered: "Adapter Registered";
    readonly AdapterRemoved: "Adapter Removed";
    readonly AdapterValidation: "Adapter Validation";
    readonly AdapterMissing: "Adapter Missing";
    readonly RegistryReady: "Registry Ready";
    readonly RegistryFailed: "Registry Failed";
};
export type AdapterRegistryEventType = (typeof AdapterRegistryEventType)[keyof typeof AdapterRegistryEventType];
export interface AdapterRegistryEvent {
    readonly type: AdapterRegistryEventType;
    readonly token?: AdapterToken;
    readonly validation?: RegistryValidationResult;
    readonly timestamp: string;
}
export interface AdapterRegistryLogger {
    log(event: AdapterRegistryEvent): void;
}
//# sourceMappingURL=types.d.ts.map