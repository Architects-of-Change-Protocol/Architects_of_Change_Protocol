import type { ReactNode } from 'react';
import type { ArchitectureShape, FlowStage } from './content';
import { FLOW } from './content';

// ---------------------------------------------------------------------------
// AOC Enterprise design system — ported from the canonical commercial
// collateral (SK005 HTML Pitch Deck + AOC Enterprise One Pager, both
// maintained outside this repository as commercial collateral). Enterprise
// is the interactive extension of that deck, so its tokens are taken
// verbatim from the deck's stylesheet rather than invented:
//
//   ink            #0F172A  -> slate-900
//   ink-muted      #64748B  -> slate-500
//   accent         #4F46E5  -> indigo-600
//   accent-deep    #3730A3  -> indigo-800
//   accent-soft    #EEF2FF  -> indigo-50
//   card           #F8FAFC  -> slate-50
//   card-border    #E2E8F0  -> slate-200
//   chip-muted     #F1F5F9  -> slate-100
//   bg-dark        #0B1220  -> arbitrary (hero + CTA bookends only)
//
// Every Tailwind color above is an exact hex match to the deck's CSS custom
// properties, not an approximation — see docs/commercial design system
// writeup (frontend/app/docs/w005-enterprise-pitch-deck-design-system.md)
// for the full mapping. The deck is light-primary with two dark "bookend"
// slides (hero, closing CTA); Enterprise follows the same rhythm.
// ---------------------------------------------------------------------------

export function Eyebrow({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' }) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.14em] ${
        tone === 'accent' ? 'text-indigo-600' : 'text-slate-500'
      }`}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'muted',
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'muted' | 'accent';
}) {
  return (
    <div className={`max-w-2xl mb-10 md:mb-11 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="mt-3.5 text-3xl md:text-[2.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
        {title}
      </h2>
      {description ? <p className="mt-3.5 text-slate-500 text-[15px] md:text-base leading-relaxed">{description}</p> : null}
    </div>
  );
}

/** A white/slate-50 surface with the deck's card treatment — border, radius, soft shadow. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </div>
  );
}

/** Small circular icon badge — the deck's `.icon-circle`. */
export function IconCircle({ children, size = 'md' }: { children: ReactNode; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-12 w-12' : 'h-[60px] w-[60px]';
  const iconDims = size === 'sm' ? '[&_svg]:h-[22px] [&_svg]:w-[22px]' : '[&_svg]:h-7 [&_svg]:w-7';
  return (
    <div className={`flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ${dims} ${iconDims}`}>
      {children}
    </div>
  );
}

/** Pill/chip — the deck's `.chip` (muted or accent-filled). */
export function Chip({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' }) {
  return (
    <span
      className={`inline-flex items-center rounded-[10px] px-5 py-3 text-[15px] font-bold ${
        tone === 'accent'
          ? 'bg-indigo-600 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      {children}
    </span>
  );
}

/** Numbered stepper node — the deck's `.pl-dot` / `.pl-label`, used by every pipeline diagram. */
export function PipelineRail({
  steps,
  activeIndex,
}: {
  steps: { label: string; sub?: string }[];
  activeIndex: number;
}) {
  return (
    <div className="flex items-start flex-wrap md:flex-nowrap gap-y-8">
      {steps.map((step, i) => (
        <div key={step.label} className="relative flex flex-1 min-w-[45%] md:min-w-0 flex-col items-center text-center px-1">
          {i < steps.length - 1 ? (
            <div className="absolute left-1/2 top-[26px] hidden h-px w-full bg-slate-200 md:block" aria-hidden />
          ) : null}
          <div
            className={`relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full text-[17px] font-extrabold ${
              i === activeIndex
                ? 'bg-indigo-600 text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {i + 1}
          </div>
          <div className={`mt-4 text-[13.5px] font-bold ${i === activeIndex ? 'text-indigo-800' : 'text-slate-900'}`}>
            {step.label}
          </div>
          {step.sub ? <div className="mt-1.5 text-[11.5px] italic text-slate-500">{step.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}

/** Three-number statistic row — the deck's `.stat-row`. */
export function StatRow({ stats }: { stats: { num: string; label: string }[] }) {
  return (
    <div className="mt-7 grid grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-[44px] md:text-[56px] font-extrabold leading-none text-indigo-600">{stat.num}</div>
          <div className="mt-2.5 text-[13px] text-slate-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

const statusToneMap: Record<string, string> = {
  Stable: 'text-emerald-600 border-emerald-400/40 bg-emerald-50',
  Beta: 'text-indigo-600 border-indigo-400/40 bg-indigo-50',
  Preview: 'text-amber-600 border-amber-400/40 bg-amber-50',
};

export function StatusPill({ label }: { label: string }) {
  const tone = statusToneMap[label] ?? 'text-slate-500 border-slate-200 bg-slate-100';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide font-mono ${tone}`}>
      {label}
    </span>
  );
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
    <svg viewBox="0 0 36 36" width="36" height="36" className="text-indigo-500">
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

/** The recurring structural diagram: Business Needs -> Protocol Capabilities ->
 * Business Architecture -> Governance. Used only inside the "Compose your own
 * architecture" deep-dive appendix — the primary homepage narrative now follows
 * the pitch deck's own sequence instead. */
export function FlowRail({ current, size = 'dense' }: { current?: FlowStage; size?: 'dense' | 'large' }) {
  const isLarge = size === 'large';
  return (
    <div
      className={`flex flex-wrap items-center font-mono ${
        isLarge ? 'gap-x-2.5 gap-y-3 text-xs md:text-sm' : 'gap-x-1.5 gap-y-2 text-[11px]'
      }`}
    >
      {FLOW.map((stage, idx) => (
        <span key={stage} className="flex items-center gap-1.5">
          <span
            className={
              stage === current
                ? `rounded-md border border-indigo-300 bg-indigo-50 text-indigo-700 ${isLarge ? 'px-3 py-1.5' : 'px-2 py-1'}`
                : `text-slate-400 ${isLarge ? 'px-3 py-1.5' : 'px-2 py-1'}`
            }
          >
            {stage}
          </span>
          {idx < FLOW.length - 1 ? <span className="text-slate-300">&rarr;</span> : null}
        </span>
      ))}
    </div>
  );
}

/** A single capability row in a checklist — checked (enabled) or hollow (available to add). */
export function CapabilityCheckItem({
  name,
  summary,
  checked,
}: {
  name: string;
  summary?: string;
  checked: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 ${checked ? 'border-slate-200 bg-white' : 'border-slate-100 bg-transparent'}`}>
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px] ${
          checked ? 'border-indigo-400 bg-indigo-100 text-indigo-700' : 'border-slate-300 text-transparent'
        }`}
        aria-hidden
      >
        {checked ? '✓' : ''}
      </span>
      <div>
        <p className={`text-sm font-medium ${checked ? 'text-slate-900' : 'text-slate-400'}`}>{name}</p>
        {summary ? <p className={`mt-0.5 text-xs leading-relaxed ${checked ? 'text-slate-500' : 'text-slate-400'}`}>{summary}</p> : null}
      </div>
    </div>
  );
}
