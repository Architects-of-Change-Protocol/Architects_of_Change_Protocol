import {
  AttestationType,
  ClaimType,
  CredentialType,
  EvidenceType,
  PrincipalKind,
  RegistryAuthorityLevel,
  RegistryEntryType,
  RegistryType,
} from '@aoc/protocol/claims';

import {
  ASSET_PROFILE_SCHEMA_VERSION,
  AssetIdentityStrategy,
  AssetProfileScope,
  AssetRequirementKind,
  AssetRequirementObligation,
  AssetRequirementSatisfaction,
} from '@aoc/asset-protocolization';
import type { AssetProfile, AssetRequirement } from '@aoc/asset-protocolization';

/**
 * Test-only profile fixtures.
 *
 * These are **not** product contracts. No concrete asset profile is defined by
 * APV-03 — `digital.artifact.v1` and every other real profile is APV-11 or
 * later. These exist purely to prove that the framework can express two
 * fundamentally different abstract shapes without either of them leaking a
 * domain concept into the framework or into Protocol.
 *
 * Shape A is a *content* subject: it has bytes, so it can carry a
 * `ContentIdentity`. Shape B is an *externally registered non-content* subject:
 * it has no canonical byte representation at all, so it is identified by an
 * external registry entry, its registry observation has to be fresh, and a
 * credentialled professional has to attest. Nothing below names a jurisdiction's
 * law, a registry by name, or a profession.
 */

const CONTENT_IDENTITY_REQUIREMENT: AssetRequirement = {
  id: 'identity.content.required',
  kind: AssetRequirementKind.Identity,
  obligation: AssetRequirementObligation.Required,
  acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
  satisfaction: AssetRequirementSatisfaction.All,
  metadata: {
    label: 'Content identity',
    reason: 'The subject has a canonical byte representation that can be digested.',
  },
};

const PROVENANCE_EVIDENCE_REQUIREMENT: AssetRequirement = {
  id: 'evidence.provenance.minimum',
  kind: AssetRequirementKind.Evidence,
  obligation: AssetRequirementObligation.Required,
  acceptedTypes: [EvidenceType.Document, EvidenceType.SystemRecord],
  acceptedSubtypes: ['provenance'],
  minimumCount: 1,
};

const AUTHORSHIP_DECLARATION_REQUIREMENT: AssetRequirement = {
  id: 'declaration.authorship.required',
  kind: AssetRequirementKind.Declaration,
  obligation: AssetRequirementObligation.Required,
  claimType: ClaimType.Authorship,
  minimumCount: 1,
};

const CONTENT_INTEGRITY_CHECK_REQUIREMENT: AssetRequirement = {
  id: 'verification.content.integrity',
  kind: AssetRequirementKind.Verification,
  obligation: AssetRequirementObligation.Required,
  checkIds: ['check.content.digest-matches'],
  satisfaction: AssetRequirementSatisfaction.All,
};

/** Shape A — a digital-content subject. */
export const TEST_CONTENT_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.content.v1',
  version: '1.0.0',
  assetCategory: 'test.category.content',
  scope: AssetProfileScope.Global,
  jurisdictions: [{ code: 'GLOBAL' }],
  requirements: [
    CONTENT_IDENTITY_REQUIREMENT,
    AUTHORSHIP_DECLARATION_REQUIREMENT,
    PROVENANCE_EVIDENCE_REQUIREMENT,
    CONTENT_INTEGRITY_CHECK_REQUIREMENT,
    {
      id: 'attestation.professional.not-required',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.NotRequired,
      acceptedTypes: [AttestationType.Human],
      metadata: {
        reason: 'A content subject is checkable from its own bytes; no professional attests it.',
      },
    },
  ],
  metadata: { label: 'Test content shape', description: 'Test-only fixture. Not a product profile.' },
};

/** Shape B — an externally registered subject with no byte representation. */
export const TEST_EXTERNAL_SHAPE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.external.v1',
  version: '1.0.0',
  assetCategory: 'test.category.external-subject',
  scope: AssetProfileScope.Global,
  jurisdictions: [{ code: 'GLOBAL' }],
  requirements: [
    {
      id: 'identity.content.not-required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.NotRequired,
      acceptedStrategies: [AssetIdentityStrategy.ContentIdentity],
      satisfaction: AssetRequirementSatisfaction.Any,
      metadata: { reason: 'The subject has no canonical byte representation.' },
    },
    {
      id: 'identity.external-registry.required',
      kind: AssetRequirementKind.Identity,
      obligation: AssetRequirementObligation.Required,
      acceptedStrategies: [AssetIdentityStrategy.RegistryEntry, AssetIdentityStrategy.ExternalReference],
      satisfaction: AssetRequirementSatisfaction.Any,
      registry: {
        acceptedTypes: [RegistryType.Custom],
        acceptedAuthorityLevels: [RegistryAuthorityLevel.External],
        acceptedEntryTypes: [RegistryEntryType.Custom],
      },
    },
    {
      id: 'evidence.registry.observation',
      kind: AssetRequirementKind.Evidence,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [EvidenceType.Certification],
      minimumCount: 1,
      registry: {
        acceptedAuthorityLevels: [RegistryAuthorityLevel.External],
      },
      freshness: { maxAgeSeconds: 60 * 60 * 24 * 30 },
    },
    {
      id: 'declaration.authority.required',
      kind: AssetRequirementKind.Declaration,
      obligation: AssetRequirementObligation.Required,
      claimType: ClaimType.Authorization,
      minimumCount: 1,
    },
    {
      id: 'verification.registry.lookup',
      kind: AssetRequirementKind.Verification,
      obligation: AssetRequirementObligation.Required,
      checkIds: ['check.registry.entry-resolves', 'check.registry.entry-active'],
      satisfaction: AssetRequirementSatisfaction.All,
      freshness: { maxAgeSeconds: 60 * 60 * 24 },
    },
    {
      id: 'attestation.professional.required',
      kind: AssetRequirementKind.Attestation,
      obligation: AssetRequirementObligation.Required,
      acceptedTypes: [AttestationType.Human],
      minimumCount: 1,
      attester: {
        acceptedPrincipalKinds: [PrincipalKind.Human],
        acceptedRoles: ['test.role.reviewer'],
        jurisdictions: [{ code: 'GLOBAL' }],
        credential: {
          acceptedTypes: [CredentialType.ProfessionalCredential],
          freshness: { mustNotBeExpired: true },
        },
      },
    },
  ],
  metadata: { label: 'Test external-reference shape', description: 'Test-only fixture. Not a product profile.' },
};

/** A minimal well-formed profile, and its successor version. */
export const TEST_PROFILE_V1: AssetProfile = {
  schemaVersion: ASSET_PROFILE_SCHEMA_VERSION,
  profileId: 'test.profile.v1',
  version: '1.0.0',
  assetCategory: 'test.category.minimal',
  scope: AssetProfileScope.Global,
  requirements: [CONTENT_IDENTITY_REQUIREMENT],
};

export const TEST_PROFILE_V2: AssetProfile = {
  ...TEST_PROFILE_V1,
  profileId: 'test.profile.v2',
  requirements: [CONTENT_IDENTITY_REQUIREMENT, PROVENANCE_EVIDENCE_REQUIREMENT],
};

/** Same profile line, later version — used to prove versions coexist. */
export const TEST_PROFILE_V1_REVISED: AssetProfile = {
  ...TEST_PROFILE_V1,
  version: '1.1.0',
  requirements: [CONTENT_IDENTITY_REQUIREMENT, AUTHORSHIP_DECLARATION_REQUIREMENT],
};

/** Builds a variant of `TEST_PROFILE_V1` for negative cases. */
export function withProfileOverrides(overrides: Record<string, unknown>): unknown {
  return { ...TEST_PROFILE_V1, ...overrides };
}

/** Builds `TEST_PROFILE_V1` carrying exactly the supplied requirement set. */
export function withRequirements(requirements: readonly unknown[]): unknown {
  return { ...TEST_PROFILE_V1, requirements };
}
