import { normalizeAdapterRecord, parseAdapterRecord, validateAdapterRecord } from './adapter-object';
import { AdapterRegistryError } from './adapter-errors';
import type {
  AOCAdapterRecord,
  AdapterListFilters,
  AdapterRegistry,
  AdapterStatus,
} from './adapter-types';
import { resolveAdapter as resolveAdapterWith } from './adapter-resolution';

const ALLOWED_STATUS_TRANSITIONS: Record<AdapterStatus, AdapterStatus[]> = {
  declared: ['verified', 'revoked'],
  verified: ['revoked'],
  revoked: [],
};

function cloneRecord(record: AOCAdapterRecord): AOCAdapterRecord {
  return {
    ...record,
    supported_operations: [...record.supported_operations],
    supported_scope_types: [...record.supported_scope_types],
    metadata: record.metadata ? { ...record.metadata } : undefined,
  };
}

// Official AOC registry utility. Optional layer: protocol primitives must work without this registry.
export function createAdapterRegistry(): AdapterRegistry {
  const adaptersById = new Map<string, AOCAdapterRecord>();

  function registerAdapter(record: unknown): AOCAdapterRecord {
    const parsed = parseAdapterRecord(record);
    validateAdapterRecord(parsed);
    const normalized = normalizeAdapterRecord(parsed);

    if (adaptersById.has(normalized.adapter_id)) {
      throw new AdapterRegistryError(`Adapter ${normalized.adapter_id} is already registered.`);
    }

    adaptersById.set(normalized.adapter_id, normalized);
    return cloneRecord(normalized);
  }

  function getAdapterById(adapterId: string): AOCAdapterRecord | null {
    const adapter = adaptersById.get(adapterId);
    return adapter ? cloneRecord(adapter) : null;
  }

  function listAdapters(filters?: AdapterListFilters): AOCAdapterRecord[] {
    const adapters = [...adaptersById.values()];

    return adapters
      .filter((adapter) => {
        if (!filters) {
          return true;
        }

        if (filters.status !== undefined && adapter.status !== filters.status) {
          return false;
        }

        if (filters.adapter_type !== undefined && adapter.adapter_type !== filters.adapter_type) {
          return false;
        }

        if (
          filters.registry_source !== undefined &&
          adapter.registry_source !== filters.registry_source
        ) {
          return false;
        }

        return true;
      })
      .map((adapter) => cloneRecord(adapter));
  }

  function updateAdapterStatus(adapterId: string, nextStatus: AdapterStatus): AOCAdapterRecord {
    const current = adaptersById.get(adapterId);
    if (!current) {
      throw new AdapterRegistryError(`Adapter ${adapterId} is not registered.`);
    }

    if (!ALLOWED_STATUS_TRANSITIONS[current.status].includes(nextStatus)) {
      throw new AdapterRegistryError(
        `Invalid status transition: ${current.status} -> ${nextStatus}. Re-registration is required when revoked.`,
      );
    }

    const updated: AOCAdapterRecord = {
      ...current,
      status: nextStatus,
      updated_at: new Date().toISOString().slice(0, 19) + 'Z',
    };

    validateAdapterRecord(updated);
    const normalized = normalizeAdapterRecord(updated);
    adaptersById.set(adapterId, normalized);

    return cloneRecord(normalized);
  }

  function resolveAdapter(adapterId: string): AOCAdapterRecord | null {
    return resolveAdapterWith(adapterId, getAdapterById);
  }

  return {
    registerAdapter,
    getAdapterById,
    listAdapters,
    updateAdapterStatus,
    resolveAdapter,
  };
}
