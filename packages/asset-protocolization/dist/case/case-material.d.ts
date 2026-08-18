import type { CanonicalAttestationId, CanonicalClaimId, CanonicalCredentialId, CanonicalEvidenceId, CanonicalRegistryEntryRef, CanonicalVerificationId } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { ContentIdentity, SovereignExternalReference } from '@aoc/protocol/identity';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationMaterialId } from './case-identifiers';
/**
 * *Material* — what a case has been given, correlated to what a profile asked
 * for.
 *
 * A material entry is an **association**, never a record. It says: this case
 * was told about this reference, at this instant, in connection with these
 * requirements. The referenced thing itself — the claim, the evidence, the
 * attestation, the verification, the credential — is a Protocol record living
 * wherever Protocol records live, and this package neither carries it, copies
 * it, stores its payload, nor defines a parallel type for it. That is the reuse
 * map's line: evidence *requirement* and evidence *association* belong to the
 * vertical; evidence *representation* belongs to Protocol.
 *
 * Nothing here is a blob. There are no bytes, no documents, no upload, no
 * storage adapter and no PII by construction — the same exclusion APV-02 §2.3
 * froze for the result envelope, for the same reason: a record must stay small
 * and safe enough to hand to someone not entitled to the payload.
 *
 * **Presence is not truth.** Adding an attestation reference does not make the
 * case attested. Adding a verification reference does not make anything
 * verified — a `CanonicalVerification` may have any status, including `Failed`,
 * and this package deliberately does not carry it. Adding a credential
 * reference does not make the credential current. What material presence
 * supports is a *later* evaluator; it decides nothing on its own.
 */
/**
 * The kinds of thing a case can be told about.
 *
 * Each member names an existing Protocol concept, and the set is closed to what
 * an APV-03 profile can require: the three identity strategies
 * (`ContentIdentity`, `ExternalReference`, `RegistryEntry`), the four
 * requirement families that name a Protocol record (`Declaration` for a claim,
 * `Evidence`, `Verification`, `Attestation`), and `Credential` for the
 * credential an attester constraint refers to. A new asset category never adds a
 * member here — it writes a profile.
 */
export declare const ProtocolizationMaterialKind: {
    /** A digest over the subject's bytes. Payload: Protocol's `ContentIdentity`. */
    readonly ContentIdentity: "ContentIdentity";
    /** How an external namespace names the subject. Payload: `SovereignExternalReference`. */
    readonly ExternalReference: "ExternalReference";
    /** An entry inside an external registry. Payload: `CanonicalRegistryEntryRef`. */
    readonly RegistryEntry: "RegistryEntry";
    /** "The applicant asserts X." Payload: a `CanonicalClaimId`. */
    readonly Declaration: "Declaration";
    /** Supporting evidence. Payload: a `CanonicalEvidenceId`. */
    readonly Evidence: "Evidence";
    /** A verification record — of any status. Payload: a `CanonicalVerificationId`. */
    readonly Verification: "Verification";
    /** An attestation record. Payload: a `CanonicalAttestationId`. */
    readonly Attestation: "Attestation";
    /** A credential an attester relies on. Payload: a `CanonicalCredentialId`. */
    readonly Credential: "Credential";
};
export type ProtocolizationMaterialKind = (typeof ProtocolizationMaterialKind)[keyof typeof ProtocolizationMaterialKind];
interface ProtocolizationCaseMaterialBase {
    /** Unique within the case. Assigned by the caller, validated here. */
    readonly materialId: ProtocolizationMaterialId;
    readonly kind: ProtocolizationMaterialKind;
    /**
     * Requirements of the pinned profile this material is offered against.
     * Non-empty, unique, and every id must exist in the pinned profile —
     * a material correlated to nothing, or to a requirement from another profile
     * version, is not a correlation.
     */
    readonly requirementIds: readonly AssetRequirementId[];
    readonly addedAt: UtcDateTime;
    /** Correlates this association with the request that produced it. */
    readonly correlationId?: CanonicalId;
}
export interface ProtocolizationContentIdentityMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.ContentIdentity;
    readonly contentIdentity: ContentIdentity;
}
export interface ProtocolizationExternalReferenceMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.ExternalReference;
    readonly externalReference: SovereignExternalReference;
}
export interface ProtocolizationRegistryEntryMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.RegistryEntry;
    readonly registryEntryRef: CanonicalRegistryEntryRef;
}
export interface ProtocolizationDeclarationMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.Declaration;
    readonly claimRef: CanonicalClaimId;
}
export interface ProtocolizationEvidenceMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.Evidence;
    readonly evidenceRef: CanonicalEvidenceId;
}
export interface ProtocolizationVerificationMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.Verification;
    /**
     * Names a `CanonicalVerification`. Its `status` is deliberately not copied
     * here: a status carried on the association would be a second, staleable copy
     * of an outcome the vertical does not own, and reading it out of the case
     * would be the fake verification APV-04 must not manufacture.
     */
    readonly verificationRef: CanonicalVerificationId;
}
export interface ProtocolizationAttestationMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.Attestation;
    readonly attestationRef: CanonicalAttestationId;
}
export interface ProtocolizationCredentialMaterial extends ProtocolizationCaseMaterialBase {
    readonly kind: typeof ProtocolizationMaterialKind.Credential;
    readonly credentialRef: CanonicalCredentialId;
}
export type ProtocolizationCaseMaterial = ProtocolizationContentIdentityMaterial | ProtocolizationExternalReferenceMaterial | ProtocolizationRegistryEntryMaterial | ProtocolizationDeclarationMaterial | ProtocolizationEvidenceMaterial | ProtocolizationVerificationMaterial | ProtocolizationAttestationMaterial | ProtocolizationCredentialMaterial;
/**
 * The payload key one material kind carries, so a caller (and this package's
 * own validator) can read a reference without a per-kind branch.
 */
export declare function protocolizationMaterialPayloadKey(kind: ProtocolizationMaterialKind): string;
export declare function isProtocolizationMaterialKind(value: unknown): value is ProtocolizationMaterialKind;
/**
 * Structural validation of one material association. Shape only: it never
 * decides that the referenced record exists, is authentic, is current, or
 * satisfies anything.
 *
 * Requirement ids are checked for *form* here. Checking them against the
 * pinned profile needs the profile, so it happens where the profile is
 * resolved — in the case operations and in `validateProtocolizationCase`.
 */
export declare function isValidProtocolizationCaseMaterial(value: unknown): value is ProtocolizationCaseMaterial;
export {};
//# sourceMappingURL=case-material.d.ts.map