import { InMemoryPricingRegistry } from './pricing';
import type {
  BillableEvent,
  BillableEventQuery,
  ConsumerBillingSummary,
  MonetizationUsageEvent,
  PricingRule,
} from './types';

function roundMoney(value: number): number {
  return Number(value.toFixed(6));
}

function cloneEvent(event: BillableEvent): BillableEvent {
  return { ...event };
}

export class InMemoryMonetizationService {
  private readonly pricingRegistry: InMemoryPricingRegistry;
  private readonly billableEvents: BillableEvent[] = [];
  private idSequence = 0;

  constructor(pricingRegistry: InMemoryPricingRegistry = new InMemoryPricingRegistry()) {
    this.pricingRegistry = pricingRegistry;
  }

  getPricingRegistry(): InMemoryPricingRegistry {
    return this.pricingRegistry;
  }

  recordUsageAsBillable(usageEvent: MonetizationUsageEvent, pricingRule?: PricingRule): BillableEvent | undefined {
    const rule = pricingRule ?? this.pricingRegistry.getRule(usageEvent.resource, usageEvent.action);
    if (rule === undefined) {
      return undefined;
    }

    this.idSequence += 1;
    const billableEvent: BillableEvent = {
      event_id: `billable_${String(this.idSequence).padStart(8, '0')}`,
      consumer_id: usageEvent.consumer_id,
      resource: usageEvent.resource,
      action: usageEvent.action,
      unit_price: rule.unit_price,
      quantity: usageEvent.quantity,
      total_price: roundMoney(rule.unit_price * usageEvent.quantity),
      currency: rule.currency,
      occurred_at: usageEvent.occurred_at,
      audit_event_id: usageEvent.audit_event_id,
    };

    this.billableEvents.push(billableEvent);
    return cloneEvent(billableEvent);
  }

  listBillableEvents(query: BillableEventQuery = {}): BillableEvent[] {
    return this.billableEvents
      .filter((event) => {
        if (query.consumer_id !== undefined && event.consumer_id !== query.consumer_id) {
          return false;
        }
        if (query.resource !== undefined && event.resource !== query.resource) {
          return false;
        }
        if (query.action !== undefined && event.action !== query.action) {
          return false;
        }

        const occurredAtTime = Date.parse(event.occurred_at);
        if (query.from !== undefined && occurredAtTime < query.from.getTime()) {
          return false;
        }
        if (query.to !== undefined && occurredAtTime > query.to.getTime()) {
          return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at))
      .map(cloneEvent);
  }

  getConsumerSummary(consumer_id: string): ConsumerBillingSummary {
    const events = this.listBillableEvents({ consumer_id });

    const grouped = new Map<string, ConsumerBillingSummary['by_resource_action'][number]>();
    for (const event of events) {
      const key = `${event.resource}::${event.action}`;
      const existing = grouped.get(key) ?? {
        resource: event.resource,
        action: event.action,
        quantity: 0,
        total_price: 0,
        event_count: 0,
      };

      existing.quantity += event.quantity;
      existing.total_price = roundMoney(existing.total_price + event.total_price);
      existing.event_count += 1;
      grouped.set(key, existing);
    }

    const byResourceAction = [...grouped.values()]
      .map((item) => ({ ...item }))
      .sort((a, b) => `${a.resource}:${a.action}`.localeCompare(`${b.resource}:${b.action}`));

    return {
      consumer_id,
      currency: 'AOC',
      total_quantity: byResourceAction.reduce((acc, item) => acc + item.quantity, 0),
      total_price: roundMoney(byResourceAction.reduce((acc, item) => acc + item.total_price, 0)),
      total_events: events.length,
      by_resource_action: byResourceAction,
    };
  }
}
