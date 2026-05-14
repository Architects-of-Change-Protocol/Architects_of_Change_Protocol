export type ScopeEffect = 'allow' | 'deny';

export interface ScopeSegmentRule {
  readonly segment: string;
  readonly wildcard: '*' | '**' | null;
}

export interface ScopeExpression {
  readonly namespace: string;
  readonly path: readonly ScopeSegmentRule[];
  readonly operation: string;
  readonly effect: ScopeEffect;
}

export interface ScopeGrammarModel {
  readonly schemaVersion: '1.0.0';
  readonly grammarId: string;
  readonly namespacePattern: 'domain:resource:action' | 'custom';
  readonly wildcardRules: {
    readonly singleSegment: '*';
    readonly recursive: '**';
  };
  readonly attenuationSemantics: {
    readonly canReduceNamespace: boolean;
    readonly canReduceOperations: boolean;
    readonly canAddConstraints: boolean;
    readonly canRemoveDenies: false;
  };
  readonly hierarchicalInheritance: {
    readonly enabled: true;
    readonly parentSeparator: ':' | '/';
  };
  readonly precedence: {
    readonly denyOverridesAllow: true;
    readonly moreSpecificOverridesBroad: true;
  };
}

export const scopeGrammarSchemaExample = {
  $id: 'https://aoc.protocol/schemas/scope-grammar-model/1-0-0',
  type: 'object',
  required: ['schemaVersion', 'grammarId', 'namespacePattern', 'wildcardRules', 'attenuationSemantics', 'hierarchicalInheritance', 'precedence'],
} as const;
