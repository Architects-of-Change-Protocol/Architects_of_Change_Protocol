import { createRuntimeClient, type HostedRuntimeSdk } from '../../packages/aoc-sdk/src';

const runtime: HostedRuntimeSdk = {
  evaluateEnforcement: async () => ({ allowed: true }),
  authorizeExecution: async () => ({ decision: 'allow' }),
  mintCapability: async () => ({ capability_id: 'cap_1' }),
  createAccessRequest: async () => ({ request_id: 'ar_1' }),
  decideAccessRequest: async () => ({ status: 'approved' }),
  listAuditEvents: async () => ([]),
  getUsageSummary: async () => ({})
};

const client = createRuntimeClient(runtime);
void client.evaluateEnforcement({});
