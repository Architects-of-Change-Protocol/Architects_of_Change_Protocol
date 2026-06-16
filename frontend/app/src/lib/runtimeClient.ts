import { HostedRuntimeClient } from '../../../../runtime/sdk/client';

export const runtimeClient = new HostedRuntimeClient({
  baseUrl: 'http://localhost:8787',
  apiKey: 'aoc_free_dev_key',
});
