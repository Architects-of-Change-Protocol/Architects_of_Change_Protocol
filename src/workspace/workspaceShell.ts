export type WorkspaceStatus = 'dormant' | 'awakening' | 'active';
export const AWAKENING_EVENT = 'workspace:awakening';

export type Imprint = {
  focus: string;
  stakeholderWeight: number;
  deliveryWeight: number;
};

export type Lens = {
  id: string;
  label: string;
  priority: number;
};

const STORAGE_KEY = 'workspace:awakening:state';
const IMPRINT_KEY = 'workspace:imprint';

type Storage = Record<string, string>;

function getStorage(): Storage {
  const g = globalThis as Record<string, unknown>;
  if (!g.__workspaceStorage) g.__workspaceStorage = {} as Storage;
  return g.__workspaceStorage as Storage;
}

export function createWorkspaceShell() {
  let status: WorkspaceStatus = 'dormant';
  let imprint: Imprint | null = null;
  const listeners: Array<() => void> = [];

  function getStatus(): WorkspaceStatus {
    return status;
  }

  function getDormantInvitation(): string | null {
    return status === 'dormant' ? 'Start a new project to activate your workspace.' : null;
  }

  function getStandbyChip(): { label: string; variant: string } | null {
    return status === 'dormant' ? { label: 'Standby', variant: 'muted' } : null;
  }

  function getIgnitionCues(imp: Imprint | null = imprint): string[] {
    if (!imp) {
      return ['Define your focus', 'Set stakeholder context', 'Describe delivery goals'];
    }
    const cues: string[] = [];
    if (imp.stakeholderWeight > 0.6) cues.push('Map key stakeholders');
    if (imp.deliveryWeight > 0.6) cues.push('Define delivery milestones');
    if (!imp.focus) cues.push('Clarify your core focus');
    return cues.length ? cues : ['Review and confirm your imprint'];
  }

  function awaken(): void {
    status = 'awakening';
    listeners.forEach((fn) => fn());
  }

  function activate(): void {
    status = 'active';
  }

  function subscribe(fn: () => void): () => void {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  function persistAwakeningState(s: WorkspaceStatus): void {
    getStorage()[STORAGE_KEY] = s;
  }

  function loadAwakeningState(): WorkspaceStatus | null {
    return (getStorage()[STORAGE_KEY] as WorkspaceStatus) ?? null;
  }

  function loadImprint(): Imprint | null {
    return imprint;
  }

  function persistImprint(imp: Imprint): void {
    imprint = imp;
    getStorage()[IMPRINT_KEY] = JSON.stringify(imp);
  }

  function resetImprint(): void {
    imprint = null;
    delete getStorage()[IMPRINT_KEY];
  }

  function getAdaptiveClarifyingQuestion(imp: Imprint | null = imprint): string {
    if (!imp) return 'What is the primary goal of this project?';
    if (imp.stakeholderWeight > 0.7) return 'Who are the key decision-makers?';
    if (imp.deliveryWeight > 0.7) return 'What is the critical delivery milestone?';
    return 'What does success look like?';
  }

  function getLensOrderByImprint(imp: Imprint | null = imprint): Lens[] {
    const lenses: Lens[] = [
      { id: 'strategic', label: 'Strategic', priority: 3 },
      { id: 'executive', label: 'Executive', priority: 2 },
      { id: 'execution', label: 'Execution', priority: 1 },
    ];
    if (!imp) return [...lenses].sort((a, b) => b.priority - a.priority);
    if (imp.stakeholderWeight > 0.6) {
      return lenses
        .map((l) => (l.id === 'executive' ? { ...l, priority: 10 } : l))
        .sort((a, b) => b.priority - a.priority);
    }
    if (imp.deliveryWeight > 0.6) {
      return lenses
        .map((l) => (l.id === 'execution' ? { ...l, priority: 10 } : l))
        .sort((a, b) => b.priority - a.priority);
    }
    return [...lenses].sort((a, b) => b.priority - a.priority);
  }

  function getCompressedHeader(): { title: string; compact: boolean } {
    return { title: 'Workspace', compact: true };
  }

  function getReadinessChips(): Array<{ id: string; label: string; active: boolean }> {
    if (status === 'dormant') return [{ id: 'standby', label: 'Standby', active: false }];
    if (status === 'awakening') return [{ id: 'awakening', label: 'Awakening', active: true }];
    return [{ id: 'ready', label: 'Ready', active: true }];
  }

  return {
    getStatus,
    getDormantInvitation,
    getStandbyChip,
    getIgnitionCues,
    awaken,
    activate,
    subscribe,
    persistAwakeningState,
    loadAwakeningState,
    loadImprint,
    persistImprint,
    resetImprint,
    getAdaptiveClarifyingQuestion,
    getLensOrderByImprint,
    getCompressedHeader,
    getReadinessChips,
  };
}
