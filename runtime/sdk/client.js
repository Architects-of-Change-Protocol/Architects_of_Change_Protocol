import { authorizeExecution } from '../../protocol/execution';
import { evaluateEnforcement } from '../../protocol/enforcement';
import { mintCapability } from '../../protocol/capability';
import { RUNTIME_HANDSHAKE_PATH } from '../types/transport';
import { RUNTIME_TRANSPORT_VERSION, classifyTransportCompatibility } from '../versioning';
async function parseEnvelope(response) {
    const parsed = (await response.json());
    if (!parsed.success)
        throw new Error(`[${parsed.error.code}] ${parsed.error.message}`);
    return parsed.data;
}
export class HostedRuntimeClient {
    mode;
    apiKey;
    baseUrl;
    fetchImpl;
    correlationId;
    constructor(options = {}) { this.mode = options.mode ?? 'remote'; this.apiKey = options.apiKey; this.baseUrl = options.baseUrl ?? 'http://localhost:8787'; this.fetchImpl = options.fetchImpl ?? fetch; this.correlationId = `corr_${Date.now()}`; if (options.validateCompatibilityOnInit !== false && this.mode === 'remote')
        void this.validateCompatibility(); }
    requireApiKey() { if (this.apiKey === undefined || this.apiKey.trim() === '')
        throw new Error('HostedRuntimeClient remote mode requires apiKey.'); }
    async validateCompatibility() { this.requireApiKey(); const response = await this.fetchImpl(`${this.baseUrl}${RUNTIME_HANDSHAKE_PATH}`, { method: 'GET', headers: { 'x-api-key': this.apiKey, 'x-correlation-id': this.correlationId } }); const handshake = await parseEnvelope(response); const compatibility = classifyTransportCompatibility(handshake.transportVersion); if (compatibility === 'incompatible')
        throw new Error(`[COMPATIBILITY_FAILURE] SDK transport ${RUNTIME_TRANSPORT_VERSION} incompatible with runtime ${handshake.transportVersion}. Minimum supported runtime transport: ${handshake.minimumSupportedTransportVersion}.`); if (compatibility === 'warn')
        console.warn(`[COMPATIBILITY_WARNING] Runtime transport ${handshake.transportVersion} is newer than SDK transport ${RUNTIME_TRANSPORT_VERSION}.`); }
    async post(path, payload) { this.requireApiKey(); const response = await this.fetchImpl(`${this.baseUrl}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': this.apiKey, 'x-correlation-id': this.correlationId }, body: JSON.stringify(payload) }); return parseEnvelope(response); }
    async get(path, params) { this.requireApiKey(); const url = new URL(`${this.baseUrl}${path}`); Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v.trim() !== '')
        url.searchParams.set(k, v); }); const response = await this.fetchImpl(url, { method: 'GET', headers: { 'x-api-key': this.apiKey, 'x-correlation-id': this.correlationId } }); return parseEnvelope(response); }
    async evaluateEnforcement(input) { return this.mode === 'local' ? evaluateEnforcement(input) : this.post('/enforcement/evaluate', input); }
    async authorizeExecution(input) { return this.mode === 'local' ? authorizeExecution(input) : this.post('/execution/authorize', input); }
    async mintCapability(input) { return this.mode === 'local' ? mintCapability(input) : this.post('/capability/mint', input); }
    async registerCredential(input) { if (this.mode === 'local')
        throw new Error('Credential registration is only available in hosted mode.'); return this.post('/trust/credential/register', input); }
    async verifyIdentity(input) { if (this.mode === 'local')
        throw new Error('Identity verification is only available in hosted mode.'); return this.post('/trust/verify', input); }
    async grantIdentityConsent(input) { if (this.mode === 'local')
        throw new Error('Consent grant is only available in hosted mode.'); return this.post('/trust/consent/grant', input); }
    async executePayout(input) { if (this.mode === 'local')
        throw new Error('Payout execution is only available in hosted mode.'); return this.post('/payout/execute', input); }
    async callbackPayout(input) { if (this.mode === 'local')
        throw new Error('Payout callback is only available in hosted mode.'); return this.post('/payout/callback', input); }
    async requestDataAccess(input) { if (this.mode === 'local')
        throw new Error('Data access requests are only available in hosted mode.'); return this.post('/data/access', input); }
    async listAuditEvents(input = {}) { if (this.mode === 'local')
        throw new Error('Audit event listing is only available in hosted mode.'); const r = await this.get('/audit/events', input); return r.events; }
    async getUsageSummary(input) { if (this.mode === 'local')
        throw new Error('Usage summary is only available in hosted mode.'); return this.get('/usage/summary', input); }
    async createAccessRequest(input) { if (this.mode === 'local')
        throw new Error('Control-plane access request endpoints are only available in hosted mode.'); return this.post('/access/request', input); }
    async listAccessRequests(input) { if (this.mode === 'local')
        throw new Error('Control-plane access request endpoints are only available in hosted mode.'); return this.get('/access/requests', input); }
    async decideAccessRequest(input) { if (this.mode === 'local')
        throw new Error('Control-plane access request endpoints are only available in hosted mode.'); return this.post('/access/request/decision', input); }
    async listActiveGrants(input = {}) { if (this.mode === 'local')
        throw new Error('Control-plane grant endpoints are only available in hosted mode.'); return this.get('/access/grants/active', input); }
    async revokeGrant(input) { if (this.mode === 'local')
        throw new Error('Control-plane grant endpoints are only available in hosted mode.'); return this.post('/access/grant/revoke', input); }
}
