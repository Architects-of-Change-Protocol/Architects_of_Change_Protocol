import { authorizeExecution, type ExecutionAuthorizationResult } from '../../protocol/execution';
import { evaluateEnforcement, type EnforcementDecision } from '../../protocol/enforcement';
import { mintCapability, type MintCapabilityInput, type ProtocolCapability } from '../../protocol/capability';
import type { GrantConsentInput, RegisterCredentialInput, VerifyIdentityInput } from '../trust/service';
import type {
  AocIdentityConsentRecord,
  AocIdentityCredentialRecord,
  IdentityVerificationResult,
  RlusdWithdrawalRequest,
} from '../trust/types';
import type { ApiResponse, RuntimeMode } from '../types/api-types';
import type { PayoutCallbackInput, PayoutExecuteResult } from '../payout/types';

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
    const code = parsed.error?.code ?? 'UNKNOWN_API_ERROR';
    const message = parsed.error?.message ?? 'Unknown API error.';
    throw new Error(`[${code}] ${message}`);
  }
  return parsed.data;
}

export type PayoutCallbackResult = { received: true; reason_code: string };

export interface HostedRuntimeSdk {
  registerCredential(input: RegisterCredentialInput): Promise<AocIdentityCredentialRecord>;
  verifyIdentity(input: VerifyIdentityInput): Promise<IdentityVerificationResult>;
  grantIdentityConsent(input: GrantConsentInput): Promise<AocIdentityConsentRecord>;
  executePayout(input: RlusdWithdrawalRequest): Promise<PayoutExecuteResult>;
  callbackPayout(input: PayoutCallbackInput): Promise<PayoutCallbackResult>;
}

export class HostedRuntimeClient implements HostedRuntimeSdk {
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

  async registerCredential(input: RegisterCredentialInput): Promise<AocIdentityCredentialRecord> {
    if (this.mode === 'local') {
      throw new Error('Credential registration is only available in hosted mode.');
    }
    return this.post('/trust/credential/register', input);
  }

  async verifyIdentity(input: VerifyIdentityInput): Promise<IdentityVerificationResult> {
    if (this.mode === 'local') {
      throw new Error('Identity verification is only available in hosted mode.');
    }
    return this.post('/trust/verify', input);
  }

  async grantIdentityConsent(input: GrantConsentInput): Promise<AocIdentityConsentRecord> {
    if (this.mode === 'local') {
      throw new Error('Consent grant is only available in hosted mode.');
    }
    return this.post('/trust/consent/grant', input);
  }

  async executePayout(input: RlusdWithdrawalRequest): Promise<PayoutExecuteResult> {
    if (this.mode === 'local') {
      throw new Error('Payout execution is only available in hosted mode.');
    }
    return this.post('/payout/execute', input);
  }
  async callbackPayout(input: PayoutCallbackInput): Promise<PayoutCallbackResult> {
    if (this.mode === 'local') {
      throw new Error('Payout callback is only available in hosted mode.');
    }
    return this.post('/payout/callback', input);
  }

}
