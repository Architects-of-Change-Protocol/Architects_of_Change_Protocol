import type { AdapterRegistry } from './adapter-registry';
import type { AdapterRegistration, AdapterRegistryLogger } from './types';
import type { RuntimeProfile } from './runtime-profile';
import type { RuntimeBootstrapResult, RuntimeBootstrapStatus } from './runtime-bootstrap-engine';
/** Marker contract for dependencies resolved at a typed composition boundary. */
export type ResolvedRuntimeContext = object;
export interface RuntimeCompositionOptions {
    readonly registry?: AdapterRegistry;
    readonly registrations?: readonly AdapterRegistration[];
    readonly logger?: AdapterRegistryLogger;
}
export interface RuntimeCompositionResult<TContext extends ResolvedRuntimeContext = ResolvedRuntimeContext> extends RuntimeBootstrapResult {
    readonly resolvedContext: TContext;
    readonly status: RuntimeBootstrapStatus;
}
/** A profile-specific composition root constructs implementations, then delegates flow to the engine. */
export interface RuntimeCompositionRoot<TOptions extends RuntimeCompositionOptions = RuntimeCompositionOptions, TContext extends ResolvedRuntimeContext = ResolvedRuntimeContext> {
    readonly profile: RuntimeProfile;
    compose(options?: TOptions): RuntimeCompositionResult<TContext>;
}
//# sourceMappingURL=runtime-composition-root.d.ts.map