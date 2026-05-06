import type { CSSProperties } from 'react';

type AudienceRingProps = {
  label: string;
  value: number;
  total: number;
  tone: 'emerald' | 'sky' | 'violet' | 'amber';
};

const toneMap: Record<AudienceRingProps['tone'], string> = {
  emerald: 'from-emerald-500 to-emerald-300',
  sky: 'from-sky-500 to-cyan-300',
  violet: 'from-violet-500 to-fuchsia-300',
  amber: 'from-amber-500 to-yellow-300',
};

export function AudienceRing({ label, value, total, tone }: AudienceRingProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.round((value / safeTotal) * 100);
  const angle = Math.round((pct / 100) * 360);

  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{label}</p>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{pct}%</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div
          className={`h-12 w-12 rounded-full bg-gradient-to-br ${toneMap[tone]} shadow-sm`}
          style={{
            maskImage: `conic-gradient(black ${angle}deg, transparent ${angle}deg)`,
            WebkitMaskImage: `conic-gradient(black ${angle}deg, transparent ${angle}deg)`,
            ...({ '--tw-shadow-color': 'rgb(0 0 0 / 0.1)' } as CSSProperties),
          }}
        />
        <p className="text-xl font-semibold text-zinc-900 dark:text-white">{value.toLocaleString()}</p>
      </div>
    </article>
  );
}
