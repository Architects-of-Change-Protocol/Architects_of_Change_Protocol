import { HrkeyPayoutEngine } from '../payoutEngine';

describe('HrkeyPayoutEngine', () => {
  it('uses local execution path when USE_AOC_PAYOUT_ENGINE is disabled', async () => {
    const engine = new HrkeyPayoutEngine({
      useAocPayoutEngine: false,
      localExecute: () => ({ allowed: true, reason_code: 'LOCAL_OK' }),
    });

    const result = await engine.execute({
      withdrawal_id: 'wd_1',
      subject_hash: '0xsubjecthash01',
      consumer_id: 'hrkey-v1',
      amount: '100.00',
      wallet_address: '0xabc123',
    });

    expect(result.allowed).toBe(true);
    expect(result.reason_code).toBe('LOCAL_OK');
  });

  it('calls AOC payout endpoint when USE_AOC_PAYOUT_ENGINE is enabled', async () => {
    const engine = new HrkeyPayoutEngine({
      useAocPayoutEngine: true,
      client: {
        executePayout: async () => ({
          allowed: true,
          reason_code: 'PAYOUT_ALLOWED',
          payout_id: 'rlusd_wd_1',
          provider_status: 'queued',
        }),
      } as never,
    });

    const result = await engine.execute({
      withdrawal_id: 'wd_1',
      subject_hash: '0xsubjecthash01',
      consumer_id: 'hrkey-v1',
      amount: '100.00',
      wallet_address: '0xabc123',
    });

    expect(result.allowed).toBe(true);
    expect(result.reason_code).toBe('PAYOUT_ALLOWED');
    expect(result.payout_id).toBe('rlusd_wd_1');
  });
});
