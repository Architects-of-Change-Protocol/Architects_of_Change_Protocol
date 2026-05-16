import { transitionExecutionState, validateExecutionTransition } from '../lifecycle';

describe('execution lifecycle transitions', () => {
  it('allows deterministic valid transitions', () => {
    expect(validateExecutionTransition('planned', 'running')).toBe(true);
    expect(transitionExecutionState('running', 'checkpointed')).toBe('checkpointed');
    expect(transitionExecutionState('suspended', 'resumed')).toBe('resumed');
  });

  it('fails closed on invalid transitions', () => {
    expect(validateExecutionTransition('completed', 'running')).toBe(false);
    expect(() => transitionExecutionState('completed', 'running')).toThrow(/Invalid execution transition/);
  });
});
