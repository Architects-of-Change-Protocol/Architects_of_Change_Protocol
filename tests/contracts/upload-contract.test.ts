import {
  createUploadPayload,
  extractWithTimeout,
  appendToOperationalMemory,
  getPressureWeight,
  ExtractionResult,
  PressureItem,
} from '../../src/upload/uploadHandler';

describe('upload contract', () => {
  it('upload UIs send documents field', () => {
    const payload = createUploadPayload(['file-a.pdf', 'file-b.pdf']);
    expect(Object.prototype.hasOwnProperty.call(payload, 'documents')).toBe(true);
    expect(Array.isArray(payload.documents)).toBe(true);
    expect(payload.documents).toEqual(['file-a.pdf', 'file-b.pdf']);
  });

  it('extraction and append pipeline is wired from upload and copilot', () => {
    let memory: ExtractionResult[] = [];
    const uploadResult: ExtractionResult = { content: 'extracted content', source: 'upload' };
    const copilotResult: ExtractionResult = { content: 'copilot analysis', source: 'copilot' };
    memory = appendToOperationalMemory(memory, uploadResult);
    memory = appendToOperationalMemory(memory, copilotResult);
    expect(memory).toHaveLength(2);
    expect(memory[0].source).toBe('upload');
    expect(memory[1].source).toBe('copilot');
  });

  it('unresolved pressure weight increases with age', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const older: PressureItem = { id: 'p1', unresolved: true, createdAt: new Date('2026-01-01T00:00:00Z') };
    const newer: PressureItem = { id: 'p2', unresolved: true, createdAt: new Date('2026-01-08T00:00:00Z') };
    const olderWeight = getPressureWeight(older, now);
    const newerWeight = getPressureWeight(newer, now);
    expect(olderWeight).toBeGreaterThan(newerWeight);
  });

  it('parser timeout: extractWithTimeout uses Promise.race; timeout resolves to empty string', async () => {
    jest.useFakeTimers();
    let extractResolve!: (v: string) => void;
    const slowExtract = () => new Promise<string>((res) => { extractResolve = res; });
    const resultPromise = extractWithTimeout(slowExtract, 100);
    jest.advanceTimersByTime(200);
    const result = await resultPromise;
    expect(result).toBe('');
    extractResolve('late');
    jest.useRealTimers();
  });
});
