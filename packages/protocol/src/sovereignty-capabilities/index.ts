export {
  SOVEREIGNTY_CAPABILITY_IDS,
  SOVEREIGNTY_CAPABILITY_KEYS,
  SOVEREIGNTY_CAPABILITY_NAMESPACE,
  isSovereigntyCapabilityId,
  isSovereigntyCapabilityKey,
} from './ids';
export type {
  SovereigntyCapabilityId,
  SovereigntyCapabilityKey,
  SovereigntyCapabilityNamespace,
} from './ids';

export type { SovereigntyCapabilityDefinition, SovereigntyCapabilityVersion } from './types';

export { SOVEREIGNTY_CAPABILITIES } from './definitions';

export {
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  listSovereigntyCapabilities,
} from './registry';
