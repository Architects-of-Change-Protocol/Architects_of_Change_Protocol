export type PricingRule = {
  resource: string;
  action: string;
  unit_price: number;
  currency: 'AOC';
};

export type BillableEvent = {
  event_id: string;
  consumer_id: string;
  resource: string;
  action: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  currency: 'AOC';
  occurred_at: string;
  audit_event_id?: string;
};

export type MonetizationUsageEvent = {
  consumer_id: string;
  resource: string;
  action: string;
  quantity: number;
  occurred_at: string;
  audit_event_id?: string;
};

export type BillableEventQuery = {
  consumer_id?: string;
  resource?: string;
  action?: string;
  from?: Date;
  to?: Date;
};

export type ConsumerBillingSummary = {
  consumer_id: string;
  currency: 'AOC';
  total_quantity: number;
  total_price: number;
  total_events: number;
  by_resource_action: Array<{
    resource: string;
    action: string;
    quantity: number;
    total_price: number;
    event_count: number;
  }>;
};
