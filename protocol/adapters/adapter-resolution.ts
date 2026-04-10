import type { AOCAdapterRecord } from './adapter-types';

export function resolveAdapter(
  adapterId: string,
  resolver: (adapterId: string) => AOCAdapterRecord | null,
): AOCAdapterRecord | null {
  return resolver(adapterId);
}
