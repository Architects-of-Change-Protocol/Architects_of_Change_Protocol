export type SdkIdentityInput = {
  subject_id?: string;
  subject_hash?: string;
  requester_id?: string;
  consumer_id?: string;
  tenant_id?: string;
};

export type SdkCanonicalIdentity = {
  subject_principal_id: string;
  requester_principal_id?: string;
  consumer_principal_id?: string;
  tenant_id?: string;
};

export function normalizeIdentity(input: SdkIdentityInput): SdkCanonicalIdentity {
  return {
    subject_principal_id: input.subject_id ?? input.subject_hash ?? '',
    requester_principal_id: input.requester_id,
    consumer_principal_id: input.consumer_id,
    tenant_id: input.tenant_id,
  };
}
