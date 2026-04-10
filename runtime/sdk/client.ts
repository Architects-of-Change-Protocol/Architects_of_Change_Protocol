import { authorizeExecution, type ExecutionAuthorizationResult } from '../../protocol/execution';
import { evaluateEnforcement, type EnforcementDecision } from '../../protocol/enforcement';
import { mintCapability, type MintCapabilityInput, type ProtocolCapability } from '../../protocol/capability';
import type { ApiResponse, RuntimeMode } from '../types/api-types';

type FetchLike = typeof fetch;

export type HostedRuntimeClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  mode?: RuntimeMode;
  fetchImpl?: FetchLike;
};

async function parseApiResponse<T>(response: Response): Promise<T> {
  const parsed = (await response.json()) as ApiResponse<T>;
  if (!parsed.success || parsed.data === undefined) {
    throw new Error(parsed.error?.message ?? parsed.error?.code ?? 'Unknown API error.');
  }
  return parsed.data;
}

export class HostedRuntimeClient {
  private readonly mode: RuntimeMode;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: HostedRuntimeClientOptions = {}) {
    this.mode = options.mode ?? 'remote';
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? 'http://localhost:8787';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async post<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse> {
    if (this.apiKey === undefined || this.apiKey.trim() === '') {
      throw new Error('HostedRuntimeClient remote mode requires apiKey.');
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    return parseApiResponse<TResponse>(response);
  }

  async evaluateEnforcement(input: Parameters<typeof evaluateEnforcement>[0]): Promise<EnforcementDecision> {
    if (this.mode === 'local') {
      return evaluateEnforcement(input);
    }

    return this.post('/enforcement/evaluate', input);
  }

  async authorizeExecution(input: Parameters<typeof authorizeExecution>[0]): Promise<ExecutionAuthorizationResult> {
    if (this.mode === 'local') {
      return authorizeExecution(input);
    }

    return this.post('/execution/authorize', input);
  }

  async mintCapability(input: MintCapabilityInput): Promise<ProtocolCapability> {
    if (this.mode === 'local') {
      return mintCapability(input);
    }

    return this.post('/capability/mint', input);
  }
}
