export type FieldManifestV1 = {
  version: 1;
  field_id: string;
  data_type: string;
  semantics: string;
  created_at: string;
  field_hash: string;
};

export type BuildFieldOptions = {
  now?: Date;
};
