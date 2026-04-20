import { HostedRuntimeClient } from '../../../../runtime/sdk/client';

export const MOCK_SUBJECT_ID = 'subject-1';
export const MOCK_REQUESTER_ID = 'requester-1';

export const runtimeClient = new HostedRuntimeClient({
  baseUrl: 'http://localhost:8787',
  apiKey: 'aoc_free_dev_key',
});
