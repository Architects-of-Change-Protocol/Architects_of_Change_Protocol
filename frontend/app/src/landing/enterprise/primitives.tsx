import type { ReactNode } from 'react';
import type { ArchitectureShape, HierarchyStage } from './content';
import { HIERARCHY } from './content';

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-cyan-300/80 text-xs uppercase tracking-[0.22em] font-mono">{children}</p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={`max-w-3xl mb-10 md:mb-12 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white">{title}</h2>
      {description ? <p className="mt-4 text-white/60 text-base leading-relaxed">{description}</p> : null}
    </div>
  );
}

const statusToneMap: Record<string, string> = {
  Stable: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
  Active: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
  Healthy: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
  Available: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
  Beta: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  Partial: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
  Attention: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
  Preview: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
  Planned: 'text-white/50 border-white/15 bg-white/[0.03]',
  'Coming soon': 'text-white/50 border-white/15 bg-white/[0.03]',
};

export function StatusPill({ label }: { label: string }) {
  const tone = statusToneMap[label] ?? 'text-white/60 border-white/15 bg-white/[0.03]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide font-mono ${tone}`}>
      {label}
    </span>
  );
}

export function ComingSoonTag() {
  return <StatusPill label="Coming soon" />;
}

/** Small geometric node glyph used for architecture pattern cards — deliberately abstract
 * (a hub-and-spoke diagram) rather than illustrative, so it reads as architecture, not iconography. */
export function NodeGlyph({ shape }: { shape: ArchitectureShape }) {
  const hub = (() => {
    switch (shape) {
      case 'circle':
        return <circle cx="18" cy="18" r="6.5" />;
      case 'diamond':
        return <rect x="12" y="12" width="12" height="12" transform="rotate(45 18 18)" />;
      case 'hex':
        return <polygon points="18,10.5 25,14.5 25,21.5 18,25.5 11,21.5 11,14.5" />;
      case 'triangle':
        return <polygon points="18,10 26,25 10,25" />;
      case 'pentagon':
        return <polygon points="18,10 26.5,16.2 23.3,26 12.7,26 9.5,16.2" />;
      case 'square':
      default:
        return <rect x="12" y="12" width="12" height="12" />;
    }
  })();

  const satellites = [
    [4, 4],
    [32, 4],
    [4, 32],
    [32, 32],
  ];

  return (
    <svg viewBox="0 0 36 36" width="36" height="36" className="text-cyan-300">
      {satellites.map(([x, y]) => (
        <line key={`${x}-${y}`} x1="18" y1="18" x2={x} y2={y} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      ))}
      {satellites.map(([x, y]) => (
        <circle key={`n-${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" fillOpacity="0.55" />
      ))}
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        {hub}
      </g>
    </svg>
  );
}

/** Persistent reminder of the platform's mental model: Architecture -> Capabilities ->
 * Governance -> Evidence -> Assurance -> Operations. Highlights the current stage. */
export function HierarchyRail({ current, dense = false }: { current?: HierarchyStage; dense?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-2 font-mono ${dense ? 'text-[11px]' : 'text-xs'}`}>
      {HIERARCHY.map((stage, idx) => (
        <span key={stage} className="flex items-center gap-1.5">
          <span
            className={
              stage === current
                ? 'rounded-md border border-cyan-300/40 bg-cyan-300/10 px-2 py-1 text-cyan-200'
                : 'px-2 py-1 text-white/40'
            }
          >
            {stage}
          </span>
          {idx < HIERARCHY.length - 1 ? <span className="text-white/20">&rarr;</span> : null}
        </span>
      ))}
    </div>
  );
}

export function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-mono">{label}</p>
      <p className="mt-2.5 text-2xl font-semibold text-white tracking-tight">{value}</p>
      {detail ? <p className="mt-1.5 text-sm text-white/50">{detail}</p> : null}
    </div>
  );
}
