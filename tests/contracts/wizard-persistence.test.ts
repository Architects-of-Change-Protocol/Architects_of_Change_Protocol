import { handleActivate, PersistenceResult } from '../../src/wizard/projectWizard';

describe('wizard', () => {
  it('handleActivate gates navigation on status=success', async () => {
    const navigate = jest.fn();
    const persist = jest.fn().mockResolvedValue({ status: 'success', projectId: 'proj-123' } satisfies PersistenceResult);
    await handleActivate(persist, navigate);
    expect(navigate).toHaveBeenCalledWith('/projects/proj-123');
  });

  it('has exactly one redirect to project after persistence', async () => {
    const navigate = jest.fn();
    const persist = jest.fn().mockResolvedValue({ status: 'success', projectId: 'proj-456' } satisfies PersistenceResult);
    await handleActivate(persist, navigate);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/projects/proj-456');
  });

  it('does NOT call router.push before persistence check', async () => {
    const navigate = jest.fn();
    let persistResolve!: (v: PersistenceResult) => void;
    const persist = jest.fn().mockReturnValue(
      new Promise<PersistenceResult>((res) => { persistResolve = res; }),
    );
    const activation = handleActivate(persist, navigate);
    // navigate must not be called before persistence resolves
    expect(navigate).not.toHaveBeenCalled();
    persistResolve({ status: 'success', projectId: 'proj-789' });
    await activation;
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
