export type UploadPayload = {
  documents: string[];
  metadata?: Record<string, unknown>;
};

export type ExtractionResult = {
  content: string;
  source: 'upload' | 'copilot';
};

export type PressureItem = {
  id: string;
  unresolved: boolean;
  createdAt: Date;
};

export function createUploadPayload(
  files: string[],
  metadata?: Record<string, unknown>,
): UploadPayload {
  return { documents: files, metadata };
}

export async function extractWithTimeout(
  extract: () => Promise<string>,
  timeoutMs: number,
): Promise<string> {
  const timeout = new Promise<string>((resolve) => setTimeout(() => resolve(''), timeoutMs));
  return Promise.race([extract(), timeout]);
}

export function appendToOperationalMemory(
  memory: ExtractionResult[],
  result: ExtractionResult,
): ExtractionResult[] {
  return [...memory, result];
}

export function getPressureWeight(item: PressureItem, now: Date = new Date()): number {
  if (!item.unresolved) return 0;
  const ageMs = now.getTime() - item.createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.min(1, 0.1 + ageDays * 0.1);
}
