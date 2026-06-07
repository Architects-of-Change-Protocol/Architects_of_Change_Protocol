import { type AdapterRegistryLogger, type AdapterRegistrationMetadata, type AdapterToken, type RegisteredAdapter, type RegistryValidationResult } from './types';
export declare class AdapterRegistry {
    private readonly logger?;
    private readonly registrations;
    constructor(logger?: AdapterRegistryLogger | undefined);
    register<TAdapter>(token: AdapterToken<TAdapter>, adapter: TAdapter, metadata: AdapterRegistrationMetadata): RegisteredAdapter<TAdapter>;
    resolve<TAdapter>(token: AdapterToken<TAdapter>): TAdapter;
    has(token: AdapterToken): boolean;
    list(): readonly RegisteredAdapter[];
    remove(token: AdapterToken): boolean;
    validate(required: readonly AdapterToken[]): RegistryValidationResult;
}
//# sourceMappingURL=adapter-registry.d.ts.map