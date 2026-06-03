import type { CredentialType } from '../credentials/credential-enums';
import type { CanonicalMetadata } from '../primitives';
import type { CanonicalSemanticRef } from './semantic-reference';
/** Descriptive semantic profile for credential types. */
export interface CanonicalCredentialVocabularyProfile {
    readonly credentialType: CredentialType;
    readonly semanticRefs: readonly CanonicalSemanticRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=credential-vocabulary-profile.d.ts.map