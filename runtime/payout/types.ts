import type { RlusdWithdrawalRequest } from '../trust/types';

export type PayoutExecuteResult = {
  allowed: boolean;
  reason_code: string;
  payout_id?: string;
  provider_status?: 'queued' | 'completed' | 'failed';
};

export type PayoutCallbackInput = {
  payout_id: string;
  provider_status: 'queued' | 'completed' | 'failed';
  provider_ref?: string;
  reason_code?: string;
  occurred_at?: string;
};

export type PayoutAuditEvent = {
  event_type: 'PAYOUT_EXECUTION_REQUESTED' | 'PAYOUT_EXECUTION_RESULT' | 'PAYOUT_CALLBACK_RECEIVED';
  at: string;
  withdrawal_id?: string;
  payout_id?: string;
  reason_code: string;
  provider_status?: 'queued' | 'completed' | 'failed';
};

export type PayoutExecutionContext = {
  request: RlusdWithdrawalRequest;
  kycDecision: { allowed: boolean; reason_code: string };
};

export type PayoutAdapterResult = {
  payout_id: string;
  provider_status: 'queued' | 'completed' | 'failed';
  reason_code: string;
};

export interface PayoutAdapter {
  execute(context: PayoutExecutionContext): PayoutAdapterResult;
}
