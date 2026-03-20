import { defineCapabilityRegistry, indexCapabilitiesById } from './registry';
import type { ProtocolCapabilityDefinition } from './types';

export const financialCapabilities = defineCapabilityRegistry([
  {
    id: 'financial.wallet.balance.read',
    description: 'Read the current balance exposed for a wallet account or sub-account.',
    resource_type: 'wallet',
    access_level: 'read',
    sensitivity_level: 'high',
    requires_user_consent: true
  },
  {
    id: 'financial.wallet.tx.read',
    description: 'Read wallet transaction history, including inflows, outflows, and transfers.',
    resource_type: 'wallet',
    access_level: 'read',
    sensitivity_level: 'high',
    requires_user_consent: true
  },
  {
    id: 'financial.portfolio.snapshot.read',
    description: 'Read point-in-time holdings and valuation snapshots for a portfolio.',
    resource_type: 'portfolio',
    access_level: 'read',
    sensitivity_level: 'high',
    requires_user_consent: true
  },
  {
    id: 'financial.portfolio.aggregate.read',
    description: 'Read portfolio-level aggregates such as total allocation, exposure, and summary metrics.',
    resource_type: 'portfolio',
    access_level: 'read',
    sensitivity_level: 'medium',
    requires_user_consent: true
  },
  {
    id: 'financial.insight.read',
    description: 'Read derived financial insights generated from wallet or portfolio data.',
    resource_type: 'insight',
    access_level: 'read',
    sensitivity_level: 'medium',
    requires_user_consent: true
  },
  {
    id: 'financial.insight.write',
    description: 'Write or attach derived financial insights back into an authorized insight resource.',
    resource_type: 'insight',
    access_level: 'write',
    sensitivity_level: 'high',
    requires_user_consent: true
  }
] as const satisfies readonly ProtocolCapabilityDefinition[]);

export type FinancialCapabilityId = (typeof financialCapabilities)[number]['id'];

export const financialCapabilitiesById = indexCapabilitiesById(financialCapabilities);

export function getFinancialCapability(
  capabilityId: FinancialCapabilityId
): (typeof financialCapabilitiesById)[FinancialCapabilityId] {
  return financialCapabilitiesById[capabilityId];
}
