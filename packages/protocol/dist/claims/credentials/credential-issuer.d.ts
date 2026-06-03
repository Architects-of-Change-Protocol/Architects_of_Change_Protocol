import type { CanonicalId } from '../../contracts';
import type { CanonicalMetadata } from '../primitives';
import type { CanonicalPrincipalRef } from '../references';
import type { CanonicalRegistryEntryRef } from '../registries/registry-entry-reference';
import type { CredentialIssuerKind } from './credential-enums';
/**
 * Identifies the issuer of a credential without verifying issuer authority.
 */
export interface CanonicalCredentialIssuer {
    readonly id: CanonicalId;
    readonly kind: CredentialIssuerKind;
    readonly principalRef?: CanonicalPrincipalRef;
    readonly registryRefs?: readonly CanonicalRegistryEntryRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=credential-issuer.d.ts.map