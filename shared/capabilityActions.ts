const ACTION_PATTERN = /^[a-z][a-z0-9-]*$/;

export const canonicalCapabilityActions = [
  'read',
  'store',
  'share',
  'derive',
  'aggregate'
] as const;

export type CanonicalCapabilityAction =
  (typeof canonicalCapabilityActions)[number];

const canonicalCapabilityActionSet = new Set<string>(canonicalCapabilityActions);

export function isCanonicalCapabilityAction(action: string): action is CanonicalCapabilityAction {
  return canonicalCapabilityActionSet.has(action);
}

export function validateCapabilityAction(action: string, context: string): void {
  if (typeof action !== 'string' || !ACTION_PATTERN.test(action)) {
    throw new Error(`${context}: must be lowercase alphanumeric with hyphens.`);
  }

  if (!isCanonicalCapabilityAction(action)) {
    throw new Error(
      `${context} must be one of: ${canonicalCapabilityActions.join(', ')}.`
    );
  }
}

export function validateCapabilityActions(
  actions: string[],
  options: {
    containerLabel: string;
    itemLabel: string;
    emptyMessage: string;
    maxEntries: number;
  }
): void {
  if (!Array.isArray(actions) || actions.length === 0) {
    throw new Error(options.emptyMessage);
  }

  if (actions.length > options.maxEntries) {
    throw new Error(
      `${options.containerLabel} must not exceed ${options.maxEntries} entries.`
    );
  }

  const seen = new Set<string>();
  for (let i = 0; i < actions.length; i++) {
    validateCapabilityAction(actions[i], `${options.itemLabel} ${i}`);

    if (seen.has(actions[i])) {
      throw new Error(`${options.containerLabel} contain duplicate: "${actions[i]}".`);
    }

    seen.add(actions[i]);
  }
}
