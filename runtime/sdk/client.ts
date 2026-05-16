import { authorizeExecution, type ExecutionAuthorizationResult } from '../../protocol/execution';
import { evaluateEnforcement, type EnforcementDecision } from '../../protocol/enforcement';
import { mintCapability, type MintCapabilityInput, type ProtocolCapability } from '../../protocol/capability';
import type { DataAccessDecision, DataAccessRequestInput } from '../access/types';
import type { RuntimeAuditEvent } from '../audit/service';
import type { GrantConsentInput, RegisterCredentialInput, VerifyIdentityInput } from '../trust/service';
import type {
  AocIdentityConsentRecord,
  AocIdentityCredentialRecord,
  IdentityVerificationResult,
  RlusdWithdrawalRequest,
} from '../trust/types';
import type { RuntimeMode } from '../types/api-types';
import { RUNTIME_HANDSHAKE_PATH, RUNTIME_TRANSPORT_VERSION, type RuntimeHandshakeEnvelope, type RuntimeResponseEnvelope } from '../types/transport';
import type { PayoutCallbackInput, PayoutExecuteResult } from '../payout/types';
import type { MeteredRuntimeEndpoint, UsageSummaryResult } from '../usage';
import type { AccessRequest, ConsentDecision, CreateAccessRequestInput, GrantedAccess } from '../controlPlane';

type FetchLike = typeof fetch;
export type HostedRuntimeClientOptions = { apiKey?: string; baseUrl?: string; mode?: RuntimeMode; fetchImpl?: FetchLike; validateCompatibilityOnInit?: boolean };
export type ListAuditEventsInput = { subject_hash?: string; consumer_id?: string; event_type?: string; from?: string; to?: string };
export type GetUsageSummaryInput = { consumer_id: string; endpoint?: MeteredRuntimeEndpoint; from?: string; to?: string };
export type PayoutCallbackResult = { received: true; reason_code: string };
export interface HostedRuntimeSdk { /* unchanged */
  registerCredential(input: RegisterCredentialInput): Promise<AocIdentityCredentialRecord>; verifyIdentity(input: VerifyIdentityInput): Promise<IdentityVerificationResult>; grantIdentityConsent(input: GrantConsentInput): Promise<AocIdentityConsentRecord>; executePayout(input: RlusdWithdrawalRequest): Promise<PayoutExecuteResult>; callbackPayout(input: PayoutCallbackInput): Promise<PayoutCallbackResult>; requestDataAccess(input: DataAccessRequestInput): Promise<DataAccessDecision>; listAuditEvents(input?: ListAuditEventsInput): Promise<RuntimeAuditEvent[]>; getUsageSummary(input: GetUsageSummaryInput): Promise<UsageSummaryResult>; createAccessRequest(input: CreateAccessRequestInput): Promise<AccessRequest>; listAccessRequests(input: { subject_id: string; requester_id?: string; status?: 'pending' | 'approved' | 'denied'; }): Promise<AccessRequest[]>; decideAccessRequest(input: { request_id: string; subject_id: string; decision: 'approve' | 'deny'; reason?: string; }): Promise<{ request: AccessRequest; decision: ConsentDecision; grant?: GrantedAccess }>; listActiveGrants(input?: { subject_id?: string; requester_id?: string }): Promise<GrantedAccess[]>; revokeGrant(input: { grant_id: string; subject_id?: string; requester_id?: string }): Promise<GrantedAccess>; }

async function parseEnvelope<T>(response: Response): Promise<T> {
  const parsed = (await response.json()) as RuntimeResponseEnvelope<T>;
  if (!parsed.success) throw new Error(`[${parsed.error.code}] ${parsed.error.message}`);
  return parsed.data;
}

export class HostedRuntimeClient implements HostedRuntimeSdk {
  private readonly mode: RuntimeMode; private readonly apiKey?: string; private readonly baseUrl: string; private readonly fetchImpl: FetchLike; private readonly correlationId: string;
  constructor(options: HostedRuntimeClientOptions = {}) { this.mode = options.mode ?? 'remote'; this.apiKey = options.apiKey; this.baseUrl = options.baseUrl ?? 'http://localhost:8787'; this.fetchImpl = options.fetchImpl ?? fetch; this.correlationId = `corr_${Date.now()}`; if (options.validateCompatibilityOnInit !== false && this.mode === 'remote') void this.validateCompatibility(); }
  private requireApiKey(): void { if (this.apiKey === undefined || this.apiKey.trim() === '') throw new Error('HostedRuntimeClient remote mode requires apiKey.'); }
  private async validateCompatibility(): Promise<void> { this.requireApiKey(); const response = await this.fetchImpl(`${this.baseUrl}${RUNTIME_HANDSHAKE_PATH}`, { method: 'GET', headers: { 'x-api-key': this.apiKey!, 'x-correlation-id': this.correlationId } }); const handshake = await parseEnvelope<RuntimeHandshakeEnvelope>(response); if (handshake.transportVersion !== RUNTIME_TRANSPORT_VERSION) throw new Error(`[COMPATIBILITY_FAILURE] SDK transport ${RUNTIME_TRANSPORT_VERSION} incompatible with runtime ${handshake.transportVersion}.`); }
  private async post<TReq,TRes>(path:string,payload:TReq):Promise<TRes>{ this.requireApiKey(); const response=await this.fetchImpl(`${this.baseUrl}${path}`,{method:'POST',headers:{'content-type':'application/json','x-api-key':this.apiKey!,'x-correlation-id':this.correlationId},body:JSON.stringify(payload)}); return parseEnvelope<TRes>(response); }
  private async get<TRes>(path:string,params:Record<string,string|undefined>):Promise<TRes>{ this.requireApiKey(); const url=new URL(`${this.baseUrl}${path}`); Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v.trim()!=='')url.searchParams.set(k,v);}); const response=await this.fetchImpl(url,{method:'GET',headers:{'x-api-key':this.apiKey!,'x-correlation-id':this.correlationId}}); return parseEnvelope<TRes>(response); }
  async evaluateEnforcement(input: Parameters<typeof evaluateEnforcement>[0]): Promise<EnforcementDecision> { return this.mode==='local'?evaluateEnforcement(input):this.post('/enforcement/evaluate',input); }
  async authorizeExecution(input: Parameters<typeof authorizeExecution>[0]): Promise<ExecutionAuthorizationResult> { return this.mode==='local'?authorizeExecution(input):this.post('/execution/authorize',input); }
  async mintCapability(input: MintCapabilityInput): Promise<ProtocolCapability> { return this.mode==='local'?mintCapability(input):this.post('/capability/mint',input); }
  async registerCredential(input: RegisterCredentialInput){ if(this.mode==='local') throw new Error('Credential registration is only available in hosted mode.'); return this.post('/trust/credential/register',input); }
  async verifyIdentity(input: VerifyIdentityInput){ if(this.mode==='local') throw new Error('Identity verification is only available in hosted mode.'); return this.post('/trust/verify',input); }
  async grantIdentityConsent(input: GrantConsentInput){ if(this.mode==='local') throw new Error('Consent grant is only available in hosted mode.'); return this.post('/trust/consent/grant',input); }
  async executePayout(input: RlusdWithdrawalRequest){ if(this.mode==='local') throw new Error('Payout execution is only available in hosted mode.'); return this.post('/payout/execute',input); }
  async callbackPayout(input: PayoutCallbackInput){ if(this.mode==='local') throw new Error('Payout callback is only available in hosted mode.'); return this.post('/payout/callback',input); }
  async requestDataAccess(input: DataAccessRequestInput){ if(this.mode==='local') throw new Error('Data access requests are only available in hosted mode.'); return this.post('/data/access',input); }
  async listAuditEvents(input: ListAuditEventsInput = {}){ if(this.mode==='local') throw new Error('Audit event listing is only available in hosted mode.'); const r=await this.get<{events:RuntimeAuditEvent[]}>('/audit/events',input); return r.events; }
  async getUsageSummary(input: GetUsageSummaryInput){ if(this.mode==='local') throw new Error('Usage summary is only available in hosted mode.'); return this.get('/usage/summary',input); }
  async createAccessRequest(input: CreateAccessRequestInput){ if(this.mode==='local') throw new Error('Control-plane access request endpoints are only available in hosted mode.'); return this.post('/access/request',input); }
  async listAccessRequests(input:{subject_id:string;requester_id?:string;status?:'pending'|'approved'|'denied';}){ if(this.mode==='local') throw new Error('Control-plane access request endpoints are only available in hosted mode.'); return this.get('/access/requests',input); }
  async decideAccessRequest(input:{request_id:string;subject_id:string;decision:'approve'|'deny';reason?:string;}){ if(this.mode==='local') throw new Error('Control-plane access request endpoints are only available in hosted mode.'); return this.post('/access/request/decision',input); }
  async listActiveGrants(input:{subject_id?:string;requester_id?:string}={}){ if(this.mode==='local') throw new Error('Control-plane grant endpoints are only available in hosted mode.'); return this.get('/access/grants/active',input); }
  async revokeGrant(input:{grant_id:string;subject_id?:string;requester_id?:string}){ if(this.mode==='local') throw new Error('Control-plane grant endpoints are only available in hosted mode.'); return this.post('/access/grant/revoke',input); }
}
