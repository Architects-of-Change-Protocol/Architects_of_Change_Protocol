import { HostedRuntimeClient } from '../../runtime';
import type { PayoutExecuteResult, RlusdWithdrawalRequest } from '../../runtime';

export type HrkeyPayoutEngineOptions = {
  useAocPayoutEngine?: boolean;
  client?: HostedRuntimeClient;
  localExecute?: (request: RlusdWithdrawalRequest) => PayoutExecuteResult;
};

function parseUseAocPayoutEngine(flag?: boolean): boolean {
  if (flag !== undefined) {
    return flag;
  }

  return process.env.USE_AOC_PAYOUT_ENGINE === 'true';
}

export class HrkeyPayoutEngine {
  private readonly useAocPayoutEngine: boolean;
  private readonly client: HostedRuntimeClient;
  private readonly localExecute: (request: RlusdWithdrawalRequest) => PayoutExecuteResult;

  constructor(options: HrkeyPayoutEngineOptions = {}) {
    this.useAocPayoutEngine = parseUseAocPayoutEngine(options.useAocPayoutEngine);
    this.client = options.client ?? new HostedRuntimeClient();
    this.localExecute =
      options.localExecute ??
      ((request) => ({
        allowed: false,
        reason_code: `LOCAL_PAYOUT_ENGINE_UNAVAILABLE_${request.withdrawal_id}`,
      }));
  }

  async execute(request: RlusdWithdrawalRequest): Promise<PayoutExecuteResult> {
    if (!this.useAocPayoutEngine) {
      return this.localExecute(request);
    }

    return this.client.executePayout(request);
  }
}
