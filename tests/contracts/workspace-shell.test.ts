import { createWorkspaceShell, AWAKENING_EVENT, Imprint } from '../../src/workspace/workspaceShell';
import { OPERATIONAL_SHELL_COPY } from '../../src/workspace/operationalShell';

beforeEach(() => {
  const g = globalThis as Record<string, unknown>;
  delete g.__workspaceStorage;
});

describe('workspace shell', () => {
  it('dormantInvitation returns invitation copy when workspace is dormant', () => {
    const shell = createWorkspaceShell();
    const invitation = shell.getDormantInvitation();
    expect(invitation).toBeTruthy();
    expect(typeof invitation).toBe('string');
  });

  it('standby chip is present when workspace is dormant', () => {
    const shell = createWorkspaceShell();
    const chip = shell.getStandbyChip();
    expect(chip).not.toBeNull();
    expect(chip!.label).toBe('Standby');
  });

  it('ignition cues are present when workspace is dormant', () => {
    const shell = createWorkspaceShell();
    const cues = shell.getIgnitionCues();
    expect(Array.isArray(cues)).toBe(true);
    expect(cues.length).toBeGreaterThan(0);
  });

  it('persistAwakeningState persists state to storage', () => {
    const shell = createWorkspaceShell();
    shell.persistAwakeningState('awakening');
    const loaded = shell.loadAwakeningState();
    expect(loaded).toBe('awakening');
  });

  it('AWAKENING_EVENT subscription fires on awaken', () => {
    expect(AWAKENING_EVENT).toBe('workspace:awakening');
    const shell = createWorkspaceShell();
    const listener = jest.fn();
    shell.subscribe(listener);
    shell.awaken();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('localStorage awakening state is loaded after persist', () => {
    const shell = createWorkspaceShell();
    shell.persistAwakeningState('active');
    expect(shell.loadAwakeningState()).toBe('active');
  });

  it('imprint load returns null before any persist', () => {
    const shell = createWorkspaceShell();
    expect(shell.loadImprint()).toBeNull();
  });

  it('imprint persists and loads correctly', () => {
    const shell = createWorkspaceShell();
    const imp: Imprint = { focus: 'delivery', stakeholderWeight: 0.3, deliveryWeight: 0.8 };
    shell.persistImprint(imp);
    expect(shell.loadImprint()).toEqual(imp);
  });

  it('imprint reset clears persisted imprint', () => {
    const shell = createWorkspaceShell();
    shell.persistImprint({ focus: 'test', stakeholderWeight: 0.5, deliveryWeight: 0.5 });
    shell.resetImprint();
    expect(shell.loadImprint()).toBeNull();
  });

  it('adaptive clarifying question reflects imprint context', () => {
    const shell = createWorkspaceShell();
    const stakeholderHeavy: Imprint = { focus: 'stakeholders', stakeholderWeight: 0.9, deliveryWeight: 0.2 };
    const question = shell.getAdaptiveClarifyingQuestion(stakeholderHeavy);
    expect(question).toBeTruthy();
    expect(question).toContain('decision-makers');
  });

  it('dynamic ignitionCues reflect imprint context', () => {
    const shell = createWorkspaceShell();
    const deliveryHeavy: Imprint = { focus: 'delivery', stakeholderWeight: 0.2, deliveryWeight: 0.8 };
    const cues = shell.getIgnitionCues(deliveryHeavy);
    expect(cues.some((c) => c.toLowerCase().includes('deliver'))).toBe(true);
  });

  it('lens ordering by imprint returns lenses sorted by priority', () => {
    const shell = createWorkspaceShell();
    const lenses = shell.getLensOrderByImprint(null);
    expect(lenses.length).toBeGreaterThan(0);
    for (let i = 0; i < lenses.length - 1; i++) {
      expect(lenses[i].priority).toBeGreaterThanOrEqual(lenses[i + 1].priority);
    }
  });

  it('executive lens is promoted for stakeholder-heavy focus', () => {
    const shell = createWorkspaceShell();
    const imp: Imprint = { focus: 'stakeholders', stakeholderWeight: 0.9, deliveryWeight: 0.1 };
    const lenses = shell.getLensOrderByImprint(imp);
    expect(lenses[0].id).toBe('executive');
  });

  it('execution lens is ordered first for delivery-heavy focus', () => {
    const shell = createWorkspaceShell();
    const imp: Imprint = { focus: 'delivery', stakeholderWeight: 0.1, deliveryWeight: 0.9 };
    const lenses = shell.getLensOrderByImprint(imp);
    expect(lenses[0].id).toBe('execution');
  });

  it('compressed workspace header is present', () => {
    const shell = createWorkspaceShell();
    const header = shell.getCompressedHeader();
    expect(header.compact).toBe(true);
    expect(header.title).toBeTruthy();
  });

  it('readiness chips reflect workspace status', () => {
    const shell = createWorkspaceShell();
    const dormantChips = shell.getReadinessChips();
    expect(dormantChips[0].id).toBe('standby');
    shell.awaken();
    const awakeningChips = shell.getReadinessChips();
    expect(awakeningChips[0].id).toBe('awakening');
    expect(awakeningChips[0].active).toBe(true);
  });

  it('concise operational shell copy is defined', () => {
    expect(OPERATIONAL_SHELL_COPY.dormantPrompt).toBeTruthy();
    expect(OPERATIONAL_SHELL_COPY.standbyLabel).toBe('Standby');
    expect(OPERATIONAL_SHELL_COPY.awakeningLabel).toBe('Awakening');
    expect(OPERATIONAL_SHELL_COPY.readyLabel).toBe('Ready');
  });
});
