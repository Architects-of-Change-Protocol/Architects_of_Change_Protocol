import type { PayoutAdapter, PayoutAdapterResult, PayoutExecutionContext } from '../types';

/**
 * Deterministic in-memory RLUSD adapter. Mirrors provider queue semantics while
 * preserving response shape required by existing clients.
 */
export class RlusdPayoutAdapter implements PayoutAdapter {
  execute(context: PayoutExecutionContext): PayoutAdapterResult {
    const { withdrawal_id } = context.request;

    return {
      payout_id: `rlusd_${withdrawal_id}`,
      provider_status: 'queued',
      reason_code: 'PAYOUT_ALLOWED',
    };
  }
}
