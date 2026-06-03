import type { CanonicalMetadata } from '../primitives';
import type { ProofType } from '../proofs/proof-enums';
import type { CanonicalSemanticRef } from './semantic-reference';
/** Descriptive semantic profile for proof types. */
export interface CanonicalProofVocabularyProfile {
    readonly proofType: ProofType;
    readonly semanticRefs: readonly CanonicalSemanticRef[];
    readonly metadata?: CanonicalMetadata;
}
//# sourceMappingURL=proof-vocabulary-profile.d.ts.map