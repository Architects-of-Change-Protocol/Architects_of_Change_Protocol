import { AIConnectorAttestation, RuntimeEvent, TenantId } from './types';

export interface AIRuntimeConnector {
  provider: AIConnectorAttestation['provider'];
  attest(input: AIConnectorAttestation, tenantId: TenantId, relationshipId: string, sequence: number): RuntimeEvent;
}

abstract class BaseConnector implements AIRuntimeConnector {
  abstract provider: AIConnectorAttestation['provider'];

  attest(input: AIConnectorAttestation, tenantId: TenantId, relationshipId: string, sequence: number): RuntimeEvent {
    return {
      eventId: `${tenantId}-${relationshipId}-${sequence}-${this.provider}`,
      tenantId,
      relationshipId,
      type: 'ai.execution.attested',
      ts: new Date().toISOString(),
      sequence,
      replaySafe: true,
      payload: { ...input, provider: this.provider, attestedAt: new Date().toISOString() },
    };
  }
}

export class OpenAIConnector extends BaseConnector {
  provider: AIConnectorAttestation['provider'] = 'openai';
}

export class AnthropicConnector extends BaseConnector {
  provider: AIConnectorAttestation['provider'] = 'anthropic';
}

export class LocalModelConnector extends BaseConnector {
  provider: AIConnectorAttestation['provider'] = 'local';
}
