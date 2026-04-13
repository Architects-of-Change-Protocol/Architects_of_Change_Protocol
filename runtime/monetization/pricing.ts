import type { PricingRule } from './types';

function toPricingKey(resource: string, action: string): string {
  return `${resource}::${action}`;
}

export class InMemoryPricingRegistry {
  private readonly rules = new Map<string, PricingRule>();

  constructor(initialRules: PricingRule[] = []) {
    for (const rule of initialRules) {
      this.setRule(rule);
    }
  }

  setRule(rule: PricingRule): void {
    this.rules.set(toPricingKey(rule.resource, rule.action), { ...rule });
  }

  getRule(resource: string, action: string): PricingRule | undefined {
    const rule = this.rules.get(toPricingKey(resource, action));
    return rule === undefined ? undefined : { ...rule };
  }

  listRules(): PricingRule[] {
    return [...this.rules.values()]
      .map((rule) => ({ ...rule }))
      .sort((a, b) => `${a.resource}:${a.action}`.localeCompare(`${b.resource}:${b.action}`));
  }
}
