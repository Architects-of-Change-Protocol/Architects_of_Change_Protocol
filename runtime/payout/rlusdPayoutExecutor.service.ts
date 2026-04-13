import type { InMemoryTrustService } from '../trust/service';
import type { PayoutAdapter } from './types';
import type { PayoutAuditEvent, PayoutCallbackInput, PayoutExecuteResult } from './types';
import type { RlusdWithdrawalRequest } from '../trust/types';

export class RlusdPayoutExecutorService {
  private readonly auditEvents: PayoutAuditEvent[] = [];
  private readonly idempotentResults = new Map<string, PayoutExecuteResult>();

  constructor(
    private readonly trustService: InMemoryTrustService,
    private readonly adapter: PayoutAdapter
  ) {}

  getAuditEvents(): readonly PayoutAuditEvent[] {
    return [...this.auditEvents];
  }

  execute(request: RlusdWithdrawalRequest, now: Date = new Date()): PayoutExecuteResult {
    const cached = this.idempotentResults.get(request.withdrawal_id);
    if (cached !== undefined) {
      return cached;
    }

    this.auditEvents.push({
      event_type: 'PAYOUT_EXECUTION_REQUESTED',
      at: now.toISOString(),
      withdrawal_id: request.withdrawal_id,
      reason_code: 'PAYOUT_REQUEST_RECEIVED',
    });

    const kycDecision = this.trustService.enforcePayoutKyc(request, now);
    if (!kycDecision.allowed) {
      const blocked: PayoutExecuteResult = {
        allowed: false,
        reason_code: kycDecision.reason_code,
      };
      this.idempotentResults.set(request.withdrawal_id, blocked);
      this.auditEvents.push({
        event_type: 'PAYOUT_EXECUTION_RESULT',
        at: now.toISOString(),
        withdrawal_id: request.withdrawal_id,
        reason_code: blocked.reason_code,
        provider_status: 'failed',
      });
      return blocked;
    }

    const adapterResult = this.adapter.execute({ request, kycDecision });
    const allowed: PayoutExecuteResult = {
      allowed: true,
      reason_code: adapterResult.reason_code,
      payout_id: adapterResult.payout_id,
      provider_status: adapterResult.provider_status,
    };
    this.idempotentResults.set(request.withdrawal_id, allowed);
    this.auditEvents.push({
      event_type: 'PAYOUT_EXECUTION_RESULT',
      at: now.toISOString(),
      withdrawal_id: request.withdrawal_id,
      payout_id: adapterResult.payout_id,
      reason_code: adapterResult.reason_code,
      provider_status: adapterResult.provider_status,
    });

    return allowed;
  }

  callback(input: PayoutCallbackInput, now: Date = new Date()): { received: true; reason_code: string } {
    this.auditEvents.push({
      event_type: 'PAYOUT_CALLBACK_RECEIVED',
      at: input.occurred_at ?? now.toISOString(),
      payout_id: input.payout_id,
      reason_code: input.reason_code ?? 'PAYOUT_CALLBACK_RECEIVED',
      provider_status: input.provider_status,
    });

    return {
      received: true,
      reason_code: input.reason_code ?? 'PAYOUT_CALLBACK_RECEIVED',
    };
  }
}
