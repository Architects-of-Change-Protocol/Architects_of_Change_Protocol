// Content model for the AOC Protocol landing page (W004).
//
// Thesis: AOC Protocol defines what a digital asset can be — identity,
// integrity, provenance, capabilities and sovereignty-related properties
// that compatible systems can interpret. AOC Enterprise operationalizes
// governance on top of it. This file holds the narrative data so the
// section components stay focused on layout.

export type ClaimStatus = 'Reference Model' | 'Future Direction';

export const STATUS_COPY: Record<ClaimStatus, string> = {
  'Reference Model': 'Defined as a canonical contract in @aoc/protocol today.',
  'Future Direction': 'Not yet defined as a canonical contract — a protocol direction.',
};

export type CapabilityFamily = {
  id: string;
  name: string;
  status: ClaimStatus;
  summary: string;
};

// The eight capability families a digital asset can express. Grounded in the
// canonical contract shapes already published in packages/protocol/src —
// not a claim that a runtime or creation SDK implements them end to end.
export const CAPABILITY_FAMILIES: CapabilityFamily[] = [
  {
    id: 'identity',
    name: 'Identity',
    status: 'Reference Model',
    summary:
      "A canonical identity and credential reference that name an asset independent of any single database, application or account.",
  },
  {
    id: 'integrity',
    name: 'Integrity',
    status: 'Reference Model',
    summary:
      'A declared digest — algorithm plus hash — that lets a compatible system check whether the underlying resource has changed.',
  },
  {
    id: 'provenance',
    name: 'Provenance',
    status: 'Reference Model',
    summary:
      "Issuer and issuance-time fields that record where an asset's context came from and when it was established.",
  },
  {
    id: 'portability',
    name: 'Portability',
    status: 'Reference Model',
    summary:
      'A registry reference that lets an asset be looked up and resolved independent of which provider currently stores it.',
  },
  {
    id: 'interoperability',
    name: 'Interoperability',
    status: 'Reference Model',
    summary:
      'Adapter interfaces for verification, revocation and registry lookup that any compatible runtime can implement.',
  },
  {
    id: 'verifiability',
    name: 'Verifiability',
    status: 'Reference Model',
    summary:
      'Proof references and verification-key resolution that let a claim about an asset be checked without trusting whoever presents it.',
  },
  {
    id: 'licensing',
    name: 'Licensing & Terms',
    status: 'Future Direction',
    summary:
      "References an asset's manifest could carry to policies, licenses or economic arrangements. Not yet defined as a canonical contract.",
  },
  {
    id: 'governance-compatibility',
    name: 'Governance Compatibility',
    status: 'Reference Model',
    summary:
      'Capability and consent shapes that Protocol defines and that AOC Enterprise operationalizes into access decisions, grants and revocation.',
  },
];

export type CreationStep = {
  label: string;
  detail: string;
};

export const CREATION_FLOW: CreationStep[] = [
  { label: 'Application or Tool', detail: 'A compatible application originates or ingests a digital resource.' },
  { label: 'Digital Resource Created or Registered', detail: 'A file, dataset or record is produced or brought under protocol reference.' },
  { label: 'Canonical Identity Assigned', detail: "An identity that doesn't depend on the storage location is attached to the resource." },
  { label: 'Integrity and Provenance Recorded', detail: 'A digest and issuer/time context are declared for the resource.' },
  { label: 'Capabilities Declared', detail: 'The asset states what it can express — licensing references, governance compatibility, and more.' },
  { label: 'Asset Available to Compatible Systems', detail: 'Compatible applications and, where deployed, AOC Enterprise can now interpret the asset.' },
];

export type PhotoStage = {
  label: string;
  detail: string;
};

export const PHOTO_PROGRESSION: PhotoStage[] = [
  { label: 'Photo File', detail: 'photo.jpg — content, format, a place it happens to be stored.' },
  { label: 'Identified Digital Asset', detail: 'A canonical asset identity and a creator or registrant reference are attached.' },
  { label: 'Integrity and Provenance', detail: 'A digest fixes the file at a point in time; provenance records who registered it and when.' },
  { label: 'Capabilities', detail: 'Preview vs. full-resolution, licensing references and governed-access compatibility are declared.' },
  { label: 'Compatible Governance through Enterprise', detail: 'Organizations running AOC Enterprise can turn those declarations into access decisions.' },
];

export type ProviderEntry = {
  name: string;
  status: ClaimStatus;
};

export const ILLUSTRATIVE_PROVIDERS: ProviderEntry[] = [
  { name: 'Pinata', status: 'Future Direction' },
  { name: 'Amazon S3', status: 'Future Direction' },
  { name: 'Azure Blob Storage', status: 'Future Direction' },
  { name: 'Other providers', status: 'Future Direction' },
];

export type AssetExample = {
  name: string;
};

export const OTHER_ASSET_EXAMPLES: AssetExample[] = [
  { name: 'documents' },
  { name: 'datasets' },
  { name: 'videos' },
  { name: 'models' },
  { name: 'credentials' },
];

export type BuilderAudience = {
  name: string;
  summary: string;
};

export const BUILDER_AUDIENCES: BuilderAudience[] = [
  { name: 'Application developers', summary: 'building tools that create, read or move digital assets.' },
  { name: 'Storage platforms', summary: 'that want asset identity to survive a migration off their platform.' },
  { name: 'Digital-asset tooling', summary: 'for creation, verification or cataloging workflows.' },
  { name: 'Creator platforms', summary: 'issuing photos, media or other work with provenance attached.' },
  { name: 'Document systems', summary: 'that need portable identity and integrity across organizational boundaries.' },
  { name: 'AI and data platforms', summary: 'that need datasets and model files to carry verifiable origin.' },
  { name: 'Infrastructure providers', summary: 'implementing adapters so their systems interoperate with compatible assets.' },
];
