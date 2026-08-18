import type {
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalCredentialId,
  CanonicalEvidenceId,
  CanonicalRegistryEntryRef,
  CanonicalVerificationId,
} from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import { isValidContentIdentity, isValidSovereignExternalReference } from '@aoc/protocol/identity';
import type { ContentIdentity, SovereignExternalReference } from '@aoc/protocol/identity';

import { isValidUtcDateTime } from '../freshness';
import type { AssetRequirementId } from '../identifiers';
import { isValidAssetRequirementId } from '../identifiers';
import {
  PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH,
  isValidProtocolizationMaterialId,
} from './case-identifiers';
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
export const ProtocolizationMaterialKind = {
  /** A digest over the subject's bytes. Payload: Protocol's `ContentIdentity`. */
  ContentIdentity: 'ContentIdentity',
  /** How an external namespace names the subject. Payload: `SovereignExternalReference`. */
  ExternalReference: 'ExternalReference',
  /** An entry inside an external registry. Payload: `CanonicalRegistryEntryRef`. */
  RegistryEntry: 'RegistryEntry',
  /** "The applicant asserts X." Payload: a `CanonicalClaimId`. */
  Declaration: 'Declaration',
  /** Supporting evidence. Payload: a `CanonicalEvidenceId`. */
  Evidence: 'Evidence',
  /** A verification record — of any status. Payload: a `CanonicalVerificationId`. */
  Verification: 'Verification',
  /** An attestation record. Payload: a `CanonicalAttestationId`. */
  Attestation: 'Attestation',
  /** A credential an attester relies on. Payload: a `CanonicalCredentialId`. */
  Credential: 'Credential',
} as const;
export type ProtocolizationMaterialKind =
  (typeof ProtocolizationMaterialKind)[keyof typeof ProtocolizationMaterialKind];

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

export type ProtocolizationCaseMaterial =
  | ProtocolizationContentIdentityMaterial
  | ProtocolizationExternalReferenceMaterial
  | ProtocolizationRegistryEntryMaterial
  | ProtocolizationDeclarationMaterial
  | ProtocolizationEvidenceMaterial
  | ProtocolizationVerificationMaterial
  | ProtocolizationAttestationMaterial
  | ProtocolizationCredentialMaterial;

const MATERIAL_BASE_KEYS: readonly string[] = [
  'materialId',
  'kind',
  'requirementIds',
  'addedAt',
  'correlationId',
];

const MATERIAL_PAYLOAD_KEY: Readonly<Record<ProtocolizationMaterialKind, string>> = Object.freeze({
  [ProtocolizationMaterialKind.ContentIdentity]: 'contentIdentity',
  [ProtocolizationMaterialKind.ExternalReference]: 'externalReference',
  [ProtocolizationMaterialKind.RegistryEntry]: 'registryEntryRef',
  [ProtocolizationMaterialKind.Declaration]: 'claimRef',
  [ProtocolizationMaterialKind.Evidence]: 'evidenceRef',
  [ProtocolizationMaterialKind.Verification]: 'verificationRef',
  [ProtocolizationMaterialKind.Attestation]: 'attestationRef',
  [ProtocolizationMaterialKind.Credential]: 'credentialRef',
});

/**
 * The payload key one material kind carries, so a caller (and this package's
 * own validator) can read a reference without a per-kind branch.
 */
export function protocolizationMaterialPayloadKey(kind: ProtocolizationMaterialKind): string {
  return MATERIAL_PAYLOAD_KEY[kind];
}

export function isProtocolizationMaterialKind(value: unknown): value is ProtocolizationMaterialKind {
  return typeof value === 'string' && Object.values<string>(ProtocolizationMaterialKind).includes(value);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never parsed,
 * never resolved, and never checked for existence — this package has no way to
 * dereference one and must not pretend otherwise.
 */
function isCanonicalRecordId(value: unknown): value is CanonicalId {
  return typeof value === 'string' && value.trim() !== '' && value.length <= PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH;
}

/**
 * The minimum that makes a registry entry reference usable as a correlation
 * key: it names an entry, inside a named registry. Deeper validation of the
 * record belongs to whoever owns the record — restating
 * `CanonicalRegistryEntryRef`'s full shape here would be a second, drifting copy
 * of a Protocol contract, which is precisely what this package must not build.
 */
function isUsableRegistryEntryRef(value: unknown): value is CanonicalRegistryEntryRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<CanonicalRegistryEntryRef>;
  if (!isCanonicalRecordId(candidate.id)) return false;
  const registry = candidate.registryRef;
  if (typeof registry !== 'object' || registry === null || Array.isArray(registry)) return false;
  return isCanonicalRecordId((registry as { readonly id?: unknown }).id);
}

function isValidRequirementIdList(value: unknown): value is readonly AssetRequirementId[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const seen = new Set<string>();
  for (const entry of value) {
    if (!isValidAssetRequirementId(entry)) return false;
    if (seen.has(entry)) return false;
    seen.add(entry);
  }
  return true;
}

function isValidMaterialPayload(candidate: Record<string, unknown>, kind: ProtocolizationMaterialKind): boolean {
  const payload = candidate[MATERIAL_PAYLOAD_KEY[kind]];
  switch (kind) {
    case ProtocolizationMaterialKind.ContentIdentity:
      return isValidContentIdentity(payload);
    case ProtocolizationMaterialKind.ExternalReference:
      return isValidSovereignExternalReference(payload);
    case ProtocolizationMaterialKind.RegistryEntry:
      return isUsableRegistryEntryRef(payload);
    default:
      return isCanonicalRecordId(payload);
  }
}

/**
 * Structural validation of one material association. Shape only: it never
 * decides that the referenced record exists, is authentic, is current, or
 * satisfies anything.
 *
 * Requirement ids are checked for *form* here. Checking them against the
 * pinned profile needs the profile, so it happens where the profile is
 * resolved — in the case operations and in `validateProtocolizationCase`.
 */
export function isValidProtocolizationCaseMaterial(value: unknown): value is ProtocolizationCaseMaterial {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;

  const kind = candidate.kind;
  if (!isProtocolizationMaterialKind(kind)) return false;

  const allowedKeys = [...MATERIAL_BASE_KEYS, MATERIAL_PAYLOAD_KEY[kind]];
  for (const key of Object.keys(candidate)) {
    if (!allowedKeys.includes(key)) return false;
  }

  if (!isValidProtocolizationMaterialId(candidate.materialId)) return false;
  if (!isValidRequirementIdList(candidate.requirementIds)) return false;
  if (!isValidUtcDateTime(candidate.addedAt)) return false;
  if (hasOwn(candidate, 'correlationId') && !isCanonicalRecordId(candidate.correlationId)) return false;
  return isValidMaterialPayload(candidate, kind);
}
