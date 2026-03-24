import type { CapabilityTokenV1 } from '../../capability/types';
import type { ConsentObjectV1 } from '../../consent/types';
import type { AIInterpreterResponse } from '../../interpreter/interpreterTypes';
import type {
  CapabilityAccessDecision,
  CapabilityAccessRequest,
  CapabilityResource
} from '../capabilities/core';
import type {
  CapabilityConsumptionDecision,
  CapabilityConsumptionRequest
} from '../capabilities/runtime';
import type { MarketMakerRegistry } from '../capabilities/market/marketMakerRegistry';
import { evaluateCapabilityAccess } from '../capabilities/core/evaluateCapabilityAccess';
import { consumeCapabilityAccess } from '../capabilities/runtime/consumeCapabilityAccess';
import { interpretWithCapability } from '../capabilities/interpreter/interpretWithCapability';

export type ExecuteCapabilityFlowRequest = {
  capability: CapabilityTokenV1;
  consent?: ConsentObjectV1 | null;
  action: string;
  resource: CapabilityResource;
  marketMakerId?: string;
  marketMakerRegistry?: Pick<MarketMakerRegistry, 'exists' | 'getStatus'>;
  now?: string | number | Date;
  paymentContext?: {
    paid: boolean;
  };
  rateLimit?: CapabilityConsumptionRequest['rateLimit'];
  registries?: CapabilityConsumptionRequest['registries'];
  hooks?: CapabilityAccessRequest['hooks'];
  interpreter?: {
    enabled: boolean;
    query: string;
    context?: Record<string, unknown>;
  };
};

export type ExecuteCapabilityFlowResponse = {
  allowed: boolean;
  stage: 'evaluation' | 'consumption' | 'interpretation';
  evaluation: CapabilityAccessDecision;
  consumption?: CapabilityConsumptionDecision;
  interpretation?: AIInterpreterResponse;
  reasonCode?: string;
  reason?: string;
};

function normalizeResourceForInterpreter(resource: CapabilityResource): string {
  if (typeof resource === 'string') {
    return resource;
  }
  return `${resource.type}:${resource.ref}`;
}

export function executeCapabilityFlow(
  request: ExecuteCapabilityFlowRequest
): ExecuteCapabilityFlowResponse {
  const evaluation = evaluateCapabilityAccess({
    capability: request.capability,
    consent: request.consent,
    action: request.action,
    resource: request.resource,
    marketMakerId: request.marketMakerId,
    marketMakerRegistry: request.marketMakerRegistry,
    now: request.now,
    hooks: request.hooks
  });

  if (!evaluation.allowed) {
    return {
      allowed: false,
      stage: 'evaluation',
      evaluation,
      reasonCode: evaluation.reasonCode,
      reason: evaluation.reason
    };
  }

  const consumption = consumeCapabilityAccess({
    capability: request.capability,
    consent: request.consent,
    action: request.action,
    resource: request.resource,
    marketMakerId: request.marketMakerId,
    marketMakerRegistry: request.marketMakerRegistry,
    now: request.now,
    paymentContext: request.paymentContext,
    rateLimit: request.rateLimit,
    hooks: request.hooks,
    registries: request.registries
  });

  if (!consumption.allowed) {
    return {
      allowed: false,
      stage: 'consumption',
      evaluation,
      consumption,
      reasonCode: consumption.reasonCode,
      reason: consumption.reason
    };
  }

  if (!request.interpreter?.enabled) {
    return {
      allowed: true,
      stage: 'consumption',
      evaluation,
      consumption,
      reasonCode: consumption.reasonCode,
      reason: consumption.reason
    };
  }

  const interpretation = interpretWithCapability(
    {
      capability: request.capability,
      consent: request.consent ?? undefined,
      action: request.action,
      resource: normalizeResourceForInterpreter(request.resource),
      now:
        request.now instanceof Date
          ? request.now.toISOString().replace(/\.\d{3}Z$/, 'Z')
          : typeof request.now === 'number'
            ? new Date(request.now).toISOString().replace(/\.\d{3}Z$/, 'Z')
            : request.now,
      paymentContext: request.paymentContext,
      input: {
        query: request.interpreter.query,
        context: request.interpreter.context
      }
    },
    {
      marketMakerRegistry: request.marketMakerRegistry,
      hooks: request.hooks,
      registries: request.registries
    }
  );

  return {
    allowed: interpretation.allowed,
    stage: 'interpretation',
    evaluation,
    consumption,
    interpretation,
    reasonCode: interpretation.allowed ? undefined : interpretation.error?.code,
    reason: interpretation.allowed ? undefined : interpretation.error?.message
  };
}
