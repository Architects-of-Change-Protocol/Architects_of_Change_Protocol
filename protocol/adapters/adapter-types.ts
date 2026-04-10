export const ADAPTER_TYPES = [
  'market_maker',
  'storage_provider',
  'interpreter',
  'executor',
  'other',
] as const;

export const ADAPTER_SCOPE_TYPES = ['field', 'content', 'pack'] as const;

export const ADAPTER_STATUS = ['declared', 'verified', 'revoked'] as const;

export const ADAPTER_REGISTRY_SOURCES = ['self_declared', 'official_aoc'] as const;

export type AdapterType = (typeof ADAPTER_TYPES)[number];
export type AdapterScopeType = (typeof ADAPTER_SCOPE_TYPES)[number];
export type AdapterStatus = (typeof ADAPTER_STATUS)[number];
export type AdapterRegistrySource = (typeof ADAPTER_REGISTRY_SOURCES)[number];

export type AdapterMetadata = Record<string, unknown>;

export type AOCAdapterRecord = {
  adapter_id: string;
  display_name: string;
  adapter_type: AdapterType;
  owner_did?: string;
  marketMakerId?: string;
  supported_operations: string[];
  supported_scope_types: AdapterScopeType[];
  endpoint_url?: string;
  documentation_url?: string;
  status: AdapterStatus;
  registry_source: AdapterRegistrySource;
  created_at: string;
  updated_at: string;
  metadata?: AdapterMetadata;
};

export type AdapterRecordInput = Partial<AOCAdapterRecord> & Record<string, unknown>;

export type AdapterListFilters = {
  status?: AdapterStatus;
  adapter_type?: AdapterType;
  registry_source?: AdapterRegistrySource;
};

export type AdapterRegistry = {
  registerAdapter: (record: unknown) => AOCAdapterRecord;
  getAdapterById: (adapterId: string) => AOCAdapterRecord | null;
  listAdapters: (filters?: AdapterListFilters) => AOCAdapterRecord[];
  updateAdapterStatus: (adapterId: string, nextStatus: AdapterStatus) => AOCAdapterRecord;
  resolveAdapter: (adapterId: string) => AOCAdapterRecord | null;
};
